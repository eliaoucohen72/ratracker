import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import CITY_COORDS from "../../data/cities_coords.json";

const ISRAEL_BOUNDS = [[29.4, 34.2], [33.3, 35.9]];

function IsraelBoundsEnforcer() {
  const map = useMap();
  useEffect(() => {
    map.setMinZoom(7);
  }, [map]);
  return null;
}

const TEN_MINUTES = 10 * 60 * 1000;

// Extract individual city name from Pikud Ha'Oref label format:
// "שדרות I אזור עוטף עזה" → "שדרות"
function extractCityName(label) {
  if (!label) return null;
  return label.split(" I ")[0].trim();
}

export default function AlertMap({ history }) {
  const recentCityAlerts = useMemo(() => {
    const now = Date.now();
    const cityMap = {};

    history.forEach((entry) => {
      if (!entry.timestamp) return;
      if (now - entry.timestamp > TEN_MINUTES) return;

      // Prefer structured cities_labels from API (individual cities with names)
      if (entry.cities_labels && entry.cities_labels.length > 0) {
        entry.cities_labels.forEach((cityLabel) => {
          const rawLabel = cityLabel.city_data?.label || cityLabel.label;
          const cityName = extractCityName(rawLabel);
          if (!cityName || !CITY_COORDS[cityName]) return;
          if (!cityMap[cityName]) cityMap[cityName] = { times: [], areaname: null, migun_time: null };
          cityMap[cityName].times.push(entry.time);
          if (cityLabel.areaname) cityMap[cityName].areaname = cityLabel.areaname;
          if (cityLabel.migun_time) cityMap[cityName].migun_time = cityLabel.migun_time;
        });
      } else {
        // Fallback: use raw data[] strings (group labels)
        entry.cities?.forEach((city) => {
          const cityName = extractCityName(city);
          if (!cityName || !CITY_COORDS[cityName]) return;
          if (!cityMap[cityName]) cityMap[cityName] = { times: [], areaname: null, migun_time: null };
          cityMap[cityName].times.push(entry.time);
        });
      }
    });

    return cityMap;
  }, [history]);

  const markerEntries = Object.entries(recentCityAlerts);
  // Normalize: support both old array format and new object format
  const getInfo = (val) => Array.isArray(val) ? { times: val, areaname: null, migun_time: null } : val;

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
          center={[31.5, 35.0]}
          zoom={7}
          maxBounds={ISRAEL_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%", background: "#111" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <IsraelBoundsEnforcer />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          {markerEntries.map(([city, raw]) => {
            const { times, areaname, migun_time } = getInfo(raw);
            return (
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
                <Tooltip direction="bottom" offset={[0, 8]} opacity={1}>
                  <div dir="rtl" style={{ fontFamily: "'Heebo', sans-serif", minWidth: 130 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{city}</div>
                    {areaname && (
                      <div style={{ fontSize: 11, color: "#f97316", marginBottom: 4 }}>{areaname}</div>
                    )}
                    {migun_time && (
                      <div style={{ fontSize: 11, color: "#facc15", marginBottom: 4 }}>
                        ⏱ {migun_time} שניות
                      </div>
                    )}
                    {times.map((t, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#ef4444", fontFamily: "monospace" }}>
                        🕐 {t}
                      </div>
                    ))}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
