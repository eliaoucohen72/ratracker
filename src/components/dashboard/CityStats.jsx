import React, { useMemo } from "react";
import { BarChart2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CityStats({ history }) {
  const cityCounts = useMemo(() => {
    const counts = {};
    history.forEach((entry) => {
      entry.cities.forEach((city) => {
        counts[city] = (counts[city] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [history]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-inter font-bold text-foreground">ערים שהותקפו</h2>
        <span className="text-xs text-muted-foreground ml-1">Cities targeted</span>
      </div>

      {cityCounts.length === 0 ? (
        <p className="text-muted-foreground text-sm font-inter text-center py-8">
          No data yet.
        </p>
      ) : (
        <ScrollArea className="h-72">
          <div className="space-y-2 pr-2">
            {cityCounts.map(([city, count]) => (
              <div
                key={city}
                className="flex items-center justify-between bg-secondary/50 border border-border rounded-lg px-3 py-2"
                dir="rtl"
              >
                <span className="font-heebo font-semibold text-sm text-foreground">{city}</span>
                <span className="font-inter text-xs text-red-400 font-bold tabular-nums ml-2 shrink-0">
                  {count} {count === 1 ? "alert" : "alerts"}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}