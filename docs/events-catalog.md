# AIOS Event Catalog v1

**Last updated:** 2026-04-21  
**Status:** Production  
**Versioning:** Semantic (v1, v2, etc.). Breaking schema changes require version bump.

---

## 1. Overview

The AIOS event catalog is the single source of truth for all events POSTed to `AIOS/api/events` from n8n workflows. It defines:

- **Event types** — what real-world actions trigger an event
- **Payload schema** — required and optional fields for each event
- **Idempotency rules** — how AIOS deduplicates duplicate POSTs
- **Authentication** — how n8n workflows authenticate with AIOS
- **KPI mapping** — which events feed into AIOS's 9 KPI cards

Every n8n workflow (WF1–WF8) POSTs events to this API when key business actions occur (calls received, messages sent, bookings made, deals closed). AIOS reads these events to calculate the 9 KPI cards displayed on the v1 dashboard.

### Versioning

- **v1** is this document. All events defined here are in production.
- **v2+** will be introduced if AIOS requires a breaking change (e.g., removing or renaming a required field).
- n8n workflows must always POST with the correct API version in the URL: `POST /api/events?version=1`.
- AIOS will accept v1 events indefinitely; v2 POSTs will only be accepted after v2 launches.

### Authentication

Every POST to `/api/events` must include an `Authorization` header:

```
Authorization: Bearer <workspace_api_key>
```

- **workspace_api_key** — a secret string generated in AIOS Admin Settings. AIOS looks up the workspace by hashing this key (SHA-256) and resolving the workspace_id from the database.
- n8n workflows **must never** include workspace_id in the body; AIOS infers it from the API key.
- Revoked keys return 403 Forbidden.
- Missing keys return 401 Unauthorized.

### Idempotency

Duplicate POSTs are inevitable (n8n retries on timeout, network flakes, etc.). AIOS prevents double-counting via **idempotency keys**:

- Every event **must** have a deterministic `idempotency_key` field (specified per event type below).
- If AIOS receives two events with the same `idempotency_key` within a 24h window, the second POST returns `{ok: true, deduped: true}` and the event is not processed again.
- Each event type has a recommended idempotency key format (e.g., `twilio:{callSid}`). Use the format exactly as specified.

---

## 2. Common Envelope

Every event POSTed to `/api/events` shares this top-level JSON structure:

```typescript
interface EventEnvelope {
  event_type: string;
  occurred_at: string; // ISO 8601 UTC, e.g. "2026-04-21T14:32:00Z"
  idempotency_key: string; // deterministic, unique per event
  correlation_id: string; // trace ID for linking related events
  data: Record<string, unknown>; // event-specific payload
}
```

- **event_type** — e.g., `call.inbound.received`, `sms.outbound.sent`. See section 3 for all types.
- **occurred_at** — RFC 3339 UTC timestamp when the real-world action happened (not when the POST was sent). Example: `"2026-04-21T14:32:00.123Z"`.
- **idempotency_key** — deterministic string derived from the source system's event ID (see each event type for format). Must be unique per workspace per event type.
- **correlation_id** — trace ID to link related events. For a call that becomes a booking, both `call.inbound.answered` and `call.booked` events share the same `correlation_id` (usually the Twilio callSid or similar).
- **data** — event-specific payload. See section 3 for the schema of each event type.

### Headers

All POSTs must include:

```
Authorization: Bearer <workspace_api_key>
Content-Type: application/json
```

---

## 3. Event Reference

### 3.1 `call.inbound.received`

**Description:** An inbound call arrived at a Twilio number provisioned for this workspace.

**Fires from:** WF1, WF4 (Twilio webhook → n8n)  
**Trigger node:** Twilio Webhook (HTTP trigger in n8n receives the POST from Twilio, then n8n POSTs to AIOS)

**Idempotency key format:** `twilio:{callSid}`

**Payload schema:**

```typescript
interface CallInboundReceivedEvent {
  call_sid: string; // Twilio Call SID, e.g. "CA1234567890abcdef"
  from_number: string; // caller's E.164 phone number, e.g. "+15551234567"
  to_number: string; // the Twilio number called, e.g. "+14045551234"
  received_at: string; // ISO 8601 UTC timestamp of when Twilio received the call
}
```

**Zod schema:**

