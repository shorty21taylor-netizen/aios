"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TimeWindowSelector } from "@/components/dashboard/time-window-selector";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-brand-500">
            Overview
          </div>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.02em] text-grey-950">
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
        <div className="rounded-2xl border border-grey-200 bg-white p-8">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-brand-500">
            Loading
          </div>
          <div className="mt-2 text-grey-600">Fetching your KPIs...</div>
        </div>
      ) : kpis ? (
        <>
          {(() => {
            const totalSignals =
              kpis.kpis.inbound_calls.received +
              kpis.kpis.calls_to_bookings.count +
              kpis.kpis.sms_sent_from_inquiries.count +
              kpis.kpis.quotes_sent.count +
              kpis.kpis.sms_to_bookings.count +
              kpis.kpis.email_to_bookings.count +
              kpis.kpis.email_replies.count;
            if (totalSignals > 0) return null;
            return (
              <div className="rounded-2xl border border-brand-300 bg-gradient-to-br from-brand-50 to-white p-8">
                <div className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Waiting for your first signal
                </div>
                <h2 className="mt-2 font-display text-2xl font-medium tracking-tight text-grey-950">
                  Connect n8n to start capturing calls, SMS, and bookings.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-grey-700">
                  salesyAI listens for events posted to <code className="rounded bg-grey-100 px-1.5 py-0.5 text-xs">POST /api/events/ingest</code>.
                  Generate a workspace API key, then import the 8 n8n workflows — the first call, text, or
                  missed-call will light these cards up.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard/settings/api-keys"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow"
                  >
                    Generate API key <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="/dashboard/status"
                    className="inline-flex items-center gap-2 rounded-xl border border-grey-300 bg-white px-5 py-3 text-sm font-medium text-grey-700 shadow-sm transition-colors hover:bg-grey-50"
                  >
                    Check readiness
                  </Link>
                </div>
              </div>
            );
          })()}
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
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-red-600">
                Alert
              </div>
              <div className="mt-2">
                Answer rate is below 100%. Only{" "}
                <span className="font-display font-medium text-grey-950">
                  {kpis.kpis.inbound_calls.answered}
                </span>{" "}
                of{" "}
                <span className="font-display font-medium text-grey-950">
                  {kpis.kpis.inbound_calls.received}
                </span>{" "}
                calls were answered.
              </div>
            </div>
          )}

          <RecentActivity />
        </>
      ) : (
        <div className="rounded-2xl border border-grey-200 bg-white p-8">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-brand-500">
            No data yet
          </div>
          <div className="mt-2 text-grey-600">
            Once your n8n workflows start sending events, they&apos;ll appear
            here.
          </div>
        </div>
      )}
    </div>
  );
}
