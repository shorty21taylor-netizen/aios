"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface TimeWindowSelectorProps {
  current: "today" | "7d" | "30d";
  onChange: (window: "today" | "7d" | "30d") => void;
}

export function TimeWindowSelector({
  current,
  onChange,
}: TimeWindowSelectorProps) {
  return (
    <div className="flex gap-2">
      {["today", "7d", "30d"].map((window) => (
        <Button
          key={window}
          variant={current === window ? "primary" : "secondary"}
          size="sm"
          onClick={() => onChange(window as "today" | "7d" | "30d")}
        >
          {window === "today" ? "Today" : window === "7d" ? "7 Days" : "30 Days"}
        </Button>
      ))}
    </div>
  );
}