```typescript
import { z } from "zod";

export const callInboundReceivedSchema = z.object({
  event_type: z.literal("call.inbound.received"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("twilio:"),
  correlation_id: z.string(),
  data: z.object({
    call_sid: z.string(),
    from_number: z.string().regex(/^\+\d{10,15}$/),
    to_number: z.string().regex(/^\+\d{10,15}$/),
    received_at: z.string().datetime(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "call.inbound.received",
  "occurred_at": "2026-04-21T14:32:00Z",
  "idempotency_key": "twilio:CA1234567890abcdef",
  "correlation_id": "twilio:CA1234567890abcdef",
  "data": {
    "call_sid": "CA1234567890abcdef",
    "from_number": "+15551234567",
    "to_number": "+14045551234",
    "received_at": "2026-04-21T14:32:00Z"
  }
}
```

**KPI impact:** Increments "Inbound calls received" counter.

---

### 3.2 `call.inbound.answered`

**Description:** The ElevenLabs voice agent picked up the inbound call (connection established, agent is now in conversation with the caller).

**Fires from:** WF1, WF4 (ElevenLabs agent → n8n post-call processor)  
**Trigger node:** ElevenLabs Conversational AI agent sends a webhook to n8n after the call is connected; n8n POSTs to AIOS.

**Idempotency key format:** `twilio:{callSid}:answered`

**Payload schema:**

```typescript
interface CallInboundAnsweredEvent {
  call_sid: string; // Twilio Call SID
  from_number: string; // caller's E.164 phone number
  to_number: string; // the Twilio number called
  agent_id: string; // ElevenLabs agent ID that picked up
  answered_at: string; // ISO 8601 UTC timestamp when agent connected
  wait_time_seconds: number; // seconds between received and answered (0 or minimal for immediate pickup)
}
```

**Zod schema:**

```typescript
export const callInboundAnsweredSchema = z.object({
  event_type: z.literal("call.inbound.answered"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("twilio:").endsWith(":answered"),
  correlation_id: z.string(),
  data: z.object({
    call_sid: z.string(),
    from_number: z.string().regex(/^\+\d{10,15}$/),
    to_number: z.string().regex(/^\+\d{10,15}$/),
    agent_id: z.string(),
    answered_at: z.string().datetime(),
    wait_time_seconds: z.number().min(0),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "call.inbound.answered",
  "occurred_at": "2026-04-21T14:32:15Z",
  "idempotency_key": "twilio:CA1234567890abcdef:answered",
  "correlation_id": "twilio:CA1234567890abcdef",
  "data": {
    "call_sid": "CA1234567890abcdef",
    "from_number": "+15551234567",
    "to_number": "+14045551234",
    "agent_id": "eleven_labs_agent_123",
    "answered_at": "2026-04-21T14:32:15Z",
    "wait_time_seconds": 15
  }
}
```

**KPI impact:**
- Increments "Inbound calls answered" counter.
- Used to calculate answer rate (answered / received). **Anthony's v1 KPI: this rate must always be 100%.**

---

### 3.3 `call.booked`

**Description:** During the inbound call, the ElevenLabs agent successfully booked an appointment for the caller.

**Fires from:** WF1, WF4 (ElevenLabs post-call processor → n8n)  
**Trigger node:** ElevenLabs Conversational AI agent (with built-in booking logic) confirms the booking and sends webhook to n8n; n8n POSTs to AIOS.

**Idempotency key format:** `twilio:{callSid}:booked`

**Payload schema:**

```typescript
interface CallBookedEvent {
  call_sid: string; // Twilio Call SID
  from_number: string; // caller's E.164 phone number
  to_number: string; // the Twilio number called
  booking_id: string; // unique ID for this booking (from your CRM or internal system)
  estimated_value: number; // estimated job/project value in cents (e.g., 15000 = $150)
  service_type: string; // e.g., "roofing_inspection", "hvac_maintenance", "solar_quote"
  caller_name?: string; // optional: name collected during call
  caller_email?: string; // optional: email collected during call
  booked_for_date?: string; // optional: ISO 8601 date of the appointment
}
```

**Zod schema:**

```typescript
export const callBookedSchema = z.object({
  event_type: z.literal("call.booked"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("twilio:").endsWith(":booked"),
  correlation_id: z.string(),
  data: z.object({
    call_sid: z.string(),
    from_number: z.string().regex(/^\+\d{10,15}$/),
    to_number: z.string().regex(/^\+\d{10,15}$/),
    booking_id: z.string(),
    estimated_value: z.number().int().min(0),
    service_type: z.string(),
    caller_name: z.string().optional(),
    caller_email: z.string().email().optional(),
    booked_for_date: z.string().date().optional(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "call.booked",
  "occurred_at": "2026-04-21T14:35:00Z",
  "idempotency_key": "twilio:CA1234567890abcdef:booked",
  "correlation_id": "twilio:CA1234567890abcdef",
  "data": {
    "call_sid": "CA1234567890abcdef",
    "from_number": "+15551234567",
    "to_number": "+14045551234",
    "booking_id": "bk_987654321",
    "estimated_value": 25000,
    "service_type": "roofing_inspection",
    "caller_name": "John Smith",
    "caller_email": "john@example.com",
    "booked_for_date": "2026-04-25"
  }
}
```

