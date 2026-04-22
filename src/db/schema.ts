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
