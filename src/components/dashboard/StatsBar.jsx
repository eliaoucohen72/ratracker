import React from "react";
import { Activity, Target, Clock, Radio } from "lucide-react";

function StatItem({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 bg-secondary/50 rounded-lg border border-border px-4 py-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-inter">{label}</p>
        <p className="text-lg font-inter font-bold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function StatsBar({ totalAlerts, totalCities, lastUpdate, isLive, onRefresh }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatItem
        icon={Activity}
        label="Total Alerts"
        value={totalAlerts}
        color="bg-red-900/50 text-red-400"
      />
      <StatItem
        icon={Target}
        label="Cities Targeted"
        value={totalCities}
        color="bg-orange-900/50 text-orange-400"
      />
      <div className="flex items-center gap-3 bg-secondary/50 rounded-lg border border-border px-4 py-3">
        <div className="p-2 rounded-lg bg-blue-900/50 text-blue-400">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-inter">Last Update</p>
          <p className="text-lg font-inter font-bold tabular-nums text-foreground truncate">{lastUpdate || "—"}</p>
        </div>
        <button
          onClick={onRefresh}
          title="Refresh now"
          className="ml-1 shrink-0 text-lg text-muted-foreground hover:text-foreground bg-secondary hover:bg-border rounded-md px-2 py-1 transition-colors leading-none"
        >
          ↻
        </button>
      </div>
      <StatItem
        icon={Radio}
        label="Mode"
        value={isLive ? "LIVE" : "DEMO"}
        color={isLive ? "bg-emerald-900/50 text-emerald-400" : "bg-purple-900/50 text-purple-400"}
      />
    </div>
  );
}