**KPI impact:**
- Increments "Bookings from calls" counter.
- Adds `estimated_value` to "Pipeline value of booked calls" KPI.

---

### 3.4 `sms.outbound.sent`

**Description:** n8n sent an outbound SMS message to a recipient via Twilio (e.g., responding to an inquiry, sending a quote reminder, or proactive reengagement).

**Fires from:** WF2, WF6 (n8n SMS dispatcher → AIOS)  
**Trigger node:** Twilio Send Message node in n8n; after the message is sent, n8n immediately POSTs to AIOS.

**Idempotency key format:** `twilio_sms:{messageSid}`

**Payload schema:**

```typescript
interface SmsOutboundSentEvent {
  message_sid: string; // Twilio Message SID
  to_number: string; // recipient's E.164 phone number
  from_number: string; // the Twilio number sending (workspace's provisioned number)
  body: string; // the SMS body text (up to 160 chars or segmented)
  message_count: number; // number of SMS segments (1–10)
  sent_at: string; // ISO 8601 UTC timestamp
  campaign_id?: string; // optional: if this is part of a reengagement campaign, the campaign ID
  context?: string; // optional: "inquiry_response", "quote_reminder", "reengagement", etc.
}
```

**Zod schema:**

```typescript
export const smsOutboundSentSchema = z.object({
  event_type: z.literal("sms.outbound.sent"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("twilio_sms:"),
  correlation_id: z.string(),
  data: z.object({
    message_sid: z.string(),
    to_number: z.string().regex(/^\+\d{10,15}$/),
    from_number: z.string().regex(/^\+\d{10,15}$/),
    body: z.string().min(1).max(1600),
    message_count: z.number().int().min(1).max(10),
    sent_at: z.string().datetime(),
    campaign_id: z.string().optional(),
    context: z.enum(["inquiry_response", "quote_reminder", "reengagement", "other"]).optional(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "sms.outbound.sent",
  "occurred_at": "2026-04-21T14:40:00Z",
  "idempotency_key": "twilio_sms:SM1234567890abcdef",
  "correlation_id": "inquiry_20260421_001",
  "data": {
    "message_sid": "SM1234567890abcdef",
    "to_number": "+15551234567",
    "from_number": "+14045551234",
    "body": "Hi John! Your roof inspection is scheduled for April 25 at 10am. Reply CONFIRM to verify or RESCHEDULE to change.",
    "message_count": 2,
    "sent_at": "2026-04-21T14:40:00Z",
    "campaign_id": "camp_123",
    "context": "inquiry_response"
  }
}
```

**KPI impact:** Increments "SMS messages sent from inquiries" counter.

---

### 3.5 `sms.inbound.received`

**Description:** An inbound SMS arrived from a customer to one of the workspace's Twilio numbers (e.g., a reply to an outbound SMS, or a new inquiry).

**Fires from:** WF2, WF8 (Twilio webhook → n8n)  
**Trigger node:** Twilio Webhook (HTTP trigger in n8n receives the POST from Twilio; n8n processes and POSTs to AIOS).

**Idempotency key format:** `twilio_sms:{messageSid}`

**Payload schema:**

```typescript
interface SmsInboundReceivedEvent {
  message_sid: string; // Twilio Message SID
  from_number: string; // sender's E.164 phone number
  to_number: string; // the Twilio number that received it (workspace's provisioned number)
  body: string; // the SMS body text
  received_at: string; // ISO 8601 UTC timestamp
  is_reply_to?: string; // optional: message_sid of the outbound message this is replying to (for threading)
}
```

**Zod schema:**

```typescript
export const smsInboundReceivedSchema = z.object({
  event_type: z.literal("sms.inbound.received"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("twilio_sms:"),
  correlation_id: z.string(),
  data: z.object({
    message_sid: z.string(),
    from_number: z.string().regex(/^\+\d{10,15}$/),
    to_number: z.string().regex(/^\+\d{10,15}$/),
    body: z.string().min(1),
    received_at: z.string().datetime(),
    is_reply_to: z.string().optional(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "sms.inbound.received",
  "occurred_at": "2026-04-21T14:42:30Z",
  "idempotency_key": "twilio_sms:SM9876543210fedcba",
  "correlation_id": "inquiry_20260421_001",
  "data": {
    "message_sid": "SM9876543210fedcba",
    "from_number": "+15551234567",
    "to_number": "+14045551234",
    "body": "CONFIRM - I'll be there on the 25th at 10am",
    "received_at": "2026-04-21T14:42:30Z",
    "is_reply_to": "SM1234567890abcdef"
  }
}
```

