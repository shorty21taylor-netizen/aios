// build-claude-system-prompt.js
//
// Drop this into an n8n Code node after the "AIOS: Fetch Tenant Profile" HTTP
// Request node. It takes the workspace_profiles row and returns:
//   { system: string, user: string, profile: object }
//
// The `system` string is the Claude system prompt, personalized per tenant.
// The `user` string is the turn-specific user message, built from the webhook payload.
// Both are ready to stringify into the Anthropic /v1/messages body.
//
// This file is the canonical composer. Every n8n workflow uses it (or a variant)
// so prompt quality stays consistent across SMS, voice, email, and marketing
// agents. The AIOS repo has a TypeScript mirror at src/lib/profile/prompt-composer.ts
// that the dashboard uses for previews.
//
// USAGE (n8n Code node — paste the body below, tweak the `kind` constant and the
// `buildUser()` function for each workflow):

const KIND = 'sms_enrich'; // sms_enrich | sms_reply | voice_qualify | email_draft | marketing | daily_brief | missed_call_recovery

const profile = $input.first().json;
const webhook = $node['Webhook: SMS Convo Enrichment'].json; // rename per workflow

// ---------- profile pulls ----------
const businessName = profile.business_name || 'the business';
const vertical = profile.vertical || 'home services';
const phoneNumber = profile.phone_number || '';
const bookingUrl = profile.booking_url || '';
const serviceArea = profile.service_area_description || '';
const hoursJson = profile.hours_json || {};
const timezone = profile.timezone || 'America/New_York';
const voicePersona = profile.voice_persona || 'professional';
const brandTone = profile.brand_tone || 'warm';

const details = profile.details || {};
const services = (details.services || []).slice(0, 20);
const faqs = (details.top_faqs || []).slice(0, 8);
const objections = (details.common_objections || []).slice(0, 6);
const qualifyingQuestions = (details.qualifying_questions || []).slice(0, 6);
const bookingRules = details.booking_rules || {};
const escalationRules = (details.escalation_rules || []).slice(0, 5);
const brandDos = (details.brand_voice_dos || []).slice(0, 8);
const brandDonts = (details.brand_voice_donts || []).slice(0, 8);

// ---------- shared header ----------
function buildSharedHeader() {
  const lines = [
    `Business: ${businessName} (${vertical})`,
    `Service area: ${serviceArea || 'not specified'}`,
    `Timezone: ${timezone}`,
    `Voice persona: ${voicePersona}. Brand tone: ${brandTone}.`,
  ];
  if (phoneNumber) lines.push(`Business phone: ${phoneNumber}`);
  if (bookingUrl) lines.push(`Booking link: ${bookingUrl}`);
  if (brandDos.length) lines.push('', 'DO:', ...brandDos.map(x => `  - ${x}`));
  if (brandDonts.length) lines.push('', 'DO NOT:', ...brandDonts.map(x => `  - ${x}`));
  return lines.join('\n');
}

// ---------- per-kind system prompts ----------
function buildSystem() {
  const header = buildSharedHeader();
  switch (KIND) {
    case 'sms_enrich':
      return [
        `You are the SMS conversation analyst for ${businessName}.`,
        header,
        '',
        'Return ONLY a JSON object with: intent, bookingScore (0-10), urgency (low|medium|high),',
        'sentiment (negative|neutral|positive), actionItems (string[]), objectionFlag (null or label).',
        objections.length ? `KNOWN_OBJECTIONS: ${objections.map(o => o.label || o).join(', ')}` : ''
      ].filter(Boolean).join('\n');

    case 'sms_reply':
      return [
        `You are the SMS assistant for ${businessName}.`,
        header,
        '',
        'Reply concisely in 1-3 sentences, matching the brand tone. If the customer is ready',
        'to book, offer the booking link. If they have questions, pull from the FAQs below.',
        '',
        faqs.length ? 'FAQs:\n' + faqs.map(f => `  Q: ${f.question || f}\n  A: ${f.answer || ''}`).join('\n') : '',
      ].filter(Boolean).join('\n');

    case 'voice_qualify':
      return [
        `You are the inbound voice receptionist for ${businessName}.`,
        header,
        '',
        'Qualify the caller by asking at most 4 questions from QUALIFYING_QUESTIONS below.',
        'If a qualifying threshold is met, offer to book using BOOKING_RULES.',
        'If any ESCALATION_TRIGGER is detected, hand off to the human operator.',
        '',
        qualifyingQuestions.length ? 'QUALIFYING_QUESTIONS:\n' + qualifyingQuestions.map(q => `  - ${q.question || q}`).join('\n') : '',
        '',
        Object.keys(bookingRules).length ? 'BOOKING_RULES:\n' + Object.entries(bookingRules).map(([k, v]) => `  - ${k}: ${v}`).join('\n') : '',
        '',
        escalationRules.length ? 'ESCALATION_TRIGGERS:\n' + escalationRules.map(e => `  - ${e.trigger || e}`).join('\n') : '',
      ].filter(Boolean).join('\n');

    case 'email_draft':
      return [
        `You are drafting an email reply on behalf of ${businessName}.`,
        header,
        '',
        'Keep it under 120 words. Match the brand tone exactly. End with a clear next step',
        '(usually the booking link, a phone number, or a scheduling question).',
        services.length ? `Services offered: ${services.map(s => s.name || s).join(', ')}` : '',
      ].filter(Boolean).join('\n');

    case 'marketing':
      return [
        `You are writing a re-engagement message for past leads of ${businessName}.`,
        header,
        '',
        'Rules: no pressure, no false urgency, no promises about timing we cannot keep.',
        'Max 160 chars if SMS, max 80 words if email. Include consent opt-out if SMS.',
      ].filter(Boolean).join('\n');

    case 'daily_brief':
      return [
        `You are generating the 6am Daily Brief for ${businessName}'s operator.`,
        header,
        '',
        'Return a 3-5 bullet brief. Each bullet: an action, why it matters (1 sentence),',
        'expected impact. Written for a busy contractor reading on their phone.',
      ].filter(Boolean).join('\n');

    case 'missed_call_recovery':
      return [
        `You are the SMS auto-responder for a missed call to ${businessName}.`,
        header,
        '',
        'The caller just got a "we missed you" SMS. Reply with a short, friendly hook that',
        'invites them to text a description of what they need or book a time.',
      ].filter(Boolean).join('\n');

    default:
      return [`You are an assistant for ${businessName}.`, header].join('\n');
  }
}

// ---------- per-workflow user prompt ----------
// OVERRIDE this in each workflow — the stub here is the SMS-enrich variant.
function buildUser() {
  const conversation = webhook.conversation_history || '';
  const contactPhone = webhook.contact_phone || '';
  const priorTouches = webhook.prior_touches || 0;
  return [
    'Analyze this SMS thread and return ONLY the JSON described above.',
    '',
    `Customer phone: ${contactPhone}`,
    `Prior touches: ${priorTouches}`,
    '',
    'Thread:',
    conversation,
  ].join('\n');
}

return [{
  json: {
    system: buildSystem(),
    user: buildUser(),
    profile,
  }
}];
