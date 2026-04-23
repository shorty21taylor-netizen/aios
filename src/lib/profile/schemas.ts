import { z } from 'zod';

// Hours schema for each day
export const HourSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  close: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

// Service definition
export const ServiceSchema = z.object({
  name: z.string().min(1, 'Service name required'),
  price_range_usd: z.string().min(1),
  typical_duration_days: z.number().min(0),
});

// FAQ item
export const FAQSchema = z.object({
  q: z.string().min(1, 'Question required'),
  a: z.string().min(1, 'Answer required'),
});

// Common objection
export const ObjectionSchema = z.object({
  objection: z.string().min(1, 'Objection required'),
  response: z.string().min(1, 'Response required'),
});

// Booking rules
export const BookingRulesSchema = z.object({
  book_when: z.string().optional(),
  decline_when: z.string().optional(),
  decline_message: z.string().optional(),
});

// Consent preferences
export const ConsentPreferencesSchema = z.object({
  marketing_reengagement_enabled: z.boolean().default(true),
  max_touches_per_lead_per_30d: z.number().default(3),
  quiet_hours: z
    .object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })
    .optional(),
});

// Payment info
export const PaymentInfoSchema = z.object({
  accepts_credit_card: z.boolean().default(true),
  financing_partner: z.string().optional(),
  deposit_pct: z.number().min(0).max(100).optional(),
});

// Details JSONB structure
export const ProfileDetailsSchema = z.object({
  services: z.array(ServiceSchema).default([]),
  top_faqs: z.array(FAQSchema).default([]),
  common_objections: z.array(ObjectionSchema).default([]),
  qualifying_questions: z.array(z.string()).default([]),
  booking_rules: BookingRulesSchema.optional(),
  escalation_rules: z.array(z.string()).default([]),
  brand_voice_dos: z.array(z.string()).default([]),
  brand_voice_donts: z.array(z.string()).default([]),
  consent_preferences: ConsentPreferencesSchema.optional(),
  payment_info: PaymentInfoSchema.optional(),
});

// Full profile schema
export const ProfileSchema = z.object({
  id: z.string().uuid().optional(),
  workspace_id: z.string().uuid(),
  business_name: z.string().min(1, 'Business name required'),
  vertical: z.enum(['roofing', 'hvac', 'solar', 'exteriors', 'remodeling', 'other']),
  years_in_business: z.number().min(0).optional(),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Valid phone required'),
  booking_url: z.string().url('Valid URL required').optional(),
  service_area_description: z.string().optional(),
  service_area_zip_codes: z.array(z.string()).optional(),
  timezone: z.string().default('America/Chicago'),
  voice_persona: z.enum(['professional', 'friendly', 'direct']).default('friendly'),
  brand_tone: z.enum(['formal', 'casual', 'warm', 'technical']).default('warm'),
  operator_phone_e164: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  operator_email: z.string().email('Valid email required').optional(),
  company_address: z.string().optional(),
  onboarding_completed_at: z.date().optional(),
  onboarding_step: z.number().min(0).max(6).default(0),
  details: ProfileDetailsSchema.default({}),
});

// Partial profile for step-by-step updates
export const PartialProfileSchema = ProfileSchema.partial();

// Step-specific schemas
export const Step1Schema = z.object({
  business_name: z.string().min(1, 'Business name required'),
  vertical: z.enum(['roofing', 'hvac', 'solar', 'exteriors', 'remodeling', 'other']),
  years_in_business: z.number().min(0).optional(),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Valid phone required'),
  company_address: z.string().min(1, 'Address required'),
  timezone: z.string().min(1, 'Timezone required'),
});

export const Step2Schema = z.object({
  service_area_description: z.string().min(1, 'Service area required'),
  service_area_zip_codes: z.array(z.string()).optional(),
  timezone: z.string(),
});

export const Step3Schema = z.object({
  details: z.object({
    services: z.array(ServiceSchema).min(1, 'At least one service required'),
  }),
});

export const Step4Schema = z.object({
  voice_persona: z.enum(['professional', 'friendly', 'direct']),
  brand_tone: z.enum(['formal', 'casual', 'warm', 'technical']),
  booking_url: z.string().url('Valid URL required'),
  details: z.object({
    brand_voice_dos: z.array(z.string()),
    brand_voice_donts: z.array(z.string()),
  }),
});

export const Step5Schema = z.object({
  details: z.object({
    top_faqs: z.array(FAQSchema),
    common_objections: z.array(ObjectionSchema),
    qualifying_questions: z.array(z.string()),
  }),
});

export const Step6Schema = z.object({
  operator_phone_e164: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Valid phone required'),
  operator_email: z.string().email('Valid email required'),
  details: z.object({
    escalation_rules: z.array(z.string()),
    booking_rules: BookingRulesSchema,
    consent_preferences: ConsentPreferencesSchema,
  }),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type PartialProfile = z.infer<typeof PartialProfileSchema>;
export type ProfileDetails = z.infer<typeof ProfileDetailsSchema>;
