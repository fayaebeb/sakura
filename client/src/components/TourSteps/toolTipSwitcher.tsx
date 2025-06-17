// components/CustomTooltipSwitcher.tsx
import React from "react";
import { TooltipRenderProps } from "react-joyride";

import { CustomJoyrideStep } from "@/lib/tourSteps";
import WelcomeDialog from "./TooltipWelcome";
import ChatInterfaceDialog from "./ChatInterfaceDialog";
import { User } from "lucide-react";
import UserTypeSelectDialog from "./UserTypeSelectDialog";
import ChatInputStepContent from "./chatInputStepContent";


const ToolTipSwitcher: React.FC<TooltipRenderProps> = (props) => {
    const step = props.step as CustomJoyrideStep;
    const stepId = step.id;

    switch (stepId) {
        case "welcome":
            return <WelcomeDialog {...props} />;
        case "chat-interface":
            return <ChatInterfaceDialog {...props} />;
        case "user-type-select":
            return <ChatInterfaceDialog {...props} />;
        case "search-internet-button":
            return <ChatInterfaceDialog {...props} />;
        case "select-database-button":
            return <ChatInterfaceDialog {...props} />;
        case "suggestions-button":
            return <ChatInterfaceDialog {...props} />;
        case "user-type-select":
            return <ChatInterfaceDialog {...props} />;
        case "voice-mode-button":
            return <ChatInterfaceDialog {...props} />;
        case "send-button":
            return <ChatInterfaceDialog {...props} />;
        case "main-message-text":
            return <ChatInterfaceDialog {...props} />;
        case "社内文書情報":
            return <ChatInterfaceDialog {...props} />;
        case "オンラインWeb情報":
            return <ChatInterfaceDialog {...props} />;
        case "settings-dropdown":
            return <ChatInterfaceDialog {...props} />;
        case "end-tour":
            return <WelcomeDialog {...props} />;
        case "chat-input":
            return <ChatInterfaceDialog {...props} />;

        default: return (
            <div className="p-4 bg-red-100 text-red-800 rounded">
                Unknown step: {stepId}
            </div>
        );
    }
};

export default ToolTipSwitcher;
