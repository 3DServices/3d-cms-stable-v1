import React from "react";
import { TopBar }      from "./components/TopBar";
import { StatusStrip } from "./components/StatusStrip";
import { NavRail }     from "./components/NavRail";
import { Sidebar }     from "./components/Sidebar";
import { Dashboard }   from "./components/Dashboard";

export default function SystemHealthNocBridge() {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-[#F0F2F5] pb-14 md:pb-0 overflow-x-hidden w-full">

      <TopBar />
      <StatusStrip />

      <div className="flex flex-1 min-h-0 min-w-0 overflow-x-hidden">
        <NavRail />
        <Sidebar />
        <Dashboard />
      </div>

      <footer className="hidden md:flex items-center h-[22px] bg-white border-t border-[#E9EDEF] px-3 text-[11px] text-[#667781] overflow-x-auto whitespace-nowrap shrink-0" style={{ scrollbarWidth: "none" }}>
        Kafka lag 4.8s&nbsp;•&nbsp;Redis p95 3ms&nbsp;•&nbsp;Cassandra p95 27ms&nbsp;•&nbsp;SSE clients 2.1k&nbsp;•&nbsp;Uptime 99.82%
      </footer>
    </div>
  );
}