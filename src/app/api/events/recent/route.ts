import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireWorkspace } from "@/lib/auth/workspace";
import { db } from "@/lib/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await requireWorkspace();

    const recentEvents = await db
      .select()
      .from(events)
      .where(eq(events.workspaceId, workspace.id))
      .orderBy((e) => e.occurredAt)
      .limit(20);

    return NextResponse.json({ events: recentEvents });
  } catch (error) {
    console.error("Error fetching recent events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
