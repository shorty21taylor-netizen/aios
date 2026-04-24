"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok || !body.url) {
        setError(body.message || body.error || "Could not open billing portal");
        setLoading(false);
        return;
      }
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={openPortal}
        disabled={loading}
        className="inline-flex items-center rounded-xl border border-grey-300 bg-white px-5 py-3 text-sm font-medium text-grey-700 shadow-sm transition-colors hover:bg-grey-50 disabled:opacity-50"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
