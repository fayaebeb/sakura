import { memo, useCallback, useRef, useEffect, useState } from "react";
import { Send, User, Building, Landmark } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { motion } from "framer-motion";
import VoiceRecorder from "./voice-recorder";
import PromptPicker from "./prompt-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
// Message category type
export type MessageCategory = "SELF" | "PRIVATE" | "ADMINISTRATIVE";

const ChatInput = memo(function ChatInput({
  input,
  setInput,
  handleSubmit: originalHandleSubmit,
  handleVoiceRecording,
  isProcessing,
  sendDisabled,
  handlePromptSelect,
  isMobile,
  textareaRef,
}: {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent, category?: MessageCategory) => void;
  handleVoiceRecording: (audio: Blob) => void;
  isProcessing: boolean;
  sendDisabled: boolean;
  handlePromptSelect: (text: string) => void;
  isMobile: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  // Category selection state
  const [category, setCategory] = useState<MessageCategory>("SELF");
  
  // Local input state for smoother typing experience
  const localInputRef = useRef<string>(input);

  // Wrap the original submit handler to include the category
  const handleSubmit = (e: React.FormEvent) => {
    originalHandleSubmit(e, category);
  };

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
      <form onSubmit={handleSubmit} className="pt-2 sm:pt-1 pb-2 sm:pb-2 px-2 sm:px-4 border-t flex flex-col gap-1 relative">

      {/* Category selection toggle group */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0.5 mb-0.5">

        
        <TooltipProvider>
          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(value) => {
              if (value) setCategory(value as MessageCategory);
            }}
            className="flex border rounded-md p-0.5 bg-gray-50 shadow-sm"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value="SELF" 
                  aria-label="個人" 
                  className={`flex items-center gap-1 px-1 py-0.5 text-xs rounded ${
                    category === "SELF" 
                      ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 shadow-sm" 
                      : "hover:bg-blue-50"
                  }`}
                >
                  <User size={12} className={category === "SELF" ? "text-blue-600" : "text-gray-500"} />
                  <span>自分</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">個人としてメッセージを送信</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value="PRIVATE" 
                  aria-label="民間" 
                  className={`flex items-center gap-1 px-1 py-0.5 text-xs rounded ${
                    category === "PRIVATE" 
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Building size={12} className={category === "PRIVATE" ? "text-gray-600" : "text-gray-500"} />
                  <span>民間</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">民間企業としてメッセージを送信</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value="ADMINISTRATIVE" 
                  aria-label="行政" 
                  className={`flex items-center gap-1 px-1 py-0.5 text-xs rounded ${
                    category === "ADMINISTRATIVE" 
                      ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700 shadow-sm" 
                      : "hover:bg-red-50"
                  }`}
                >
                  <Landmark size={12} className={category === "ADMINISTRATIVE" ? "text-red-600" : "text-gray-500"} />
                  <span>行政</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">行政機関としてメッセージを送信</p>
              </TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </TooltipProvider>
      </div>

      <div className="flex gap-1.5 sm:gap-2">
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
            className="px-3 py-2 focus:ring-2 focus:ring-pink-100 text-xs sm:text-sm min-h-[40px] max-h-[200px] resize-none w-full border rounded-md"
            minRows={1}
            maxRows={6}
            onKeyDown={handleKeyDown}
            spellCheck={false} // Disable spell checking for better performance
            autoComplete="off" // Disable browser autocomplete
            autoCorrect="off" // Disable autocorrect
          />
        </div>
        
        <div className="flex-shrink-0 relative z-20">
          <PromptPicker onSelect={handlePromptSelect} />
        </div>

        <motion.button
          type="submit"
          disabled={sendDisabled}
          className="px-2 sm:px-3 py-2 h-[40px] rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md flex items-center gap-1 disabled:opacity-70 flex-shrink-0"
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