/**
 * Sidebar — Secondary Side Navigation Bar
 *
 * Section-specific sub-navigation. Visible only on lg+ screens.
 * Can be toggled open on tablet via the `.open` state prop.
 */
import React from "react";

interface SidebarItem { key: string; label: string; }
interface SidebarTip  { title: string; body: string; }
interface SidebarProps {
  title?:     string;
  subtitle?:  string;
  items?:     SidebarItem[];
  activeKey?: string;
  onSelect?:  (key: string) => void;
  tip?:       SidebarTip;
  /** When true (tablet), sidebar slides in over the rail */
  open?:      boolean;
}

const DEFAULT_ITEMS: SidebarItem[] = [
  { key: "overview",           label: "Overview"             },
  { key: "api-edge",           label: "API & Edge"           },
  { key: "ingestion",          label: "Ingestion Pipeline"   },
  { key: "kafka",              label: "Kafka"                },
  { key: "databases",          label: "Databases"            },
  { key: "compute",            label: "Compute"              },
  { key: "messaging-payments", label: "Messaging + Payments" },
  { key: "ai-workloads",       label: "AI Workloads"         },
  { key: "task-manager",       label: "Task Manager (Diag)"  },
  { key: "runbooks",           label: "Runbooks"             },
  { key: "incidents",          label: "Incidents"            },
];

const DEFAULT_TIP: SidebarTip = {
  title: "Waswa Tip",
  body:  'Type: "why burn↑" to trace token drains to infra.',
};

export function Sidebar({
  title     = "System Health CMS",
  subtitle  = "SRE God View • Ops+Revenue",
  items     = DEFAULT_ITEMS,
  activeKey = "overview",
  onSelect,
  tip       = DEFAULT_TIP,
  open      = false,
}: SidebarProps) {
  return (
    <aside
      className={`
        w-[240px] bg-white border-r border-[#E9EDEF]
        flex flex-col gap-2.5 p-3.5 shrink-0 overflow-y-auto

        /* Desktop: always visible in flow */
        hidden lg:flex

        /* Tablet: fly out over rail when open */
        ${open
          ? "md:flex md:fixed md:left-[60px] md:top-[86px] md:bottom-0 md:z-[150] md:shadow-xl"
          : ""
        }
      `}
    >
      <div className="font-extrabold text-[#111B21] text-[13px]">{title}</div>
      <div className="text-[11px] text-[#667781]">{subtitle}</div>

      <nav className="flex flex-col gap-1.5" aria-label="Secondary navigation">
        {items.map((item) => (
          <div
            key={item.key}
            role="button"
            tabIndex={0}
            aria-current={item.key === activeKey ? "page" : undefined}
            onClick={() => onSelect?.(item.key)}
            onKeyDown={(e) => e.key === "Enter" && onSelect?.(item.key)}
            className={`
              relative h-[34px] rounded-lg border flex items-center
              px-2.5 text-[12px] cursor-pointer select-none
              transition-colors duration-100
              ${item.key === activeKey
                ? "bg-[#E9F7F4] text-[#111B21] border-[#C2E8E1]"
                : "text-[#667781] border-[#E9EDEF] hover:bg-[#F0F2F5]"
              }
            `}
          >
            {/* Active accent bar */}
            {item.key === activeKey && (
              <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-[#128C7E]" />
            )}
            <span className="pl-1">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Tip card — pinned to bottom */}
      {tip && (
        <div className="mt-auto border border-[#E9EDEF] bg-[#F0F2F5] rounded-xl p-2.5">
          <div className="font-bold text-[12px] text-[#111B21]">{tip.title}</div>
          <div className="mt-1 text-[11px] text-[#667781] leading-snug">{tip.body}</div>
        </div>
      )}
    </aside>
  );
}
