// components/CustomTooltipSwitcher.tsx
import React from "react";
import { TooltipRenderProps } from "react-joyride";

import { CustomJoyrideStep } from "@/lib/tourSteps";
import WelcomeDialog from "./TooltipWelcome";
import ChatInterfaceDialog from "./ChatInterfaceDialog";
import { User } from "lucide-react";
import UserTypeSelectDialog from "./UserTypeSelectDialog";
import ChatInputStepContent from "./chatInputStepContent";
import SearchInternetButtonDialog from "./SearchInternetButtonDialog";
import SelectDatabaseDialog from "./SelectDatabaseDialog";
import SuggestionsDialog from "./SuggestionsDialog";
import VoiceModeDialog from "./VoiceModeDialog";
import ChatInputDialog from "./ChatInputDialog";
import SendButtonDialog from "./SendButtonDialog";
import TooltipEnd from "./TooltipEnd";
import MainMessageDialog from "./MainMessageDialog";
import SettingsDialog from "./SettingsDialog";


const ToolTipSwitcher: React.FC<TooltipRenderProps> = (props) => {
    const step = props.step as CustomJoyrideStep;
    const stepId = step.id;

    switch (stepId) {
        case "welcome":
            return <WelcomeDialog {...props} />;
        case "chat-interface":
            return <ChatInterfaceDialog {...props} />;
        case "user-type-select":
            return <UserTypeSelectDialog {...props} />;
        case "search-internet-button":
            return <SearchInternetButtonDialog {...props} />;
        case "select-database-button":
            return <SelectDatabaseDialog {...props} />;
        case "suggestions-button":
            return <SuggestionsDialog {...props} />;
        case "voice-mode-button":
            return <VoiceModeDialog {...props} />;
        case "chat-input":
            return <ChatInputDialog {...props} />;
        case "send-button":
            return <SendButtonDialog {...props} />;
        case "main-message-text":
            return <MainMessageDialog {...props} />;
        // case "社内文書情報":
        //     return <ChatInterfaceDialog {...props} />;
        // case "オンラインWeb情報":
        //     return <ChatInterfaceDialog {...props} />;
        case "settings-dropdown":
            return <SettingsDialog {...props} />;
        case "end-tour":
            return <TooltipEnd {...props} />;

        default: return (
            <div className="p-4 bg-red-100 text-red-800 rounded">
                Unknown step: {stepId}
            </div>
        );
    }
};

export default ToolTipSwitcher;
