import { useState, useEffect, useRef } from "react";
import cityGrid from "@/assets/city-grid.jpg";

// --- Types ---
interface Vehicle {
  id: string;
  label: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  status: "active" | "idle" | "delayed" | "alert";
  color: string;
  route: [number, number][];
  driver: string;
  speed: number;
  orders: number;
}

// --- Seeded initial vehicles ---
const STATUS_COLORS: Record<string, string> = {
  active:  "#22c55e",
  idle:    "#6b7280",
  delayed: "#f59e0b",
  alert:   "#ef4444",
};

const INITIAL_VEHICLES: Vehicle[] = [
  { id: "V-01", label: "V-01", x: 22, y: 35, dx: 0.12, dy: 0.08,  status: "active",  color: "#22c55e", route: [], driver: "M. Torres",  speed: 42, orders: 4 },
  { id: "V-02", label: "V-02", x: 55, y: 20, dx: -0.09, dy: 0.13, status: "active",  color: "#22c55e", route: [], driver: "S. Chen",    speed: 38, orders: 6 },
  { id: "V-03", label: "V-03", x: 75, y: 60, dx: 0.07, dy: -0.11, status: "delayed", color: "#f59e0b", route: [], driver: "R. Patel",   speed: 21, orders: 3 },
  { id: "V-04", label: "V-04", x: 40, y: 70, dx: -0.14, dy: -0.06,status: "active",  color: "#22c55e", route: [], driver: "J. Kim",     speed: 51, orders: 5 },
  { id: "V-05", label: "V-05", x: 88, y: 25, dx: -0.06, dy: 0.09, status: "alert",   color: "#ef4444", route: [], driver: "A. Novak",   speed: 0,  orders: 2 },
  { id: "V-06", label: "V-06", x: 15, y: 75, dx: 0.10, dy: -0.07, status: "idle",    color: "#6b7280", route: [], driver: "C. Diaz",    speed: 0,  orders: 0 },
];

const ROUTE_PATHS: [number, number][][] = [
  [[22,35],[35,28],[50,22],[62,18],[72,14],[80,20]],
  [[55,20],[50,35],[45,50],[40,62],[38,75]],
  [[75,60],[65,55],[55,52],[45,55],[38,62]],
  [[40,70],[52,65],[65,60],[74,52],[80,40],[85,30]],
];

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function DispatchMap({ selectedVehicle, onSelectVehicle }: {
  selectedVehicle: string | null;
  onSelectVehicle: (id: string) => void;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(performance.now());

  // Animate vehicles
  useEffect(() => {
    function tick(now: number) {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setVehicles(prev => prev.map(v => {
        if (v.status === "idle" || v.status === "alert") return v;
        let nx = v.x + v.dx * dt * 8;
        let ny = v.y + v.dy * dt * 8;
        let ndx = v.dx;
        let ndy = v.dy;
        if (nx < 5 || nx > 95) { ndx = -ndx; nx = clamp(nx, 5, 95); }
        if (ny < 5 || ny > 95) { ndy = -ndy; ny = clamp(ny, 5, 95); }
        return { ...v, x: nx, y: ny, dx: ndx, dy: ndy };
      }));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ background: "#050d1a" }}>
      {/* Map background */}
      <img
        src={cityGrid}
        alt="City grid map"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        draggable={false}
      />

      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline pointer-events-none" />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(220,40%,4%) 100%)" }} />

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/60" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/60" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/60" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/60" />

      {/* Map label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-mono text-muted-foreground/60 tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-live inline-block" />
        LIVE · NYC Metro
      </div>

      {/* SVG overlay — routes + vehicles */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Route polylines */}
        {ROUTE_PATHS.map((path, i) => {
          const d = path.map((p, j) => `${j === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
          return (
            <path key={i} d={d} fill="none"
              stroke={i === 2 ? "#f59e0b" : "#3b82f6"}
              strokeWidth="0.4"
              strokeDasharray="2 1.5"
              opacity="0.55"
              style={{ animation: "route-dash 1.5s linear infinite" }}
            />
          );
        })}

        {/* Vehicle markers */}
        {vehicles.map(v => {
          const isSelected = v.id === selectedVehicle;
          const c = STATUS_COLORS[v.status];
          return (
            <g key={v.id}
              transform={`translate(${v.x}, ${v.y})`}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectVehicle(v.id)}
            >
              {/* Selection ring */}
              {isSelected && (
                <circle r="4.5" fill="none" stroke={c} strokeWidth="0.4" opacity="0.8"
                  style={{ animation: "vehicle-pulse 1.4s ease-in-out infinite" }} />
              )}
              {/* Outer ping */}
              <circle r="2.5" fill={c} opacity="0.18"
                style={{ animation: "vehicle-pulse 2s ease-in-out infinite" }} />
              {/* Main dot */}
              <circle r="1.4" fill={c} stroke="hsl(220,40%,5%)" strokeWidth="0.3" />
              {/* Label */}
              <text x="2.2" y="-1.5" fontSize="1.8" fill={c}
                fontFamily="JetBrains Mono, monospace" fontWeight="600">
                {v.label}
              </text>
            </g>
          );
        })}

        {/* Depot marker */}
        <g transform="translate(50,50)">
          <polygon points="0,-2.5 2,-0.8 1.5,2 -1.5,2 -2,-0.8"
            fill="#2563eb" stroke="hsl(220,40%,5%)" strokeWidth="0.3" />
          <text x="2.8" y="-1" fontSize="1.8" fill="#60a5fa"
            fontFamily="JetBrains Mono, monospace">HQ</text>
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        {[
          { label: "Active", color: "#22c55e" },
          { label: "Delayed", color: "#f59e0b" },
          { label: "Alert", color: "#ef4444" },
          { label: "Idle", color: "#6b7280" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-xs font-mono text-muted-foreground/70">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Scale bar */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-0.5">
        <div className="w-16 h-px bg-muted-foreground/40" />
        <span className="text-xs font-mono text-muted-foreground/50">~2.4 km</span>
      </div>
    </div>
  );
}

export { INITIAL_VEHICLES };
export type { Vehicle };
