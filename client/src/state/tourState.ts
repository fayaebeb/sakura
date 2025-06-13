import { atom } from "recoil";
import { Step } from "react-joyride";

export type CustomJoyrideStep = Step & {
  customRadius?: string;
};

export const tourSteps: CustomJoyrideStep[] = [
  {
    target: "body",
    content: "Welcome to the app!",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: "#chat-interface",
    content: "This is where you chat with the assistant.",
    placement: "right",        // <-- force it on this step
    spotlightPadding: 0,
    floaterProps: {
      disableFlip: true,       // <-- only this step won't flip
    },
    customRadius: "var(--radius)",

  },
  {
    target: "#user-type-select",
    content: "Choose your user type here.",
    placement: "bottom",
    spotlightPadding: 0,
    customRadius: "calc(var(--radius) - 2px)"
  },
  {
    target: "#search-internet-button",
    content: "Click here to get started!",
    placement: "bottom",
    spotlightPadding: 0,
    customRadius: "9999px"
  },
  {
    target: "#select-database-button",
    content: "Click here to get started!",
    placement: "bottom",
    spotlightPadding: 0,
    customRadius: "9999px"
  },
  // {
  //   target: "#select-database-options",
  //   content: "Click here to get started!",
  //   placement: "right",
  //   spotlightPadding: 0,
  //   customRadius: "9999px"

  // },
  {
    target: "#suggestions-button",
    content: "Click here to get started!",
    placement: "bottom",
    spotlightPadding: 0,
    customRadius: "9999px"
  },
  {
    target: "#voice-mode-button",
    content: "Click here to get started!",
    placement: "bottom",
    spotlightPadding: 0,
    customRadius: "9999px"
  },
  {
    target: "#chat-input",
    content: "Click here to get started!",
    placement: "bottom",
    spotlightPadding: 0,
    customRadius: "var(--radius)"
  },
  {
    target: "#send-button",
    content: "Click here to get started!",
    placement: "bottom",
    spotlightPadding: 0,
    customRadius: "9999px"
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
