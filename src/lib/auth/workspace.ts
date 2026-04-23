import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "workspace"
  );
}

/**
 * Returns the workspace row for the signed-in Clerk Organization.
 * If one does not exist yet, creates it on the fly (lazy provisioning)
 * so that users who just created a Clerk Organization via the
 * /create-organization page are not stuck without a workspace row.
 */
export async function getWorkspaceForAuth() {
  const { orgId } = await auth();
  if (!orgId) {
    return null;
  }

  const existing = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerkOrgId, orgId))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  // Lazy provision — fetch org details from Clerk and insert a workspace row.
  let orgName = "Workspace";
  let orgSlug: string | null = null;
  try {
    const clerk = await clerkClient();
    const org = await clerk.organizations.getOrganization({
      organizationId: orgId,
    });
    orgName = org?.name || orgName;
    orgSlug = org?.slug || null;
  } catch {
    // Fall through — we'll synthesize a slug below.
  }

  const baseSlug = slugify(orgSlug || orgName || orgId);
  const uniqueSlug = `${baseSlug}-${orgId.slice(-6).toLowerCase()}`;

  const inserted = await db
    .insert(workspaces)
    .values({
      clerkOrgId: orgId,
      name: orgName,
      slug: uniqueSlug,
    })
    .onConflictDoNothing({ target: workspaces.clerkOrgId })
    .returning();

  if (inserted[0]) {
    return inserted[0];
  }

  // Conflict path — someone else inserted concurrently. Re-read.
  const refetch = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerkOrgId, orgId))
    .limit(1);
  return refetch[0] || null;
}

export async function requireWorkspace() {
  const workspace = await getWorkspaceForAuth();
  if (!workspace) {
    throw new Error("Workspace not found. User may not be authenticated.");
  }
  return workspace;
}
