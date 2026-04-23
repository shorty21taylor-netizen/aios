import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, bookings, workspaceApiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { EventPayloadSchema } from "@/lib/events/types";
import { hashApiKey } from "@/lib/api-keys/generate";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const rawKey = authHeader.slice(7);
    const keyHash = hashApiKey(rawKey);

    const apiKey = await db
      .select()
      .from(workspaceApiKeys)
      .where(
        and(eq(workspaceApiKeys.keyHash, keyHash), eq(workspaceApiKeys.isActive, true))
      )
      .limit(1);

    if (!apiKey.length) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    const key = apiKey[0];
    const workspaceId = key.workspaceId;

    const body = await req.json();
    const payload = EventPayloadSchema.parse(body);

    const eventId = await db.transaction(async (tx) => {
      const insertResult = await tx
        .insert(events)
        .values({
          workspaceId,
          eventType: payload.event_type,
          occurredAt: payload.occurred_at,
          correlationId: payload.correlation_id,
          idempotencyKey: payload.idempotency_key,
          data: payload.data,
        })
        .returning({ id: events.id })
        .onConflictDoNothing();

      if (!insertResult.length) {
        return null;
      }

      const newEventId = insertResult[0].id;

      if (payload.event_type === "booking.created") {
        const bookingData = payload.data as {
          contact_name: string;
          contact_phone?: string;
          contact_email?: string;
          booking_slot: string;
          estimated_value?: number;
        };

        const sourceChannel = payload.data.source_channel as
          | "call"
          | "sms"
          | "email";

        await tx.insert(bookings).values({
          workspaceId,
          sourceChannel,
          sourceEventId: newEventId,
          contactName: bookingData.contact_name,
          contactPhone: bookingData.contact_phone,
          contactEmail: bookingData.contact_email,
          bookingSlot: new Date(bookingData.booking_slot),
          estimatedValue: bookingData.estimated_value?.toString(),
          status: "booked",
        });
      }

      if (payload.event_type === "deal.closed") {
        const dealData = payload.data as {
          booking_id: string;
          amount_closed: number;
        };

        await tx
          .update(bookings)
          .set({
            status: "closed_won",
            amountClosed: dealData.amount_closed?.toString(),
          })
          .where(eq(bookings.id, dealData.booking_id));
      }

      await tx
        .update(workspaceApiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(workspaceApiKeys.id, key.id));

      return newEventId;
    });

    if (!eventId) {
      return NextResponse.json(
        { ok: true, event_id: null, message: "Event already exists (idempotent)" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { ok: true, event_id: eventId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event ingestion error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { z } from "zod";
