import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function StatusBanner({ isActive, title }) {
  if (isActive) {
    return (
      <div className="animate-pulse-red animate-flash rounded-xl bg-red-700 border border-red-500 p-5 flex items-center justify-center gap-4" dir="rtl">
        <AlertTriangle className="w-8 h-8 text-white animate-bounce" />
        <div className="text-center">
          <p className="text-white font-heebo font-black text-2xl md:text-3xl tracking-wide">
            🚨 {title || "ירי רקטות וטילים"} 🚨
          </p>
          <p className="text-red-200 font-heebo text-sm mt-1">היכנסו למרחב המוגן!</p>
        </div>
        <AlertTriangle className="w-8 h-8 text-white animate-bounce" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-400 dark:border-emerald-700/50 p-5 flex items-center justify-center gap-3">
      <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
      <p className="text-emerald-700 dark:text-emerald-300 font-inter font-semibold text-lg md:text-xl">
        No active alerts — All clear
      </p>
      <span className="text-emerald-600 dark:text-emerald-400 font-heebo text-lg">אין התרעות</span>
    </div>
  );
}