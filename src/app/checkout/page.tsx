"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("Preparing your secure checkout…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stripe/checkout", { method: "POST" });
        const body = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
          message?: string;
        };
        if (cancelled) return;
        if (!res.ok || !body.url) {
          setError(body.message || body.error || "Could not start checkout");
          setMessage("");
          return;
        }
        setMessage("Redirecting to Stripe…");
        window.location.href = body.url;
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setMessage("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <div className="font-display text-2xl font-semibold text-grey-950">
          salesy<span className="text-brand-500">AI</span>
        </div>
        <h1 className="mt-6 font-display text-3xl font-normal tracking-tight text-grey-950">
          {error ? "Checkout unavailable" : "Starting your plan"}
        </h1>
        {error ? (
          <>
            <p className="mt-4 text-sm text-red-700">{error}</p>
            <p className="mt-6 text-xs text-grey-500">
              Email Anthony at <a href="mailto:shorty21taylor@gmail.com" className="underline">shorty21taylor@gmail.com</a> and we&apos;ll open a manual checkout link for you.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center rounded-xl border border-grey-300 bg-white px-5 py-3 text-sm font-medium text-grey-700 shadow-sm transition-colors hover:bg-grey-50"
            >
              Back to home
            </Link>
          </>
        ) : (
          <p className="mt-4 text-sm text-grey-600">{message}</p>
        )}
      </div>
    </div>
  );
}
