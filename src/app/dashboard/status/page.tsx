"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

interface LayerStatus {
  layer: string;
  status: "green" | "yellow" | "red" | "unknown";
  summary: string;
  details: Record<string, unknown>;
}

interface StatusReadout {
  generatedAt: string;
  rollup: "green" | "yellow" | "red";
  layers: LayerStatus[];
  nextAction: string;
}

const LAYER_TITLES: Record<string, string> = {
  repo_deploy: "Repo + Deploy",
  auth_chain: "Auth Chain",
  database: "Database Schema",
  n8n_workflows: "n8n Workflows",
  signal_wiring: "Signal Wiring",
  close_readiness: "Close Readiness",
};

const LAYER_DESCRIPTIONS: Record<string, string> = {
  repo_deploy: "Which commit is running on Railway right now",
  auth_chain: "Clerk org → workspace provisioning works",
  database: "All required tables exist on production Postgres",
  n8n_workflows: "All 8 workflows imported + active in n8n Cloud",
  signal_wiring: "Last event that flowed n8n → AIOS → DB",
  close_readiness: "Stripe, domain, demo, outreach gates",
};

export default function StatusPage() {
  const [data, setData] = useState<StatusReadout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) throw new Error("Status API returned " + res.status);
      const body = (await res.json()) as StatusReadout;
      setData(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-grey-950">
            Chief of Staff
          </h1>
          <p className="mt-2 text-sm text-grey-600">
            Client-close readiness across repo, auth, database, n8n, wiring, and outreach gates.
          </p>
        </div>
        <button onClick={loadStatus} disabled={loading} className="inline-flex items-center rounded-lg border border-grey-300 bg-white px-4 py-2 text-sm font-medium text-grey-700 shadow-sm transition-colors hover:bg-grey-50 disabled:opacity-50">
          <RefreshCw className={"mr-2 h-4 w-4 " + (loading ? "animate-spin" : "")} />
          Refresh
        </button>
      </div>

      {error ? (
        <Card className="border-red-300 bg-red-50">
          <CardTitle className="text-red-900">Status unavailable</CardTitle>
          <CardContent className="text-sm text-red-800">{error}</CardContent>
        </Card>
      ) : null}

      {data ? (
        <>
          <RollupBanner rollup={data.rollup} nextAction={data.nextAction} generatedAt={data.generatedAt} />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.layers.map((layer) => (
              <LayerCard key={layer.layer} layer={layer} />
            ))}
          </div>
        </>
      ) : loading ? (
        <Card>
          <CardContent className="text-grey-500">Running audit…</CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function RollupBanner({
  rollup,
  nextAction,
  generatedAt,
}: {
  rollup: "green" | "yellow" | "red";
  nextAction: string;
  generatedAt: string;
}) {
  const styles: Record<string, string> = {
    green: "border-emerald-300 bg-emerald-50 text-emerald-900",
    yellow: "border-amber-300 bg-amber-50 text-amber-900",
    red: "border-red-300 bg-red-50 text-red-900",
  };
  const labels: Record<string, string> = {
    green: "READY TO CLOSE",
    yellow: "GAPS REMAINING",
    red: "BLOCKERS PRESENT",
  };
  return (
    <Card className={styles[rollup]}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider opacity-75">
            Overall status
          </div>
          <div className="mt-1 font-display text-2xl font-semibold">{labels[rollup]}</div>
          <div className="mt-3 text-sm opacity-90">
            <span className="font-medium">Next action:</span> {nextAction}
          </div>
        </div>
        <div className="text-right text-xs opacity-75">
          Generated {new Date(generatedAt).toLocaleString()}
        </div>
      </div>
    </Card>
  );
}

function LayerCard({ layer }: { layer: LayerStatus }) {
  const Icon =
    layer.status === "green"
      ? CheckCircle2
      : layer.status === "yellow"
        ? AlertTriangle
        : layer.status === "red"
          ? XCircle
          : HelpCircle;
  const iconColor: Record<string, string> = {
    green: "text-emerald-600",
    yellow: "text-amber-600",
    red: "text-red-600",
    unknown: "text-grey-400",
  };
  const borderColor: Record<string, string> = {
    green: "border-emerald-200",
    yellow: "border-amber-200",
    red: "border-red-300",
    unknown: "border-grey-200",
  };
  return (
    <Card className={borderColor[layer.status]}>
      <div className="flex items-start gap-3">
        <Icon className={"mt-0.5 h-5 w-5 " + iconColor[layer.status]} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {LAYER_TITLES[layer.layer] || layer.layer}
            </CardTitle>
            <span
              className={
                "rounded-full px-2 py-0.5 text-xs font-semibold uppercase " +
                (layer.status === "green"
                  ? "bg-emerald-100 text-emerald-800"
                  : layer.status === "yellow"
                    ? "bg-amber-100 text-amber-800"
                    : layer.status === "red"
                      ? "bg-red-100 text-red-800"
                      : "bg-grey-100 text-grey-700")
              }
            >
              {layer.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-grey-500">
            {LAYER_DESCRIPTIONS[layer.layer]}
          </p>
          <p className="mt-3 text-sm text-grey-800">{layer.summary}</p>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-grey-500 hover:text-grey-700">
              Details
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-grey-50 p-3 text-xs text-grey-700">
              {JSON.stringify(layer.details, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </Card>
  );
}
