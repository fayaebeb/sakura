import ChatInputStepContent from "@/components/TourSteps/chatInputStepContent";
// import TourStartContent from "@/components/TourSteps/TourStartContent";
import { Step } from "react-joyride";


export type CustomJoyrideStep = Step & {
    customRadius?: string;
    id: string
};

export const tourSteps: CustomJoyrideStep[] = [
    {
        target: "body",
        content: "",
        placement: "center",
        disableBeacon: true,
        id: "welcome"
    },
    {
        id: "chat-interface",
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
        id: "user-type-select",
        target: "#user-type-select",
        content: "Choose your user type here.",
        placement: "bottom",
        spotlightPadding: 0,
        customRadius: "9999px"
    },
    {
        id: "search-internet-button",
        target: "#search-internet-button",
        content: "Click here to get started!",
        placement: "bottom",
        spotlightPadding: 0,
        customRadius: "9999px"
    },
    {
        id: "select-database-button",
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
             id: "suggestions-button",
        target: "#suggestions-button",
        content: "Click here to get started!",
        placement: "bottom",
        spotlightPadding: 0,
        customRadius: "9999px"
    },
    {
        id: "voice-mode-button",
        target: "#voice-mode-button",
        content: "Click here to get started!",
        placement: "bottom",
        spotlightPadding: 0,
        customRadius: "9999px"
    },
    {
        id: "chat-input",
        target: "#chat-input",
        placement: "bottom",
        spotlightPadding: 0,
        customRadius: "var(--radius)",
        content: ""
    },
    {
        id: "send-button",
        target: "#send-button",
        content: "Click here to get started!",
        placement: "bottom",
        spotlightPadding: 0,
        customRadius: "9999px"
    },
    {
        id: "main-message-text",
        target: "#main-message-text",
        content: "Click here to get started!",
        placement: "top",
        spotlightPadding: 5,
        floaterProps: {
            disableFlip: true,       // <-- only this step won't flip  
        },
        customRadius: "var(--radius)",
    },
    {
        id: "社内文書情報",
        target: "#社内文書情報",
        content: "Click here to get started!",
        placement: "top",
        spotlightPadding: 0,
        customRadius: "var(--radius)"
    },
    {
        id: "オンラインWeb情報",
        target: "#オンラインWeb情報",
        content: "Click here to get started!",
        placement: "top",
        spotlightPadding: 0,
        customRadius: "var(--radius)"
    },
    {
        id: "settings-dropdown",
        target: "#settings-dropdown",
        content: "Click here to get started!",
        placement: "top",
        spotlightPadding: 0,
        customRadius: " 9999px"
    },
    {
        id: "end-tour",
        target: "body",
        content: "Welcome to the app!",
        placement: "center",
        disableBeacon: true,
    },
];