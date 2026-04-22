import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  boolean,
  numeric,
  uniqueIndex,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id").notNull().unique(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    timezone: text("timezone").notNull().default("America/Chicago"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clerkOrgIdIdx: uniqueIndex("idx_workspaces_clerk_org_id").on(
      table.clerkOrgId
    ),
    slugIdx: uniqueIndex("idx_workspaces_slug").on(table.slug),
  })
);

export const workspaceApiKeys = pgTable(
  "workspace_api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    keyHash: text("key_hash").notNull().unique(),
    label: text("label").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => ({
    keyHashIdx: uniqueIndex("idx_api_keys_hash").on(table.keyHash),
    workspaceIdIdx: index("idx_api_keys_workspace").on(table.workspaceId),
  })
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    occurredAt: timestamp("occurred_at").notNull(),
    receivedAt: timestamp("received_at").defaultNow().notNull(),
    correlationId: text("correlation_id"),
    idempotencyKey: text("idempotency_key").notNull(),
    data: jsonb("data").notNull().default(sql`'{}'::jsonb`),
  },
  (table) => ({
    workspaceEventTypeIdx: index("idx_events_workspace_type").on(
      table.workspaceId,
      table.eventType
    ),
    workspaceOccurredAtIdx: index("idx_events_workspace_occurred").on(
      table.workspaceId,
      table.occurredAt
    ),
    idempotencyIdx: uniqueIndex("idx_events_idempotency").on(
      table.workspaceId,
      table.idempotencyKey
    ),
  })
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    sourceChannel: text("source_channel").notNull(),
    sourceEventId: uuid("source_event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    contactName: text("contact_name").notNull(),
    contactPhone: text("contact_phone"),
    contactEmail: text("contact_email"),
    bookingSlot: timestamp("booking_slot").notNull(),
    estimatedValue: numeric("estimated_value", { precision: 10, scale: 2 }),
    status: text("status").notNull().default("booked"),
    amountClosed: numeric("amount_closed", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_bookings_workspace").on(table.workspaceId),
    sourceEventIdx: index("idx_bookings_source_event").on(table.sourceEventId),
    statusIdx: index("idx_bookings_status").on(table.status),
  })
);

export const workspaceProfiles = pgTable(
  "workspace_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .unique()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    vertical: text("vertical").notNull(),
    yearsInBusiness: integer("years_in_business"),
    phoneNumber: text("phone_number").notNull(),
    bookingUrl: text("booking_url"),
    serviceAreaDescription: text("service_area_description"),
    serviceAreaZipCodes: text("service_area_zip_codes").array(),
    hoursJson: jsonb("hours_json").notNull().default(
      sql`'{"mon":{"open":"08:00","close":"18:00"},"tue":{"open":"08:00","close":"18:00"},"wed":{"open":"08:00","close":"18:00"},"thu":{"open":"08:00","close":"18:00"},"fri":{"open":"08:00","close":"18:00"},"sat":{"open":"09:00","close":"15:00"},"sun":{"open":"","close":""},"emergency_available":false}'::jsonb`
    ),
    timezone: text("timezone").notNull().default("America/Chicago"),
    voicePersona: text("voice_persona").notNull().default("friendly"),
    brandTone: text("brand_tone").notNull().default("warm"),
    operatorPhoneE164: text("operator_phone_e164"),
    operatorEmail: text("operator_email"),
    companyAddress: text("company_address"),
    onboardingCompletedAt: timestamp("onboarding_completed_at"),
    onboardingStep: integer("onboarding_step").notNull().default(0),
    details: jsonb("details").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdIdx: uniqueIndex("idx_workspace_profiles_workspace_id").on(
      table.workspaceId
    ),
    updatedAtIdx: index("idx_workspace_profiles_updated").on(table.updatedAt),
  })
);

export const workspaceAgentSettings = pgTable(
  "workspace_agent_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    agentSlug: text("agent_slug").notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    lastToggledAt: timestamp("last_toggled_at").defaultNow().notNull(),
    config: jsonb("config").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceSlugIdx: uniqueIndex("idx_agent_settings_workspace_slug").on(
      table.workspaceId,
      table.agentSlug
    ),
  })
);
