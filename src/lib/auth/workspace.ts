import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkspaceForAuth() {
  const { orgId } = await auth();
  if (!orgId) {
    return null;
  }

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerkOrgId, orgId))
    .limit(1);

  return workspace[0] || null;
}

export async function requireWorkspace() {
  const workspace = await getWorkspaceForAuth();
  if (!workspace) {
    throw new Error("Workspace not found. User may not be authenticated.");
  }
  return workspace;
}
