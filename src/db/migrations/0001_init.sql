CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text UNIQUE NOT NULL,
	"name" text NOT NULL,
	"slug" text UNIQUE NOT NULL,
	"timezone" text DEFAULT 'America/Chicago' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "idx_workspaces_clerk_org_id" ON "workspaces" ("clerk_org_id");
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "idx_workspaces_slug" ON "workspaces" ("slug");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "workspace_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"key_hash" text UNIQUE NOT NULL,
	"label" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "workspace_api_keys_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE cascade
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "idx_api_keys_hash" ON "workspace_api_keys" ("key_hash");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_api_keys_workspace" ON "workspace_api_keys" ("workspace_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"occurred_at" timestamp NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"correlation_id" text,
	"idempotency_key" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE cascade
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_events_workspace_type" ON "events" ("workspace_id","event_type");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_events_workspace_occurred" ON "events" ("workspace_id","occurred_at");
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "idx_events_idempotency" ON "events" ("workspace_id","idempotency_key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"source_channel" text NOT NULL,
	"source_event_id" uuid NOT NULL,
	"contact_name" text NOT NULL,
	"contact_phone" text,
	"contact_email" text,
	"booking_slot" timestamp NOT NULL,
	"estimated_value" numeric(10,2),
	"status" text DEFAULT 'booked' NOT NULL,
	"amount_closed" numeric(10,2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE cascade,
	CONSTRAINT "bookings_source_event_id_events_id_fk" FOREIGN KEY ("source_event_id") REFERENCES "events"("id") ON DELETE restrict
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_bookings_workspace" ON "bookings" ("workspace_id");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_bookings_source_event" ON "bookings" ("source_event_id");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_bookings_status" ON "bookings" ("status");
