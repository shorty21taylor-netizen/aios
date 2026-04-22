import { db } from "../src/lib/db";
import { workspaces, workspaceApiKeys, events } from "../src/db/schema";
import { generateApiKey, hashApiKey } from "../src/lib/api-keys/generate";
import { randomUUID } from "crypto";

async function seed() {
  try {
    console.log("Seeding database...");

    const workspaceId = randomUUID();
    const wsResult = await db
      .insert(workspaces)
      .values({
        id: workspaceId,
        clerkOrgId: "test-org-123",
        name: "Test Workspace",
        slug: "test-workspace",
        timezone: "America/Chicago",
      })
      .onConflictDoNothing()
      .returning();

    if (!wsResult.length) {
      console.log("Workspace already exists, using existing...");
    } else {
      console.log("Created test workspace:", wsResult[0].id);
    }

    const ws = wsResult.length > 0 ? wsResult[0] : (await db
      .select()
      .from(workspaces)
      .where((w) => w.clerkOrgId === "test-org-123")
      .limit(1))[0];

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);

    const keyResult = await db
      .insert(workspaceApiKeys)
      .values({
        workspaceId: ws.id,
        keyHash,
        label: "Seed test key",
      })
      .onConflictDoNothing()
      .returning();

    if (keyResult.length > 0) {
      console.log("\nGenerated API Key (save this):");
      console.log(rawKey);
    }

    const eventTypes = [
      "call.inbound.received",
      "call.inbound.answered",
      "call.booked",
      "sms.outbound.sent",
      "sms.booked",
      "quote.sent",
      "email.outbound.sent",
      "email.inbound.replied",
      "email.booked",
    ];

    const now = new Date();
    let eventCount = 0;

    for (let i = 0; i < 50; i++) {
      const eventType = eventTypes[i % eventTypes.length];
      const minutesAgo = Math.floor(Math.random() * 1440);
      const occurredAt = new Date(now.getTime() - minutesAgo * 60 * 1000);

      const result = await db
        .insert(events)
        .values({
          workspaceId: ws.id,
          eventType,
          occurredAt,
          idempotencyKey: `seed-${i}`,
          data: {
            source: "seed",
            contact_name: `Contact ${i}`,
            details: `Test event ${i}`,
          },
        })
        .onConflictDoNothing()
        .returning();

      if (result.length > 0) {
        eventCount++;
      }
    }

    console.log(`\nSeeded ${eventCount} events`);
    console.log("Database setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
