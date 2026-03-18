import React, { useState, useEffect } from "react";
import { Timer, MapPin } from "lucide-react";

export default function CityCard({ city, startTime, countdown = 45 }) {
  const [secondsLeft, setSecondsLeft] = useState(countdown);

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const initial = Math.max(countdown - elapsed, 0);
    setSecondsLeft(initial);

    if (initial <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, countdown]);

  const isUrgent = secondsLeft <= 15;
  const isExpired = secondsLeft === 0;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border p-4 transition-all duration-300
        ${isExpired
          ? "bg-secondary border-border opacity-60"
          : isUrgent
            ? "bg-red-950/80 border-red-600 animate-pulse-red"
            : "bg-orange-950/60 border-orange-600/70"
        }
      `}
      dir="rtl"
    >
      {!isExpired && (
        <div
          className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${
            isUrgent ? "bg-red-500" : "bg-orange-500"
          }`}
          style={{ width: `${(secondsLeft / countdown) * 100}%` }}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className={`w-5 h-5 ${isUrgent ? "text-red-400" : "text-orange-400"}`} />
          <span className="font-heebo font-bold text-xl text-foreground">{city}</span>
        </div>

        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${isExpired ? "text-muted-foreground" : isUrgent ? "text-red-400" : "text-orange-400"}`} />
          <span
            className={`font-inter font-black text-2xl tabular-nums ${
              isExpired
                ? "text-muted-foreground"
                : isUrgent
                  ? "text-red-400"
                  : "text-orange-300"
            }`}
          >
            {isExpired ? "00" : String(secondsLeft).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground font-inter">sec</span>
        </div>
      </div>

      {!isExpired && (
        <p className="text-xs mt-2 font-heebo text-muted-foreground">
          {isUrgent ? "⚠️ זמן מועט! היכנסו למרחב המוגן מיד!" : "היכנסו למרחב המוגן"}
        </p>
      )}
    </div>
  );
}
