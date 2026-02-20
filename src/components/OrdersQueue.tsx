import { useState } from "react";
import { Package, Clock, MapPin, ChevronRight, RefreshCw } from "lucide-react";

interface Order {
  id: string;
  destination: string;
  vehicle: string;
  twStart: string;
  twEnd: string;
  status: "pending" | "in_transit" | "delivered" | "overdue";
  priority: "standard" | "express" | "critical";
  distance: number;
}

const INITIAL_ORDERS: Order[] = [
  { id: "ORD-8821", destination: "Industrial Area, Nairobi",        vehicle: "V-01", twStart: "09:00", twEnd: "10:30", status: "in_transit", priority: "express",  distance: 4.2 },
  { id: "ORD-8822", destination: "Upper Hill, Nairobi",              vehicle: "V-02", twStart: "09:15", twEnd: "11:00", status: "in_transit", priority: "critical", distance: 2.8 },
  { id: "ORD-8823", destination: "Thika Road Mall Hub (TRM)",         vehicle: "V-03", twStart: "08:30", twEnd: "10:00", status: "overdue",    priority: "express",  distance: 7.1 },
  { id: "ORD-8824", destination: "Westlands, Nairobi",               vehicle: "V-04", twStart: "10:00", twEnd: "12:00", status: "in_transit", priority: "standard", distance: 3.5 },
  { id: "ORD-8825", destination: "JKIA Cargo Terminal, Nairobi",     vehicle: "V-05", twStart: "11:00", twEnd: "13:00", status: "pending",    priority: "critical", distance: 5.9 },
  { id: "ORD-8826", destination: "Ruiru Distribution Depot",         vehicle: "—",    twStart: "11:30", twEnd: "14:00", status: "pending",    priority: "standard", distance: 3.1 },
  { id: "ORD-8820", destination: "Mombasa Road Logistics Park",      vehicle: "V-02", twStart: "07:00", twEnd: "09:00", status: "delivered",  priority: "standard", distance: 6.4 },
];

const STATUS_STYLE: Record<string, string> = {
  in_transit: "status-active",
  pending: "status-idle",
  overdue: "status-alert",
  delivered: "bg-muted/50 text-muted-foreground border border-border",
};

const PRIORITY_STYLE: Record<string, string> = {
  standard: "text-muted-foreground",
  express: "text-warning",
  critical: "text-danger",
};

export function OrdersQueue() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "done">("all");
  const [optimizing, setOptimizing] = useState(false);

  const filtered = orders.filter((o) => {
    if (filter === "active") return o.status === "in_transit";
    if (filter === "pending") return o.status === "pending" || o.status === "overdue";
    if (filter === "done") return o.status === "delivered";
    return true;
  });

  function triggerOptimize() {
    setOptimizing(true);
    setTimeout(() => setOptimizing(false), 2400);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={15} className="text-accent" />
          <span className="text-sm font-semibold text-foreground">Orders Queue</span>
          <span className="text-xs font-mono text-muted-foreground">({orders.length})</span>
        </div>
        <button
          onClick={triggerOptimize}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors"
        >
          <RefreshCw size={11} className={optimizing ? "animate-spin" : ""} />
          {optimizing ? "Solving…" : "Re-Optimize"}
        </button>
      </div>

      {/* Optimizing banner */}
      {optimizing && (
        <div
          className="mb-2 px-3 py-2 rounded bg-accent/10 border border-accent/30 text-xs font-mono text-accent flex items-center gap-2"
          style={{ animation: "fade-in-up 0.3s ease" }}
        >
          <RefreshCw size={11} className="animate-spin" />
          VRP Solver running Tabu Search · Clustering {orders.length} orders…
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {(["all", "active", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2.5 py-1 rounded font-mono capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Order list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
        {filtered.map((o) => (
          <div
            key={o.id}
            className="p-3 rounded-lg border border-border bg-card hover:border-primary/25 transition-all duration-150 cursor-pointer group"
            style={{ animation: "fade-in-up 0.2s ease" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-foreground">{o.id}</span>
                <span className={`text-[10px] font-mono uppercase font-semibold ${PRIORITY_STYLE[o.priority]}`}>
                  {o.priority}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${STATUS_STYLE[o.status]}`}>
                  {o.status.replace("_", " ")}
                </span>
                <ChevronRight size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={10} className="text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-foreground/80 truncate">{o.destination}</span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={9} />
                <span>
                  {o.twStart} – {o.twEnd}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span>{o.distance} km</span>
                <span className={o.vehicle === "—" ? "text-muted-foreground/50" : "text-primary"}>{o.vehicle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}