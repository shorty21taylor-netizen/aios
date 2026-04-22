# AIOS - AI Operating System

Dashboard for receiving and visualizing events from n8n workflows. Built with Next.js 15, TypeScript, Drizzle ORM, and PostgreSQL.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `NEXT_PUBLIC_APP_URL` - Your app URL (localhost:3000 for dev)

### 3. Initialize Database

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Architecture

### Core Tables

- **workspaces** - Multi-tenant organizations
- **workspace_api_keys** - API credentials for n8n (SHA-256 hashed)
- **events** - Append-only event firehose from n8n
- **bookings** - Derived from booking.created and deal.closed events

### API Routes

#### Event Ingestion
**POST /api/events**

Authentication: Bearer token (raw API key)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer aios_xxxx..." \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "call.inbound.received",
    "occurred_at": "2024-04-21T10:30:00Z",
    "idempotency_key": "call-123-abc",
    "correlation_id": "twilio-call-sid",
    "data": {
      "contact_name": "John Doe",
      "contact_phone": "+1-555-0123",
      "source": "twilio"
    }
  }'
```

Event types:
- `call.inbound.received` - Inbound call started
- `call.inbound.answered` - Call answered
- `call.booked` - Call resulted in booking
- `sms.outbound.sent` - Outbound SMS sent
- `sms.booked` - SMS resulted in booking
- `quote.sent` - Quote sent to prospect
- `email.outbound.sent` - Outbound email sent
- `email.inbound.replied` - Inbound reply to campaign
- `email.booked` - Email resulted in booking
- `booking.created` - New booking (auto-creates bookings table row)
- `deal.closed` - Deal closed with amount

#### KPI Retrieval
**GET /api/kpis?window=today|7d|30d**

Authentication: Clerk (user must belong to workspace org)

```bash
curl http://localhost:3000/api/kpis?window=today \
  -H "Cookie: __session=..."
```

Returns all 9 KPI metrics with deltas vs. prior period.

## n8n Integration

1. Generate an API key at `/dashboard/settings/api-keys`
2. In n8n, create a **Webhook** node pointing to your AIOS instance:
   - URL: `https://your-aios-url.com/api/events`
   - Method: POST
   - Auth: Bearer token (use your API key)
   - Body: JSON with `event_type`, `occurred_at`, `idempotency_key`, `data`

3. Test by triggering a workflow; event should appear in dashboard

## Development

### Type Checking

```bash
npm run type-check
```

### Database Operations

```bash
npm run db:generate    # Generate schema types
npm run db:migrate     # Run migrations
npm run db:studio      # Visual query editor
```

### Build for Production

```bash
npm run build
npm start
```

## Deployment (Railway)

1. Connect your GitHub repo
2. Set environment variables in Railway
3. Database auto-runs migrations on deploy
4. Visit your Railway domain

## Multi-Tenancy

- Each user can belong to multiple Clerk Organizations
- Each organization gets one Workspace in AIOS
- All queries filtered by workspace_id (RLS enforced)
- API keys scoped to single workspace

## Schema

### Workspaces
```
id (uuid pk)
clerk_org_id (text unique)
name (text)
slug (text unique)
timezone (text, default 'America/Chicago')
created_at, updated_at
```

### Events
```
id (uuid pk)
workspace_id (uuid fk)
event_type (text)
occurred_at (timestamp)
received_at (timestamp default now)
correlation_id (text nullable)
idempotency_key (text, unique per workspace)
data (jsonb)
```

### Bookings
```
id (uuid pk)
workspace_id (uuid fk)
source_channel (text: call, sms, email)
source_event_id (uuid fk events.id)
contact_name, contact_phone, contact_email (text)
booking_slot (timestamp)
estimated_value (numeric)
status (text: booked, closed_won, etc.)
amount_closed (numeric nullable)
created_at, updated_at
```

## License

Proprietary.
