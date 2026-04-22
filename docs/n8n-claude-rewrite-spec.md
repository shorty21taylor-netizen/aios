# n8n Workflow Claude-Direct Audit & Rewrite Spec

**Audit Date:** 2026-04-22  
**Status:** Draft (Ready for Anthony's review)  
**Directive:** Replace all n8n AI abstraction nodes with direct HTTP POST to Anthropic API v1/messages  

---

## 1. Summary

### Workflows Scanned
8 total workflow JSONs in `/n8n-workflows/`:
- WF1: Inbound Lead Qualifier
- WF2: Daily Brief Generator
- WF3: Missed-Call Auto-Responder
- WF4: ElevenLabs Post-Call Processor
- WF5: Outbound Missed-Call Voice Dialer
- WF6: Marketing Dispatcher
- WF7: Email Dispatcher
- WF8: SMS Conversation Enrichment

### AI-Abstraction Nodes Flagged

**Total: 8 nodes requiring rewrite**

| Workflow | Node Type | Count | Status |
|----------|-----------|-------|--------|
| WF1 | `httpRequest` (already Claude-direct) | 1 | **CLEAN** |
| WF2 | `httpRequest` (already Claude-direct) | 3 | **CLEAN** |
| WF3 | `httpRequest` (already Claude-direct) | 1 | **CLEAN** |
| WF4 | `httpRequest` (already Claude-direct) | 1 | **CLEAN** |
| WF5 | ElevenLabs direct + no LLM | 0 | **CLEAN** |
| WF6 | Twilio + Postgres only | 0 | **CLEAN** |
| WF7 | Resend email + Postgres only | 0 | **CLEAN** |
| WF8 | `n8n-nodes-base.anthropic` (abstraction) | **1** | **NEEDS REWRITE** |

### Effort Estimate
- **WF8 rewrite:** 30–45 minutes (1 node replacement, system prompt extraction, error handling)
- **Testing/validation:** 30 minutes (verify JSON shape, confirm API responses)
- **Total:** ~1 focused hour

### Key Finding
**7 of 8 workflows are already using direct HTTP POST to Anthropic API**. Only WF8 uses n8n's built-in Anthropic abstraction node (`n8n-nodes-base.anthropic`). This is a **high-confidence, low-effort rewrite**.

---

## 2. Inventory Table

| Workflow File | Total Nodes | AI Nodes (w/ names) | Status | Effort |
|---------------|-------------|-------------------|--------|--------|
| 01-inbound-lead-qualifier.json | 8 | 1 × `httpRequest` to Anthropic | CLEAN | – |
| 02-daily-brief-generator.json | 11 | 3 × `httpRequest` to Anthropic | CLEAN | – |
| 03-missed-call-auto-responder.json | 9 | 1 × `httpRequest` to Anthropic | CLEAN | – |
| 04-elevenlabs-post-call-processor.json | 8 | 1 × `httpRequest` to Anthropic | CLEAN | – |
| 05-outbound-missed-call-voice.json | 7+ | ElevenLabs phone agent (no LLM node) | CLEAN | – |
| 06-marketing-dispatcher.json | 11 | None (Twilio + Postgres only) | CLEAN | – |
| 07-email-dispatcher.json | 11 | None (Resend + Postgres only) | CLEAN | – |
| 08-sms-convo-enrichment.json | 5 | 1 × `n8n-nodes-base.anthropic` | **NEEDS REWRITE** | **30–45 min** |

---

## 3. Per-Workflow Rewrite Specs

### WF1: Inbound Lead Qualifier ✓ CLEAN

**Current Status:** Already compliant. Uses `httpRequest` to `https://api.anthropic.com/v1/messages` with:
- Model: `claude-sonnet-4-6`
- Headers: `anthropic-version: 2023-06-01`
- Hardcoded system prompt (no business-profile injection yet, but correct pattern)

**No changes needed.** This is the reference pattern.

---

### WF2: Daily Brief Generator ✓ CLEAN

**Current Status:** Already compliant. Three sequential `httpRequest` nodes:

1. **Pass 1 — Signal Analysis** (`n3-pass1`)
   - Model: `claude-sonnet-4-6`
   - Input: 24h signal events
   - Output: JSON with patterns, anomalies, risk signals

2. **Pass 2 — Pattern Recognition** (`n5-pass2`)
   - Model: `claude-sonnet-4-6`
   - Input: Pass 1 output + KPIs
   - Output: JSON with bottleneck + top_actions

3. **Pass 3 — Brief Generation** (`n7-pass3`)
   - Model: `claude-sonnet-4-6`
   - Input: KPIs + Pass 2
   - Output: JSON with sms_text, voice_summary, priority, headline

All three use direct `httpRequest` with proper headers and JSON bodies.

**No changes needed.**

---

### WF3: Missed-Call Auto-Responder ✓ CLEAN

**Current Status:** Already compliant. One `httpRequest` node:

- **Claude — Draft Reply** (`n5-draft`)
  - Model: `claude-haiku-4-5-20251001` (latency-optimized for SMS drafting)
  - Input: Caller history + prior interactions
  - Output: JSON with sms text + tone

Direct `httpRequest` to Anthropic with proper headers.

**No changes needed.**

---

### WF4: ElevenLabs Post-Call Processor ✓ CLEAN

**Current Status:** Already compliant. One `httpRequest` node:

- **Claude — Extract Lead Data** (`n3-extract`)
  - Model: `claude-sonnet-4-6`
  - Input: Call transcript + direction + duration
  - Output: JSON with intent_score, service_type, timeline, budget_signal, address, caller_name, concerns, suggested_action, summary, urgency_reason

Direct `httpRequest` to Anthropic.

**No changes needed.**

---

### WF5: Outbound Missed-Call Voice Dialer ✓ CLEAN

**Current Status:** No LLM nodes. Uses ElevenLabs Conversational AI phone agent directly (already approved, compliant with voice architecture).

**No changes needed.**

---

### WF6: Marketing Dispatcher ✓ CLEAN

**Current Status:** No LLM nodes. Pure marketing SMS dispatcher (Twilio + Postgres consent checks).

**No changes needed.**

---

### WF7: Email Dispatcher ✓ CLEAN

**Current Status:** No LLM nodes. Pure email dispatcher (Resend API + Postgres).

**No changes needed.**

---

### WF8: SMS Conversation Enrichment — NEEDS REWRITE

**Current Status:** Uses n8n's built-in `n8n-nodes-base.anthropic` node (abstraction layer). **FLAGGED FOR REPLACEMENT.**

#### Current Architecture

Node chain:
1. **Webhook** — receives SMS conversation enrichment trigger
2. **HTTP POST** — fetches conversation context from Railway API
3. **Claude: Analyze & Summarize** (`claude-enrich`, **node type: `n8n-nodes-base.anthropic`**)
   - Hardcoded system prompt (no business profile injection)
   - Takes conversation_history + contact_phone + vertical + prior_touches
   - Returns JSON with intent, bookingScore, urgency, sentiment, actionItems
4. **Set** node — transforms Claude response into signal_event shape
5. **HTTP POST** — submits signal_event to Railway API

#### Problem
Node `claude-enrich` uses n8n's Anthropic wrapper, which:
- Hides the actual HTTP request shape
- No explicit control over headers (anthropic-version, x-api-key)
- Harder to debug request/response
- Not aligned with "Claude-direct" architectural pattern

#### New Node Sequence (Replacement)

Replace the single `n8n-nodes-base.anthropic` node with this sequence:

**NEW N1: Fetch Business Profile (HTTP GET)**
```
Node ID:   n3a-fetch-profile
Name:      "HTTP GET: Fetch Business Profile"
Type:      n8n-nodes-base.httpRequest
Method:    GET
URL:       ={{ $env.AIOS_URL }}/api/profile/by-key
Headers:
  - Authorization: Bearer {{ $env.AIOS_WORKSPACE_KEY }}
  - Content-Type: application/json
Timeout:   5000ms
Retry:     2 attempts, exponential backoff
Expected response shape:
{
  "id": "uuid",
  "org_id": "uuid",
  "business_name": "string",
  "vertical": "roofing|hvac|solar|exteriors|remodeling",
  "booking_url": "string",
  "brand_tone": "string",
  "voice_persona": "string",
  "details": {
    "services": [{ "name": "string", "id": "string" }],
    "booking_rules": {
      "book_when": "string",
      "decline_when": "string"
    },
    "top_faqs": [{ "q": "string", "a": "string" }],
    "common_objections": ["string"],
    "brand_voice_dos": ["string"],
    "brand_voice_donts": ["string"],
    "escalation_rules": ["string"]
  }
}
```

**NEW N2: Build System Prompt (Code node)**
```
Node ID:   n3b-build-prompt
Name:      "Code: Build System Prompt"
Type:      n8n-nodes-base.code
Language:  javascript

Code:
```javascript
const profile = $('HTTP GET: Fetch Business Profile').item.json;

const system_prompt = `You are an SMS conversation analyzer for ${profile.business_name}, a ${profile.vertical} business.

Services: ${profile.details.services.map(s => s.name).join(', ')}
Booking URL: ${profile.booking_url}
Brand tone: ${profile.brand_tone}
Voice persona: ${profile.voice_persona}

When to book a customer: ${profile.details.booking_rules.book_when}
When to decline: ${profile.details.booking_rules.decline_when}

Top FAQs:
${profile.details.top_faqs.map(faq => `Q: ${faq.q}\nA: ${faq.a}`).join('\n\n')}

Common objections to expect:
${profile.details.common_objections.map((obj, i) => `${i+1}. ${obj}`).join('\n')}

Brand voice dos: ${profile.details.brand_voice_dos.join('; ')}
Brand voice don'ts: ${profile.details.brand_voice_donts.join('; ')}

Escalation rules: ${profile.details.escalation_rules.join('; ')}

Your job: Analyze an SMS conversation. Output STRICT JSON with keys:
- intent: "string" (what the customer is trying to accomplish)
- bookingScore: number (0-10, 10 = ready to book today)
- urgency: "low" | "medium" | "high"
- sentiment: "positive" | "neutral" | "negative"
- actionItems: ["string", ...] (3-5 specific next steps the operator should take)

Be conservative with booking scores. Only 8+ if customer explicitly asks to schedule or shows immediate intent.`;

const context = $('HTTP POST: Fetch Conversation Context').item.json;

const user_message = `Analyze this SMS conversation for ${profile.business_name}:

Conversation history:
${context.conversation_history}

Customer phone: ${context.contact_phone}
Vertical: ${context.vertical}
Prior interactions: ${context.prior_touches || 'None'}

Return STRICT JSON only. No prose before or after.`;

return { 
  json: { 
    system_prompt, 
    user_message 
  } 
};
```
```

**NEW N3: Call Claude API (HTTP POST)**
```
Node ID:   n3c-call-claude
Name:      "HTTP POST: Claude Messages API"
Type:      n8n-nodes-base.httpRequest
Method:    POST
URL:       https://api.anthropic.com/v1/messages
Authentication: httpHeaderAuth
Headers:
  - x-api-key: {{ $env.ANTHROPIC_API_KEY }}
  - anthropic-version: 2023-06-01
  - content-type: application/json
Body (raw JSON):
{{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "system": {{ JSON.stringify($('Code: Build System Prompt').item.json.system_prompt) }},
  "messages": [
    {
      "role": "user",
      "content": {{ JSON.stringify($('Code: Build System Prompt').item.json.user_message) }}
    }
  ]
}}
Timeout:   30000ms
Retry:     3 attempts, exponential backoff (1s, 2s, 4s)
Expected response:
{
  "id": "msg_...",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "{...JSON...}"
    }
  ],
  "model": "claude-sonnet-4-6",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": number,
    "output_tokens": number
  }
}
```

**NEW N4: Parse Claude Response (Code node)**
```
Node ID:   n3d-parse-claude
Name:      "Code: Parse Claude JSON Response"
Type:      n8n-nodes-base.code
Language:  javascript

Code:
```javascript
const response = $('HTTP POST: Claude Messages API').item.json;
const text = (response.content && response.content[0] && response.content[0].text) || '{}';

let parsed;
try {
  // Extract JSON from response (in case there's surrounding text)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : text;
  parsed = JSON.parse(jsonStr);
} catch (e) {
  // Fallback if parsing fails
  parsed = {
    intent: 'parse_failed',
    bookingScore: 0,
    urgency: 'unknown',
    sentiment: 'neutral',
    actionItems: ['Operator review needed due to parse error']
  };
}

return {
  json: {
    ...parsed,
    _raw_text: text,
    _model: response.model,
    _usage: response.usage,
    _error: parsed.intent === 'parse_failed' ? 'JSON parse failed' : null
  }
};
```
```

#### New Event to Fire (AIOS Integration)

After parsing Claude's response, instead of inserting to signal_events table directly, **fire an AIOS event**:

**NEW N5: POST to AIOS (HTTP POST)**
```
Node ID:   n3e-fire-aios-event
Name:      "HTTP POST: Fire SMS Conversation Event to AIOS"
Type:      n8n-nodes-base.httpRequest
Method:    POST
URL:       {{ $env.AIOS_URL }}/api/events?version=1
Headers:
  - Authorization: Bearer {{ $env.AIOS_WORKSPACE_KEY }}
  - Content-Type: application/json
Body (raw JSON):
{
  "event_type": "sms.enriched",
  "occurred_at": "{{ new Date().toISOString() }}",
  "idempotency_key": "sms_enrich:{{ $('Code: Parse Claude JSON Response').item.json.conversation_id }}",
  "correlation_id": "{{ $('Webhook: SMS Convo Enrichment').item.json.conversation_id }}",
  "data": {
    "conversation_id": "{{ $('Webhook: SMS Convo Enrichment').item.json.conversation_id }}",
    "contact_phone": "{{ $('HTTP POST: Fetch Conversation Context').item.json.contact_phone }}",
    "intent": "{{ $('Code: Parse Claude JSON Response').item.json.intent }}",
    "booking_score": {{ $('Code: Parse Claude JSON Response').item.json.bookingScore }},
    "urgency": "{{ $('Code: Parse Claude JSON Response').item.json.urgency }}",
    "sentiment": "{{ $('Code: Parse Claude JSON Response').item.json.sentiment }}",
    "action_items": {{ JSON.stringify($('Code: Parse Claude JSON Response').item.json.actionItems) }},
    "claude_model": "{{ $('Code: Parse Claude JSON Response').item.json._model }}",
    "tokens_used": {{ $('Code: Parse Claude JSON Response').item.json._usage.input_tokens + $('Code: Parse Claude JSON Response').item.json._usage.output_tokens }}
  }
}
Timeout:   10000ms
Retry:     3 attempts (429 → wait 60s; 5xx → exponential backoff)
Expected response: 
{ "ok": true, "event_id": "evt_...", "deduped": false }
```

#### Summary for WF8

**Old node to remove:**
- `n3-claude-enrich` (type: `n8n-nodes-base.anthropic`)

**New nodes to insert (in order):**
1. `n3a-fetch-profile` — HTTP GET to AIOS
2. `n3b-build-prompt` — Code node to construct system prompt from profile
3. `n3c-call-claude` — HTTP POST to Anthropic API
4. `n3d-parse-claude` — Code node to parse JSON + error handling
5. `n3e-fire-aios-event` — HTTP POST to AIOS /api/events

**Updated connections:**
- Remove: `postgres-fetch-context` → `n3-claude-enrich`
- Add: `postgres-fetch-context` → `n3a-fetch-profile` → `n3b-build-prompt` → `n3c-call-claude` → `n3d-parse-claude` → `n3e-fire-aios-event` → `transform-signal` (or remove transform-signal if AIOS event is sufficient)

**System Prompt Template (for WF8):**
```
You are an SMS conversation analyzer for ${profile.business_name}, a ${profile.vertical} business.

Services: ${profile.details.services.map(s => s.name).join(', ')}
Booking URL: ${profile.booking_url}
Brand tone: ${profile.brand_tone}
Voice persona: ${profile.voice_persona}

When to book a customer: ${profile.details.booking_rules.book_when}
When to decline: ${profile.details.booking_rules.decline_when}

Top FAQs:
${profile.details.top_faqs.map(faq => `Q: ${faq.q}\nA: ${faq.a}`).join('\n\n')}

Common objections: ${profile.details.common_objections.join('; ')}

Brand dos: ${profile.details.brand_voice_dos.join('; ')}
Brand don'ts: ${profile.details.brand_voice_donts.join('; ')}

Escalation rules: ${profile.details.escalation_rules.join('; ')}

Output JSON with keys: intent, bookingScore (0-10), urgency (low|medium|high), sentiment (positive|neutral|negative), actionItems (array of strings).
```

**Expected Output Schema (JSON):**
```typescript
interface SmsEnrichmentOutput {
  intent: string;              // what customer wants
  bookingScore: number;        // 0-10 scale
  urgency: "low" | "medium" | "high";
  sentiment: "positive" | "neutral" | "negative";
  actionItems: string[];       // 3-5 operator actions
}
```

**Error Handling:**
- **Anthropic 429 (rate limited):** Retry after `retry-after` header (or 60s default)
- **Anthropic 5xx:** Exponential backoff (1s, 2s, 4s, 8s, give up)
- **JSON parse failure:** Return fallback with `_error` flag; operator manual review needed
- **AIOS 401/403:** Check `AIOS_WORKSPACE_KEY` env var; alert ops

**KPI Event to Fire:**
- **Event type:** `sms.enriched` (proposed for v2 event catalog; v1 may not use this yet)
- **Idempotency key:** `sms_enrich:{conversation_id}`
- **Correlation ID:** `{conversation_id}` (to link back to original SMS)

---

## 4. Agent → Workflow Map

| Agent Role | Workflow(s) | Node | Model | Purpose |
|-----------|-----------|------|-------|---------|
| Inbound Lead Qualifier | WF1 | n3-classify | claude-sonnet-4-6 | Assess inbound lead quality, urgency, budget |
| Decision Engine (Brief) | WF2 | n3-pass1, n5-pass2, n7-pass3 | claude-sonnet-4-6 | 3-pass signal → decision chain |
| Missed-Call SMS Drafter | WF3 | n5-draft | claude-haiku-4-5-20251001 | Draft auto-reply SMS (latency-optimized) |
| Post-Call Lead Extractor | WF4 | n3-extract | claude-sonnet-4-6 | Extract structured data from call transcript |
| Outbound Missed-Call Voice Agent | WF5 | (ElevenLabs ConvAI) | N/A (voice) | ElevenLabs phone agent, no LLM node |
| Marketing Dispatcher | WF6 | (none) | N/A | Pre-written SMS, consent checks |
| Email Dispatcher | WF7 | (none) | N/A | Resend API, pre-written emails |
| SMS Conversation Analyzer | WF8 | n3-claude-enrich (→ replace) | claude-sonnet-4-6 | Analyze SMS convo, detect intent/booking likelihood |

---

## 5. Common Boilerplate Library

### Canonical Fetch Business Profile Node

```json
{
  "parameters": {
    "method": "GET",
    "url": "={{ $env.AIOS_URL }}/api/profile/by-key",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "=Bearer {{ $env.AIOS_WORKSPACE_KEY }}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "options": {
      "timeout": 5000
    }
  },
  "id": "fetch-aios-profile",
  "name": "HTTP GET: Fetch Business Profile",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [400, 300],
  "credentials": {}
}
```

### Canonical Call Claude Node

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.anthropic.com/v1/messages",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "x-api-key",
          "value": "={{ $env.ANTHROPIC_API_KEY }}"
        },
        {
          "name": "anthropic-version",
          "value": "2023-06-01"
        },
        {
          "name": "content-type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"model\": \"claude-sonnet-4-6\",\n  \"max_tokens\": 1024,\n  \"system\": {{ JSON.stringify($('Build Prompt').item.json.system_prompt) }},\n  \"messages\": [\n    { \"role\": \"user\", \"content\": {{ JSON.stringify($('Build Prompt').item.json.user_message) }} }\n  ]\n}",
    "options": {
      "timeout": 30000,
      "retry": {
        "maxRetries": 3,
        "retryOnFailures": true
      }
    }
  },
  "id": "call-claude-api",
  "name": "HTTP POST: Call Claude API",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [640, 300],
  "credentials": {}
}
```

### Canonical Parse Claude JSON Node

```json
{
  "parameters": {
    "jsCode": "const response = items[0].json;\nconst text = (response.content && response.content[0] && response.content[0].text) || '{}';\nlet parsed;\ntry {\n  const jsonStart = text.indexOf('{');\n  const jsonEnd = text.lastIndexOf('}');\n  if (jsonStart >= 0 && jsonEnd > jsonStart) {\n    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));\n  } else {\n    parsed = { _error: 'no_json_found', _raw: text };\n  }\n} catch (e) {\n  parsed = { _error: 'json_parse_failed', _raw: text };\n}\nreturn [{ json: { ...parsed, _model: response.model, _usage: response.usage } }];"
  },
  "id": "parse-claude-response",
  "name": "Code: Parse Claude JSON",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [860, 300]
}
```

### Canonical Fire AIOS Event Node

```json
{
  "parameters": {
    "method": "POST",
    "url": "={{ $env.AIOS_URL }}/api/events?version=1",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "=Bearer {{ $env.AIOS_WORKSPACE_KEY }}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"event_type\": \"{{ $json.event_type }}\",\n  \"occurred_at\": \"{{ $json.occurred_at }}\",\n  \"idempotency_key\": \"{{ $json.idempotency_key }}\",\n  \"correlation_id\": \"{{ $json.correlation_id }}\",\n  \"data\": {{ JSON.stringify($json.data) }}\n}",
    "options": {
      "timeout": 10000,
      "retry": {
        "maxRetries": 3,
        "retryOnFailures": true
      }
    }
  },
  "id": "fire-aios-event",
  "name": "HTTP POST: Fire AIOS Event",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1080, 300],
  "credentials": {}
}
```

---

## 6. Migration Plan

### Recommended Order

1. **Phase 1 (immediate):** WF8 SMS Conversation Enrichment
   - Most isolated workflow (no dependencies on other WFs)
   - Single node replacement (lowest risk)
   - Tests the fetch-profile + build-prompt + call-claude + parse + fire-event pattern
   - Once WF8 succeeds, pattern can be applied to other workflows

2. **Phase 2 (optional, if business-profile injection needed):** WF1–WF4
   - Currently using hardcoded system prompts
   - If vertical/brand customization needed, inject profile data into system prompts
   - No node replacement needed (already HTTP-direct), just prompt enhancement
   - Update model IDs to import from `src/lib/ai/model-config.ts` (Chatty AI reference)

3. **Phase 3 (optional):** WF5–WF7
   - WF5: ElevenLabs voice agent (already compliant, no changes)
   - WF6, WF7: No LLM nodes (already clean)

### Checklist for WF8 Rewrite

- [ ] Read current WF8 JSON
- [ ] Extract system prompt from `claude-enrich` node
- [ ] Write replacement node specs (5 new nodes)
- [ ] Test JSON validation (parse all code blocks)
- [ ] Import to n8n (or manually edit in UI)
- [ ] Set env vars: `AIOS_URL`, `AIOS_WORKSPACE_KEY`, `ANTHROPIC_API_KEY`
- [ ] Execute sample SMS conversation enrichment
- [ ] Verify Claude response is parsed correctly
- [ ] Verify AIOS event is posted (check /api/events audit log)
- [ ] Confirm idempotency key format matches catalog (`sms_enrich:{conversation_id}`)

---

## 7. Environment Variables n8n Needs

### Required (WF8 rewrite + all new workflows)

```
ANTHROPIC_API_KEY              # sk-ant-... (shared Anthropic account)
AIOS_URL                       # https://aios.your-domain.com (Railway AIOS app URL)
AIOS_WORKSPACE_KEY             # sk_aios_1234567890abcdef... (per-workspace secret from AIOS Admin)
```

### Optional (other workflows, already in use)

```
TWILIO_ACCOUNT_SID             # AC1234567890abcdef... (shared)
TWILIO_AUTH_TOKEN              # auth_token (shared)
TWILIO_PHONE_NUMBER            # +1-404-555-1234 (shared)
ELEVENLABS_API_KEY             # xi-... (shared)
ELEVENLABS_PHONE_NUMBER_ID     # phone_1234... (for WF5)
ELEVENLABS_VOICE_ID            # 21m00Tcm4TlvDq8ikWAM (or custom voice clone ID)
```

### Scoping Strategy

**Option A (Recommended for v1):**
- Store `AIOS_WORKSPACE_KEY` per workspace in n8n's Credentials UI
- Each n8n workspace (tenant) gets its own credential entry
- n8n workflow references the credential ID (not hardcoded env var)
- Simplest for multi-tenant scaling

**Option B (Alternative for v1):**
- Store `AIOS_WORKSPACE_KEY` as environment variable
- Use one n8n Cloud workspace for all tenants
- Pass workspace identifier in webhook payloads (e.g., `?workspace_id=xyz`)
- More complex orchestration, but scales to thousands of tenants

**Recommendation:** Option A for now (one n8n workspace per contractor tenant, or one shared workspace with per-workspace credentials for future SaaS scaling).

---

## 8. Testing Strategy

### Manual Test for WF8

**Setup:**
1. Create an SMS conversation in Postgres (signal_events with event_type = `sms.inbound.received`)
2. Trigger WF8 webhook with:
   ```json
   {
     "org_id": "test-org-uuid",
     "conversation_id": "conv_123",
     "contact_phone": "+15551234567"
   }
   ```

**Expected flow:**
1. Webhook received
2. Fetch conversation context from AIOS (or mock Railway API)
3. Fetch business profile from AIOS
4. Build system prompt
5. Call Claude API with 30s timeout
6. Parse JSON response
7. Fire `sms.enriched` event to AIOS
8. Verify event in AIOS audit log (deduping via idempotency key)

**Assertions:**
- [ ] Claude response is valid JSON
- [ ] Booking score is 0–10 (integer)
- [ ] AIOS returns `{ ok: true, event_id: "...", deduped: false }`
- [ ] Idempotency key is deterministic: re-running same conversation returns `deduped: true`
- [ ] Usage tokens are logged (for billing)

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| AIOS `/api/profile/by-key` API not ready | Medium | High | Fallback to default system prompt if API returns 5xx; retry with backoff |
| Anthropic API latency (>30s) | Low | Medium | Increase timeout to 45s; switch to Haiku for WF8 if urgent |
| JSON parsing edge cases | Low | Low | Add try/catch with fallback; operator review flag in _error field |
| Idempotency key collision | Very low | Medium | Use deterministic format (conversation_id); AIOS enforces 24h window |
| AIOS workspace key rotation | Low | Medium | Document key rotation procedure; test with new key before revoke old |

---

## 10. Follow-Up Checklist

- [ ] Anthony reviews this spec and approves WF8 rewrite
- [ ] Confirm AIOS API is deployed (business profile endpoint working)
- [ ] Import WF8 rewrite JSON to n8n
- [ ] Set env vars in n8n workspace
- [ ] Run manual test
- [ ] Verify AIOS event ingestion
- [ ] Update n8n skill (SALESY.AI repo) with new WF8 pattern
- [ ] Document event flow in CLAUDE.md (next time you ship AIOS changes)
- [ ] Create follow-up task: "Inject business profile into WF1-WF4 system prompts"

---

## 11. Summary of Findings

**Status: AUDIT COMPLETE**

**Verdict:** Excellent baseline. 7 of 8 workflows already comply with "Claude-direct" architecture. Only WF8 uses n8n abstraction layer, and it's a straightforward replacement (1 node → 5 nodes, ~45 min effort).

**Biggest win:** Rewriting WF8 establishes the fetch-profile → build-prompt → call-claude → parse → fire-event pattern, which can be used for future AIOS integration work in Chatty AI.

**Hardest part:** Building the business profile into WF8's system prompt correctly (requires AIOS API to be stable). Once that's working, can scale to other workflows.

**Next:** Wait for Anthony approval, then apply WF8 rewrite in a follow-up session.

---

**End of n8n Workflow Audit Spec v1**
