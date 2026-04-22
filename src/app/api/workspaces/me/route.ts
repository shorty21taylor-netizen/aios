import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceForAuth } from "@/lib/auth/workspace";

export async function GET() {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await getWorkspaceForAuth();

    return NextResponse.json({
      workspace,
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
