/**
 * GatehousePage.tsx  (/gatehouse)
 * Fleet Monitoring — Live Vehicle Tracking
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { getCookie }          from "../../utils/cookies";
import { getStoredAuthToken } from "../../api/client";
import { ENDPOINTS }          from "../../api/endpoints";

// ─── Fleet env config ─────────────────────────────────────────────────────────
const FLEET_API = (import.meta.env.VITE_FLEET_API_URL as string) ?? "https://api.fort-track.online";
const FLEET_SSE = (import.meta.env.VITE_FLEET_SSE_URL as string) ?? "https://socket.fort-track.online";
const GMAPS_KEY = "AIzaSyCxsn8cnwrKUpbgO6Pn_Gdk2-T5HkJRmLY";
const PAGE_SIZE  = 25;

const ICONS = {
  moving:  "https://santripe.com/static/moving.png",
  parked:  "https://santripe.com/static/parked.png",
  idling:  "https://santripe.com/static/idiling.png",
  unknown: "https://santripe.com/static/unknown.png",
};

const DEFAULT_CENTER = { lat: 1.3733, lng: 32.2903 };

// ─── Types ────────────────────────────────────────────────────────────────────
type MotionStatus = "Moving" | "Parked" | "Idling" | "Offline";

interface VehicleUnit {
  imei:                string;
  name:                string;
  subscription_status: string;
  status:              MotionStatus;
  speed:               number;
  altitude:            number;
  course:              number;
  satellites:          number;
  mileage:             number;
  fuel:                number;
  motion_state:        string;
  geocoded_location:   string;
  coords:              { lat: number; lng: number } | null;
  last_sync:           string;
  country:             string;
  sensors:             { label: string; value: string }[];
}

interface ClientItem { uid: string; label: string; }

type ToastVariant = "warn" | "error" | "info" | "success";
interface Toast { id: string; variant: ToastVariant; title: string; body?: string; out?: boolean; }

// ─── Status palette ───────────────────────────────────────────────────────────
const ST: Record<MotionStatus, { bg: string; label: string }> = {
  Moving:  { bg: "#2E7D32", label: "Moving"  },
  Parked:  { bg: "#C62828", label: "Parked"  },
  Idling:  { bg: "#1565C0", label: "Idling"  },
  Offline: { bg: "#455A64", label: "Offline" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function fleetFetch(method: string, path: string, body?: unknown): Promise<unknown> {
  const token = getStoredAuthToken();
  const hdrs: Record<string, string> = { "Content-Type": "application/json" };
  if (token) hdrs["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${FLEET_API}${path}`, {
    method, headers: hdrs,
    body: body != null ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  return res.json();
}

async function fetchUserDetails(accountUid: string): Promise<{ account_type: string; role: string } | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const j = await fleetFetch("GET", `${ENDPOINTS.FLEET.USER_DETAILS}/${encodeURIComponent(accountUid)}/details`) as any;
    if (j?.status === "success" && j?.data) {
      return {
        account_type: String(j.data.account_type || "").toLowerCase(),
        role: String(j.data.assigned_role || j.data.role || "").toLowerCase(),
      };
    }
  } catch { /**/ }
  return null;
}

const sseUrl = (imei: string) =>
  `${FLEET_SSE}/data-stream/${encodeURIComponent(imei)}/x-location`;

function normalizeStatus(ms: string, spd: number): MotionStatus {
  const s = ms.toLowerCase();
  if (s.includes("park") || s.includes("stop")) return "Parked";
  if (s.includes("idl")  || s === "idle")        return "Idling";
  if (s.includes("mov")  || s.includes("driv"))  return "Moving";
  if (Number.isFinite(spd) && spd >= 5)          return "Moving";
  if (Number.isFinite(spd) && spd > 0)           return "Idling";
  return "Offline";
}

function iconUrl(st: MotionStatus): string {
  return st === "Moving" ? ICONS.moving : st === "Parked" ? ICONS.parked
       : st === "Idling" ? ICONS.idling : ICONS.unknown;
}

