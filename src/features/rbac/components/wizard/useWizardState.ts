import { useState, useCallback } from "react";

export interface StepData {
  permissionUids?: string[];
  roleName?: string;
  userUid?: string;
}

export type StepNumber = 1 | 2 | 3 | 4;

export interface WizardState {
  activeStep: StepNumber;
  completedSteps: Set<number>;
  stepData: StepData;
  goToStep: (n: StepNumber) => void;
  markCompleted: (n: StepNumber, data?: Partial<StepData>) => void;
  goNext: () => void;
  reset: () => void;
}

export function useWizardState(initialStep: StepNumber = 1): WizardState {
  const [activeStep, setActiveStep] = useState<StepNumber>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepData, setStepData] = useState<StepData>({});

  const goToStep = useCallback((n: StepNumber) => {
    setActiveStep(n);
  }, []);

  const markCompleted = useCallback((n: StepNumber, data?: Partial<StepData>) => {
    setCompletedSteps((prev) => new Set(prev).add(n));
    if (data) {
      setStepData((prev) => ({ ...prev, ...data }));
    }
  }, []);

  const goNext = useCallback(() => {
    setActiveStep((prev) => (prev < 4 ? ((prev + 1) as StepNumber) : prev));
  }, []);

  const reset = useCallback(() => {
    setActiveStep(initialStep);
    setCompletedSteps(new Set());
    setStepData({});
  }, [initialStep]);

  return { activeStep, completedSteps, stepData, goToStep, markCompleted, goNext, reset };
}
