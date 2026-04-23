import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProfileByWorkspaceId, updateProfile } from '@/lib/profile/queries';
import { db } from '@/lib/db';
import { workspaces } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getWorkspaceId(clerkOrgId: string): Promise<string | null> {
  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerkOrgId, clerkOrgId))
    .limit(1);

  return workspace[0]?.id || null;
}

// Validate that all required fields are present
function validateProfileComplete(profile: any): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!profile.businessName) missing.push('business_name');
  if (!profile.vertical) missing.push('vertical');
  if (!profile.phoneNumber) missing.push('phone_number');
  if (!profile.companyAddress) missing.push('company_address');
  if (!profile.timezone) missing.push('timezone');
  if (!profile.serviceAreaDescription) missing.push('service_area_description');
  if (!profile.voicePersona) missing.push('voice_persona');
  if (!profile.brandTone) missing.push('brand_tone');
  if (!profile.bookingUrl) missing.push('booking_url');
  if (!profile.operatorPhoneE164) missing.push('operator_phone_e164');
  if (!profile.operatorEmail) missing.push('operator_email');

  // Check details
  if (!profile.details?.services?.length) missing.push('details.services');
  if (!profile.details?.top_faqs?.length) missing.push('details.top_faqs');
  if (!profile.details?.qualifying_questions?.length) missing.push('details.qualifying_questions');
  if (!profile.details?.booking_rules) missing.push('details.booking_rules');

  return {
    valid: missing.length === 0,
    missing,
  };
}

export async function POST(_req: NextRequest) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = await getWorkspaceId(orgId);
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const profile = await getProfileByWorkspaceId(workspaceId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const validation = validateProfileComplete(profile);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Missing required fields', missing: validation.missing },
        { status: 400 }
      );
    }

    // Mark onboarding as complete
    await updateProfile(workspaceId, {
      onboarding_completed_at: new Date(),
      onboarding_step: 6,
    });

    return NextResponse.json({
      success: true,
      redirect_to: '/dashboard',
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
