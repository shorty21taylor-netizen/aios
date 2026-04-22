"use client";

import { useState } from "react";

interface AgentRow {
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
  lastEventAt: string | null;
}

const CHANNEL_BADGE: Record<string, { label: string; color: string }> = {
  voice: { label: "Voice", color: "bg-indigo-900 text-indigo-200" },
  sms: { label: "SMS", color: "bg-emerald-900 text-emerald-200" },
  email: { label: "Email", color: "bg-sky-900 text-sky-200" },
  marketing: { label: "Marketing", color: "bg-amber-900 text-amber-200" },
  internal: { label: "Internal", color: "bg-slate-800 text-slate-300" },
};

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function AgentRosterClient({ agents: initial }: { agents: AgentRow[] }) {
  const [agents, setAgents] = useState(initial);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (slug: string, next: boolean) => {
    setToggling(slug);
    const prev = agents;
    setAgents((curr) =>
      curr.map((a) => (a.slug === slug ? { ...a, isEnabled: next } : a))
    );
    try {
      const res = await fetch("/api/agents/toggle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentSlug: slug, isEnabled: next }),
      });
      if (!res.ok) throw new Error(`toggle failed: ${res.status}`);
    } catch (err) {
      console.error(err);
      setAgents(prev); // revert
      alert(`Failed to toggle ${slug}. Check console.`);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {agents.map((a) => {
        const badge = CHANNEL_BADGE[a.channel] ?? CHANNEL_BADGE.internal;
        return (
          <div
            key={a.slug}
            className="rounded-lg border border-slate-700 bg-slate-900 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{a.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  {a.usesClaude ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-900 text-purple-200">
                      Claude
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-slate-400 mt-2">{a.description}</p>
              </div>
              <label className="flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={a.isEnabled}
                  disabled={toggling === a.slug}
                  onChange={(e) => handleToggle(a.slug, e.target.checked)}
                />
                <div className="relative w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-emerald-600 transition-colors">
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      a.isEnabled ? "translate-x-5" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide">
                  Events (7d)
                </div>
                <div className="text-white font-mono">{a.eventCount7d}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wide">
                  Last event
                </div>
                <div className="text-white">
                  {formatTimestamp(a.lastEventAt)}
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500 font-mono">
              n8n webhook: <span className="text-slate-400">/{a.webhookPath}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
