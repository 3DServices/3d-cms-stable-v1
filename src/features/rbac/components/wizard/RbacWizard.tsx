import React, { useEffect } from "react";
import { useWizardState, type StepNumber } from "./useWizardState";
import { WizardStepperSidebar } from "./WizardStepperSidebar";
import { StepPermission } from "./StepPermission";
import { StepRole } from "./StepRole";
import { StepUser } from "./StepUser";
import { StepAssignRole } from "./StepAssignRole";

interface RbacWizardProps {
  open: boolean;
  onClose: () => void;
  initialStep?: StepNumber;
  onDataChanged?: () => void;
}

const STEP_TITLES: Record<StepNumber, string> = {
  1: "Create Permissions",
  2: "Create Role",
  3: "Create User",
  4: "Assign Role",
};

const STEP_SUBTITLES: Record<StepNumber, string> = {
  1: "Define module actions for your system",
  2: "Bundle permissions into a named role",
  3: "Add a new user account to the system",
  4: "Link a role to an existing user",
};

export function RbacWizard({ open, onClose, initialStep = 1, onDataChanged }: RbacWizardProps) {
  const wizard = useWizardState(initialStep);

  // Reset when closed, sync initialStep when re-opened
  useEffect(() => {
    if (open) {
      wizard.reset();
      wizard.goToStep(initialStep);
    }
  }, [open, initialStep]);

  if (!open) return null;

  function handleStepSuccess(step: StepNumber, data?: Record<string, unknown>) {
    const mapped: Record<string, unknown> = {};
    if (step === 1 && data?.permissionUids) mapped.permissionUids = data.permissionUids;
    if (step === 2 && data?.roleName) mapped.roleName = data.roleName;
    if (step === 3 && data?.userUid) mapped.userUid = data.userUid;
    wizard.markCompleted(step, mapped);
    onDataChanged?.();
  }

  function handleClose() {
    wizard.reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/35" onClick={handleClose} />

      {/* Panel — slides in from right */}
      <div className="ml-auto relative w-[min(1100px,90vw)] h-full bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div>
            <div className="font-black text-[15px]">{STEP_TITLES[wizard.activeStep]}</div>
            <div className="text-[11px] opacity-70">{STEP_SUBTITLES[wizard.activeStep]}</div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-white/15 text-white font-black text-[14px] border-none cursor-pointer grid place-items-center hover:bg-white/25"
          >
            X
          </button>
        </div>

        {/* Body: Sidebar + Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <WizardStepperSidebar
            activeStep={wizard.activeStep}
            completedSteps={wizard.completedSteps}
            onStepClick={wizard.goToStep}
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5 bg-[#FBFBFB]">
            {wizard.activeStep === 1 && (
              <StepPermission
                onSuccess={(uids) => handleStepSuccess(1, { permissionUids: uids })}
                onClose={handleClose}
                onNext={wizard.goNext}
              />
            )}
            {wizard.activeStep === 2 && (
              <StepRole
                preSelectedPermissionUids={wizard.stepData.permissionUids}
                onSuccess={(roleName) => handleStepSuccess(2, { roleName })}
                onClose={handleClose}
                onNext={wizard.goNext}
              />
            )}
            {wizard.activeStep === 3 && (
              <StepUser
                preSelectedRoleName={wizard.stepData.roleName}
                onSuccess={(userUid) => handleStepSuccess(3, { userUid })}
                onClose={handleClose}
                onNext={wizard.goNext}
              />
            )}
            {wizard.activeStep === 4 && (
              <StepAssignRole
                preSelectedUserUid={wizard.stepData.userUid}
                onSuccess={() => handleStepSuccess(4)}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
