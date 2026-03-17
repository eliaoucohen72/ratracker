import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

const CITY_COORDS = {
  "תל אביב": [32.0853, 34.7818],
  "אשקלון": [31.6688, 34.5743],
  "שדרות": [31.5245, 34.5963],
  "אשדוד": [31.8044, 34.6553],
  "באר שבע": [31.2530, 34.7915],
  "רחובות": [31.8928, 34.8113],
  "נתיבות": [31.4226, 34.5878],
  "ירושלים": [31.7683, 35.2137],
  "חיפה": [32.7940, 34.9896],
  "עפולה": [32.6078, 35.2897],
  "קריית שמונה": [33.2074, 35.5695],
  "נהריה": [33.0078, 35.0950],
  "עכו": [32.9228, 35.0763],
  "טבריה": [32.7968, 35.5322],
  "ראשון לציון": [31.9730, 34.7925],
};

const TEN_MINUTES = 10 * 60 * 1000;

export default function AlertMap({ history }) {
  // Build a map of city -> list of timestamps from the last 10 minutes
  const recentCityAlerts = useMemo(() => {
    const now = Date.now();
    const cityMap = {};

    // history entries have: { id, title, cities, time (HH:MM:SS string), timestamp (ms) }
    history.forEach((entry) => {
      if (!entry.timestamp) return;
      if (now - entry.timestamp > TEN_MINUTES) return;
      entry.cities.forEach((city) => {
        if (!CITY_COORDS[city]) return;
        if (!cityMap[city]) cityMap[city] = [];
        cityMap[city].push(entry.time);
      });
    });

    return cityMap;
  }, [history]);

  const markerEntries = Object.entries(recentCityAlerts);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 bg-card px-4 py-3 border-b border-border">
        <MapPin className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-inter font-bold text-foreground">
          Alert Map
        </h2>
        <span className="text-xs text-muted-foreground ml-1">— last 10 minutes</span>
        {markerEntries.length > 0 && (
          <span className="ml-auto text-xs bg-red-900/50 border border-red-700/40 text-red-300 px-2 py-0.5 rounded-full font-inter">
            {markerEntries.length} cities
          </span>
        )}
      </div>
      <div style={{ height: 450 }}>
        <MapContainer
          center={[31.5, 34.8]}
          zoom={7}
          style={{ height: "100%", width: "100%", background: "#111" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          {markerEntries.map(([city, timestamps]) => (
            <CircleMarker
              key={city}
              center={CITY_COORDS[city]}
              radius={10}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#ef4444",
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div dir="rtl" style={{ fontFamily: "'Heebo', sans-serif", minWidth: 120 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{city}</div>
                  {timestamps.map((t, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#ef4444", fontFamily: "monospace" }}>
                      🕐 {t}
                    </div>
                  ))}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}