import { db } from '@/lib/db';
import { workspaceProfiles, workspaceApiKeys } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashApiKey } from '@/lib/api-keys/generate';
import { Profile, PartialProfile } from './schemas';

export async function getProfileByWorkspaceId(workspaceId: string) {
  const profile = await db
    .select()
    .from(workspaceProfiles)
    .where(eq(workspaceProfiles.workspaceId, workspaceId))
    .limit(1);

  return profile[0] || null;
}

export async function getProfileByApiKey(apiKey: string) {
  const keyHash = hashApiKey(apiKey);

  const foundKey = await db
    .select()
    .from(workspaceApiKeys)
    .where(
      and(
        eq(workspaceApiKeys.keyHash, keyHash),
        eq(workspaceApiKeys.isActive, true)
      )
    )
    .limit(1);

  if (!foundKey.length) {
    return null;
  }

  const profile = await getProfileByWorkspaceId(foundKey[0].workspaceId);
  return profile;
}

export async function createProfile(data: Profile & { workspace_id: string }) {
  const result = await db
    .insert(workspaceProfiles)
    .values({
      workspaceId: data.workspace_id,
      businessName: data.business_name,
      vertical: data.vertical,
      yearsInBusiness: data.years_in_business,
      phoneNumber: data.phone_number,
      bookingUrl: data.booking_url,
      serviceAreaDescription: data.service_area_description,
      serviceAreaZipCodes: data.service_area_zip_codes,
      timezone: data.timezone,
      voicePersona: data.voice_persona,
      brandTone: data.brand_tone,
      operatorPhoneE164: data.operator_phone_e164,
      operatorEmail: data.operator_email,
      companyAddress: data.company_address,
      onboardingStep: data.onboarding_step || 0,
      details: data.details,
    })
    .returning();

  return result[0];
}

export async function updateProfile(
  workspaceId: string,
  data: PartialProfile & { workspace_id?: string }
) {
  const updates: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.business_name) updates.businessName = data.business_name;
  if (data.vertical) updates.vertical = data.vertical;
  if (data.years_in_business !== undefined) updates.yearsInBusiness = data.years_in_business;
  if (data.phone_number) updates.phoneNumber = data.phone_number;
  if (data.booking_url) updates.bookingUrl = data.booking_url;
  if (data.service_area_description) updates.serviceAreaDescription = data.service_area_description;
  if (data.service_area_zip_codes) updates.serviceAreaZipCodes = data.service_area_zip_codes;
  if (data.timezone) updates.timezone = data.timezone;
  if (data.voice_persona) updates.voicePersona = data.voice_persona;
  if (data.brand_tone) updates.brandTone = data.brand_tone;
  if (data.operator_phone_e164) updates.operatorPhoneE164 = data.operator_phone_e164;
  if (data.operator_email) updates.operatorEmail = data.operator_email;
  if (data.company_address) updates.companyAddress = data.company_address;
  if (data.onboarding_step !== undefined) updates.onboardingStep = data.onboarding_step;
  if (data.details) updates.details = data.details;
  if (data.onboarding_completed_at) updates.onboardingCompletedAt = data.onboarding_completed_at;

  const result = await db
    .update(workspaceProfiles)
    .set(updates)
    .where(eq(workspaceProfiles.workspaceId, workspaceId))
    .returning();

  return result[0] || null;
}

export async function mergeProfileDetails(
  workspaceId: string,
  details: Partial<Profile['details']>
) {
  const existing = await getProfileByWorkspaceId(workspaceId);

  if (!existing) {
    throw new Error('Profile not found');
  }

  const merged = {
    ...(existing.details as Record<string, any>),
    ...details,
  };

  return updateProfile(workspaceId, { details: merged as Profile['details'] });
}
