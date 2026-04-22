/**
 * Agent catalog — 8 agents that make up the AIOS product.
 *
 * Each agent corresponds to exactly one n8n workflow under `aios/n8n/workflows/`.
 * The `kind` field matches the PromptKind taxonomy in src/lib/profile/prompt-composer.ts.
 */

import type { PromptKind } from "@/lib/profile/prompt-composer";

export type AgentChannel = "voice" | "sms" | "email" | "marketing" | "internal";

export interface AgentDefinition {
  /** Slug — stable identifier used in the DB and webhook paths. */
  slug: string;
  /** Display name shown on /dashboard/agents. */
  name: string;
  /** One-line description of what this agent does. */
  description: string;
  /** Channel category for grouping / icons. */
  channel: AgentChannel;
  /** Event types this agent emits — used to compute per-agent counts from events table. */
  eventTypes: string[];
  /** Path to the n8n workflow JSON (relative to repo root). */
  workflowPath: string;
  /** Prompt kind this agent uses — matches composePrompt({ kind }). */
  promptKind: PromptKind | null;
  /** n8n webhook path (the `path` parameter in the webhook trigger node). */
  webhookPath: string;
  /** True if this agent calls Claude (so we show the prompt preview for it). */
  usesClaude: boolean;
}

export const AGENT_CATALOG: AgentDefinition[] = [
  {
    slug: "inbound-lead-qualifier",
    name: "Inbound Lead Qualifier",
    description:
      "Webhook-triggered: qualifies a freshly captured lead, routes hot leads to SMS and warm leads to email.",
    channel: "internal",
    eventTypes: ["lead.captured", "lead.qualified"],
    workflowPath: "n8n/workflows/01-inbound-lead-qualifier.json",
    promptKind: "sms_enrich",
    webhookPath: "aios-lead-inbound",
    usesClaude: true,
  },
  {
    slug: "daily-brief-generator",
    name: "Daily Brief Generator",
    description:
      "Scheduled 6am: rolls up yesterday's signals and sends the operator a 3–5 bullet action list via SMS.",
    channel: "internal",
    eventTypes: ["brief.generated", "sms.outbound.sent"],
    workflowPath: "n8n/workflows/02-daily-brief-generator.json",
    promptKind: "daily_brief",
    webhookPath: "aios-daily-brief",
    usesClaude: true,
  },
  {
    slug: "missed-call-auto-responder",
    name: "Missed-Call Auto-Responder",
    description:
      "Twilio missed-call webhook: sends an empathetic SMS within seconds inviting the caller to text or book.",
    channel: "sms",
    eventTypes: ["call.inbound.missed", "sms.outbound.sent"],
    workflowPath: "n8n/workflows/03-missed-call-auto-responder.json",
    promptKind: "missed_call_recovery",
    webhookPath: "aios-missed-call",
    usesClaude: true,
  },
  {
    slug: "elevenlabs-post-call-processor",
    name: "Post-Call Processor",
    description:
      "ElevenLabs webhook: summarizes completed calls, extracts booking intent, writes booking row if qualified.",
    channel: "voice",
    eventTypes: ["call.inbound.summarized", "booking.created"],
    workflowPath: "n8n/workflows/04-elevenlabs-post-call-processor.json",
    promptKind: "voice_qualify",
    webhookPath: "aios-voice-post-call",
    usesClaude: true,
  },
  {
    slug: "outbound-missed-call-voice",
    name: "Missed-Call Voice Recovery",
    description:
      "Optional: auto-dials a missed-call customer back via ElevenLabs Conversational AI to qualify and book.",
    channel: "voice",
    eventTypes: ["call.outbound.initiated", "booking.created"],
    workflowPath: "n8n/workflows/05-outbound-missed-call-voice.json",
    promptKind: "voice_qualify",
    webhookPath: "aios-missed-call-voice",
    usesClaude: true,
  },
  {
    slug: "marketing-dispatcher",
    name: "Marketing Re-Engagement",
    description:
      "Webhook or schedule: drafts personalized re-engagement SMS/email to opted-in past leads.",
    channel: "marketing",
    eventTypes: ["marketing.campaign.sent"],
    workflowPath: "n8n/workflows/06-marketing-dispatcher.json",
    promptKind: "marketing",
    webhookPath: "aios-marketing-send",
    usesClaude: true,
  },
  {
    slug: "email-dispatcher",
    name: "Email Dispatcher",
    description:
      "Webhook: drafts and sends email replies or quotes, personalized to each recipient's thread.",
    channel: "email",
    eventTypes: ["email.outbound.sent", "email.replies.received"],
    workflowPath: "n8n/workflows/07-email-dispatcher.json",
    promptKind: "email_draft",
    webhookPath: "aios-email-send",
    usesClaude: true,
  },
  {
    slug: "sms-convo-enrichment",
    name: "SMS Conversation Enrichment",
    description:
      "Async: analyzes ongoing SMS threads, extracts intent and urgency, flags objections for the operator.",
    channel: "sms",
    eventTypes: ["sms.conversation.summarized"],
    workflowPath: "n8n/workflows/08-sms-convo-enrichment.json",
    promptKind: "sms_enrich",
    webhookPath: "aios-sms-convo-enrich",
    usesClaude: true,
  },
];

export function getAgentBySlug(slug: string): AgentDefinition | undefined {
  return AGENT_CATALOG.find((a) => a.slug === slug);
}
