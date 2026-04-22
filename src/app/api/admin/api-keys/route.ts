import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireWorkspace } from "@/lib/auth/workspace";
import { db } from "@/lib/db";
import { workspaceApiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateApiKey, hashApiKey } from "@/lib/api-keys/generate";
import { z } from "zod";

const CreateApiKeySchema = z.object({
  label: z.string().min(1).max(255),
});

export async function POST(req: NextRequest) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await requireWorkspace();
    const body = await req.json();
    const { label } = CreateApiKeySchema.parse(body);

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);

    await db.insert(workspaceApiKeys).values({
      workspaceId: workspace.id,
      keyHash,
      label,
    });

    return NextResponse.json(
      {
        key: rawKey,
        label,
        message: "Store this key safely. You will not see it again.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating API key:", error);

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

    const keys = await db
      .select({
        id: workspaceApiKeys.id,
        label: workspaceApiKeys.label,
        isActive: workspaceApiKeys.isActive,
        lastUsedAt: workspaceApiKeys.lastUsedAt,
        createdAt: workspaceApiKeys.createdAt,
        revokedAt: workspaceApiKeys.revokedAt,
      })
      .from(workspaceApiKeys)
      .where(eq(workspaceApiKeys.workspaceId, workspace.id));

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
