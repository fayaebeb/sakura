// src/state/onboardingState.ts
import { atom } from "recoil";
import type { Step } from "react-joyride";

export const onboardingStepsState = atom<Step[]>({
  key: "onboardingSteps",
  default: [],
});

export const onboardingRunState = atom<boolean>({
  key: "onboardingRun",
  default: false,
});
