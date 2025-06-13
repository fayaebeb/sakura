import { atom } from "recoil";
import { Step } from "react-joyride";

export const tourSteps: Step[] = [
  {
    target: "body",
    content: "Welcome to the app!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: "#chat-interface",
    content: "This is where you chat with the assistant.",
    placement: "right",
  },
  {
    target: "#user-type-select",
    content: "Choose your user type here.",
    placement: "bottom",
  },
  {
    target: "#start-button",
    content: "Click here to get started!",
    placement: "bottom",
  },
];

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
