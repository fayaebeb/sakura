import { memo, useCallback, useRef, useEffect } from "react";
import { Lightbulb, Send } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import VoiceRecorder from "./voice-recorder";

// Debounce function to improve input performance
function useDebounce(callback: Function, delay: number) {
  const timeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

// Optimized version to reduce input lag
const ChatInput = memo(function ChatInput({
  input,
  setInput,
  handleSubmit,
  handleVoiceRecording,
  isProcessing,
  sendDisabled,
  showEmotions,
  setShowEmotions,
  isMobile,
  textareaRef,
}: {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
  handleVoiceRecording: (audio: Blob) => void;
  isProcessing: boolean;
  sendDisabled: boolean;
  showEmotions: boolean;
  setShowEmotions: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  // Local input state for smoother typing experience
  const localInputRef = useRef<string>(input);
  
  // Update the parent state in a debounced way to avoid lag
  const debouncedSetInput = useDebounce((value: string) => {
    setInput(value);
  }, 5); // Very small delay - just enough to batch updates
  
  // Update local ref when parent input changes
  useEffect(() => {
    localInputRef.current = input;
  }, [input]);
  
  // Handle Enter key for submission - optimize deps array
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (!isMobile) {
        e.preventDefault();
        const currentInput = textareaRef.current?.value || "";
        if (currentInput.trim() && !sendDisabled) {
          const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
          handleSubmit(formEvent);
        }
      }
    }
  }, [isMobile, handleSubmit, sendDisabled, textareaRef]);
  
  // Handle immediate input change for better responsiveness
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    localInputRef.current = newValue; // Update local ref immediately
    debouncedSetInput(newValue); // Update parent state in a debounced way
  }, [debouncedSetInput]);
  
  return (
    <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t flex flex-col gap-2 relative">
      <div className="flex gap-2">
        <div className="flex-shrink-0">
          <VoiceRecorder 
            onRecordingComplete={handleVoiceRecording} 
            isProcessing={isProcessing}
          />
        </div>

        <div className="relative flex-1 min-w-0">
          <TextareaAutosize
            ref={textareaRef}
            autoFocus
            defaultValue={input} // Use defaultValue instead of value for smoother typing
            onChange={handleInputChange}
            placeholder="メッセージを書いてね！"
            className="pr-10 pl-3 py-2 focus:ring-2 focus:ring-pink-100 text-sm sm:text-base min-h-[40px] max-h-[200px] resize-none w-full border rounded-md"
            minRows={1}
            maxRows={6}
            onKeyDown={handleKeyDown}
            spellCheck={false} // Disable spell checking for better performance
            autoComplete="off" // Disable browser autocomplete
            autoCorrect="off" // Disable autocorrect
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  className="absolute right-2 top-2 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-accent/50 lightbulb-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmotions((prev) => !prev)}
                >
                  <Lightbulb className="h-4 w-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>プロンプトを選択</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <motion.button
          type="submit"
          disabled={sendDisabled}
          className="px-3 sm:px-4 py-2 h-[40px] rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md flex items-center gap-1 disabled:opacity-70 flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">送信</span>
        </motion.button>
      </div>
    </form>
  );
});

export default ChatInput;
