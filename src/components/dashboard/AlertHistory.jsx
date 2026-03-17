import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Clock } from "lucide-react";

export default function AlertHistory({ history }) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-inter font-bold text-foreground">Alert History</h2>
        </div>
        <p className="text-muted-foreground text-sm font-inter text-center py-8">
          No alerts recorded yet. Alerts will appear here when detected.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-inter font-bold text-foreground">
          Alert History <span className="text-muted-foreground text-sm font-normal">({history.length})</span>
        </h2>
      </div>
      <ScrollArea className="h-80">
        <div className="space-y-2 pr-3">
          {history.map((entry, idx) => (
            <div
              key={entry.id + "-" + idx}
              className="rounded-lg bg-secondary/50 border border-border p-3 transition-all hover:bg-secondary"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-heebo font-semibold text-sm text-foreground">
                  {entry.title}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-inter tabular-nums">{entry.time}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entry.cities.map((city) => (
                  <span
                    key={city}
                    className="px-2 py-0.5 rounded-md bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-heebo"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}