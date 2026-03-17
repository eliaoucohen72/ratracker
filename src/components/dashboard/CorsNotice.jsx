import React from "react";
import { Info } from "lucide-react";

export default function CorsNotice({ isLive }) {
  if (!isLive) return null;

  return (
    <div className="rounded-lg bg-blue-950/30 border border-blue-800/30 p-3 flex items-start gap-2">
      <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
      <p className="text-xs text-blue-300/80 font-inter leading-relaxed">
        <strong>CORS Notice:</strong> The Pikud Ha'Oref API blocks direct browser requests due to CORS restrictions.
        In <strong>local development</strong>, requests are routed through the built-in{" "}
        <code className="text-blue-400">Vite dev proxy</code> (<code className="text-blue-400">/api/oref → oref.org.il</code>),
        which bypasses CORS by making the call server-side — no third-party service needed.{" "}
        In <strong>production</strong>, you must set up a real server-side proxy (e.g. Nginx, Express, or a serverless function)
        to forward requests to the API, as the Vite proxy only works during development.
      </p>
    </div>
  );
}