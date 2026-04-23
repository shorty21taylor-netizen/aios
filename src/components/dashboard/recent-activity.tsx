"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface Event {
  id: string;
  event_type: string;
  occurred_at: string;
  data: Record<string, unknown>;
}

export function RecentActivity() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events/recent");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error("Error fetching recent events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <CardContent>
          <div className="text-slate-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Recent Activity (Last 20 Events)
      </CardTitle>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-slate-400">No events yet.</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between text-sm border-b border-slate-700 pb-3 last:border-0"
              >
                <div>
                  <div className="font-medium text-emerald-400">
                    {event.event_type}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(event.occurred_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
