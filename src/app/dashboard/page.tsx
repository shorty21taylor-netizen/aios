"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TimeWindowSelector } from "@/components/dashboard/time-window-selector";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const GRID_BACKDROP_STYLE = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(195, 202, 224, 0.22) 1px, transparent 0)",
  backgroundSize: "56px 56px",
  WebkitMaskImage:
    "radial-gradient(ellipse at 50% 0%, black 40%, transparent 80%)",
  maskImage:
    "radial-gradient(ellipse at 50% 0%, black 40%, transparent 80%)",
} as const;

interface KPIs {
  window: string;
  kpis: {
    inbound_calls: {
      answered: number;
      received: number;
      answer_rate: number;
      delta_vs_prior: number;
    };
    calls_to_bookings: {
      count: number;
      delta_vs_prior: number;
    };
    sms_sent_from_inquiries: {
      count: number;
      delta_vs_prior: number;
    };
    quotes_sent: {
      count: number;
      delta_vs_prior: number;
    };
    sms_to_bookings: {
      count: number;
      delta_vs_prior: number;
    };
    email_to_bookings: {
      count: number;
      delta_vs_prior: number;
    };
    email_replies: {
      count: number;
      delta_vs_prior: number;
    };
    pipeline_value: {
      usd: number;
      delta_vs_prior: number;
    };
    closed_revenue: {
      usd: number;
      delta_vs_prior: number;
    };
  };
}

export default function DashboardPage() {
  const [timeWindow, setTimeWindow] = useState<"today" | "7d" | "30d">("today");
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKpis() {
      setLoading(true);
      try {
        const response = await fetch(`/api/kpis?window=${timeWindow}`);
        if (response.ok) {
          const data = await response.json();
          setKpis(data);
        }
      } catch (error) {
        console.error("Error fetching KPIs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchKpis();
  }, [timeWindow]);

  const answerRateWarning =
    kpis && kpis.kpis.inbound_calls.answer_rate < 100;

  return (
    <div className="relative space-y-8">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={GRID_BACKDROP_STYLE}
      />
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-brand-400">
            Overview
          </div>
          <h1 className="mt-2 bg-gradient-to-br from-ink-50 to-brand-300 bg-clip-text font-display text-4xl font-medium tracking-tight text-transparent">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <TimeWindowSelector current={timeWindow} onChange={setTimeWindow} />
          <Link href="/dashboard/settings">
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-brand-400">
            Loading
          </div>
          <div className="mt-2 text-ink-300">Fetching your KPIs...</div>
        </div>
      ) : kpis ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard
              title="Inbound Calls"
              value={`${kpis.kpis.inbound_calls.answered} / ${kpis.kpis.inbound_calls.received}`}
              subvalue={`${kpis.kpis.inbound_calls.answer_rate}% answer rate`}
              delta={kpis.kpis.inbound_calls.delta_vs_prior}
              highlight={!answerRateWarning}
            />
            <KPICard
              title="Calls to Bookings"
              value={kpis.kpis.calls_to_bookings.count}
              delta={kpis.kpis.calls_to_bookings.delta_vs_prior}
            />
            <KPICard
              title="SMS Sent from Inquiries"
              value={kpis.kpis.sms_sent_from_inquiries.count}
              delta={kpis.kpis.sms_sent_from_inquiries.delta_vs_prior}
            />

            <KPICard
              title="Quotes Sent"
              value={kpis.kpis.quotes_sent.count}
              delta={kpis.kpis.quotes_sent.delta_vs_prior}
            />
            <KPICard
              title="SMS to Bookings"
              value={kpis.kpis.sms_to_bookings.count}
              delta={kpis.kpis.sms_to_bookings.delta_vs_prior}
            />
            <KPICard
              title="Email to Bookings"
              value={kpis.kpis.email_to_bookings.count}
              delta={kpis.kpis.email_to_bookings.delta_vs_prior}
            />

            <KPICard
              title="Email Replies"
              value={kpis.kpis.email_replies.count}
              delta={kpis.kpis.email_replies.delta_vs_prior}
            />
            <KPICard
              title="Pipeline Value"
              value={`$${kpis.kpis.pipeline_value.usd.toLocaleString()}`}
              delta={kpis.kpis.pipeline_value.delta_vs_prior}
            />
            <KPICard
              title="Closed Revenue"
              value={`$${kpis.kpis.closed_revenue.usd.toLocaleString()}`}
              delta={kpis.kpis.closed_revenue.delta_vs_prior}
            />
          </div>

          {answerRateWarning && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-200 backdrop-blur-xl">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-red-300">
                Alert
              </div>
              <div className="mt-2">
                Answer rate is below 100%. Only{" "}
                <span className="bg-gradient-to-br from-ink-50 to-brand-300 bg-clip-text font-display font-medium text-transparent">
                  {kpis.kpis.inbound_calls.answered}
                </span>{" "}
                of{" "}
                <span className="bg-gradient-to-br from-ink-50 to-brand-300 bg-clip-text font-display font-medium text-transparent">
                  {kpis.kpis.inbound_calls.received}
                </span>{" "}
                calls were answered.
              </div>
            </div>
          )}

          <RecentActivity />
        </>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-brand-400">
            No data yet
          </div>
          <div className="mt-2 text-ink-300">
            Once your n8n workflows start sending events, they&apos;ll appear
            here.
          </div>
        </div>
      )}
    </div>
  );
}
