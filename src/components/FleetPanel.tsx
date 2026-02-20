import { useState, useEffect } from "react";
import { Truck, MapPin, Clock, AlertTriangle, CheckCircle2, Wifi } from "lucide-react";
import type { Vehicle } from "./DispatchMap";

const STATUS_LABEL: Record<string, string> = {
  active: "On Route",
  idle: "Available",
  delayed: "Delayed",
  alert: "Alert",
};

function VehicleCard({ v, isSelected, onClick }: { v: Vehicle; isSelected: boolean; onClick: () => void }) {
  const statusClass: Record<string, string> = {
    active: "status-active",
    idle: "status-idle",
    delayed: "status-delayed",
    alert: "status-alert",
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
        isSelected
          ? "border-primary/50 bg-primary/8 shadow-[0_0_16px_hsl(var(--primary)/0.15)]"
          : "border-border bg-card hover:border-primary/25 hover:bg-secondary"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded flex items-center justify-center ${
            v.status === "active" ? "bg-success/15" :
            v.status === "delayed" ? "bg-warning/15" :
            v.status === "alert" ? "bg-danger/15" : "bg-muted"
          }`}>
            <Truck size={13} className={
              v.status === "active" ? "text-success" :
              v.status === "delayed" ? "text-warning" :
              v.status === "alert" ? "text-danger" : "text-muted-foreground"
            } />
          </div>
          <div>
            <div className="text-sm font-semibold font-mono text-foreground">{v.id}</div>
            <div className="text-xs text-muted-foreground">{v.driver}</div>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${statusClass[v.status]}`}>
          {STATUS_LABEL[v.status]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-muted/50 rounded px-2 py-1">
          <div className="text-muted-foreground mb-0.5">Speed</div>
          <div className="font-mono font-semibold text-foreground">{v.speed}<span className="text-muted-foreground text-[10px]"> km/h</span></div>
        </div>
        <div className="bg-muted/50 rounded px-2 py-1">
          <div className="text-muted-foreground mb-0.5">Orders</div>
          <div className="font-mono font-semibold text-primary">{v.orders}</div>
        </div>
        <div className="bg-muted/50 rounded px-2 py-1">
          <div className="text-muted-foreground mb-0.5">ETA</div>
          <div className={`font-mono font-semibold ${v.status === "delayed" ? "text-warning" : "text-foreground"}`}>
            {v.status === "idle" ? "—" : v.status === "alert" ? "!" : `${14 + parseInt(v.id.split("-")[1]) * 3}m`}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FleetPanel({ vehicles, selectedVehicle, onSelectVehicle }: {
  vehicles: Vehicle[];
  selectedVehicle: string | null;
  onSelectVehicle: (id: string) => void;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const active = vehicles.filter(v => v.status === "active").length;
  const delayed = vehicles.filter(v => v.status === "delayed").length;
  const alerts = vehicles.filter(v => v.status === "alert").length;
  const idle = vehicles.filter(v => v.status === "idle").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck size={15} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Fleet Status</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Wifi size={11} className="text-success pulse-live" />
          LIVE
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <div className="bg-success/10 border border-success/25 rounded px-2 py-1.5 text-center">
          <div className="text-lg font-bold font-mono text-success leading-none">{active}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Active</div>
        </div>
        <div className="bg-warning/10 border border-warning/25 rounded px-2 py-1.5 text-center">
          <div className="text-lg font-bold font-mono text-warning leading-none">{delayed}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Delayed</div>
        </div>
        <div className="bg-danger/10 border border-danger/25 rounded px-2 py-1.5 text-center">
          <div className="text-lg font-bold font-mono text-danger leading-none">{alerts}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Alert</div>
        </div>
        <div className="bg-muted/50 border border-border rounded px-2 py-1.5 text-center">
          <div className="text-lg font-bold font-mono text-muted-foreground leading-none">{idle}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Idle</div>
        </div>
      </div>

      {/* Vehicle list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
        {vehicles.map(v => (
          <VehicleCard key={v.id} v={v}
            isSelected={selectedVehicle === v.id}
            onClick={() => onSelectVehicle(v.id === selectedVehicle ? "" : v.id)}
          />
        ))}
      </div>
    </div>
  );
}
