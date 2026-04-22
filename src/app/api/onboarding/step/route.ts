import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateProfile, mergeProfileDetails, getProfileByWorkspaceId } from '@/lib/profile/queries';
import { db } from '@/lib/db';
import { workspaces } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PartialProfileSchema } from '@/lib/profile/schemas';

async function getWorkspaceId(clerkOrgId: string): Promise<string | null> {
  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerkOrgId, clerkOrgId))
    .limit(1);

  return workspace[0]?.id || null;
}

export async function POST(req: NextRequest) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = await getWorkspaceId(orgId);
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const body = await req.json();
    const { step, data } = body;

    if (typeof step !== 'number' || step < 1 || step > 6) {
      return NextResponse.json({ error: 'Invalid step number' }, { status: 400 });
    }

    const validated = PartialProfileSchema.parse(data);

    // Update the step number and merge data
    await updateProfile(workspaceId, {
      ...validated,
      onboarding_step: step,
    });

    const updated = await getProfileByWorkspaceId(workspaceId);

    return NextResponse.json({
      success: true,
      current_step: step,
      next_step: step < 6 ? step + 1 : null,
      profile: updated,
    });
  } catch (error: any) {
    console.error('Error updating onboarding step:', error);
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0] }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
