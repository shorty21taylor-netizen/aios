# Business Profile API

The business profile is the single most important piece of the AIOS product. Every n8n workflow will fetch the tenant's business profile and use it to personalize all AI-generated messages, call scripts, SMS replies, emails, and voice agent responses.

## Overview

Each workspace has exactly one `workspace_profiles` row that contains:
- **Typed columns** — for filtering and querying (business_name, vertical, phone_number, etc.)
- **details JSONB** — for the long tail of rich context (services, FAQs, objections, escalation rules, etc.)

When a contractor onboards, they complete a 6-step wizard that populates this profile. Afterwards, n8n workflows fetch the profile via `/api/profile/by-key` and inject it into every Claude system prompt.

## Database Schema

See `src/db/schema.ts` for the full `workspaceProfiles` table definition.

### Typed Columns

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `id` | UUID | Yes | Primary key |
| `workspace_id` | UUID | Yes | 1:1 reference to workspace (unique) |
| `business_name` | text | Yes | e.g., "Acme Roofing" |
| `vertical` | text | Yes | roofing\|hvac\|solar\|exteriors\|remodeling\|other |
| `years_in_business` | integer | No | - |
| `phone_number` | text | Yes | Business phone, e.g. "+1-512-555-1234" |
| `booking_url` | text | No | Calendly, JobNimbus, etc. |
| `service_area_description` | text | No | e.g., "Austin + surrounding 30 miles" |
| `service_area_zip_codes` | text[] | No | Array of zip codes |
| `hours_json` | jsonb | Yes | Business hours (default: 8am-6pm Mon-Fri, 9am-3pm Sat, closed Sun) |
| `timezone` | text | Yes | Default: America/Chicago |
| `voice_persona` | text | Yes | professional\|friendly\|direct (default: friendly) |
| `brand_tone` | text | Yes | formal\|casual\|warm\|technical (default: warm) |
| `operator_phone_e164` | text | No | Where to escalate calls (E.164 format) |
| `operator_email` | text | No | Where to escalate emails |
| `company_address` | text | No | For CAN-SPAM footer, etc. |
| `onboarding_completed_at` | timestamp | No | Null until step 6 submitted |
| `onboarding_step` | integer | Yes | 0-6 (6 = complete) |
| `details` | jsonb | Yes | Rich context (see below) |
| `created_at` | timestamp | Yes | - |
| `updated_at` | timestamp | Yes | - |

### Details JSONB Structure

```json
{
  "services": [
    {
      "name": "Roof replacement",
      "price_range_usd": "8000-25000",
      "typical_duration_days": 2
    }
  ],
  "top_faqs": [
    {
      "q": "Do you offer financing?",
      "a": "Yes, through GreenSky — 0% APR for 12 months."
    }
  ],
  "common_objections": [
    {
      "objection": "too expensive",
      "response": "We offer financing + lifetime warranty; most competitors don't."
    }
  ],
  "qualifying_questions": [
    "What's the age of your current roof?",
    "Have you had any recent leaks or storm damage?"
  ],
  "booking_rules": {
    "book_when": "customer is homeowner AND has a specific problem OR is comparing quotes",
    "decline_when": "renting without landlord approval OR outside service area",
    "decline_message": "We'd love to help but can only work with homeowners in our service area."
  },
  "escalation_rules": [
    "If caller asks to speak to a human, transfer to operator_phone_e164",
    "If caller mentions active leak + water damage, escalate immediately"
  ],
  "brand_voice_dos": ["use first name only", "mention lifetime warranty"],
  "brand_voice_donts": ["don't promise specific prices over the phone"],
  "consent_preferences": {
    "marketing_reengagement_enabled": true,
    "max_touches_per_lead_per_30d": 3,
    "quiet_hours": { "start": "21:00", "end": "08:00" }
  },
  "payment_info": {
    "accepts_credit_card": true,
    "financing_partner": "GreenSky",
    "deposit_pct": 25
  }
}
```

## API Endpoints

### GET /api/profile/by-key

**Authentication:** Bearer token (workspace API key)

