import React from 'react'
import { Button } from '../ui/button'
import { useSetRecoilState } from 'recoil';
import { chatInputState } from '@/state/chatInputState';

const ChatInputStepContent = () => {
    
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
            <Button className="mt-2" onClick={() => setPromptInChatInput("SAMPLE PROMPT")}>
                Demo Button
            </Button>
        </div>
    )
}

export default ChatInputStepContent