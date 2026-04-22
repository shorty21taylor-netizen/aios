"use client";

import { useMemo, useState } from "react";
import { composePrompt, type PromptKind } from "@/lib/profile/prompt-composer";

const KIND_LABELS: Array<{ kind: PromptKind; label: string; sample: string }> = [
  {
    kind: "sms_reply",
    label: "SMS reply",
    sample: "Hi! Do you service 90210 and how soon can someone come out?",
  },
  {
    kind: "voice_qualify",
    label: "Voice (qualify)",
    sample: "Hi, my AC stopped working overnight. Can someone come today?",
  },
  {
    kind: "email_draft",
    label: "Email draft",
    sample:
      "I'm comparing three quotes on a 4-ton heat pump replacement for a 2,400 sq ft home in Plano.",
  },
  {
    kind: "sms_enrich",
    label: "SMS enrichment (JSON)",
    sample: "Yeah I think we're ready to book. Do you have Saturday morning?",
  },
  {
    kind: "daily_brief",
    label: "Daily brief (6am)",
    sample: "Generate today's operator brief.",
  },
  {
    kind: "marketing",
    label: "Marketing re-engagement",
    sample: "Draft a message to a lead from 90 days ago who asked for a roof quote.",
  },
  {
    kind: "missed_call_recovery",
    label: "Missed-call recovery",
    sample: "Missed call from +15551234567 at 2:14pm.",
  },
];

/**
 * Live preview of what Claude will see when n8n runs an agent for this profile.
 * Uses the exact same composer that the n8n workflow uses, via the shared
 * TypeScript mirror at src/lib/profile/prompt-composer.ts.
 */
export function PromptPreview({ profile }: { profile: unknown }) {
  const [kindIdx, setKindIdx] = useState(0);
  const chosen = KIND_LABELS[kindIdx];

  const composed = useMemo(() => {
    try {
      return composePrompt({
        kind: chosen.kind,
        profile: (profile ?? {}) as Record<string, never>,
        userMessage: chosen.sample,
      });
    } catch (err) {
      return {
        system: `[composer error: ${(err as Error).message}]`,
        user: chosen.sample,
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
      };
    }
  }, [profile, chosen]);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Live prompt preview
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            This is what Claude will see when n8n runs your agents. Edits above
            reflect here instantly.
          </p>
        </div>
        <select
          className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-1.5 text-sm"
          value={kindIdx}
          onChange={(e) => setKindIdx(Number(e.target.value))}
        >
          {KIND_LABELS.map((k, i) => (
            <option key={k.kind} value={i}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
          System prompt
        </div>
        <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
          {composed.system}
        </pre>
      </div>

      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
          User message (sample)
        </div>
        <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 whitespace-pre-wrap font-mono">
          {composed.user}
        </pre>
      </div>

      <div className="flex gap-4 text-xs text-slate-500">
        <div>
          Model: <span className="text-slate-300">{composed.model}</span>
        </div>
        <div>
          Max tokens: <span className="text-slate-300">{composed.max_tokens}</span>
        </div>
      </div>
    </div>
  );
}
