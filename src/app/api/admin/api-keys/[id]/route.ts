import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireWorkspace } from "@/lib/auth/workspace";
import { db } from "@/lib/db";
import { workspaceApiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await requireWorkspace();
    const { id: keyId } = await params;

    const key = await db
      .select()
      .from(workspaceApiKeys)
      .where(
        and(
          eq(workspaceApiKeys.id, keyId),
          eq(workspaceApiKeys.workspaceId, workspace.id)
        )
      )
      .limit(1);

    if (!key.length) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    await db
      .update(workspaceApiKeys)
      .set({ revokedAt: new Date(), isActive: false })
      .where(eq(workspaceApiKeys.id, keyId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