**KPI impact:** Tracked for context but does not directly increment any v1 KPI. (v2 may add "inbound SMS received" as a signal.)

---

### 3.6 `sms.booked`

**Description:** A Twilio SMS conversation resulted in a booked appointment (the customer replied confirming availability or completing a booking intent).

**Fires from:** WF2, WF8 (n8n SMS convo agent → AIOS)  
**Trigger node:** n8n SMS conversation enrichment node detects booking intent and POSTs to AIOS.

**Idempotency key format:** `twilio_sms:{messageSid}:booked` (use the message SID of the confirmation message)

**Payload schema:**

```typescript
interface SmsBookedEvent {
  from_number: string; // customer's E.164 phone number
  to_number: string; // the Twilio number (workspace's provisioned number)
  booking_id: string; // unique ID for this booking
  estimated_value: number; // estimated job/project value in cents
  service_type: string; // e.g., "roofing_inspection", "hvac_maintenance"
  thread_message_count: number; // number of SMS exchanges in the conversation
  first_message_sid?: string; // optional: the original message SID that started this conversation
}
```

**Zod schema:**

```typescript
export const smsBookedSchema = z.object({
  event_type: z.literal("sms.booked"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("twilio_sms:").endsWith(":booked"),
  correlation_id: z.string(),
  data: z.object({
    from_number: z.string().regex(/^\+\d{10,15}$/),
    to_number: z.string().regex(/^\+\d{10,15}$/),
    booking_id: z.string(),
    estimated_value: z.number().int().min(0),
    service_type: z.string(),
    thread_message_count: z.number().int().min(2),
    first_message_sid: z.string().optional(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "sms.booked",
  "occurred_at": "2026-04-21T14:45:00Z",
  "idempotency_key": "twilio_sms:SM9876543210fedcba:booked",
  "correlation_id": "inquiry_20260421_001",
  "data": {
    "from_number": "+15551234567",
    "to_number": "+14045551234",
    "booking_id": "bk_987654322",
    "estimated_value": 18000,
    "service_type": "hvac_maintenance",
    "thread_message_count": 3,
    "first_message_sid": "SM1234567890abcdef"
  }
}
```

**KPI impact:**
- Increments "Bookings from SMS" counter.
- Adds `estimated_value` to "Pipeline value of booked calls" KPI.

---

### 3.7 `quote.sent`

**Description:** n8n dispatched a quote, proposal, or estimate document to a customer (via email, SMS, or other channel).

**Fires from:** WF3, WF7 (n8n quote dispatcher → AIOS)  
**Trigger node:** n8n email or SMS dispatcher node after composing and sending a quote.

**Idempotency key format:** `quote:{quoteId}` (use a unique quote ID from your system)

**Payload schema:**

```typescript
interface QuoteSentEvent {
  quote_id: string; // unique ID for this quote
  to_contact: string; // customer email or phone (depending on channel)
  channel: string; // "email" or "sms"
  sent_at: string; // ISO 8601 UTC timestamp
  job_description?: string; // optional: brief description of the job/project
  estimated_amount?: number; // optional: quote amount in cents
  valid_until?: string; // optional: ISO 8601 date when quote expires
  related_booking_id?: string; // optional: booking ID this quote is for
}
```

**Zod schema:**

```typescript
export const quoteSentSchema = z.object({
  event_type: z.literal("quote.sent"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("quote:"),
  correlation_id: z.string(),
  data: z.object({
    quote_id: z.string(),
    to_contact: z.string(),
    channel: z.enum(["email", "sms"]),
    sent_at: z.string().datetime(),
    job_description: z.string().optional(),
    estimated_amount: z.number().int().min(0).optional(),
    valid_until: z.string().date().optional(),
    related_booking_id: z.string().optional(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "quote.sent",
  "occurred_at": "2026-04-21T15:00:00Z",
  "idempotency_key": "quote:qt_2026042101",
  "correlation_id": "bk_987654321",
  "data": {
    "quote_id": "qt_2026042101",
    "to_contact": "john@example.com",
    "channel": "email",
    "sent_at": "2026-04-21T15:00:00Z",
    "job_description": "Full roof replacement, 2000 sq ft asphalt shingles",
    "estimated_amount": 45000,
    "valid_until": "2026-05-05",
    "related_booking_id": "bk_987654321"
  }
}
```

**KPI impact:** Increments "Quotes sent out" counter.

---

### 3.8 `email.outbound.sent`

