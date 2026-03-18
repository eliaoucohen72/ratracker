import React from "react";
import { Info } from "lucide-react";

export default function CorsNotice({ isLive }) {
  if (!isLive) return null;

  return (
    <div className="rounded-lg bg-blue-100 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800/30 p-3 flex items-start gap-2">
      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
      <p className="text-xs text-blue-700 dark:text-blue-300/80 font-inter leading-relaxed">
        <strong>CORS Notice:</strong> The Pikud Ha'Oref API does not allow direct browser requests.
        This dashboard uses a CORS proxy (<code className="text-blue-600 dark:text-blue-400">corsproxy.io</code>) to fetch data.
        In production, use a server-side proxy for reliability. If live data fails to load, switch to Demo mode.
      </p>
    </div>
  );
}