import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireWorkspace } from "@/lib/auth/workspace";
import { db } from "@/lib/db";
import { events, bookings } from "@/db/schema";
import { eq, and, gte, count, sum } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await requireWorkspace();

    const searchParams = req.nextUrl.searchParams;
    const window = searchParams.get("window") || "today";

    let startTime: Date;
    const now = new Date();

    if (window === "7d") {
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (window === "30d") {
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    let priorStartTime: Date;

    if (window === "7d") {
      priorStartTime = new Date(startTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (window === "30d") {
      priorStartTime = new Date(startTime.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      const yesterday = new Date(startTime);
      yesterday.setDate(yesterday.getDate() - 1);
      priorStartTime = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate()
      );
    }

    const wsId = workspace.id;

    const [
      callsReceivedResult,
      callsAnsweredResult,
      callsBookedResult,
      smsSentResult,
      smsBookedResult,
      emailBookedResult,
      emailRepliesResult,
      quotesSentResult,
      bookingsList,
      closedDealsResult,
      ,
      priorCallsAnsweredResult,
      priorCallsBookedResult,
      priorSmsSentResult,
      priorSmsBookedResult,
      priorEmailBookedResult,
      priorEmailRepliesResult,
      priorQuotesSentResult,
      priorClosedDealsResult,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "call.inbound.received"),
            gte(events.occurredAt, startTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "call.inbound.answered"),
            gte(events.occurredAt, startTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "call.booked"),
            gte(events.occurredAt, startTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "sms.outbound.sent"),
            gte(events.occurredAt, startTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "sms.booked"),
            gte(events.occurredAt, startTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "email.booked"),
            gte(events.occurredAt, startTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "email.inbound.replied"),
            gte(events.occurredAt, startTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "quote.sent"),
            gte(events.occurredAt, startTime)
          )
        ),
      db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.workspaceId, wsId),
            eq(bookings.status, "booked"),
            gte(bookings.createdAt, startTime)
          )
        ),
      db
        .select({ total: sum(bookings.amountClosed) })
        .from(bookings)
        .where(
          and(
            eq(bookings.workspaceId, wsId),
            eq(bookings.status, "closed_won"),
            gte(bookings.createdAt, startTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "call.inbound.received"),
            gte(events.occurredAt, priorStartTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "call.inbound.answered"),
            gte(events.occurredAt, priorStartTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "call.booked"),
            gte(events.occurredAt, priorStartTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "sms.outbound.sent"),
            gte(events.occurredAt, priorStartTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "sms.booked"),
            gte(events.occurredAt, priorStartTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "email.booked"),
            gte(events.occurredAt, priorStartTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "email.inbound.replied"),
            gte(events.occurredAt, priorStartTime)
          )
        ),
      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.workspaceId, wsId),
            eq(events.eventType, "quote.sent"),
            gte(events.occurredAt, priorStartTime)
          )
        ),
      db
        .select({ total: sum(bookings.amountClosed) })
        .from(bookings)
        .where(
          and(
            eq(bookings.workspaceId, wsId),
            eq(bookings.status, "closed_won"),
            gte(bookings.createdAt, priorStartTime)
          )
        ),
    ]);

    const callsReceived = callsReceivedResult[0]?.count || 0;
    const callsAnswered = callsAnsweredResult[0]?.count || 0;
    const callsBooked = callsBookedResult[0]?.count || 0;
    const smsSent = smsSentResult[0]?.count || 0;
    const smsBooked = smsBookedResult[0]?.count || 0;
    const emailBooked = emailBookedResult[0]?.count || 0;
    const emailReplies = emailRepliesResult[0]?.count || 0;
    const quotesSent = quotesSentResult[0]?.count || 0;
    const pipelineValue = bookingsList.reduce((sum, b) => {
      const val = b.estimatedValue ? parseFloat(b.estimatedValue) : 0;
      return sum + val;
    }, 0);
    const closedRevenue = parseFloat(closedDealsResult[0]?.total || "0");

    const priorCallsAnswered = priorCallsAnsweredResult[0]?.count || 0;
    const priorCallsBooked = priorCallsBookedResult[0]?.count || 0;
    const priorSmsSent = priorSmsSentResult[0]?.count || 0;
    const priorSmsBooked = priorSmsBookedResult[0]?.count || 0;
    const priorEmailBooked = priorEmailBookedResult[0]?.count || 0;
    const priorEmailReplies = priorEmailRepliesResult[0]?.count || 0;
    const priorQuotesSent = priorQuotesSentResult[0]?.count || 0;
    const priorClosedRevenue = parseFloat(priorClosedDealsResult[0]?.total || "0");

    const calculateDelta = (current: number, prior: number): number => {
      if (prior === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - prior) / prior) * 100);
    };

    return NextResponse.json({
      window,
      kpis: {
        inbound_calls: {
          answered: callsAnswered,
          received: callsReceived,
          answer_rate: callsReceived > 0 ? Math.round((callsAnswered / callsReceived) * 100) : 100,
          delta_vs_prior: calculateDelta(callsAnswered, priorCallsAnswered),
        },
        calls_to_bookings: {
          count: callsBooked,
          delta_vs_prior: calculateDelta(callsBooked, priorCallsBooked),
        },
        sms_sent_from_inquiries: {
          count: smsSent,
          delta_vs_prior: calculateDelta(smsSent, priorSmsSent),
        },
        quotes_sent: {
          count: quotesSent,
          delta_vs_prior: calculateDelta(quotesSent, priorQuotesSent),
        },
        sms_to_bookings: {
          count: smsBooked,
          delta_vs_prior: calculateDelta(smsBooked, priorSmsBooked),
        },
        email_to_bookings: {
          count: emailBooked,
          delta_vs_prior: calculateDelta(emailBooked, priorEmailBooked),
        },
        email_replies: {
          count: emailReplies,
          delta_vs_prior: calculateDelta(emailReplies, priorEmailReplies),
        },
        pipeline_value: {
          usd: pipelineValue,
          delta_vs_prior: calculateDelta(pipelineValue, 0),
        },
        closed_revenue: {
          usd: closedRevenue,
          delta_vs_prior: calculateDelta(closedRevenue, priorClosedRevenue),
        },
      },
    });
  } catch (error) {
    console.error("KPI calculation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
