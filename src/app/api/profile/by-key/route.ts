import { NextRequest, NextResponse } from 'next/server';
import { getProfileByApiKey } from '@/lib/profile/queries';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);
    const profile = await getProfileByApiKey(apiKey);

    if (!profile) {
      return NextResponse.json(
        {
          error: 'profile_not_configured',
          onboarding_url: '/onboarding',
        },
        { status: 404 }
      );
    }

    // Merge typed columns with details JSONB for clients
    const mergedProfile = {
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
      details: profile.details,
    };

    return NextResponse.json(mergedProfile, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
