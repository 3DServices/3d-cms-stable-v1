import type { StepNumber } from "./useWizardState";

export interface WizardStep {
  id: StepNumber;
  title: string;
  subtitle: string;
  permission: string;
}

export const FULL_SETUP_STEPS: WizardStep[] = [
  { id: 1, title: "Create Role", subtitle: "Bundle permissions into a role", permission: "rbac.create" },
  { id: 2, title: "Create User", subtitle: "Add user account", permission: "rbac.create" },
  { id: 3, title: "Assign Role", subtitle: "Link role to user", permission: "rbac.assign" },
];
