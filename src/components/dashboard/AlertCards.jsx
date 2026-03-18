import { useState, useEffect } from "react";
import { Timer, MapPin, Flame } from "lucide-react";

export default function AlertCards({ cities, startTime, timeToRun = 45, desc }) {
  const [secondsLeft, setSecondsLeft] = useState(timeToRun);

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const initial = Math.max(timeToRun - elapsed, 0);
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
  }, [startTime]);

  if (!cities || cities.length === 0) return null;

  const isUrgent = secondsLeft <= 15;
  const isExpired = secondsLeft === 0;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        isExpired
          ? "bg-secondary border-border opacity-60"
          : isUrgent
            ? "bg-red-100 border-red-500 dark:bg-red-950/80 dark:border-red-600 animate-pulse-red"
            : "bg-orange-100 border-orange-400 dark:bg-orange-950/60 dark:border-orange-600/70"
      }`}
    >
      {/* Progress bar */}
      {!isExpired && (
        <div
          className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${
            isUrgent ? "bg-red-500" : "bg-orange-500"
          }`}
          style={{ width: `${(secondsLeft / timeToRun) * 100}%` }}
        />
      )}

      {/* Header: title + timer */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${isUrgent ? "text-red-400" : "text-orange-400"}`} />
          <span className="font-inter font-bold text-foreground">
            Active Alerts —{" "}
            <span className="font-heebo">{cities.length} יעדים</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Timer
            className={`w-4 h-4 ${
              isExpired ? "text-muted-foreground" : isUrgent ? "text-red-400" : "text-orange-400"
            }`}
          />
          <span
            className={`font-inter font-black text-2xl tabular-nums ${
              isExpired
                ? "text-muted-foreground"
                : isUrgent
                  ? "text-red-600 dark:text-red-400"
                  : "text-orange-600 dark:text-orange-300"
            }`}
          >
            {isExpired ? "00" : String(secondsLeft).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground font-inter">sec</span>
        </div>
      </div>

      {/* Cities as chips */}
      <div className="flex flex-wrap gap-2" dir="rtl">
        {cities.map((city) => (
          <div
            key={city}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm border ${
              isUrgent
                ? "bg-red-200/60 border-red-400/60 dark:bg-red-900/40 dark:border-red-700/50"
                : "bg-orange-200/50 border-orange-400/40 dark:bg-black/25 dark:border-orange-700/30"
            }`}
          >
            <MapPin
              className={`w-3 h-3 ${isUrgent ? "text-red-400" : "text-orange-400"}`}
            />
            <span className="font-heebo font-bold text-foreground">{city}</span>
          </div>
        ))}
      </div>

      {!isExpired && (
        <p className="text-xs mt-3 font-heebo text-muted-foreground" dir="rtl">
          {isUrgent
            ? "⚠️ זמן מועט! היכנסו למרחב המוגן מיד!"
            : (desc || "היכנסו למרחב המוגן")}
        </p>
      )}
    </div>
  );
}
