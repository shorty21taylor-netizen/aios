# n8n workflows

This folder holds the 8 n8n workflows that feed AIOS. Each one runs independently in n8n Cloud and POSTs events back to AIOS via HTTP.

## The rule

**Every LLM call is an HTTP Request to `https://api.anthropic.com/v1/messages`.** Do not use n8n's AI Agent node, Anthropic Chat Model node, or any LangChain-flavored abstraction. The system prompt is built at runtime from the tenant's `workspace_profiles` row.

## Canonical 5-node pattern

Every workflow that calls Claude follows this shape:

1. **Trigger** (Webhook / Schedule / Poll) — entry point
2. **AIOS: Fetch Tenant Profile** — `GET {{$env.AIOS_URL}}/api/profile/by-key` with `Authorization: Bearer {{$env.AIOS_WORKSPACE_KEY}}`
3. **Code: Build Claude Prompt** — compose `{ system, user }` from the profile JSON using `snippets/build-claude-system-prompt.js`
4. **HTTP: Claude Messages API** — `POST https://api.anthropic.com/v1/messages` with `x-api-key`, `anthropic-version: 2023-06-01`, body built from step 3
5. **Code: Build AIOS Event** + **AIOS: Report Event** — parse `response.content[0].text`, then POST to `{{$env.AIOS_URL}}/api/events`

WF8 (`08-sms-convo-enrichment.json`) is the reference implementation — the exact 5-node shape, fully wired.

## Files

| File | Trigger | Claude? | AIOS event(s) |
|---|---|---|---|
| 01-inbound-lead-qualifier.json | Webhook | Yes (qualify + route) | `lead.qualified`, `call.inbound.*` |
| 02-daily-brief-generator.json | Schedule 6am | Yes (brief generation) | `brief.generated`, `sms.outbound.sent` |
| 03-missed-call-auto-responder.json | Webhook | Yes (empathetic reply) | `call.inbound.missed`, `sms.outbound.sent` |
| 04-elevenlabs-post-call-processor.json | Webhook (from EL) | Yes (summary) | `call.inbound.summarized`, `booking.created` |
| 05-outbound-missed-call-voice.json | Webhook | Yes (script prep) | `call.outbound.initiated`, `booking.created` |
| 06-marketing-dispatcher.json | Webhook | Yes (message drafting) | `marketing.campaign.sent` |
| 07-email-dispatcher.json | Webhook | Yes (email body) | `email.outbound.sent` |
| 08-sms-convo-enrichment.json | Webhook | **Yes — reference impl** | `sms.conversation.summarized` |

## Environment variables (set in n8n Cloud → Credentials & Variables)

```
AIOS_URL             = https://your-aios-domain.com
AIOS_WORKSPACE_KEY   = <bearer key, generated in AIOS /dashboard/settings/api-keys>
ANTHROPIC_API_KEY    = sk-ant-...
TWILIO_ACCOUNT_SID   = ACxxxx
TWILIO_AUTH_TOKEN    = xxxx
ELEVENLABS_API_KEY   = xxxx (for workflows that call ElevenLabs)
```

Every tenant gets their own `AIOS_WORKSPACE_KEY`. In n8n Cloud, each tenant is either (a) their own n8n workspace with their own env vars, or (b) a shared n8n workspace where the key is passed into the webhook payload and the workflow uses that instead of `$env`. Option (a) is simpler; option (b) is cheaper at scale.

## Prompt composer

`snippets/build-claude-system-prompt.js` is a Code node function that takes the profile JSON and returns `{ system, user }` ready for the Anthropic API. Every workflow uses it (or a variant) so prompt quality stays consistent across SMS / voice / email / marketing agents.

A TypeScript mirror lives at `src/lib/profile/prompt-composer.ts` in the AIOS app. The dashboard uses it to preview what Claude will see — so when a contractor edits their profile at `/dashboard/settings/profile` they can see the live system prompt n8n will compose at runtime.

**Rule: if you change one composer, change the other.** A drift there silently makes the dashboard preview lie about what's actually being sent to Claude.

## Import into n8n Cloud

1. Open n8n Cloud → Workflows → Import from file.
2. Pick each `0N-*.json` file. n8n creates the workflow but leaves credentials blank.
3. For each workflow, open the HTTP Request nodes and pick (or create) an Anthropic credential — or set the `ANTHROPIC_API_KEY` env var and reference it in the header.
4. Update the Webhook URL in the trigger node to match your n8n instance's public URL (e.g. `https://your-n8n.app.n8n.cloud/webhook/aios-sms-convo-enrich`).
5. Activate the workflow.

## Testing

Test payloads for each workflow live in `n8n-workflows/test-payloads/` in the root SALESY.AI repo (reference only). Copy the relevant payload, `curl -X POST` it at the webhook URL, and watch the AIOS `/dashboard` light up.
