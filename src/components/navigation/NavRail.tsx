/**
 * NavRail — Primary Side Navigation Bar
 * Uses react-router-dom NavLink for URL-driven active state.
 */
import React from "react";
import { NavLink } from "react-router-dom";

export interface NavRailItem { key: string; glyph: string; label: string; path?: string; }
interface NavRailProps { items?: NavRailItem[]; }

const DEFAULT_ITEMS: NavRailItem[] = [
  { key: "home",               glyph: "⌂",  label: "Home",               path: "/"                  },
  { key: "aegis",              glyph: "A",  label: "Aegis Dashboard",     path: "/aegis"             },
  { key: "noc-bridge",         glyph: "⛑",  label: "NOC Bridge",          path: "/noc-bridge"        },
  { key: "protocol",           glyph: "⚙",  label: "Protocol Port",        path: "/protocol"          },
  { key: "firmware",           glyph: "⬆",  label: "Patch Orchestrator",   path: "/firmware"          },
  { key: "sim",                glyph: "📡", label: "Signal Vault",         path: "/sim"               },
  { key: "ops",                glyph: "!",  label: "Ops War Room",         path: "/ops"               },
  { key: "gatehouse",          glyph: "G",  label: "Gatehouse",            path: "/gatehouse"         },
  { key: "alarms-factory",     glyph: "⚡", label: "Alarm Factory",        path: "/alarms-factory"    },
  { key: "tenant-tower",       glyph: "#",  label: "Tenant Tower",         path: "/tenant-tower"      },
  { key: "billing-invoicing",  glyph: "I",  label: "Billing & Invoicing",  path: "/billing-invoicing" },
  { key: "health",             glyph: "♥",  label: "System Health",        path: "/health"            },
  { key: "alarms",             glyph: "⚠",  label: "Alarms",               path: "/alarms"            },
  { key: "tokens",             glyph: "T",  label: "Tokens",               path: "/tokens"            },
  { key: "billing",            glyph: "₿",  label: "Billing",              path: "/billing"           },
  { key: "asset-digital-twin", glyph: "🖼", label: "Asset Digital Twin",    path: "/asset-digital-twin" },

  { key: "payments",           glyph: "$",  label: "Payments",             path: "/payments"          },
  { key: "money",              glyph: "💳", label: "Money Switchboard",    path: "/money"             },
  { key: "veba",               glyph: "V",  label: "VEBA",                 path: "/veba"              },
  { key: "ai",                 glyph: "W",  label: "AI Workloads",         path: "/ai"                },
  { key: "rbac",               glyph: "R",  label: "RBAC",                 path: "/rbac"              },
  { key: "audit",              glyph: "📋", label: "Audit Trail",          path: "/audit"             },
];

export function NavRail({ items = DEFAULT_ITEMS }: NavRailProps) {
  return (
    <>
      {/* Desktop vertical rail */}
      <nav
        aria-label="Primary navigation"
        className="hidden md:flex flex-col gap-2 w-[60px] bg-white border-r border-[#E9EDEF] px-[10px] py-3 shrink-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => <RailLink key={item.key} item={item} />)}
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Primary navigation"
        className="flex md:hidden flex-row items-center justify-around fixed bottom-0 left-0 right-0 h-14 z-[200] overflow-x-auto bg-white border-t border-[#E9EDEF] px-2 gap-1"
      >
        {items.map((item) => <RailLink key={item.key} item={item} mobile />)}
      </nav>
    </>
  );
}

function RailLink({ item, mobile = false }: { item: NavRailItem; mobile?: boolean }) {
  const to = item.path ?? `/${item.key}`;
  return (
    <NavLink
      to={to}
      end={to === "/"}
      title={item.label}
      aria-label={item.label}
      className={({ isActive }) =>
        [
          mobile ? "w-10 h-10" : "w-9 h-9",
          "rounded-[10px] border font-bold text-[14px] grid place-items-center",
          "cursor-pointer shrink-0 no-underline transition-colors duration-150",
          isActive
            ? "bg-[#128C7E] text-white border-transparent"
            : "bg-[#EEF3F4] text-[#667781] border-[#E9EDEF] hover:bg-[#DCF1EE]",
        ].join(" ")
      }
    >
      {item.glyph}
    </NavLink>
  );
}