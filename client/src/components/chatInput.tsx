import { memo, useCallback, useRef, useEffect, useState } from "react";
import { Send, User, Building, Landmark, Globe, Database, ChevronDown } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { motion } from "framer-motion";
import VoiceRecorder from "./voice-recorder";
import PromptPicker from "./prompt-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";


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
  isProcessingVoice,
  sendDisabled,
  handlePromptSelect,
  isMobile,
  textareaRef,
  useWeb,
  setUseWeb,
  useDb,
  setUseDb,
}: {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent, category: MessageCategory, useWeb: boolean, useDb: boolean) => void;
  handleVoiceRecording: (audio: Blob) => void;
  isProcessing: boolean;
  isProcessingVoice: boolean; 
  sendDisabled: boolean;
  handlePromptSelect: (text: string) => void;
  isMobile: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  useWeb: boolean;
  setUseWeb: React.Dispatch<React.SetStateAction<boolean>>;
  useDb: boolean;
  setUseDb: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // Category selection state
  const [category, setCategory] = useState<MessageCategory>("SELF");

  const [localInput, setLocalInput] = useState(input);

  useEffect(() => {
    setLocalInput(input);
  }, [input]);

  const debouncedSetInput = useDebounce((value: string) => {
    setInput(value);
  }, 100); // 50-150ms is smooth and responsive


  // Local input state for smoother typing experience
  const localInputRef = useRef<string>(input);

  // Wrap the original submit handler to include the category
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Ensure default behavior is prevented
    originalHandleSubmit(e, category, useWeb, useDb);
    setInput(""); // Reset parent input
    localInputRef.current = ""; // Reset local input ref
  };

  
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
    setInput(newValue); // Update parent state in a debounced way
  }, [debouncedSetInput]);

  const [showOptions, setShowOptions] = useState(true);

  return (
      <form onSubmit={handleSubmit} className="pt-2 sm:pt-1 pb-2 sm:pb-2 px-2 sm:px-4 border-t flex flex-col gap-1 relative">
            {showOptions && (
                  <div className="overflow-x-auto sm:overflow-visible px-1 relative">
                    <div className="flex items-center gap-2 min-w-max">
                   {/* Category selection toggle group */}
            <div className="flex">
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

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setUseWeb(!useWeb);
                }}
                className={`h-[40px] flex items-center justify-center flex-shrink-0 shadow-md transition
                  ${isMobile ? "w-[36px] h-[36px] rounded-full p-0" : "px-2 sm:px-3 py-2 rounded-full gap-1"}
                  ${useWeb ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white" : "bg-muted text-muted-foreground"}
                `}
              >
                <Globe className="h-4 w-4" />
                {!isMobile && <span className="hidden sm:inline">オンライン情報</span>}
              </button>


              <button
                onClick={(e) => {
                  e.preventDefault();
                  setUseDb(!useDb);
                }}
                className={`h-[40px] flex items-center justify-center flex-shrink-0 shadow-md transition
                  ${isMobile ? "w-[36px] h-[36px] rounded-full p-0" : "px-2 sm:px-3 py-2 rounded-full gap-1"}
                  ${useDb ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white" : "bg-muted text-muted-foreground"}
                `}
              >
                <Database className="h-4 w-4" />
                {!isMobile && <span className="hidden sm:inline">内部データ</span>}
              </button>

                        </div>
                      <div className="relative flex-shrink-0 mr-[32px] z-30">
                        <PromptPicker onSelect={handlePromptSelect} />
                      </div>



                      </div>
                    </div>
                  )}

      <div className="flex gap-1.5 sm:gap-2">
        <div className="flex-shrink-0">
          <VoiceRecorder 
            onRecordingComplete={handleVoiceRecording} 
            isProcessing={isProcessingVoice}
          />
        </div>

        <div className="relative flex-1 min-w-0">
          <TextareaAutosize
            ref={textareaRef}
            autoFocus
            value={localInput}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalInput(newValue);         // Immediate UI feedback
              debouncedSetInput(newValue);     // Debounced sync to parent
            }}
            placeholder="メッセージを書いてね！"
            className="px-3 py-2 focus:ring-2 focus:ring-pink-100 text-xs sm:text-sm min-h-[40px] max-h-[200px] resize-none w-full border rounded-lg"
            minRows={1}
            maxRows={6}
            onKeyDown={handleKeyDown}
            spellCheck={false} // Disable spell checking for better performance
            autoComplete="off" // Disable browser autocomplete
            autoCorrect="off" // Disable autocorrect
          />
        </div>

        <motion.button
          type="submit"
          disabled={sendDisabled}
          className={`h-[40px] flex items-center justify-center flex-shrink-0 shadow-md transition
            ${isMobile ? "w-[36px] h-[36px] rounded-full p-0" : "px-2 sm:px-3 py-2 rounded-full gap-1"}
            ${sendDisabled 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "bg-gradient-to-r from-pink-400 to-pink-500 text-white"
            }`}
          whileHover={!sendDisabled ? { scale: 1.05 } : {}}
          whileTap={!sendDisabled ? { scale: 0.95 } : {}}
        >
          <Send className="h-4 w-4" />
          {!isMobile && <span className="text-xs hidden sm:inline">送信</span>}
        </motion.button>


      </div>
        <button
          type="button"
          onClick={() => setShowOptions((prev) => !prev)}
          className="absolute right-2 bottom-[60px] z-20 bg-white border border-gray-300 p-1.5 rounded-full shadow-md transition-transform duration-200 hover:bg-gray-100"
          aria-label="Toggle options"
        >
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
              showOptions ? "rotate-0" : "rotate-180"
            }`}
          />
        </button>

    </form>
  );
});

export default ChatInput;