/**
 * NavRail — Primary Side Navigation Bar
 * Uses react-router-dom NavLink for URL-driven active state.
 */
import React from "react";
import { NavLink } from "react-router-dom";
import { getModulesForNavRail } from "../../auth/modules";

export interface NavRailItem { key: string; glyph: string; label: string; path?: string; }
interface NavRailProps { items?: NavRailItem[]; }

/**
 * Default nav-rail items are derived from the module registry
 * (`auth/modules.ts`). The "home" entry is a UI affordance, not a module,
 * so it's prepended explicitly.
 *
 * Note: this rail does NOT permission-filter the items (intentional — the
 * rail is a primary nav and shows all destinations; if the user lacks
 * access, the route itself shows an Access Denied panel). Per-item
 * permission filtering happens in the secondary <Sidebar>.
 */
const HOME_ITEM: NavRailItem = { key: "home", glyph: "⌂", label: "Home", path: "/" };

const DEFAULT_ITEMS: NavRailItem[] = [
  HOME_ITEM,
  ...getModulesForNavRail().map((m) => ({
    key:   m.id,
    glyph: m.navGlyph ?? "•",
    label: m.navLabel ?? m.name,
    path:  m.route,
  })),
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