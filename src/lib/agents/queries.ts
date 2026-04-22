import { db } from "@/db";
import { workspaceAgentSettings, events } from "@/db/schema";
import { eq, and, sql, inArray, gte } from "drizzle-orm";
import { AGENT_CATALOG } from "./catalog";

export interface AgentRosterRow {
  slug: string;
  name: string;
  description: string;
  channel: string;
  promptKind: string | null;
  workflowPath: string;
  webhookPath: string;
  usesClaude: boolean;
  isEnabled: boolean;
  eventCount7d: number;
  lastEventAt: Date | null;
}

/**
 * Build the full agents roster for a workspace, merging:
 *   - AGENT_CATALOG (definitional)
 *   - workspace_agent_settings (per-tenant on/off)
 *   - events table (7-day event count + last-event timestamp per agent)
 */
export async function getAgentRosterForWorkspace(
  workspaceId: string
): Promise<AgentRosterRow[]> {
  // 1) per-tenant settings
  const settingsRows = await db
    .select()
    .from(workspaceAgentSettings)
    .where(eq(workspaceAgentSettings.workspaceId, workspaceId));
  const settingsBySlug = new Map(settingsRows.map((r) => [r.agentSlug, r]));

  // 2) per-agent event metrics (7d window)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const allEventTypes = AGENT_CATALOG.flatMap((a) => a.eventTypes);

  const eventStats =
    allEventTypes.length === 0
      ? []
      : await db
          .select({
            eventType: events.eventType,
            count: sql<number>`count(*)`,
            lastAt: sql<Date | null>`max(${events.occurredAt})`,
          })
          .from(events)
          .where(
            and(
              eq(events.workspaceId, workspaceId),
              inArray(events.eventType, allEventTypes),
              gte(events.occurredAt, sevenDaysAgo)
            )
          )
          .groupBy(events.eventType);

  const statsByEventType = new Map(eventStats.map((s) => [s.eventType, s]));

  // 3) merge
  return AGENT_CATALOG.map((agent) => {
    const setting = settingsBySlug.get(agent.slug);
    let count = 0;
    let lastAt: Date | null = null;
    for (const et of agent.eventTypes) {
      const s = statsByEventType.get(et);
      if (!s) continue;
      count += Number(s.count);
      if (s.lastAt && (!lastAt || s.lastAt > lastAt)) lastAt = s.lastAt;
    }
    return {
      slug: agent.slug,
      name: agent.name,
      description: agent.description,
      channel: agent.channel,
      promptKind: agent.promptKind,
      workflowPath: agent.workflowPath,
      webhookPath: agent.webhookPath,
      usesClaude: agent.usesClaude,
      isEnabled: setting ? setting.isEnabled : true,
      eventCount7d: count,
      lastEventAt: lastAt,
    };
  });
}

/**
 * Upsert an on/off toggle for one agent. Creates the row if missing.
 */
export async function setAgentEnabled(
  workspaceId: string,
  agentSlug: string,
  isEnabled: boolean
): Promise<void> {
  await db
    .insert(workspaceAgentSettings)
    .values({
      workspaceId,
      agentSlug,
      isEnabled,
      lastToggledAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        workspaceAgentSettings.workspaceId,
        workspaceAgentSettings.agentSlug,
      ],
      set: {
        isEnabled,
        lastToggledAt: new Date(),
        updatedAt: new Date(),
      },
    });
}