**Description:** n8n sent an outbound email message to a customer or prospect via Resend (e.g., follow-up, quote delivery, campaign email).

**Fires from:** WF7 (n8n email dispatcher → AIOS)  
**Trigger node:** Resend Send Email node in n8n; after the email is accepted by Resend, n8n POSTs to AIOS.

**Idempotency key format:** `resend:{messageId}` (use the Resend message ID)

**Payload schema:**

```typescript
interface EmailOutboundSentEvent {
  message_id: string; // Resend Message ID
  to_email: string; // recipient email address
  from_email: string; // sender email (workspace's sending domain)
  subject: string; // email subject line
  sent_at: string; // ISO 8601 UTC timestamp
  campaign_id?: string; // optional: if part of a marketing campaign
  context?: string; // optional: "follow_up", "quote_delivery", "reengagement", etc.
}
```

**Zod schema:**

```typescript
export const emailOutboundSentSchema = z.object({
  event_type: z.literal("email.outbound.sent"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("resend:"),
  correlation_id: z.string(),
  data: z.object({
    message_id: z.string(),
    to_email: z.string().email(),
    from_email: z.string().email(),
    subject: z.string().min(1),
    sent_at: z.string().datetime(),
    campaign_id: z.string().optional(),
    context: z.enum(["follow_up", "quote_delivery", "reengagement", "other"]).optional(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "email.outbound.sent",
  "occurred_at": "2026-04-21T15:05:00Z",
  "idempotency_key": "resend:msg_abc123def456",
  "correlation_id": "bk_987654321",
  "data": {
    "message_id": "msg_abc123def456",
    "to_email": "john@example.com",
    "from_email": "quotes@contractor.com",
    "subject": "Your Roofing Quote – Valid Through May 5",
    "sent_at": "2026-04-21T15:05:00Z",
    "campaign_id": "camp_456",
    "context": "quote_delivery"
  }
}
```

**KPI impact:** Increments "Emails sent" counter (for v2; not directly used in v1 dashboard).

---

### 3.9 `email.inbound.replied`

**Description:** A customer replied to an outbound email sent by n8n (detected via Resend webhook or an inbound mail handler).

**Fires from:** WF7 (Resend webhook → n8n or direct inbound handler)  
**Trigger node:** Resend webhook listener (for bounces, complaints, opens, clicks, replies) or an inbound mail webhook.