function dotColor(st: MotionStatus): string {
  return st === "Moving" ? "#2E7D32" : st === "Parked" ? "#C62828"
       : st === "Idling" ? "#1565C0" : "#607D8B";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSensors(d: any): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = [];
  const map: [string, string, string][] = [
    ["fls_temp",    "FLS TEMP",   " °C"],
    ["fuel_temp",   "FUEL TEMP",  " °C"],
    ["engine_temp", "ENG TEMP",   " °C"],
    ["generator",   "GENERATOR",  " On/Off"],
    ["door_status", "DOOR",       ""],
    ["battery",     "BATTERY",    " V"],
    ["ignition",    "IGNITION",   ""],
    ["axle_weight", "AXLE WEIGHT"," kg"],
  ];
  for (const [field, label, unit] of map) {
    if (d[field] != null && d[field] !== "") {
      result.push({ label, value: `${d[field]}${unit}` });
    }
  }
  return result;
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────
const BADGE_COLORS: Record<MotionStatus, { bg: string; color: string }> = {
  Moving:  { bg: "#E8F5E9", color: "#2E7D32" },
  Parked:  { bg: "#FFEBEE", color: "#C62828" },
  Idling:  { bg: "#E3F2FD", color: "#1565C0" },
  Offline: { bg: "#F1F3F4", color: "#607D8B" },
};

function StatusBadge({ status }: { status: MotionStatus }) {
  const c = BADGE_COLORS[status] ?? BADGE_COLORS.Offline;
  return (
    <span
      className="shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded"
      style={{ background: c.bg, color: c.color }}
    >
      {status}
    </span>
  );
}

function Btn({
  variant = "teal", onClick, disabled, children,
}: {
  variant?: "green" | "teal" | "azure" | "dark";
  onClick?: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  const c: Record<string, string> = {
    green: "bg-[#25D366] text-[#075E54]",
    teal:  "bg-[#128C7E] text-white",
    azure: "bg-[#34B7F1] text-white",
    dark:  "bg-[#111B21] text-white",
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`h-9 rounded-lg px-3.5 text-[12px] font-extrabold border-none cursor-pointer
        hover:brightness-105 active:opacity-85 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed ${c[variant]}`}
    >{children}</button>
  );
}

// ─── Toast stack ──────────────────────────────────────────────────────────────
const TCONF: Record<ToastVariant, { bar: string; icon: string; col: string }> = {
  warn:    { bar: "bg-[#FB8C00]", icon: "⚠", col: "#FB8C00" },
  error:   { bar: "bg-[#D93025]", icon: "✕", col: "#D93025" },
  info:    { bar: "bg-[#34B7F1]", icon: "ℹ", col: "#34B7F1" },
  success: { bar: "bg-[#128C7E]", icon: "✓", col: "#128C7E" },
};

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2 items-end pointer-events-none">
      <style>{`@keyframes toast-drain{from{width:100%}to{width:0%}}`}</style>
      {toasts.map((t) => {
        const s = TCONF[t.variant];
        return (
          <div key={t.id}
            className={[
              "pointer-events-auto flex flex-col w-[300px] rounded-xl overflow-hidden",
              "bg-white border border-[#E9EDEF] shadow-[0_8px_30px_rgba(0,0,0,0.18)]",
              "border-l-[4px] transition-all duration-300",
              t.out ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0",
            ].join(" ")}
            style={{ borderLeftColor: s.col }}
          >
            <div className="flex items-start gap-3 px-3.5 pt-3 pb-2.5">
              <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black text-white mt-0.5"
                style={{ background: s.col }}>{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold text-[#111B21] leading-snug">{t.title}</div>
                {t.body && <div className="text-[11px] text-[#667781] mt-0.5 leading-snug">{t.body}</div>}
              </div>
              <button onClick={() => onDismiss(t.id)}
                className="shrink-0 text-[#667781] hover:text-[#111B21] bg-transparent border-none cursor-pointer text-[18px] leading-none transition-colors">×</button>
            </div>
            <div className="h-[3px] w-full bg-[#F0F2F5]">
              <div className={`h-full rounded-full ${s.bar}`}
                style={{ animation: "toast-drain 4s linear forwards" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Unit Detail Panel ────────────────────────────────────────────────────────
function UnitDetailPanel({
  unit, onClose, onShowOnMap,
}: {
  unit: VehicleUnit; onClose: () => void; onShowOnMap: () => void;
}) {
  const st = ST[unit.status] ?? ST.Offline;

  const stats = [
    { label: "SPEED",      value: `${unit.speed} km/h` },
    { label: "ALTITUDE",   value: unit.altitude  > 0 ? `${unit.altitude} m`  : "—" },
    { label: "COURSE",     value: unit.course    > 0 ? `${unit.course}°`     : "—" },
    { label: "SATELLITES", value: unit.satellites > 0 ? String(unit.satellites) : "—" },
    { label: "MILEAGE",    value: unit.mileage   > 0 ? `${unit.mileage} km`  : "—" },
    { label: "FUEL",       value: unit.fuel      > 0 ? `${unit.fuel} L`      : "—" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#E9EDEF]">
        <span className="font-black text-[15px] text-[#111B21] truncate pr-2">
          {unit.name || unit.imei}
        </span>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md
            text-[#667781] hover:text-[#111B21] hover:bg-[#F0F2F5]
            bg-transparent border border-[#E9EDEF] cursor-pointer text-[16px] leading-none transition-colors"
        >×</button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4" style={{ scrollbarWidth: "thin" }}>

        {/* Status badge */}
        <div
          className="w-full py-2.5 rounded-xl text-center font-black text-white text-[14px] tracking-wide select-none"
          style={{ background: st.bg }}
        >
          {unit.status}
        </div>

        {/* Stats grid — 2 × 3 */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="border border-[#E9EDEF] rounded-lg p-3 bg-[#FAFAFA]">
              <div className="text-[9px] font-extrabold text-[#667781] tracking-widest mb-1.5">{s.label}</div>
              <div className="text-[16px] font-black text-[#111B21] leading-none">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Location */}
        <div>
          <div className="text-[9px] font-extrabold text-[#667781] tracking-widest mb-1.5">LOCATION</div>
          <div className="font-bold text-[13px] text-[#111B21] leading-snug mb-0.5">
            {unit.geocoded_location || unit.country || "—"}
          </div>
          {unit.coords && (
            <div className="font-mono text-[11px] text-[#128C7E]">
              {unit.coords.lat.toFixed(6)},&nbsp;{unit.coords.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Last Update */}
        <div>
          <div className="text-[9px] font-extrabold text-[#667781] tracking-widest mb-1.5">LAST UPDATE</div>
          <div className="font-bold text-[13px] text-[#111B21]">{unit.last_sync || "—"}</div>
        </div>

        {/* Show on Map */}
        <button
          onClick={onShowOnMap}
          disabled={!unit.coords}
          className="w-full h-10 rounded-lg border-2 border-[#128C7E] text-[#128C7E]
            font-extrabold text-[12px] flex items-center justify-center gap-2
            bg-white hover:bg-[#F0FFF4] transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0
              9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Show on Map
        </button>

        {/* Sensors */}
        {unit.sensors.length > 0 && (
          <div>
            <div className="text-[9px] font-extrabold text-[#667781] tracking-widest mb-2">SENSORS</div>
            <div className="grid grid-cols-2 gap-2">
              {unit.sensors.map((s) => (
                <div key={s.label} className="border border-[#E9EDEF] rounded-lg p-3 bg-[#FAFAFA]">
                  <div className="text-[9px] font-extrabold text-[#667781] tracking-widest mb-1.5">{s.label}</div>
                  <div className="text-[14px] font-black text-[#111B21] leading-none">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GatehousePage() {
  const [, forceUpdate]    = useState(0);
  const [loading,        setLoading]       = useState(true);
  const [listError,      setListError]     = useState<string | null>(null);
  const [searchQ,        setSearchQ]       = useState("");
  const [isClientAdmin,  setIsClientAdmin] = useState(false);
  const [showModal,      setShowModal]     = useState(false);
  const [clients,        setClients]       = useState<ClientItem[]>([]);
  const [selClient,      setSelClient]     = useState("");
  const [toasts,         setToasts]        = useState<Toast[]>([]);
  const [page,           setPage]          = useState(1);
  const [statusFilter,   setStatusFilter]  = useState<MotionStatus | "">("");
  const [selectedImei,   setSelectedImei]  = useState<string | null>(null);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const gMap      = useRef<unknown>(null);
  const markers   = useRef(new Map<string, unknown>());
  const sseConns  = useRef(new Map<string, EventSource>());
  const units     = useRef(new Map<string, VehicleUnit>());

  const rafRef = useRef<number | null>(null);
  const tick   = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      forceUpdate((n) => n + 1);
    });
  }, []);

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const showToast = useCallback((variant: ToastVariant, title: string, body?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p.slice(-2), { id, variant, title, body }]);
    setTimeout(() => {
      setToasts((p) => p.map((t) => t.id === id ? { ...t, out: true } : t));
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 320);
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((p) => p.map((t) => t.id === id ? { ...t, out: true } : t));
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 320);
  }, []);

  // Filtered + paginated list
  const q        = searchQ.trim().toLowerCase();
  const allUnits = Array.from(units.current.values());
  const list     = allUnits.filter((u) => {
    const matchQ  = !q || u.name.toLowerCase().includes(q)
      || u.imei.toLowerCase().includes(q)
      || (u.geocoded_location || u.country || "").toLowerCase().includes(q);
    const matchSt = !statusFilter || u.status === statusFilter;
    return matchQ && matchSt;
  });

  const statusCounts = allUnits.reduce<Record<string, number>>((acc, u) => {
    acc[u.status] = (acc[u.status] ?? 0) + 1;
    return acc;
  }, {});

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pagedList  = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Map helpers ───────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function ensureMarker(u: VehicleUnit): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const G = (window as any).google?.maps;
    if (!gMap.current || !u.coords || !G) return null;
    if (String(u.subscription_status).toLowerCase() === "expired") {
      const m = markers.current.get(u.imei);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (m) { try { (m as any).setMap(null); } catch { /**/ } markers.current.delete(u.imei); }
      return null;
    }
    const icon = { url: iconUrl(u.status), scaledSize: new G.Size(32, 32), anchor: new G.Point(16, 16) };
    let m = markers.current.get(u.imei);
    if (!m) {
      m = new G.Marker({ position: u.coords, map: gMap.current, title: u.name || u.imei, icon });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m as any).addListener("click", () => setSelectedImei(u.imei));
      markers.current.set(u.imei, m);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m as any).setPosition(u.coords); (m as any).setIcon(icon);
    }
    return m;
  }

  function panToUnit(imei: string) {
    const u  = units.current.get(imei);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const GM = gMap.current as any;
    if (u?.coords && GM) { GM.panTo(u.coords); GM.setZoom(15); }
  }

  // ── SSE ───────────────────────────────────────────────────────────────────
  function stopAll() {
    sseConns.current.forEach((es) => { try { es.close(); } catch { /**/ } });
    sseConns.current.clear();
  }

  function openStream(imei: string) {
    let es: EventSource;
    try { es = new EventSource(sseUrl(imei)); } catch { return; }
    sseConns.current.set(imei, es);

    es.onmessage = (ev) => {
      const u = units.current.get(imei); if (!u) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let res: any; try { res = JSON.parse(ev.data); } catch { return; }
      if (res.status === "heartbeat") return;

      if (res.status === "no_data") {
        u.status = "Offline"; tick(); return;
      }

      if (res.status !== "success" || !res.data) return;
      const d   = res.data;
      const lat = parseFloat(d.data_latitude), lng = parseFloat(d.data_longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      u.speed             = Number(d.speed_log) || 0;
      u.altitude          = Number(d.altitude   || d.data_altitude)  || 0;
      u.course            = Number(d.course     || d.data_course)    || 0;
      u.satellites        = Number(d.satellites || d.data_satellites || d.sat_count) || 0;
      u.mileage           = Number(d.mileage    || d.odometer)       || 0;
      u.fuel              = Number(d.fuel       || d.fuel_level)     || 0;
      u.motion_state      = d.motion_state || "";
      u.status            = normalizeStatus(u.motion_state, u.speed);
      u.coords            = { lat, lng };
      u.geocoded_location = d.geocoded_location || u.geocoded_location || "";
      u.last_sync         = `${d.local_system_datestamp || ""} ${d.local_system_timestamp || ""}`.trim();
      u.sensors           = parseSensors(d);

      tick();
      ensureMarker(u);
    };

    es.onerror = () => {
      try { es.close(); } catch { /**/ }
      sseConns.current.delete(imei);
      setTimeout(() => openStream(imei), 4000);
    };
  }

  function startAll() { stopAll(); units.current.forEach((_, imei) => openStream(imei)); }

  // ── API ───────────────────────────────────────────────────────────────────
  async function enrichSubs() {
    await Promise.all(
      Array.from(units.current.entries()).map(async ([imei, u]) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const j = await fleetFetch("POST", ENDPOINTS.FLEET.CHECK_IMEI, { data: { device_imei: imei } }) as any;
          if (j?.status !== "success" || !j.data) return;
          const d   = j.data;
          const raw = String(d.subscription_status || "").toLowerCase();
          u.subscription_status = raw === "active" ? "running" : raw || "unknown";
        } catch { /**/ }
      })
    );
  }

  async function loadUnits(dataLevel: string, accountUid: string) {
    setLoading(true); setListError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = await fleetFetch("POST", ENDPOINTS.FLEET.LIST_UNITS, {
        data: { data_level: dataLevel, account_uid: accountUid },
      }) as any;
      if (!resp || resp.status !== "success" || !Array.isArray(resp.data)) {
        setListError("Failed to load units."); setLoading(false); return;
      }
      units.current.clear();
      setPage(1);
      setSelectedImei(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resp.data.forEach((u: any) => {
        if (!u.device_imei) return;
        units.current.set(u.device_imei, {
          imei: u.device_imei, name: u.device_name || u.device_imei,
          subscription_status: u.subscription_status || "",
          status: "Offline", speed: 0, altitude: 0, course: 0,
          satellites: 0, mileage: 0, fuel: 0,
          motion_state: "", geocoded_location: "", coords: null,
          last_sync: "", country: "", sensors: [],
        });
      });
      tick(); setLoading(false);
      try { await enrichSubs(); tick(); } catch { /**/ }
      startAll();
    } catch { setListError("API error loading units."); setLoading(false); }
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const initMap = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const G = (window as any).google?.maps;
      if (!mapDivRef.current || gMap.current || !G) return;
      gMap.current = new G.Map(mapDivRef.current, {
        zoom: 6, center: DEFAULT_CENTER, mapTypeId: "roadmap",
        gestureHandling: "greedy", zoomControl: true,
        fullscreenControl: false, mapTypeControl: true,
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps) {
      initMap();
    } else if (!document.getElementById("gmaps-gatehouse")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__gatehouseMapInit = initMap;
      const s = Object.assign(document.createElement("script"), {
        id:    "gmaps-gatehouse",
        src:   `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&callback=__gatehouseMapInit&loading=async`,
        async: true, defer: true,
      });
      document.head.appendChild(s);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__gatehouseMapInit = initMap;
    }

    (async () => {
      const rawUid = getCookie("_nvxs_account_uid") ?? "";
      if (!rawUid) { setListError("Missing session — please log in."); setLoading(false); return; }

      const details = await fetchUserDetails(rawUid);
      const type    = details?.account_type || (getCookie("_nvxs_account_type") ?? "client").toLowerCase();
      const role    = details?.role         || (getCookie("_nvxs_account_role") ?? "").toLowerCase();
      if (type === "client" && role === "admin") setIsClientAdmin(true);

      const dataLevel  = type;
      const accountUid = dataLevel === "client"
        ? (getCookie("_nvxs_account_root") ?? rawUid)
        : rawUid;
      await loadUnits(dataLevel, accountUid);
    })();

    return () => {
      stopAll();
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  function onUnitClick(imei: string) {
    const u = units.current.get(imei);
    if (!u) return;
    if (String(u.subscription_status).toLowerCase() === "expired") {
      showToast("warn", "Subscription Expired",
        `${u.name || imei} — renew the subscription to enable live tracking.`);
      return;
    }
    setSelectedImei(imei);
    panToUnit(imei);
  }

  async function onOpenModal() {
    const primary = getCookie("_nvxs_account_root") || getCookie("_nvxs_account_uid") || "";
    if (!primary) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const j = await fleetFetch("GET", `${ENDPOINTS.FLEET.CLIENTS_ALL}/${encodeURIComponent(primary)}/all`) as any;
      if (j?.status === "success" && Array.isArray(j?.data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setClients(j.data.map((c: any) => ({
          uid:   c.client_uid || c.uid   || "",
          label: c.client_name || c.label || c.client_uid || "",
        })));
      }
    } catch { /**/ }
    setShowModal(true);
  }

  async function onLoadClientUnits() {
    if (!selClient) {
      showToast("info", "No client selected", "Please choose a client from the dropdown.");
      return;
    }
    setShowModal(false);
    stopAll();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markers.current.forEach((m) => { try { (m as any).setMap(null); } catch { /**/ } });
    markers.current.clear();
    await loadUnits("client", selClient);
  }

  const selectedUnit = selectedImei ? (units.current.get(selectedImei) ?? null) : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-[#F0F2F5]">

      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-3">
        <div className="text-[10px] text-[#667781] mb-0.5">Home › Fleet › Live Monitoring</div>
        <h1 className="text-[20px] font-black text-[#111B21] m-0 leading-tight">
          Fleet Monitoring — Live Vehicle Tracking
        </h1>
        <p className="text-[12px] text-[#667781] m-0 mt-0.5">
          Real-time GPS via SSE · Click a unit to view details · Expired subscriptions are locked.
        </p>
      </div>

      {/* Two-panel body */}
      <div className="flex-1 min-h-0 grid xl:grid-cols-[360px_1fr] gap-3 px-5 pb-5 overflow-hidden">

        {/* Left column — detail panel OR unit list */}
        <div className="min-h-0 flex flex-col bg-white border border-[#E9EDEF] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">

          {selectedUnit ? (
            <UnitDetailPanel
              unit={selectedUnit}
              onClose={() => setSelectedImei(null)}
              onShowOnMap={() => panToUnit(selectedImei!)}
            />
          ) : (
            <>
              {/* List header */}
              <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E9EDEF]">
                <div>
                  <div className="font-black text-[15px] text-[#111B21]">Vehicle Units</div>
                  <div className="text-[12px] text-[#667781] mt-0.5">
                    {list.length} unit{list.length !== 1 ? "s" : ""}{(q || statusFilter) ? " (filtered)" : ""}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-extrabold text-white px-2.5 py-1 rounded-full bg-[#25D366]">LIVE</span>
              </div>

              {/* Search + Load Client */}
              <div className="shrink-0 px-4 pt-3 pb-2 flex gap-2">
                <input
                  type="search"
                  value={searchQ}
                  onChange={(e) => { setSearchQ(e.target.value); setPage(1); }}
                  placeholder="Search name, IMEI, location…"
                  className="flex-1 h-9 rounded-lg border border-[#E9EDEF] px-3 text-[12px] text-[#111B21]
                    placeholder:text-[#667781] bg-[#F8F9FA] outline-none focus:border-[#128C7E] transition-colors"
                />
                {isClientAdmin && <Btn variant="azure" onClick={onOpenModal}>Load Client</Btn>}
              </div>

              {/* Status filter chips */}
              <div className="shrink-0 px-4 pb-2 flex flex-wrap gap-1.5">
                {([["", "All"], ["Moving", "Moving"], ["Parked", "Parked"], ["Idling", "Idling"], ["Offline", "Offline"]] as [MotionStatus | "", string][]).map(([val, label]) => {
                  const active = statusFilter === val;
                  const c      = val ? BADGE_COLORS[val as MotionStatus] : { bg: "#E9EDEF", color: "#111B21" };
                  const count  = val ? (statusCounts[val] ?? 0) : allUnits.length;
                  return (
                    <button
                      key={val}
                      onClick={() => { setStatusFilter(val); setPage(1); }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer"
                      style={active
                        ? { background: c.color, color: "#fff", borderColor: c.color }
                        : { background: "transparent", color: c.color, borderColor: c.color }}
                    >
                      {val && <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#fff" : c.color }} />}
                      {label}
                      <span className="opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Unit rows */}
              <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                {loading   && <div className="px-4 py-3 text-[12px] text-[#667781] italic">Loading units…</div>}
                {listError && <div className="px-4 py-3 text-[12px] text-[#D93025]">{listError}</div>}
                {!loading && !listError && list.length === 0 && (
                  <div className="px-4 py-3 text-[12px] text-[#667781] italic">No units found.</div>
                )}
                {pagedList.map((u, i) => {
                  const expired = String(u.subscription_status).toLowerCase() === "expired";
                  const loc     = u.geocoded_location || u.country || "—";
                  return (
                    <div key={u.imei} onClick={() => onUnitClick(u.imei)}
                      className={[
                        "flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer",
                        "border-b border-[#E9EDEF] last:border-b-0 hover:bg-[#F0F2F5] transition-colors",
                        i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]",
                        expired ? "opacity-60" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor(u.status) }} />
                        <div className="min-w-0">
                          <div className="font-extrabold text-[12px] text-[#111B21] truncate">{u.name || u.imei}</div>
                          <div className="text-[11px] text-[#667781] truncate max-w-[200px]" title={loc}>{loc}</div>
                        </div>
                      </div>
                      <StatusBadge status={u.status} />
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-[#E9EDEF] bg-white">
                <span className="text-[11px] text-[#667781]">
                  {list.length === 0
                    ? "0 units"
                    : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, list.length)} of ${list.length}`}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
                    className="w-7 h-7 rounded flex items-center justify-center text-[18px] leading-none
                      text-[#667781] disabled:opacity-30 hover:bg-[#F0F2F5] transition-colors
                      border-none bg-transparent cursor-pointer disabled:cursor-not-allowed">‹</button>
                  <span className="text-[11px] font-extrabold text-[#111B21] min-w-[52px] text-center">
                    {safePage} / {totalPages}
                  </span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                    className="w-7 h-7 rounded flex items-center justify-center text-[18px] leading-none
                      text-[#667781] disabled:opacity-30 hover:bg-[#F0F2F5] transition-colors
                      border-none bg-transparent cursor-pointer disabled:cursor-not-allowed">›</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Map */}
        <div className="min-h-0 flex flex-col bg-white border border-[#E9EDEF] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E9EDEF]">
            <div>
              <div className="font-black text-[15px] text-[#111B21]">Unit Locations</div>
              <div className="text-[12px] text-[#667781] mt-0.5">Click a unit or marker to view details</div>
            </div>
            <span className="shrink-0 text-[11px] font-extrabold text-white px-2.5 py-1 rounded-full bg-[#34B7F1]">MAP</span>
          </div>
          <div ref={mapDivRef} className="flex-1 min-h-0 w-full" />
        </div>

      </div>

      {/* Client modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-[320px] overflow-hidden border border-[#E9EDEF]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9EDEF]">
              <div className="font-black text-[15px] text-[#111B21]">Load Client Units</div>
              <button onClick={() => setShowModal(false)}
                className="text-[#667781] hover:text-[#111B21] text-xl font-bold bg-transparent border-none cursor-pointer leading-none">×</button>
            </div>
            <div className="p-4">
              <label className="text-[12px] font-extrabold text-[#667781] block mb-1.5">Select Client</label>
              <select value={selClient} onChange={(e) => setSelClient(e.target.value)}
                className="w-full h-9 rounded-lg border border-[#E9EDEF] px-3 text-[12px]
                  text-[#111B21] outline-none focus:border-[#128C7E] bg-[#F8F9FA]">
                <option value="">— Select a client —</option>
                {clients.map((c) => <option key={c.uid} value={c.uid}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 px-4 pb-4">
              <Btn variant="dark" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn variant="teal" onClick={onLoadClientUnits} disabled={!selClient}>Load Units</Btn>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
