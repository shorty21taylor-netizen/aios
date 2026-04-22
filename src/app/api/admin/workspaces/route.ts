import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaces } from "@/db/schema";
import { z } from "zod";

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  timezone: z.string().default("America/Chicago"),
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

    const body = await req.json();
    const { name, slug, timezone } = CreateWorkspaceSchema.parse(body);

    const workspace = await db
      .insert(workspaces)
      .values({
        clerkOrgId: orgId,
        name,
        slug,
        timezone,
      })
      .returning();

    return NextResponse.json(workspace[0], { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);

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
