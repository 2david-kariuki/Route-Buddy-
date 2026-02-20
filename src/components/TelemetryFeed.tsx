import { useState, useEffect } from "react";
import { Activity, Cpu, GitBranch } from "lucide-react";

interface TelemetryEntry {
  id: number;
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  event: string;
  timestamp: string;
  type: "location" | "event" | "alert";
}

const EVENTS = [
  "GPS sync",
  "Route waypoint reached",
  "Speed variance detected",
  "Geofence check",
  "Order delivered",
  "Traffic reroute",
  "Low battery warning",
  "Connection restored",
];

const VEHICLE_IDS = ["V-01", "V-02", "V-03", "V-04", "V-05", "V-06"];

let _counter = 100;
function generateEntry(): TelemetryEntry {
  const vehicleId = VEHICLE_IDS[Math.floor(Math.random() * VEHICLE_IDS.length)];
  const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  const type: TelemetryEntry["type"] = event.includes("warning") || event.includes("alert")
    ? "alert" : event.includes("delivered") || event.includes("waypoint")
    ? "event" : "location";
  const now = new Date();
  return {
    id: _counter++,
    vehicleId,
    lat: 40.71 + (Math.random() - 0.5) * 0.1,
    lng: -74.00 + (Math.random() - 0.5) * 0.1,
    speed: Math.round(Math.random() * 65),
    heading: Math.round(Math.random() * 360),
    event,
    timestamp: now.toLocaleTimeString("en-US", { hour12: false }),
    type,
  };
}

const INITIAL_FEED: TelemetryEntry[] = Array.from({ length: 12 }, generateEntry).reverse();

const TYPE_DOT: Record<string, string> = {
  location: "bg-primary",
  event: "bg-success",
  alert: "bg-danger pulse-live",
};

const TYPE_TEXT: Record<string, string> = {
  location: "text-muted-foreground",
  event: "text-success",
  alert: "text-danger",
};

export function TelemetryFeed() {
  const [feed, setFeed] = useState<TelemetryEntry[]>(INITIAL_FEED);
  const [optimizerStatus, setOptimizerStatus] = useState<"idle" | "running" | "done">("idle");
  const [solveMs, setSolveMs] = useState(234);

  useEffect(() => {
    const t = setInterval(() => {
      setFeed(prev => [generateEntry(), ...prev.slice(0, 24)]);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setOptimizerStatus("running");
      const ms = 180 + Math.random() * 400;
      setTimeout(() => {
        setOptimizerStatus("done");
        setSolveMs(Math.round(ms));
        setTimeout(() => setOptimizerStatus("idle"), 1200);
      }, ms);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Optimizer status bar */}
      <div className="mb-3 p-2.5 rounded-lg bg-muted/40 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu size={13} className={optimizerStatus === "running" ? "text-accent animate-pulse" : "text-muted-foreground"} />
            <span className="text-xs font-semibold text-foreground">VRP Optimizer</span>
          </div>
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${
            optimizerStatus === "running" ? "bg-accent/15 text-accent border border-accent/30" :
            optimizerStatus === "done" ? "bg-success/15 text-success border border-success/30" :
            "bg-muted text-muted-foreground border border-border"
          }`}>
            {optimizerStatus === "running" ? "Solving…" : optimizerStatus === "done" ? `Done · ${solveMs}ms` : "Standby"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
          <div>
            <div className="text-muted-foreground">Algorithm</div>
            <div className="text-foreground font-semibold">Tabu Search</div>
          </div>
          <div>
            <div className="text-muted-foreground">Last Solve</div>
            <div className="text-primary font-semibold">{solveMs}ms</div>
          </div>
          <div>
            <div className="text-muted-foreground">Iterations</div>
            <div className="text-foreground font-semibold">2,400</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              optimizerStatus === "running" ? "bg-accent" : "bg-primary"
            }`}
            style={{ width: optimizerStatus === "running" ? "60%" : "100%" }}
          />
        </div>
      </div>

      {/* Route metrics */}
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        {[
          { label: "Total Distance", value: "127.4 km", icon: GitBranch },
          { label: "Active Routes",  value: "4 / 6",    icon: Activity },
        ].map(m => (
          <div key={m.label} className="p-2.5 rounded-lg bg-card border border-border flex items-center gap-2">
            <m.icon size={13} className="text-primary flex-shrink-0" />
            <div>
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
              <div className="text-sm font-mono font-semibold text-foreground">{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live feed header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-accent" />
          <span className="text-xs font-semibold text-foreground">Telemetry Stream</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-success pulse-live inline-block" />
          {feed.length} events
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 font-mono text-[11px]">
        {feed.map((entry, i) => (
          <div key={entry.id}
            className={`flex items-start gap-2 py-1.5 px-2 rounded border-b border-border/30 hover:bg-muted/30 transition-colors ${
              i === 0 ? "opacity-100" : `opacity-${Math.max(30, 100 - i * 4)}`
            }`}
            style={{ animation: i === 0 ? "fade-in-up 0.25s ease" : undefined }}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${TYPE_DOT[entry.type]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-primary font-semibold">{entry.vehicleId}</span>
                <span className={TYPE_TEXT[entry.type]}>{entry.event}</span>
              </div>
              <div className="text-muted-foreground/60 text-[10px] mt-0.5">
                {entry.lat.toFixed(4)}°N, {Math.abs(entry.lng).toFixed(4)}°W · {entry.speed}km/h · {entry.heading}°
              </div>
            </div>
            <span className="text-muted-foreground/50 text-[10px] flex-shrink-0">{entry.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
