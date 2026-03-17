import React from "react";
import CityCard from "./CityCard";
import { Flame } from "lucide-react";

export default function AlertCards({ cities, startTime }) {
  if (!cities || cities.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-inter font-bold text-foreground">
          Active Alerts — <span className="font-heebo">{cities.length} יעדים</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cities.map((city) => (
          <CityCard key={city} city={city} startTime={startTime} />
        ))}
      </div>
    </div>
  );
}