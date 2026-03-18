import React, { useState, useEffect, useRef, useCallback } from "react";
import StatusBanner from "../components/dashboard/StatusBanner";
import AlertCards from "../components/dashboard/AlertCards";
import AlertHistory from "../components/dashboard/AlertHistory";
import StatsBar from "../components/dashboard/StatsBar";
import CorsNotice from "../components/dashboard/CorsNotice";
import AlertMap from "../components/dashboard/AlertMap";
import CityStats from "../components/dashboard/CityStats";
import { Shield } from "lucide-react";
import ThemeToggle from "../components/dashboard/ThemeToggle";

const API_URL = "https://corsproxy.io/?" + encodeURIComponent("https://www.oref.org.il/WarningMessages/alert/alerts.json");

const DEMO_ALERTS = [
  { id: "demo-1", title: "ירי רקטות ופגזים", data: ["תל אביב", "רמת גן", "גבעתיים"] },
  { id: "demo-2", title: "ירי רקטות ופגזים", data: ["חיפה", "נתניה", "חדרה"] },
  { id: "demo-3", title: "חדירת כלי טיס עוין", data: ["ירושלים", "מודיעין"] },
  { id: "demo-4", title: "ירי רקטות ופגזים", data: ["אשקלון", "אשדוד", "קריית גת"] },
];

function getTimeString() {
  return new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Dashboard() {
  const [isDemo, setIsDemo] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const [alertStartTime, setAlertStartTime] = useState(null);
  const [history, setHistory] = useState([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [totalCities, setTotalCities] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const lastAlertId = useRef(null);
  const liveFetchRef = useRef(null);
  const demoIndexRef = useRef(0);
  const activeAlertRef = useRef(null);
  const alertStartTimeRef = useRef(null);

  const processAlert = useCallback((alertData) => {
    if (!alertData || !alertData.data || alertData.data.length === 0) {
      if (activeAlertRef.current && alertStartTimeRef.current && Date.now() - alertStartTimeRef.current > 45000) {
        setActiveAlert(null);
        setAlertStartTime(null);
        activeAlertRef.current = null;
        alertStartTimeRef.current = null;
      }
      return;
    }

    const alertId = alertData.id || Date.now().toString();

    if (alertId !== lastAlertId.current) {
      lastAlertId.current = alertId;
      const now = Date.now();
      setActiveAlert(alertData);
      setAlertStartTime(now);
      activeAlertRef.current = alertData;
      alertStartTimeRef.current = now;
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
  }, []);

  // Live polling
  useEffect(() => {
    if (isDemo) return;

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
  }, [processAlert, isDemo]);

  // Demo mode: cycle through fake alerts every 8s
  useEffect(() => {
    if (!isDemo) return;

    const runDemo = () => {
      const alert = DEMO_ALERTS[demoIndexRef.current % DEMO_ALERTS.length];
      demoIndexRef.current += 1;
      processAlert({ ...alert, id: alert.id + "-" + demoIndexRef.current });
      setLastUpdate(getTimeString());
    };

    runDemo();
    const interval = setInterval(runDemo, 8000);
    return () => clearInterval(interval);
  }, [isDemo, processAlert]);

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
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => {
                setIsDemo((prev) => !prev);
                setActiveAlert(null);
                setAlertStartTime(null);
                setHistory([]);
                setTotalAlerts(0);
                setTotalCities(0);
                lastAlertId.current = null;
                demoIndexRef.current = 0;
              }}
              className="flex items-center gap-2"
              title={isDemo ? "Switch to Live" : "Switch to Demo"}
            >
              <span className={`text-xs font-inter transition-all duration-200 ${isDemo ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>DEMO</span>
              <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isDemo ? "bg-yellow-400 dark:bg-yellow-500" : "bg-emerald-400 dark:bg-emerald-500"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${isDemo ? "translate-x-0" : "translate-x-5"}`} />
              </div>
              <span className={`text-xs font-inter transition-all duration-200 ${!isDemo ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>LIVE</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <CorsNotice isLive={!isDemo} />
        <StatusBanner isActive={isActive} title={activeAlert?.title} />
        <StatsBar
          totalAlerts={totalAlerts}
          totalCities={totalCities}
          lastUpdate={lastUpdate}
          isLive={!isDemo}
          onRefresh={handleRefresh}
        />

        {isActive && (
          <AlertCards cities={activeAlert.data} startTime={alertStartTime} desc={undefined} />
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