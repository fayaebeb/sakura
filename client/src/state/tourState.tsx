import { atom } from "recoil";
import { tourSteps } from "@/lib/tourSteps";



export const tourState = atom({
  key: "tourState",
  default: {
    key: new Date().getTime(),
    run: false,
    stepIndex: 0,
    steps: tourSteps,
    continuous: true,
    showSkipButton: true,
    scrollToFirstStep: true,
  },
});
