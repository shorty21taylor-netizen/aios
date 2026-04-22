-- Migration 0003 — workspace_agent_settings
-- Per-workspace on/off toggle + optional per-agent config (e.g. scheduling cron,
-- feature flags). One row per (workspace, agent_slug). Missing row = agent enabled
-- by default (the application reads the row if it exists, otherwise falls back to
-- the default in AGENT_CATALOG).

CREATE TABLE IF NOT EXISTS "workspace_agent_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "agent_slug" text NOT NULL,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "last_toggled_at" timestamp NOT NULL DEFAULT now(),
  "config" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_agent_settings_workspace_slug"
  ON "workspace_agent_settings" ("workspace_id", "agent_slug");
