import React, { useState, useEffect, useRef, useCallback } from "react";
import StatusBanner from "../components/dashboard/StatusBanner";
import AlertCards from "../components/dashboard/AlertCards";
import AlertHistory from "../components/dashboard/AlertHistory";
import StatsBar from "../components/dashboard/StatsBar";
import CorsNotice from "../components/dashboard/CorsNotice";
import AlertMap from "../components/dashboard/AlertMap";
import CityStats from "../components/dashboard/CityStats";
import { Shield } from "lucide-react";

const API_URL = "/api/oref/WarningMessages/alert/alerts.json";

function getTimeString() {
  return new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Dashboard() {
  const [activeAlert, setActiveAlert] = useState(null);
  const [alertStartTime, setAlertStartTime] = useState(null);
  const [history, setHistory] = useState([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [totalCities, setTotalCities] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const lastAlertId = useRef(null);
  const liveFetchRef = useRef(null);

  const processAlert = useCallback((alertData) => {
    if (!alertData || !alertData.data || alertData.data.length === 0) {
      if (activeAlert && alertStartTime && Date.now() - alertStartTime > 45000) {
        setActiveAlert(null);
        setAlertStartTime(null);
      }
      return;
    }

    const alertId = alertData.id || Date.now().toString();

    if (alertId !== lastAlertId.current) {
      lastAlertId.current = alertId;
      setActiveAlert(alertData);
      setAlertStartTime(Date.now());
      setTotalAlerts((prev) => prev + 1);
      setTotalCities((prev) => prev + alertData.data.length);
      setLastUpdate(getTimeString());

      setHistory((prev) => {
        const entry = {
          id: alertId,
          title: alertData.title,
          cities: alertData.data,
          time: getTimeString(),
          timestamp: Date.now(),
        };
        return [entry, ...prev].slice(0, 20);
      });
    }
  }, [activeAlert, alertStartTime]);

  // Live polling
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        const text = await response.text();
        if (!text || text.trim() === "" || text.trim() === "{}") {
          processAlert(null);
        } else {
          const data = JSON.parse(text);
          processAlert(data);
        }
      } catch (err) {
        console.log("Fetch error (CORS may be blocking):", err.message);
      }
      setLastUpdate(getTimeString());
    };

    liveFetchRef.current = fetchAlerts;
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [processAlert]);

  const handleRefresh = useCallback(() => {
    if (liveFetchRef.current) liveFetchRef.current();
  }, []);

  // Clear active alert after 45s
  useEffect(() => {
    if (!alertStartTime) return;
    const timeout = setTimeout(() => {
      setActiveAlert(null);
      setAlertStartTime(null);
    }, 46000);
    return () => clearTimeout(timeout);
  }, [alertStartTime]);

  const isActive = !!activeAlert;

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-inter font-bold text-foreground text-lg leading-tight">
              Red Alert Tracker
            </h1>
            <p className="text-xs text-muted-foreground">
              Israel Missile Alert Dashboard — Live
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/40 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-300 font-inter font-semibold">LIVE</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <CorsNotice isLive={true} />
        <StatusBanner isActive={isActive} title={activeAlert?.title} />
        <StatsBar
          totalAlerts={totalAlerts}
          totalCities={totalCities}
          lastUpdate={lastUpdate}
          isLive={true}
          onRefresh={handleRefresh}
        />

        {isActive && (
          <AlertCards cities={activeAlert.data} startTime={alertStartTime} />
        )}

        <AlertMap history={history} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CityStats history={history} />
          <AlertHistory history={history} />
        </div>
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <p className="text-center text-xs text-muted-foreground font-inter">
          Data source: Pikud Ha'Oref — Home Front Command · For informational purposes only
        </p>
      </footer>
    </div>
  );
}