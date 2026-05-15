import { DeviceManagementSection } from "./DeviceManagementSection";

export default function OpsWarRoomPage() {
  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-[#F0F2F5]">

      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-3">
        <div className="text-[10px] text-[#667781] mb-0.5">Home › Infrastructure › Device Management</div>
        <h1 className="text-[20px] font-black text-[#111B21] m-0 leading-tight">
          Device Management
        </h1>
        <p className="text-[12px] text-[#667781] m-0 mt-0.5">
          Onboard, configure and manage GPS tracking devices · Teltonika · Wetrack2 · GT06
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
        <DeviceManagementSection />
      </div>

    </div>
  );
}
