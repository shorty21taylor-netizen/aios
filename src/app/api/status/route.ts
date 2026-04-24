import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getWorkspaceForAuth } from "@/lib/auth/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LayerStatus {
  layer: string;
  status: "green" | "yellow" | "red" | "unknown";
  summary: string;
  details: Record<string, unknown>;
}

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!orgId) {
    return NextResponse.json({ error: "no_org" }, { status: 403 });
  }

  const layers: LayerStatus[] = [];
  layers.push(await auditRepoDeploy());
  layers.push(await auditAuthChain(orgId));
  layers.push(await auditDatabase());
  layers.push(await auditN8nWorkflows());
  layers.push(await auditSignalWiring());
  layers.push(await auditCloseReadiness());

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    rollup: rollupStatus(layers),
    layers,
    nextAction: suggestNextAction(layers),
  });
}

function rollupStatus(layers: LayerStatus[]): "green" | "yellow" | "red" {
  if (layers.some((l) => l.status === "red")) return "red";
  if (layers.some((l) => l.status === "yellow" || l.status === "unknown"))
    return "yellow";
  return "green";
}

function suggestNextAction(layers: LayerStatus[]): string {
  const firstRed = layers.find((l) => l.status === "red");
  if (firstRed) return "Fix " + firstRed.layer + ": " + firstRed.summary;
  const firstYellow = layers.find(
    (l) => l.status === "yellow" || l.status === "unknown"
  );
  if (firstYellow)
    return "Investigate " + firstYellow.layer + ": " + firstYellow.summary;
  return "All layers green — proceed to outreach.";
}

async function auditRepoDeploy(): Promise<LayerStatus> {
  const sha =
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    null;
  const host = process.env.NEXT_PUBLIC_APP_URL || "unknown";
  return {
    layer: "repo_deploy",
    status: sha ? "green" : "yellow",
    summary: sha
      ? "Running commit " + sha.slice(0, 7) + " on " + host
      : "No build SHA in env — confirm Railway deploy",
    details: { sha, host },
  };
}

async function auditAuthChain(orgId: string): Promise<LayerStatus> {
  try {
    const workspace = await getWorkspaceForAuth();
    if (!workspace) {
      return {
        layer: "auth_chain",
        status: "red",
        summary: "Workspace not provisioned for current Clerk org",
        details: { orgId },
      };
    }
    return {
      layer: "auth_chain",
      status: "green",
      summary: "Workspace " + workspace.slug + " resolved from org " + orgId,
      details: {
        workspaceId: workspace.id,
        slug: workspace.slug,
        timezone: workspace.timezone,
      },
    };
  } catch (err) {
    return {
      layer: "auth_chain",
      status: "red",
      summary: "Workspace lookup threw: " + asMessage(err),
      details: { orgId, error: asMessage(err) },
    };
  }
}

async function auditDatabase(): Promise<LayerStatus> {
  if (!process.env.DATABASE_URL) {
    return {
      layer: "database",
      status: "red",
      summary: "DATABASE_URL not set",
      details: {},
    };
  }
  try {
    const result = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    const rows = extractRows<{ table_name: string }>(result);
    const tables = rows.map((r) => r.table_name);
    const required = [
      "workspaces",
      "workspace_api_keys",
      "events",
      "bookings",
      "workspace_profiles",
      "workspace_agent_settings",
    ];
    const missing = required.filter((t) => !tables.includes(t));
    return {
      layer: "database",
      status: missing.length === 0 ? "green" : "red",
      summary:
        missing.length === 0
          ? "All " + required.length + " required tables present"
          : "Missing tables: " + missing.join(", "),
      details: { tables, missing },
    };
  } catch (err) {
    return {
      layer: "database",
      status: "red",
      summary: "DB query failed: " + asMessage(err),
      details: { error: asMessage(err) },
    };
  }
}

async function auditN8nWorkflows(): Promise<LayerStatus> {
  const baseUrl = process.env.N8N_API_URL;
  const apiKey = process.env.N8N_API_KEY;
  if (!baseUrl || !apiKey) {
    return {
      layer: "n8n_workflows",
      status: "unknown",
      summary: "N8N_API_URL + N8N_API_KEY not configured — cannot poll",
      details: { configured: false },
    };
  }
  try {
    const res = await fetch(baseUrl.replace(/\/$/, "") + "/api/v1/workflows", {
      headers: { "X-N8N-API-KEY": apiKey },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        layer: "n8n_workflows",
        status: "red",
        summary: "n8n API returned " + res.status,
        details: { status: res.status },
      };
    }
    const body = (await res.json()) as {
      data?: Array<{ name: string; active: boolean; id: string }>;
    };
    const workflows = body.data || [];
    const active = workflows.filter((w) => w.active).length;
    const expected = 8;
    return {
      layer: "n8n_workflows",
      status:
        workflows.length >= expected && active >= expected
          ? "green"
          : workflows.length >= expected
            ? "yellow"
            : "red",
      summary:
        workflows.length + "/" + expected + " workflows imported, " + active + " active",
      details: {
        total: workflows.length,
        active,
        expected,
        names: workflows.map((w) => w.name),
      },
    };
  } catch (err) {
    return {
      layer: "n8n_workflows",
      status: "red",
      summary: "n8n poll failed: " + asMessage(err),
      details: { error: asMessage(err) },
    };
  }
}

async function auditSignalWiring(): Promise<LayerStatus> {
  try {
    const result = await db.execute(
      sql`SELECT MAX(received_at) AS last_event, COUNT(*)::text AS total FROM events`
    );
    const rows = extractRows<{ last_event: Date | null; total: string }>(result);
    const lastEvent = rows[0]?.last_event;
    const total = parseInt(rows[0]?.total || "0", 10);
    if (total === 0) {
      return {
        layer: "signal_wiring",
        status: "red",
        summary: "No events ingested yet — n8n → AIOS round-trip unproven",
        details: { total: 0 },
      };
    }
    const ageMs = lastEvent
      ? Date.now() - new Date(lastEvent).getTime()
      : Infinity;
    const ageHours = Math.round(ageMs / 3600000);
    return {
      layer: "signal_wiring",
      status: ageHours < 24 ? "green" : ageHours < 72 ? "yellow" : "red",
      summary:
        total + " events total, last ingested " + ageHours + "h ago",
      details: { total, lastEvent, ageHours },
    };
  } catch (err) {
    return {
      layer: "signal_wiring",
      status: "red",
      summary: "Event query failed: " + asMessage(err),
      details: { error: asMessage(err) },
    };
  }
}

async function auditCloseReadiness(): Promise<LayerStatus> {
  const gates = {
    landing_live: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    stripe_configured: Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
    ),
    domain_custom: Boolean(
      process.env.NEXT_PUBLIC_APP_URL &&
        !process.env.NEXT_PUBLIC_APP_URL.includes("railway.app")
    ),
    demo_loom: Boolean(process.env.DEMO_LOOM_URL),
    outreach_ready: Boolean(process.env.OUTREACH_LIST_READY === "true"),
  };
  const green = Object.values(gates).filter(Boolean).length;
  const total = Object.keys(gates).length;
  return {
    layer: "close_readiness",
    status: green === total ? "green" : green >= total / 2 ? "yellow" : "red",
    summary: green + "/" + total + " close-readiness gates met",
    details: gates,
  };
}

function extractRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object" && "rows" in result) {
    const rows = (result as { rows?: unknown }).rows;
    if (Array.isArray(rows)) return rows as T[];
  }
  return [];
}

function asMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
