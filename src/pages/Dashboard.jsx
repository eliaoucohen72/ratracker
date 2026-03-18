import React, { useState, useEffect, useRef, useCallback } from "react";
import StatusBanner from "../components/dashboard/StatusBanner";
import AlertCards from "../components/dashboard/AlertCards";
import AlertHistory from "../components/dashboard/AlertHistory";
import StatsBar from "../components/dashboard/StatsBar";
import AlertMap from "../components/dashboard/AlertMap";
import CityStats from "../components/dashboard/CityStats";
import { Shield } from "lucide-react";
import ThemeToggle from "../components/dashboard/ThemeToggle";
import { cityByName, cityCountdown } from "../data/cityUtils";

const API_URL = "/api/alerts";

// Demo alerts — one entry per pikud-haoref-api alert type for a full overview
const DEMO_ALERTS = [
  {
    id: "demo-missiles",
    type: "missiles",
    cities: ["תל אביב - מרכז", "רמת גן", "גבעתיים", "בת ים", "חולון"],
    instructions: "ירי רקטות ופגזים",
  },
  {
    id: "demo-aircraft",
    type: "hostileAircraftIntrusion",
    cities: ["חיפה - כרמל", "חיפה - נמל", "קריית ביאליק"],
    instructions: "חדירת כלי טיס עוין",
  },
  {
    id: "demo-infiltration",
    type: "terroristInfiltration",
    cities: ["שדרות", "נתיבות", "אופקים"],
    instructions: "חדירת מחבלים",
  },
  {
    id: "demo-earthquake",
    type: "earthQuake",
    cities: ["ירושלים - מרכז", "מודיעין", "בית שמש", "רמלה"],
    instructions: "רעידת אדמה",
  },
  {
    id: "demo-tsunami",
    type: "tsunami",
    cities: ["אילת", "עקבה"],
    instructions: "צונאמי",
  },
  {
    id: "demo-radiological",
    type: "radiologicalEvent",
    cities: ["דימונה", "ירוחם", "באר שבע - מרכז"],
    instructions: "אירוע רדיולוגי",
  },
  {
    id: "demo-hazmat",
    type: "hazardousMaterials",
    cities: ["אשדוד - דרום", "אשקלון - צפון", "קריית גת"],
    instructions: "חומרים מסוכנים",
  },
  {
    id: "demo-general",
    type: "general",
    cities: ["נתניה", "חדרה", "זכרון יעקב"],
    instructions: "הנחיות כלליות",
  },
  {
    id: "demo-newsflash",
    type: "newsFlash",
    cities: ["כל הארץ"],
    instructions: "עדכון חשוב",
  },
  {
    id: "demo-drill-missiles",
    type: "missilesDrill",
    cities: ["תל אביב - מרכז", "רמת השרון", "הרצליה"],
    instructions: "תרגיל ירי רקטות ופגזים",
  },
  {
    id: "demo-drill-earthquake",
    type: "earthQuakeDrill",
    cities: ["ירושלים - מרכז", "בית שמש"],
    instructions: "תרגיל רעידת אדמה",
  },
];

function getTimeString() {
  return new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Enrich raw city name strings with metadata from our cities database
function enrichCities(cityNames) {
  return cityNames.map((name) => {
    const meta = cityByName[name];
    return {
      name,
      countdown: cityCountdown[name] ?? 45,
      zone: meta?.zone ?? null,
      zone_en: meta?.zone_en ?? null,
    };
  });
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
    if (!alertData || !alertData.cities || alertData.cities.length === 0) {
      if (activeAlertRef.current && alertStartTimeRef.current) {
        const maxCountdown = Math.max(
          ...enrichCities(activeAlertRef.current.cities ?? []).map((c) => c.countdown),
          45
        );
        if (Date.now() - alertStartTimeRef.current > maxCountdown * 1000) {
          setActiveAlert(null);
          setAlertStartTime(null);
          activeAlertRef.current = null;
          alertStartTimeRef.current = null;
        }
      }
      return;
    }

    const alertId = alertData.id || Date.now().toString();

    if (alertId !== lastAlertId.current) {
      lastAlertId.current = alertId;
      const now = Date.now();
      const enriched = enrichCities(alertData.cities);
      const enrichedAlert = { ...alertData, enrichedCities: enriched };

      setActiveAlert(enrichedAlert);
      setAlertStartTime(now);
      activeAlertRef.current = enrichedAlert;
      alertStartTimeRef.current = now;
      setTotalAlerts((prev) => prev + 1);
      setTotalCities((prev) => prev + alertData.cities.length);
      setLastUpdate(getTimeString());

      setHistory((prev) => {
        const entry = {
          id: alertId,
          title: alertData.instructions,
          type: alertData.type,
          cities: alertData.cities,
          time: getTimeString(),
          timestamp: Date.now(),
        };
        return [entry, ...prev].slice(0, 20);
      });
    }
  }, []);

  // Live polling from local Express server
  useEffect(() => {
    if (isDemo) return;

    const fetchAlerts = async () => {
      try {
        const response = await fetch(API_URL);
        const { alerts, error } = await response.json();

        if (error) {
          console.warn("[Dashboard] Server-side alert fetch error:", error);
        }

        if (!alerts || alerts.length === 0) {
          processAlert(null);
        } else {
          processAlert(alerts[0]);
        }
      } catch (err) {
        console.log("Fetch error:", err.message);
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

  // Clear active alert after max countdown for the alert's cities
  useEffect(() => {
    if (!alertStartTime || !activeAlert) return;
    const maxCountdown = Math.max(
      ...(activeAlert.enrichedCities ?? []).map((c) => c.countdown),
      45
    );
    const timeout = setTimeout(() => {
      setActiveAlert(null);
      setAlertStartTime(null);
    }, (maxCountdown + 1) * 1000);
    return () => clearTimeout(timeout);
  }, [alertStartTime, activeAlert]);

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
        <StatusBanner
          isActive={isActive}
          title={activeAlert?.instructions}
          alertType={activeAlert?.type}
        />
        <StatsBar
          totalAlerts={totalAlerts}
          totalCities={totalCities}
          lastUpdate={lastUpdate}
          isLive={!isDemo}
          onRefresh={handleRefresh}
        />

        {isActive && (
          <AlertCards
            cities={activeAlert.enrichedCities}
            startTime={alertStartTime}
            alertType={activeAlert.type}
          />
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
