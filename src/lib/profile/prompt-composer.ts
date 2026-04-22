/**
 * prompt-composer.ts
 *
 * TypeScript mirror of n8n/snippets/build-claude-system-prompt.js.
 * Used by the dashboard to preview what Claude will see — so when a contractor
 * edits their profile in /dashboard/settings/profile they can see the live
 * system prompt n8n workflows will compose at runtime.
 *
 * Keep this in lockstep with the JS version. If you change one, change the other.
 */

import type { WorkspaceProfile } from "./schemas";

export type PromptKind =
  | "sms_enrich"
  | "sms_reply"
  | "voice_qualify"
  | "email_draft"
  | "marketing"
  | "daily_brief"
  | "missed_call_recovery";

export interface ComposedPrompt {
  system: string;
  user: string;
  model: string;
  max_tokens: number;
}

interface ComposeOptions {
  kind: PromptKind;
  profile: Partial<WorkspaceProfile> & { details?: Record<string, unknown> };
  userMessage?: string;
  model?: string;
  max_tokens?: number;
}

function buildSharedHeader(p: ComposeOptions["profile"]): string {
  const details = (p.details ?? {}) as Record<string, unknown>;
  const brandDos = (details.brand_voice_dos as string[] | undefined)?.slice(0, 8) ?? [];
  const brandDonts = (details.brand_voice_donts as string[] | undefined)?.slice(0, 8) ?? [];

  const lines = [
    `Business: ${p.business_name ?? "the business"} (${p.vertical ?? "home services"})`,
    `Service area: ${p.service_area_description ?? "not specified"}`,
    `Timezone: ${p.timezone ?? "America/New_York"}`,
    `Voice persona: ${p.voice_persona ?? "professional"}. Brand tone: ${p.brand_tone ?? "warm"}.`,
  ];
  if (p.phone_number) lines.push(`Business phone: ${p.phone_number}`);
  if (p.booking_url) lines.push(`Booking link: ${p.booking_url}`);
  if (brandDos.length) lines.push("", "DO:", ...brandDos.map((x) => `  - ${x}`));
  if (brandDonts.length) lines.push("", "DO NOT:", ...brandDonts.map((x) => `  - ${x}`));
  return lines.join("\n");
}

function buildSystem(kind: PromptKind, p: ComposeOptions["profile"]): string {
  const header = buildSharedHeader(p);
  const name = p.business_name ?? "the business";
  const details = (p.details ?? {}) as Record<string, unknown>;
  const faqs = ((details.top_faqs as Array<{ question?: string; answer?: string }> | undefined) ?? []).slice(0, 8);
  const objections = ((details.common_objections as Array<{ label?: string } | string> | undefined) ?? []).slice(0, 6);
  const qualifyingQuestions = ((details.qualifying_questions as Array<{ question?: string } | string> | undefined) ?? []).slice(0, 6);
  const bookingRules = (details.booking_rules ?? {}) as Record<string, string>;
  const escalationRules = ((details.escalation_rules as Array<{ trigger?: string } | string> | undefined) ?? []).slice(0, 5);
  const services = ((details.services as Array<{ name?: string } | string> | undefined) ?? []).slice(0, 20);

  switch (kind) {
    case "sms_enrich":
      return [
        `You are the SMS conversation analyst for ${name}.`,
        header,
        "",
        "Return ONLY a JSON object with: intent, bookingScore (0-10), urgency (low|medium|high),",
        "sentiment (negative|neutral|positive), actionItems (string[]), objectionFlag (null or label).",
        objections.length
          ? `KNOWN_OBJECTIONS: ${objections.map((o) => (typeof o === "string" ? o : o.label ?? "")).join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

    case "sms_reply":
      return [
        `You are the SMS assistant for ${name}.`,
        header,
        "",
        "Reply concisely in 1-3 sentences, matching the brand tone. If the customer is ready",
        "to book, offer the booking link. If they have questions, pull from the FAQs below.",
        "",
        faqs.length
          ? "FAQs:\n" +
            faqs.map((f) => `  Q: ${f.question ?? ""}\n  A: ${f.answer ?? ""}`).join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n");

    case "voice_qualify":
      return [
        `You are the inbound voice receptionist for ${name}.`,
        header,
        "",
        "Qualify the caller by asking at most 4 questions from QUALIFYING_QUESTIONS.",
        "If a qualifying threshold is met, offer to book using BOOKING_RULES.",
        "If any ESCALATION_TRIGGER is detected, hand off to the human operator.",
        "",
        qualifyingQuestions.length
          ? "QUALIFYING_QUESTIONS:\n" +
            qualifyingQuestions
              .map((q) => `  - ${typeof q === "string" ? q : q.question ?? ""}`)
              .join("\n")
          : "",
        "",
        Object.keys(bookingRules).length
          ? "BOOKING_RULES:\n" +
            Object.entries(bookingRules)
              .map(([k, v]) => `  - ${k}: ${v}`)
              .join("\n")
          : "",
        "",
        escalationRules.length
          ? "ESCALATION_TRIGGERS:\n" +
            escalationRules
              .map((e) => `  - ${typeof e === "string" ? e : e.trigger ?? ""}`)
              .join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n");

    case "email_draft":
      return [
        `You are drafting an email reply on behalf of ${name}.`,
        header,
        "",
        "Keep it under 120 words. Match the brand tone exactly. End with a clear next step",
        "(usually the booking link, a phone number, or a scheduling question).",
        services.length
          ? `Services offered: ${services.map((s) => (typeof s === "string" ? s : s.name ?? "")).join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

    case "marketing":
      return [
        `You are writing a re-engagement message for past leads of ${name}.`,
        header,
        "",
        "Rules: no pressure, no false urgency, no promises about timing we cannot keep.",
        "Max 160 chars if SMS, max 80 words if email. Include consent opt-out if SMS.",
      ].join("\n");

    case "daily_brief":
      return [
        `You are generating the 6am Daily Brief for ${name}'s operator.`,
        header,
        "",
        "Return a 3-5 bullet brief. Each bullet: an action, why it matters (1 sentence),",
        "expected impact. Written for a busy contractor reading on their phone.",
      ].join("\n");

    case "missed_call_recovery":
      return [
        `You are the SMS auto-responder for a missed call to ${name}.`,
        header,
        "",
        "The caller just got a \"we missed you\" SMS. Reply with a short, friendly hook that",
        "invites them to text a description of what they need or book a time.",
      ].join("\n");
  }
}

export function composePrompt(opts: ComposeOptions): ComposedPrompt {
  return {
    system: buildSystem(opts.kind, opts.profile),
    user: opts.userMessage ?? "",
    model: opts.model ?? "claude-sonnet-4-6",
    max_tokens: opts.max_tokens ?? 1024,
  };
}
