# Chief of Staff Skill

**Owner:** the salesyAI project (itself)
**Purpose:** answer the only question that matters — *"Can we close a client this week, and if not, what's blocking?"*

This skill is a repeatable audit. It does not write code. It audits six layers and returns a single-page readout. It is consumed two ways:

1. **Live on the dashboard** at `/dashboard/status` (authed users only). Reads from `GET /api/status` and renders red/yellow/green per layer.
2. **By Claude subagents** when Anthony says "where are we at" or "run the overseer." The subagent fetches the same JSON and produces a prose summary with a single next action.

## The six layers (ordered by severity — fix earlier layers first)

### 1. Repo + Deploy
**Question:** which commit is running on production right now?

- Expected: `RAILWAY_GIT_COMMIT_SHA` matches `origin/main` HEAD
- Red: env var missing (Railway not auto-deploying) or SHA is stale vs. remote
- Check manually: visit https://github.com/shorty21taylor-netizen/aios/commits/main and compare to Railway's Deployments tab

### 2. Auth Chain
**Question:** can a Clerk org resolve to a provisioned workspace?

- Probes `getWorkspaceForAuth()` against the current session's `orgId`
- Red if workspace lookup throws or returns null — means lazy provisioning broke or DB is down
- Green if a valid workspace row comes back with slug/timezone populated

### 3. Database Schema
**Question:** are all required tables present on production Postgres?

- Queries `information_schema.tables` for: `workspaces`, `workspace_api_keys`, `events`, `bookings`, `workspace_profiles`, `workspace_agent_settings`
- Red if any required table is missing — means `scripts/migrate.js` didn't run or failed
- Fix: check Railway deploy logs for `[migrate]` prefix; migrations are idempotent so can be re-run safely

### 4. n8n Workflows
**Question:** are all 8 workflows imported and active in n8n Cloud?

- Requires `N8N_API_URL` + `N8N_API_KEY` env vars to be set on Railway
- Polls `${N8N_API_URL}/api/v1/workflows`
- Green: 8+ workflows total, all active
- Yellow: workflows imported but some inactive
- Red: fewer than 8 imported or API unreachable
- Unknown: env vars not configured (treat as yellow for rollup)

### 5. Signal Wiring
**Question:** has a real event ever flowed n8n → AIOS → events table?

- Queries `SELECT MAX(received_at), COUNT(*) FROM events`
- Red if count = 0 — means the round-trip is unproven, no demo possible
- Yellow if last event > 24h old — pipeline may have broken
- Green if last event < 24h old

### 6. Close Readiness
**Question:** are the non-technical gates met?

Environment-flagged boolean gates:
- `landing_live`: `NEXT_PUBLIC_APP_URL` set
- `stripe_configured`: `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` both set
- `domain_custom`: app URL is not `*.railway.app`
- `demo_loom`: `DEMO_LOOM_URL` set (2-min product video)
- `outreach_ready`: `OUTREACH_LIST_READY=true` (indicates list of 50+ prospects exists)

Score: `green_count / total`. ≥ 50% is yellow, all is green.

## Rollup
- Any red layer → overall **BLOCKERS PRESENT** (red)
- Any yellow/unknown, no red → **GAPS REMAINING** (yellow)
- All green → **READY TO CLOSE** (green)

## Daily cadence (how Anthony uses this)
Open `/dashboard/status` each morning. The rollup tells him in one word whether he can pitch today. The "Next Action" field tells him the single most valuable thing to do next. When all six layers are green, he's cleared to send outreach.

## When this skill updates itself
Add a new layer only when a new gate is discovered that materially affects client-close. Examples of layers *not* to add: marketing copy, nice-to-have analytics, internal eng polish. Examples of layers *to* add: payment processing health, voice agent uptime, SLA breach alerts.

## Invocation (for subagents)
Pass the path `src/lib/playbooks/chief-of-staff.md` and the live endpoint `GET /api/status` to any Agent audit run. The agent should:
1. Fetch `/api/status` (authed as Anthony's session cookie or a service token)
2. Parse the 6 layers
3. Write a prose status ≤ 200 words with: overall color, one sentence per red/yellow layer, and exactly one recommended next action
4. Never write code as part of the audit — audits are read-only
