import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProfileByWorkspaceId, createProfile, updateProfile } from '@/lib/profile/queries';
import { db } from '@/lib/db';
import { workspaces } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ProfileSchema, PartialProfileSchema } from '@/lib/profile/schemas';

async function getWorkspaceId(clerkOrgId: string): Promise<string | null> {
  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerkOrgId, clerkOrgId))
    .limit(1);

  return workspace[0]?.id || null;
}

export async function GET(_req: NextRequest) {
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
      return NextResponse.json({ error: 'Profile not configured' }, { status: 404 });
    }

    const merged = {
      id: profile.id,
      workspace_id: profile.workspaceId,
      business_name: profile.businessName,
      vertical: profile.vertical,
      years_in_business: profile.yearsInBusiness,
      phone_number: profile.phoneNumber,
      booking_url: profile.bookingUrl,
      service_area_description: profile.serviceAreaDescription,
      service_area_zip_codes: profile.serviceAreaZipCodes,
      timezone: profile.timezone,
      voice_persona: profile.voicePersona,
      brand_tone: profile.brandTone,
      operator_phone_e164: profile.operatorPhoneE164,
      operator_email: profile.operatorEmail,
      company_address: profile.companyAddress,
      onboarding_completed_at: profile.onboardingCompletedAt,
      onboarding_step: profile.onboardingStep,
      details: profile.details,
    };

    return NextResponse.json(merged);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
    const validated = ProfileSchema.parse({ ...body, workspace_id: workspaceId });

    const existing = await getProfileByWorkspaceId(workspaceId);
    let result;

    if (existing) {
      result = await updateProfile(workspaceId, validated);
    } else {
      result = await createProfile(validated);
    }

    return NextResponse.json({
      id: result.id,
      workspace_id: result.workspaceId,
      business_name: result.businessName,
      vertical: result.vertical,
      years_in_business: result.yearsInBusiness,
      phone_number: result.phoneNumber,
      booking_url: result.bookingUrl,
      service_area_description: result.serviceAreaDescription,
      service_area_zip_codes: result.serviceAreaZipCodes,
      timezone: result.timezone,
      voice_persona: result.voicePersona,
      brand_tone: result.brandTone,
      operator_phone_e164: result.operatorPhoneE164,
      operator_email: result.operatorEmail,
      company_address: result.companyAddress,
      onboarding_completed_at: result.onboardingCompletedAt,
      onboarding_step: result.onboardingStep,
      details: result.details,
    });
  } catch (error: any) {
    console.error('Error creating/updating profile:', error);
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0] }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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
    const validated = PartialProfileSchema.parse(body);

    const result = await updateProfile(workspaceId, validated);
    if (!result) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: result.id,
      workspace_id: result.workspaceId,
      business_name: result.businessName,
      vertical: result.vertical,
      years_in_business: result.yearsInBusiness,
      phone_number: result.phoneNumber,
      booking_url: result.bookingUrl,
      service_area_description: result.serviceAreaDescription,
      service_area_zip_codes: result.serviceAreaZipCodes,
      timezone: result.timezone,
      voice_persona: result.voicePersona,
      brand_tone: result.brandTone,
      operator_phone_e164: result.operatorPhoneE164,
      operator_email: result.operatorEmail,
      company_address: result.companyAddress,
      onboarding_completed_at: result.onboardingCompletedAt,
      onboarding_step: result.onboardingStep,
      details: result.details,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0] }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
