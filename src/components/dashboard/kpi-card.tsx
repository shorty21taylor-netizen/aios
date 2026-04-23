"use client";


import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  delta?: number;
  highlight?: boolean;
}

export function KPICard({
  title,
  value,
  subvalue,
  delta,
  highlight,
}: KPICardProps) {
  const isDeltaNegative = delta !== undefined && delta < 0;

  return (
    <Card className={highlight ? "border-emerald-500 bg-slate-900" : ""}>
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-sm font-medium text-slate-400">
            {title}
          </CardTitle>
          <CardContent className="mt-2 p-0">
            <div className="text-3xl font-bold text-white">{value}</div>
            {subvalue && <div className="text-sm text-slate-400 mt-1">{subvalue}</div>}
          </CardContent>
        </div>
        {delta !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isDeltaNegative ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {isDeltaNegative ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            <span>{Math.abs(delta)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
}
