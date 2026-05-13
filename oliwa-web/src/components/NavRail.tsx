/**
 * NavRail — Primary Side Navigation Bar
 *
 * Vertical icon rail on desktop; transforms into a fixed bottom tab bar
 * on mobile (≤ md breakpoint).
 */
import React from "react";

interface NavRailItem { key: string; glyph: string; label: string; }
interface NavRailProps { items?: NavRailItem[]; activeKey?: string; onSelect?: (key: string) => void; }

const DEFAULT_ITEMS: NavRailItem[] = [
  { key: "home",     glyph: "H",  label: "Home"     },
  { key: "health",   glyph: "⛑",  label: "Health"   },
  { key: "alarms",   glyph: "!",  label: "Alarms"   },
  { key: "tokens",   glyph: "T",  label: "Tokens"   },
  { key: "billing",  glyph: "₿",  label: "Billing"  },
  { key: "payments", glyph: "$",  label: "Payments" },
  { key: "veba",     glyph: "V",  label: "VEBA"     },
  { key: "ai",       glyph: "W",  label: "AI"       },
  { key: "rbac",     glyph: "R",  label: "RBAC"     },
  { key: "audit",    glyph: "A",  label: "Audit"    },
];

export function NavRail({ items = DEFAULT_ITEMS, activeKey = "health", onSelect }: NavRailProps) {
  return (
    <>
      {/*
        Desktop rail — left vertical column
        Hidden on mobile; shown from md upward
      */}
      <nav
        aria-label="Primary navigation"
        className="
          hidden md:flex flex-col gap-2
          w-[60px] bg-white border-r border-[#E9EDEF]
          px-[10px] py-3 shrink-0 overflow-y-auto
        "
      >
        {items.map((item) => (
          <RailBtn key={item.key} item={item} active={item.key === activeKey} onSelect={onSelect} />
        ))}
      </nav>

      {/*
        Mobile bottom tab bar — fixed, full-width
        Shown only below md
      */}
      <nav
        aria-label="Primary navigation"
        className="
          flex md:hidden flex-row items-center justify-around
          fixed bottom-0 left-0 right-0 h-14 z-[200] overflow-x-auto
          bg-white border-t border-[#E9EDEF]
          px-2 overflow-x-auto gap-1
        "
      >
        {items.map((item) => (
          <RailBtn key={item.key} item={item} active={item.key === activeKey} onSelect={onSelect} mobile />
        ))}
      </nav>
    </>
  );
}

function RailBtn({
  item, active, onSelect, mobile = false,
}: { item: NavRailItem; active: boolean; onSelect?: (k: string) => void; mobile?: boolean }) {
  return (
    <button
      title={item.label}
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect?.(item.key)}
      className={`
        ${mobile ? "w-10 h-10" : "w-9 h-9"} rounded-[10px]
        border font-bold text-[14px] grid place-items-center
        cursor-pointer shrink-0
        transition-colors duration-150
        ${active
          ? "bg-[#128C7E] text-white border-transparent"
          : "bg-[#EEF3F4] text-[#667781] border-[#E9EDEF] hover:bg-[#DCF1EE]"
        }
      `}
    >
      {item.glyph}
    </button>
  );
}