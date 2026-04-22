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
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-4 items-center">
          <TimeWindowSelector current={timeWindow} onChange={setTimeWindow} />
          <Link href="/dashboard/settings">
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading KPIs...</div>
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
            <div className="bg-red-900 border border-red-700 rounded p-4 text-red-200">
              Alert: Answer rate is below 100%. Only {kpis.kpis.inbound_calls.answered} of{" "}
              {kpis.kpis.inbound_calls.received} calls were answered.
            </div>
          )}

          <RecentActivity />
        </>
      ) : (
        <div className="text-slate-400">No data available</div>
      )}
    </div>
  );
}
