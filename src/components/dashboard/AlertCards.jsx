import { useState, useEffect } from "react";
import { Timer, MapPin, Flame } from "lucide-react";
import { getAlertType } from "../../data/alertTypes";

export default function AlertCards({ cities, startTime, alertType = "missiles" }) {
  const typeConfig = getAlertType(alertType);

  // The group countdown = minimum countdown among all cities (most urgent)
  const groupCountdown = cities && cities.length > 0
    ? Math.min(...cities.map((c) => c.countdown ?? 45))
    : 45;

  const [secondsLeft, setSecondsLeft] = useState(groupCountdown);

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const initial = Math.max(groupCountdown - elapsed, 0);
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
  }, [startTime, groupCountdown]);

  if (!cities || cities.length === 0) return null;

  const isUrgent = secondsLeft <= 15;
  const isExpired = secondsLeft === 0;

  // Group cities by zone, sort zones by their minimum countdown (most urgent first)
  const zoneGroups = cities.reduce((acc, city) => {
    const zone = city.zone || "אחר";
    if (!acc[zone]) acc[zone] = { zone, zone_en: city.zone_en, cities: [] };
    acc[zone].cities.push(city);
    return acc;
  }, {});

  const sortedZones = Object.values(zoneGroups).sort(
    (a, b) =>
      Math.min(...a.cities.map((c) => c.countdown ?? 45)) -
      Math.min(...b.cities.map((c) => c.countdown ?? 45))
  );

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        isExpired
          ? "bg-secondary border-border opacity-60"
          : isUrgent
            ? "bg-red-100 border-red-500 dark:bg-red-950/80 dark:border-red-600 animate-pulse-red"
            : typeConfig.bgClass
      }`}
    >
      {/* Progress bar */}
      {!isExpired && (
        <div
          className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${
            isUrgent ? "bg-red-500" : "bg-orange-500"
          }`}
          style={{ width: `${(secondsLeft / groupCountdown) * 100}%` }}
        />
      )}

      {/* Header: title + timer */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${isUrgent ? "text-red-400" : "text-orange-400"}`} />
          <span className="font-inter font-bold text-foreground">
            <span className="font-heebo">{typeConfig.label}</span>
            {typeConfig.isDrill && (
              <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-muted-foreground px-1.5 py-0.5 rounded font-inter">
                DRILL
              </span>
            )}
            <span className="text-muted-foreground font-normal mx-1.5">—</span>
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

      {/* Cities grouped by zone */}
      <div className="space-y-3">
        {sortedZones.map(({ zone, zone_en, cities: zoneCities }) => (
          <div key={zone}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs font-heebo font-semibold text-muted-foreground">{zone}</span>
              {zone_en && (
                <span className="text-xs text-muted-foreground/60 font-inter">· {zone_en}</span>
              )}
              <span className="text-xs text-muted-foreground/50 font-inter ml-auto">
                {zoneCities.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2" dir="rtl">
              {zoneCities.map((city) => {
                const cityUrgent = (city.countdown ?? 45) <= 15;
                return (
                  <div
                    key={city.name}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm border ${
                      cityUrgent
                        ? "bg-red-200/60 border-red-400/60 dark:bg-red-900/40 dark:border-red-700/50"
                        : isUrgent
                          ? "bg-red-200/60 border-red-400/60 dark:bg-red-900/40 dark:border-red-700/50"
                          : "bg-orange-200/50 border-orange-400/40 dark:bg-black/25 dark:border-orange-700/30"
                    }`}
                  >
                    <MapPin
                      className={`w-3 h-3 ${cityUrgent || isUrgent ? "text-red-400" : "text-orange-400"}`}
                    />
                    <span className="font-heebo font-bold text-foreground">{city.name}</span>
                    <span className="text-xs opacity-50 font-inter ml-0.5">{city.countdown}s</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!isExpired && (
        <p className="text-xs mt-3 font-heebo text-muted-foreground" dir="rtl">
          {isUrgent
            ? "⚠️ זמן מועט! היכנסו למרחב המוגן מיד!"
            : "היכנסו למרחב המוגן"}
        </p>
      )}
    </div>
  );
}
