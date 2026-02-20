import { useState, useEffect } from "react";
import {
  Navigation,
  Truck,
  Package,
  Activity,
  Map,
  Bell,
  Settings,
  Route,
  Radio,
  ChevronRight,
  Zap,
} from "lucide-react";
import { DispatchMap, INITIAL_VEHICLES } from "@/components/DispatchMap";
import type { Vehicle } from "@/components/DispatchMap";
import { FleetPanel } from "@/components/FleetPanel";
import { OrdersQueue } from "@/components/OrdersQueue";
import { TelemetryFeed } from "@/components/TelemetryFeed";

type ActiveTab = "map" | "orders" | "telemetry";

const NAV_ITEMS = [
  { id: "map",       icon: Map,       label: "Dispatch" },
  { id: "orders",    icon: Package,   label: "Orders" },
  { id: "telemetry", icon: Activity,  label: "Telemetry" },
];

function KPIBar({ vehicles }: { vehicles: Vehicle[] }) {
  const active = vehicles.filter(v => v.status === "active").length;
  const alerts = vehicles.filter(v => v.status === "alert" || v.status === "delayed").length;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const kpis = [
    { label: "Fleet Utilization",  value: `${Math.round((active / vehicles.length) * 100)}%`,  change: "+4%",  pos: true },
    { label: "Active Vehicles",    value: `${active} / ${vehicles.length}`,                     change: null,   pos: null },
    { label: "Deliveries Today",   value: "94",                                                  change: "+12",  pos: true },
    { label: "Avg. ETA Accuracy",  value: "91.4%",                                              change: "+1.2%",pos: true },
    { label: "Route Efficiency",   value: "87.2%",                                              change: "-0.3%",pos: false },
    { label: "Alerts",             value: `${alerts}`,                                           change: null,   pos: null },
  ];

  return (
    <div className="flex items-center gap-4 px-5 py-2 border-b border-border bg-card/80 overflow-x-auto">
      {kpis.map((k, i) => (
        <div key={k.label} className="flex items-center gap-4 flex-shrink-0">
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{k.label}</div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-sm font-bold font-mono ${
                k.label === "Alerts" && parseInt(k.value) > 0 ? "text-danger" : "text-foreground"
              }`}>{k.value}</span>
              {k.change && (
                <span className={`text-[10px] font-mono ${k.pos ? "text-success" : "text-danger"}`}>{k.change}</span>
              )}
            </div>
          </div>
          {i < kpis.length - 1 && <div className="w-px h-6 bg-border" />}
        </div>
      ))}
      <div className="ml-auto flex-shrink-0">
        <div className="text-[10px] font-mono text-muted-foreground">LOCAL TIME</div>
        <div className="text-sm font-mono font-bold text-primary tabular-nums">
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("map");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState(2);
  const vehicles = INITIAL_VEHICLES;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-14 flex flex-col items-center py-4 bg-sidebar border-r border-sidebar-border flex-shrink-0 z-10">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Route size={18} className="text-primary" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              title={item.label}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 ${
                activeTab === item.id
                  ? "bg-primary/20 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon size={17} />
              {activeTab === item.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-l" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-1">
          <button title="Alerts"
            className="relative w-10 h-10 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <Bell size={17} />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
            )}
          </button>
          <button title="Settings"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <Settings size={17} />
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 backdrop-blur flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-foreground">LogiRoute Engine</h1>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-primary/15 text-primary border border-primary/30">v2.4</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <Radio size={10} className="text-success" />
                <span className="font-mono">NYC Metro · {vehicles.length} vehicles tracked</span>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <span>Dispatch</span>
            <ChevronRight size={12} />
            <span className="text-foreground capitalize">{activeTab}</span>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
            <Zap size={12} className="text-success" />
            <span className="text-xs font-mono text-success">All Systems Nominal</span>
          </div>
        </header>

        {/* KPI bar */}
        <KPIBar vehicles={vehicles} />

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === "map" && (
            <div className="flex h-full gap-0">
              {/* Map */}
              <div className="flex-1 min-w-0 p-3">
                <DispatchMap
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={setSelectedVehicle}
                />
              </div>

              {/* Right panels */}
              <div className="w-72 flex-shrink-0 flex flex-col border-l border-border overflow-hidden">
                <div className="flex-1 min-h-0 p-3 border-b border-border overflow-hidden">
                  <FleetPanel
                    vehicles={vehicles}
                    selectedVehicle={selectedVehicle}
                    onSelectVehicle={setSelectedVehicle}
                  />
                </div>
                <div className="h-[280px] p-3 overflow-hidden">
                  <TelemetryFeed />
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="flex h-full gap-0">
              <div className="flex-1 p-4 overflow-hidden">
                <OrdersQueue />
              </div>
              <div className="w-72 flex-shrink-0 border-l border-border p-3 overflow-hidden">
                <TelemetryFeed />
              </div>
            </div>
          )}

          {activeTab === "telemetry" && (
            <div className="flex h-full gap-0">
              <div className="flex-1 p-4 overflow-hidden">
                <TelemetryFeed />
              </div>
              <div className="w-72 flex-shrink-0 border-l border-border p-3 overflow-hidden">
                <FleetPanel
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={setSelectedVehicle}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
