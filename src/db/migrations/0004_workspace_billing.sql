ALTER TABLE "workspaces"
  ADD COLUMN IF NOT EXISTS "stripe_customer_id" text,
  ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text,
  ADD COLUMN IF NOT EXISTS "subscription_status" text,
  ADD COLUMN IF NOT EXISTS "subscription_current_period_end" timestamp;

-->  statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_workspaces_stripe_customer" ON "workspaces" ("stripe_customer_id");

-->  statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_workspaces_subscription_status" ON "workspaces" ("subscription_status");
