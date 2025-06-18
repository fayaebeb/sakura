import React from 'react'
import { Button } from '../ui/button'
import { useSetRecoilState } from 'recoil';
import { chatInputState } from '@/state/chatInputState';
import { TooltipRenderProps } from 'react-joyride';

const ChatInputStepContent: React.FC<TooltipRenderProps> = ({
    primaryProps,
    skipProps,
    closeProps,
    backProps,
}) => {

    const setLocalInput = useSetRecoilState(chatInputState);
    const setPromptInChatInput = (prompt: string) => {

        setLocalInput(prompt);
    }
    return (
        <div className="text-sm text-gray-800 space-y-2">
            <p className="font-medium">This is your chat interface.</p>
            <p className="text-gray-600">
                Use this area to interact with the assistant.
            </p>
            <Button {...primaryProps} className="mt-2" onClick={() => setPromptInChatInput("SAMPLE PROMPT")}>
                Demo Button
            </Button>
        </div>
    )
}

export default ChatInputStepContent