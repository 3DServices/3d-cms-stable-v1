/**
 * Sidebar — Secondary Side Navigation Bar
 * Uses react-router-dom NavLink for URL-driven active state.
 */
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { usePermissions } from "../../auth/PermissionsContext";

/** Each sidebar item can optionally require a permission to be visible. */
export interface SidebarItem { key: string; label: string; path?: string; permission?: string; }
interface SidebarTip  { title: string; body: string; }
interface SidebarProps {
  title?:    string;
  subtitle?: string;
  items?:    SidebarItem[];
  onSelect?: (key: string) => void;
  tip?:      SidebarTip;
  open?:     boolean;
}

const DEFAULT_ITEMS: SidebarItem[] = [
  // ── Core dashboards (Dashboard has no permission — always visible) ──────
  { key: "aegis",              label: "Dashboard",               path: "/"                  },
  { key: "noc-bridge",         label: "NOC Bridge",              path: "/noc-bridge",        permission: "noc.view" },
  { key: "protocol",           label: "Protocol Port",           path: "/protocol",          permission: "protocol.view" },
  { key: "sim",                label: "Signal Vault",            path: "/sim",               permission: "sim.view" },
  { key: "ops",                label: "Ops War Room",            path: "/ops",               permission: "ops.view" },
  { key: "gatehouse",          label: "Monitoring Alpha",        path: "/gatehouse",         permission: "gatehouse.view" },
  { key: "alarms-factory",     label: "Alarm Factory",           path: "/alarms-factory",    permission: "alarms.view" },
  { key: "tenant-tower",       label: "Tenant Tower",            path: "/tenant-tower",      permission: "tenants.view" },
  // { key: "billing-invoicing",  label: "Billing & Invoicing",     path: "/billing-invoicing", permission: "billing.view" },
  // { key: "asset-digital-twin", label: "Asset Digital Twin",      path: "/asset-digital-twin", permission: "assets.view" },

  // ── System & Ops ─────────────────────────────────────────────────────────
  // { key: "health",             label: "System Health",           path: "/health",            permission: "health.view" },
  { key: "alarms",             label: "Alarms Center",           path: "/alarms",            permission: "alarms.view" },
  // { key: "ingestion",          label: "Ingestion Pipeline",      path: "/health"            },
  // { key: "kafka",              label: "Kafka",                   path: "/health"            },
  // { key: "compute",            label: "Compute",                 path: "/health"            },
  // { key: "task-manager",       label: "Task Manager (Diag)",     path: "/health"            },

  // ── Tokenomics & Finance ─────────────────────────────────────────────────
  { key: "tokens",             label: "Token Engine",            path: "/tokens",            permission: "tokens.view" },
  { key: "billing",            label: "Billing",                 path: "/billing",           permission: "billing.view" },
  // { key: "payments",           label: "Payments",                path: "/payments",          permission: "payments.view" },
  { key: "money",              label: "Money Switchboard",       path: "/money",             permission: "money.view" },

  // ── Platform ─────────────────────────────────────────────────────────────
  { key: "veba",               label: "VEBA Marketplace",        path: "/veba",              permission: "veba.view" },
  // { key: "ai-workloads",       label: "AI Workloads",            path: "/ai",                permission: "ai.view" },
  { key: "rbac",               label: "RBAC / Access Control",   path: "/rbac",              permission: "rbac.view" },
  // { key: "runbooks",           label: "Runbooks",                path: "/audit"             },
  { key: "audit",              label: "Audit Trail",             path: "/audit",             permission: "audit.view" },

];

const DEFAULT_TIP: SidebarTip = {
  title: "Waswa Tip",
  body:  'Type: "why burn↑" to trace token drains to infra.',
};

// ── Clear all cookies ──────────────────────────────────────────────────────
function clearAllCookies() {
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  });
}

export function Sidebar({
  title    = "System Core Console",
  subtitle = "Primary Ops+Command Center",
  items    = DEFAULT_ITEMS,
  onSelect,
  open     = false,
}: SidebarProps) {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // Filter nav items: show if no permission required OR user has the permission
  const visibleItems = items.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const handleLogout = () => {
    clearAllCookies();
    window.location.href = "/";
  };
  return (
    <aside
      className={[
        "w-[240px] bg-white border-r border-[#E9EDEF]",
        "flex flex-col gap-2.5 p-3.5 shrink-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "hidden lg:flex",
        open ? "md:flex md:fixed md:left-[60px] md:top-[86px] md:bottom-0 md:z-[150] md:shadow-xl" : "",
      ].join(" ")}
    >
      <div className="font-extrabold text-[#111B21] text-[13px]">{title}</div>
      <div className="text-[11px] text-[#667781]">{subtitle}</div>

      <nav className="flex flex-col gap-1.5" aria-label="Secondary navigation">
        {visibleItems.map((item) => {
          const to = item.path ?? `/${item.key}`;
          return (
            <NavLink
              key={item.key}
              to={to}
              end={to === "/"}
              onClick={() => onSelect?.(item.key)}
              className={({ isActive }) =>
                [
                  "relative h-[34px] rounded-lg border flex items-center",
                  "px-2.5 text-[12px] cursor-pointer select-none no-underline",
                  "transition-colors duration-100",
                  isActive
                    ? "bg-[#E9F7F4] text-[#111B21] border-[#C2E8E1]"
                    : "text-[#667781] border-[#E9EDEF] hover:bg-[#F0F2F5]",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-[#128C7E]" />
                  )}
                  <span className="pl-1">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {(
        <div 
          onClick={handleLogout}
          className="mt-auto border border-[#E9EDEF] bg-[#F0F2F5] rounded-xl p-2.5 cursor-pointer hover:bg-[#E9EDEF] transition-colors"
        >
          <div className="font-bold text-[12px] text-[#111B21]">LogOut - Exit</div>
        </div>
      )}
    </aside>
  );
}