**Idempotency key format:** `resend:{replyMessageId}` (use the reply's message ID from Resend)

**Payload schema:**

```typescript
interface EmailInboundRepliedEvent {
  reply_message_id: string; // Resend reply message ID (or custom ID if inbound)
  from_email: string; // customer's email address
  to_email: string; // workspace's receiving email
  subject: string; // original email subject (for threading)
  body?: string; // optional: first 500 chars of reply body
  replied_at: string; // ISO 8601 UTC timestamp
  original_message_id?: string; // optional: message ID of the original email
  sentiment?: string; // optional: "positive", "negative", "neutral" (if sentiment analysis done)
}
```

**Zod schema:**

```typescript
export const emailInboundRepliedSchema = z.object({
  event_type: z.literal("email.inbound.replied"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("resend:"),
  correlation_id: z.string(),
  data: z.object({
    reply_message_id: z.string(),
    from_email: z.string().email(),
    to_email: z.string().email(),
    subject: z.string(),
    body: z.string().max(500).optional(),
    replied_at: z.string().datetime(),
    original_message_id: z.string().optional(),
    sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "email.inbound.replied",
  "occurred_at": "2026-04-21T16:30:00Z",
  "idempotency_key": "resend:msg_reply_xyz789",
  "correlation_id": "bk_987654321",
  "data": {
    "reply_message_id": "msg_reply_xyz789",
    "from_email": "john@example.com",
    "to_email": "quotes@contractor.com",
    "subject": "Re: Your Roofing Quote – Valid Through May 5",
    "body": "Hi, this looks good. Can you start next week?",
    "replied_at": "2026-04-21T16:30:00Z",
    "original_message_id": "msg_abc123def456",
    "sentiment": "positive"
  }
}
```

**KPI impact:** Increments "Emails responded to" counter.

---

### 3.10 `email.booked`

**Description:** An email conversation resulted in a booked appointment (customer replies confirming interest and availability).

**Fires from:** WF7 (n8n email enrichment → AIOS)  
**Trigger node:** n8n email conversation enrichment node detects booking intent and POSTs to AIOS.

**Idempotency key format:** `email:{bookingId}:booked` (use the booking ID)

**Payload schema:**

```typescript
interface EmailBookedEvent {
  booking_id: string; // unique ID for this booking
  from_email: string; // customer's email
  to_email: string; // workspace's email
  estimated_value: number; // estimated job/project value in cents
  service_type: string; // e.g., "roofing_inspection"
  thread_message_count: number; // number of emails exchanged
  first_message_id?: string; // optional: original message ID that started the thread
}
```

**Zod schema:**

```typescript
export const emailBookedSchema = z.object({
  event_type: z.literal("email.booked"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("email:").endsWith(":booked"),
  correlation_id: z.string(),
  data: z.object({
    booking_id: z.string(),
    from_email: z.string().email(),
    to_email: z.string().email(),
    estimated_value: z.number().int().min(0),
    service_type: z.string(),
    thread_message_count: z.number().int().min(2),
    first_message_id: z.string().optional(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "email.booked",
  "occurred_at": "2026-04-21T16:45:00Z",
  "idempotency_key": "email:bk_987654323:booked",
  "correlation_id": "bk_987654323",
  "data": {
    "booking_id": "bk_987654323",
    "from_email": "john@example.com",
    "to_email": "quotes@contractor.com",
    "estimated_value": 45000,
    "service_type": "roofing_inspection",
    "thread_message_count": 3,
    "first_message_id": "msg_abc123def456"
  }
}
```

**KPI impact:**
- Increments "Bookings from emails" counter.
- Adds `estimated_value` to "Pipeline value of booked calls" KPI.

---

### 3.11 `booking.created`

**Description:** A booking (appointment/job) was created in the system, unifying all channels (call, SMS, email, or web form). This is a canonical event for pipeline tracking.

**Fires from:** WF1, WF2, WF3, WF6, WF7 (n8n booking creation node → AIOS)  
**Trigger node:** n8n Create Booking node (triggered after call.booked, sms.booked, email.booked, or web form submission).

**Idempotency key format:** `booking:{bookingId}` (use the booking ID from your system)

**Payload schema:**

```typescript
interface BookingCreatedEvent {
  booking_id: string; // unique ID for this booking
  customer_name: string; // customer's full name
  customer_phone?: string; // optional: E.164 phone number
  customer_email?: string; // optional: email address
  source_channel: string; // "call", "sms", "email", or "web_form"
  estimated_value: number; // estimated job/project value in cents
  service_type: string; // e.g., "roofing_inspection", "hvac_maintenance"
  booked_for_date?: string; // optional: ISO 8601 date of the appointment
  booked_for_time_window?: string; // optional: "morning", "afternoon", "evening"
  notes?: string; // optional: internal notes or customer special requests
  created_at: string; // ISO 8601 UTC timestamp
}
```

**Zod schema:**

```typescript
export const bookingCreatedSchema = z.object({
  event_type: z.literal("booking.created"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("booking:"),
  correlation_id: z.string(),
  data: z.object({
    booking_id: z.string(),
    customer_name: z.string(),
    customer_phone: z.string().regex(/^\+\d{10,15}$/).optional(),
    customer_email: z.string().email().optional(),
    source_channel: z.enum(["call", "sms", "email", "web_form"]),
    estimated_value: z.number().int().min(0),
    service_type: z.string(),
    booked_for_date: z.string().date().optional(),
    booked_for_time_window: z.enum(["morning", "afternoon", "evening"]).optional(),
    notes: z.string().optional(),
    created_at: z.string().datetime(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "booking.created",
  "occurred_at": "2026-04-21T14:35:00Z",
  "idempotency_key": "booking:bk_987654321",
  "correlation_id": "twilio:CA1234567890abcdef",
  "data": {
    "booking_id": "bk_987654321",
    "customer_name": "John Smith",
    "customer_phone": "+15551234567",
    "customer_email": "john@example.com",
    "source_channel": "call",
    "estimated_value": 25000,
    "service_type": "roofing_inspection",
    "booked_for_date": "2026-04-25",
    "booked_for_time_window": "morning",
    "notes": "Customer requested morning appointment before 11am",
    "created_at": "2026-04-21T14:35:00Z"
  }
}
```

**KPI impact:**
- Used as canonical event for pipeline tracking.
- `estimated_value` contributes to "Pipeline value of booked calls" KPI.
- Unified counter for bookings across all channels.

---

### 3.12 `deal.closed`

**Description:** A booking was completed and closed as won (payment received, job completed, or contract executed). This is the revenue event for the v1 dashboard.

**Fires from:** WF1–WF8 (n8n deal closer or webhook from external system → AIOS)  
**Trigger node:** n8n Update Deal node or external webhook listener (e.g., Stripe payment webhook, manual CRM update).

**Idempotency key format:** `deal:{dealId}:closed` (use the deal/booking ID)

**Payload schema:**

```typescript
interface DealClosedEvent {
  deal_id: string; // unique ID for this deal (usually same as booking_id)
  booking_id: string; // reference to original booking
  customer_name: string; // customer's name for audit trail
  closed_at: string; // ISO 8601 UTC timestamp when the deal closed
  amount_closed: number; // actual revenue in cents (may differ from estimated_value)
  revenue_type: string; // "payment_received", "contract_executed", "job_completed"
  payment_method?: string; // optional: "credit_card", "check", "ach", "cash"
}
```

**Zod schema:**

```typescript
export const dealClosedSchema = z.object({
  event_type: z.literal("deal.closed"),
  occurred_at: z.string().datetime(),
  idempotency_key: z.string().startsWith("deal:").endsWith(":closed"),
  correlation_id: z.string(),
  data: z.object({
    deal_id: z.string(),
    booking_id: z.string(),
    customer_name: z.string(),
    closed_at: z.string().datetime(),
    amount_closed: z.number().int().min(0),
    revenue_type: z.enum(["payment_received", "contract_executed", "job_completed"]),
    payment_method: z.enum(["credit_card", "check", "ach", "cash"]).optional(),
  }),
});
```

**Example payload:**

```json
{
  "event_type": "deal.closed",
  "occurred_at": "2026-04-25T17:30:00Z",
  "idempotency_key": "deal:bk_987654321:closed",
  "correlation_id": "bk_987654321",
  "data": {
    "deal_id": "bk_987654321",
    "booking_id": "bk_987654321",
    "customer_name": "John Smith",
    "closed_at": "2026-04-25T17:30:00Z",
    "amount_closed": 24500,
    "revenue_type": "payment_received",
    "payment_method": "credit_card"
  }
}
```

**KPI impact:**
- Increments "Amount closed" counter.
- Used to calculate total closed revenue (sum of `amount_closed`).

---

## 4. KPI Contribution Matrix

This table shows which events contribute to each of the 9 KPIs:

| KPI | Events | How It's Used |
|-----|--------|---------------|
| **1. Inbound calls received** | `call.inbound.received` | Count unique events per day |
| **2. Inbound calls answered** | `call.inbound.answered` | Count unique events per day; calculate answer_rate = answered / received |
| **3. Bookings from calls** | `call.booked` | Count unique events per day |
| **4. SMS messages sent** | `sms.outbound.sent` | Count unique events per day |
| **5. Bookings from SMS** | `sms.booked` | Count unique events per day |
| **6. Bookings from emails** | `email.booked` | Count unique events per day |
| **7. Emails responded to** | `email.inbound.replied` | Count unique events per day |
| **8. Pipeline value** | `booking.created` (sum of estimated_value) | Sum all estimated_value fields for open bookings |
| **9. Amount closed** | `deal.closed` (sum of amount_closed) | Sum all amount_closed fields for closed deals |

**Dashboard filtering:** All KPIs default to "today" view. Anthony wants a date picker to toggle "today", "this week", "this month".

---

## 5. Example n8n HTTP Request Node Configuration

Every n8n workflow that POSTs to AIOS must use this configuration:

### Node Settings

**Name:** `POST to AIOS`

**Method:** `POST`

**URL:** `https://aios.your-domain.com/api/events?version=1`

**Authentication:** `Header Auth`

- **Header Name:** `Authorization`
- **Header Value:** `Bearer {{ $env.AIOS_WORKSPACE_API_KEY }}`

**Headers (Tab: Headers)**

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |

**Body (Tab: Body)**

Select **Body** (not Form-Data or Raw). Use the JavaScript expression:

```javascript
{
  "event_type": "{{ event_type }}",
  "occurred_at": new Date().toISOString(),
  "idempotency_key": "{{ idempotency_key }}",
  "correlation_id": "{{ correlation_id }}",
  "data": {{ JSON.stringify(event_data) }}
}
```

### Environment Setup

In the n8n workspace `.env` or Credentials:

```
AIOS_WORKSPACE_API_KEY=sk_aios_1234567890abcdefghijklmn
```

### n8n Input Variables (From Previous Node)

Your n8n workflow must set these variables before the HTTP POST node:

```javascript
// Collect these from earlier nodes and pass to HTTP POST:
event_type: "call.inbound.answered"
idempotency_key: "twilio:CA1234567890abcdef:answered"
correlation_id: "twilio:CA1234567890abcdef"
event_data: {
  call_sid: "CA1234567890abcdef",
  from_number: "+15551234567",
  to_number: "+14045551234",
  agent_id: "eleven_labs_agent_123",
  answered_at: "2026-04-21T14:32:15Z",
  wait_time_seconds: 15
}
```

### Response Handling

AIOS returns:

```json
{
  "ok": true,
  "event_id": "evt_abc123",
  "deduped": false
}
```

Or on duplicate:

```json
{
  "ok": true,
  "event_id": "evt_abc123",
  "deduped": true
}
```

**n8n Retry Logic:**
- Configure the HTTP node's **Retry** settings: Retry on Timeout (3 attempts, exponential backoff).
- For 429 (rate limit), retry with 60-second delay.
- For 5xx errors, retry up to 3 times (AIOS should recover).

---

## 6. Error Contract

All error responses include a JSON body with `ok: false` and error details.

### 200 OK — Success

```json
{
  "ok": true,
  "event_id": "evt_abc123xyz",
  "deduped": false
}
```

- **event_id** — AIOS's internal ID for this event (for tracing).
- **deduped** — `true` if this was a duplicate POST (same `idempotency_key` within 24h).

### 400 Bad Request — Validation Error

```json
{
  "ok": false,
  "error": "validation_error",
  "details": {
    "event_type": "must be a valid event type",
    "data.call_sid": "is required"
  }
}
```

- **error** — error code (e.g., `validation_error`, `missing_field`, `invalid_type`).
- **details** — object mapping field names to error messages.

**Action:** n8n should log this error and alert the operator. Do not retry.

### 401 Unauthorized — Missing/Invalid API Key

```json
{
  "ok": false,
  "error": "unauthorized",
  "message": "missing or invalid Authorization header"
}
```

**Action:** Verify the `AIOS_WORKSPACE_API_KEY` environment variable. Do not retry.

### 403 Forbidden — API Key Revoked

```json
{
  "ok": false,
  "error": "forbidden",
  "message": "API key has been revoked"
}
```

**Action:** Request a new API key from AIOS Admin Settings. Do not retry.

### 429 Too Many Requests — Rate Limited

```json
{
  "ok": false,
  "error": "rate_limited",
  "retry_after_seconds": 60
}
```

- **retry_after_seconds** — how long to wait before retrying.

**Action:** n8n should wait the specified duration and retry. Recommended: exponential backoff (1s, 2s, 4s, ..., up to `retry_after_seconds`).

### 500 Internal Server Error

```json
{
  "ok": false,
  "error": "internal_error",
  "message": "something went wrong on our end"
}
```

**Action:** n8n should retry up to 3 times with exponential backoff. If persistent, alert the operator.

---

## 7. Future Events (v2 Backlog)

The following events are proposed for v2 but are out of scope for v1:

### 7.1 `sms.inbound.received` (v2)
Currently tracked for context; v2 will use this to calculate "inbound SMS received" as a KPI.

### 7.2 `email.outbound.opened` (v2)
Resend webhook fires when a recipient opens an email. Useful for campaign effectiveness metrics.

### 7.3 `email.outbound.clicked` (v2)
Resend webhook fires when a recipient clicks a link in an email. Useful for engagement tracking.

### 7.4 `agent.conversation.ended` (v2)
ElevenLabs agent logs the end of a call conversation with a transcript summary and sentiment. Useful for quality assurance and training.

### 7.5 `booking.cancelled` (v2)
A booking is cancelled by the customer or internally. Useful for churn tracking and pipeline health.

### 7.6 `booking.rescheduled` (v2)
A booked appointment is rescheduled to a different date/time. Useful for understanding commitment stability.

### 7.7 `web_form.submitted` (v2)
A customer submits a web form on the contractor's site (via the embed widget). This is currently captured as part of the capture channel but may warrant its own event for better analytics.

### 7.8 `marketing.consent.changed` (v2)
A customer opts in or out of marketing SMS/email. Useful for compliance and list health tracking.

---

## 8. Changelog

### v1.0 (2026-04-21)
- Initial release
- 12 event types defined (call.inbound.received through deal.closed)
- Auth via Bearer API key (workspace-scoped)
- Idempotency via 24h sliding window
- 9 KPIs specified and mapped to events
- n8n HTTP Request node configuration documented
- Error contract and retry guidance defined

---

## 9. Support & Questions

- **API Key Setup:** AIOS Admin Settings → Workspace API Keys
- **Event Validation:** Test POSTs with `curl` or Postman before deploying to production n8n workflows
- **Idempotency Debugging:** AIOS logs all event POSTs with idempotency keys to the database; check the event audit table if duplicates are suspected
- **n8n Workflow Templates:** See `/n8n-workflows/` in the CHATTY.AI repo for example workflows (WF1–WF8) using this event contract

---

**End of AIOS Event Catalog v1**
