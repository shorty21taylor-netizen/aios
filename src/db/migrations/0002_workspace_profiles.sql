-- Create workspace_profiles table
CREATE TABLE IF NOT EXISTS workspace_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  vertical text NOT NULL CHECK (vertical IN ('roofing', 'hvac', 'solar', 'exteriors', 'remodeling', 'other')),
  years_in_business integer,
  phone_number text NOT NULL,
  booking_url text,
  service_area_description text,
  service_area_zip_codes text[],
  hours_json jsonb DEFAULT '{"mon":{"open":"08:00","close":"18:00"},"tue":{"open":"08:00","close":"18:00"},"wed":{"open":"08:00","close":"18:00"},"thu":{"open":"08:00","close":"18:00"},"fri":{"open":"08:00","close":"18:00"},"sat":{"open":"09:00","close":"15:00"},"sun":{"open":"","close":""},"emergency_available":false}'::jsonb,
  timezone text NOT NULL DEFAULT 'America/Chicago',
  voice_persona text NOT NULL DEFAULT 'friendly' CHECK (voice_persona IN ('professional', 'friendly', 'direct')),
  brand_tone text NOT NULL DEFAULT 'warm' CHECK (brand_tone IN ('formal', 'casual', 'warm', 'technical')),
  operator_phone_e164 text,
  operator_email text,
  company_address text,
  onboarding_completed_at timestamp,
  onboarding_step integer NOT NULL DEFAULT 0,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_workspace_profiles_workspace_id ON workspace_profiles(workspace_id);
CREATE INDEX idx_workspace_profiles_updated ON workspace_profiles(updated_at DESC);
