import React, { useMemo, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { cityCoords as CITY_COORDS } from "../../data/cityUtils";

const pinIcon = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
      fill="#ef4444" stroke="#fff" stroke-width="2"/>
    <circle cx="16" cy="16" r="6" fill="#fff"/>
  </svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  tooltipAnchor: [0, -40],
});

function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

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
  const isDark = useDarkMode();
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
    <div className="rounded-xl border border-border overflow-hidden isolate">
      <div className="flex items-center gap-2 bg-card px-4 py-3 border-b border-border">
        <MapPin className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-inter font-bold text-foreground">
          Alert Map
        </h2>
        <span className="text-xs text-muted-foreground ml-1">— last 10 minutes</span>
        {markerEntries.length > 0 && (
          <span className="ml-auto text-xs bg-red-100 border border-red-400/60 text-red-700 dark:bg-red-900/50 dark:border-red-700/40 dark:text-red-300 px-2 py-0.5 rounded-full font-inter">
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
          style={{ height: "100%", width: "100%", background: isDark ? "#111" : "#e8e8e8" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <IsraelBoundsEnforcer />
          <TileLayer
            key={isDark ? "dark" : "light"}
            url={isDark
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          {markerEntries.map(([city, raw]) => {
            const { times, areaname, migun_time } = getInfo(raw);
            return (
              <Marker
                key={city}
                position={CITY_COORDS[city]}
                icon={pinIcon}
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
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