**Cache:** `public, max-age=60` — n8n workflows should cache this for 60 seconds

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "workspace_id": "550e8400-e29b-41d4-a716-446655440001",
  "business_name": "Acme Roofing",
  "vertical": "roofing",
  "years_in_business": 12,
  "phone_number": "+15125551234",
  "booking_url": "https://calendly.com/acme",
  "service_area_description": "Austin + surrounding 30 miles",
  "service_area_zip_codes": ["78701", "78702"],
  "timezone": "America/Chicago",
  "voice_persona": "friendly",
  "brand_tone": "warm",
  "operator_phone_e164": "+15125559999",
  "operator_email": "operator@acmeroofing.com",
  "company_address": "123 Main St, Austin TX 78701",
  "onboarding_completed_at": "2026-04-21T14:32:00Z",
  "details": { ... }
}
```

**Error (404 Not Found — profile not configured):**
```json
{
  "error": "profile_not_configured",
  "onboarding_url": "/onboarding"
}
```

### GET /api/profile

**Authentication:** Clerk (session cookie)

**Response:** Same as `/api/profile/by-key`, but resolved from session org_id

### POST /api/profile

**Authentication:** Clerk

**Request:** Full profile object (creates if missing, else ignored)

**Response:** Updated profile

### PATCH /api/profile

**Authentication:** Clerk

**Request:** Partial profile object

**Response:** Updated profile

### POST /api/onboarding/step

**Authentication:** Clerk

**Request:**
```json
{
  "step": 1,
  "data": { "business_name": "Acme", "vertical": "roofing", ... }
}
```

**Response:** `{success: true, current_step: 1, next_step: 2, profile: {...}}`

### POST /api/onboarding/complete

**Authentication:** Clerk

Validates that all required fields are present, sets `onboarding_completed_at = now()`, and returns `{success: true, redirect_to: "/dashboard"}`.

## Onboarding Wizard (6 Steps)

### Step 1: Business Basics
- business_name (required)
- vertical (required)
- years_in_business (optional)
- phone_number (required)
- company_address (required)
- timezone (required)

### Step 2: Service Area + Hours
- service_area_description (required)
- service_area_zip_codes (optional)
- Business hours (Mon-Sun open/close times)

### Step 3: Services
- Dynamic list of services with price ranges and typical duration

### Step 4: Voice + Brand
- voice_persona (professional/friendly/direct)
- brand_tone (formal/casual/warm/technical)
- booking_url (required)
- brand_voice_dos and brand_voice_donts

### Step 5: FAQs + Objections
- top_faqs (dynamic list)
- common_objections (dynamic list)
- qualifying_questions (list of strings)

### Step 6: Escalation + Consent
- operator_phone_e164 (required)
- operator_email (required)
- escalation_rules (textarea)
- booking_rules (book_when, decline_when, decline_message)
- consent_preferences (reengagement, max_touches, quiet_hours)

## Using the Profile in n8n Workflows

Every n8n workflow should:

1. Fetch the profile at the start:
   ```
   GET /api/profile/by-key
   Authorization: Bearer <workspace_api_key>
   ```

2. Cache the response for 60 seconds (AIOS provides `Cache-Control: public, max-age=60`)

3. Inject the profile into the Claude system prompt as context:
   ```
   "You are a voice agent for {profile.business_name}. Your vertical is {profile.vertical}. 
    Your booking URL is {profile.booking_url}. When qualifying customers, use these questions: 
    {profile.details.qualifying_questions}"
   ```

4. Use `profile.details.booking_rules` to decide when to book vs. decline

5. Use `profile.details.escalation_rules` to decide when to transfer to `profile.operator_phone_e164`

## Vertical-Specific Defaults

When a contractor selects a vertical in the onboarding wizard, the form pre-populates default services, FAQs, and qualifying questions. These are editable and stored in `src/lib/profile/vertical-defaults.ts`.

Supported verticals:
- roofing
- hvac
- solar
- exteriors
- remodeling
- other

## Dashboard Gate

The dashboard (`/dashboard`) redirects unauthenticated users to `/sign-in` and users without a completed profile to `/onboarding`.

The check happens in `src/app/dashboard/layout.tsx`:
```typescript
const profile = await getProfileByWorkspaceId(workspace.id);
if (!profile || !profile.onboardingCompletedAt) {
  redirect("/onboarding");
}
```

## Settings Page

Users can edit their profile at `/dashboard/settings/profile`. The page renders all 4 sections (Business Basics, Service Area, Brand & Voice, Escalation & Contact) as collapsible cards with individual "Save" buttons (PATCH /api/profile).
