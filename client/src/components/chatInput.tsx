import { memo, useCallback, useRef, useEffect, useState } from "react";
import {
  Send,
  User,
  Building,
  Landmark,
  Globe,
  Database,
  ChevronDown,
  Check,
} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { AnimatePresence, motion } from "framer-motion";
import VoiceRecorder from "./voice-recorder";
import PromptPicker from "./prompt-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPortal } from "react-dom";
import DbButton from "@/components/dbbutton";
import { useRecoilState, useSetRecoilState } from "recoil";
import { chatInputState } from "@/state/chatInputState";

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

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
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
  selectedDb,
  setSelectedDb,
}: {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (
    e: React.FormEvent,
    category: MessageCategory,
    useWeb: boolean,
    useDb: boolean,
    selectedDb: string,
  ) => void;
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
  selectedDb: string;
  setSelectedDb: React.Dispatch<React.SetStateAction<string>>;
}) {
  // Category selection state
  const [category, setCategory] = useState<MessageCategory>("SELF");

  const [isDbDropdownOpen, setIsDbDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dbButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDbDropdownOpen(false);
      }
    }

    if (isDbDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDbDropdownOpen]);

  const [localInput, setLocalInput] = useRecoilState(chatInputState);



  const debouncedSetInput = useDebounce((value: string) => {
    setInput(value);
  }, 100); // 50-150ms is smooth and responsive

  // Local input state for smoother typing experience
  const localInputRef = useRef<string>(input);

  // Wrap the original submit handler to include the category
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Ensure default behavior is prevented
    originalHandleSubmit(e, category, useWeb, useDb, selectedDb);
    setInput(""); // Reset parent input
    localInputRef.current = ""; // Reset local input ref
  };

  // Update local ref when parent input changes
  useEffect(() => {
    localInputRef.current = input;
  }, [input]);

  // Handle Enter key for submission - optimize deps array
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        if (!isMobile) {
          e.preventDefault();
          const currentInput = textareaRef.current?.value || "";
          if (currentInput.trim() && !sendDisabled) {
            const formEvent = new Event("submit", {
              cancelable: true,
            }) as unknown as React.FormEvent;
            handleSubmit(formEvent);
          }
        }
      }
    },
    [isMobile, handleSubmit, sendDisabled, textareaRef],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      localInputRef.current = v;
      setLocalInput(v);
      debouncedSetInput(v);
    },
    [debouncedSetInput, setLocalInput],
  );

  // Handle immediate input change for better responsiveness
  // const handleInputChange = useCallback(
  //   (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //     const newValue = e.target.value;
  //     localInputRef.current = newValue; // Update local ref immediately
  //     setInput(newValue); // Update parent state in a debounced way
  //   },
  //   [debouncedSetInput],
  // );

  const [showOptions, setShowOptions] = useState(true);


  return (
    <form
      onSubmit={handleSubmit}
      className=" relative p-2 md:p-4 space-y-2 md:space-y-5 border-t flex flex-col "
    >
      <AnimatePresence initial={false}>
        {showOptions && (
          <motion.div
            key="options-toggle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.125 }}
            className={`pt-2`}
          >
            <div className={`  `}>
              <div className="flex flex-row  items-center justify-between">
                {/* Category selection toggle group */}
                <div className={`flex  `}>
                  <TooltipProvider>
                    <ToggleGroup
                      id="user-type-select"
                      type="single"
                      value={category}
                      onValueChange={(value) => {
                        if (value) setCategory(value as MessageCategory);
                      }}
                      className="flex border rounded-full  bg-gray-50 shadow-md"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value="SELF"
                            aria-label="個人"
                            className={`rounded-full border border-transparent space-x-1 flex items-center justify-center ${category === "SELF"
                              ? "bg-pink-300 border-pink-500"
                              : "hover:bg-pink-50 "
                              }`}
                          >
                            <User
                              size={12}
                              className={
                                category === "SELF"
                                  ? "text-pink-500"
                                  : "text-gray-600"
                              }
                            />
                            <span className="hidden md:block">自分</span>
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
                            className={`border border-transparent rounded-full space-x-1 flex items-center justify-center  ${category === "PRIVATE"
                              ? "bg-green-300 border-green-500"
                              : "hover:bg-green-100 "
                              }`}
                          >
                            <Building
                              size={12}
                              className={
                                category === "PRIVATE"
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }
                            />
                            <span className="hidden md:block">民間</span>
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
                            className={`border border-transparent rounded-full space-x-1 flex items-center justify-center ${category === "ADMINISTRATIVE"
                              ? "bg-blue-300 border-blue-500"
                              : "hover:bg-blue-50"
                              }`}
                          >
                            <Landmark
                              size={12}
                              className={
                                category === "ADMINISTRATIVE"
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }
                            />
                            <span className="hidden md:block">行政</span>
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="text-xs">行政機関としてメッセージを送信</p>
                        </TooltipContent>
                      </Tooltip>
                    </ToggleGroup>
                  </TooltipProvider>
                </div>

                <div className="flex items-center justify-between space-x-1.5 md:justify-center sm:space-x-2 md:space-x-4">
                  <button
                    id="search-internet-button"
                    onClick={(e) => {
                      e.preventDefault();
                      setUseWeb(!useWeb);
                    }}
                    className={`h-[40px] flex items-center justify-center flex-shrink-0 shadow-md transition
                            ${isMobile ? "w-[36px] h-[36px] rounded-full px-2" : "px-2 sm:px-3 py-2 rounded-full gap-1"}
                            ${useWeb
                        ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white border border-pink-500"
                        : "bg-muted text-muted-foreground border border-gray-300"
                      }
                            hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300
                          `}
                  >
                    <Globe className="h-4 w-4" />
                    {!isMobile && useWeb && (
                      <span className="hidden sm:inline">オンライン情報</span>
                    )}
                  </button>

                  <DbButton
                    useDb={useDb}
                    setUseDb={setUseDb}
                    selectedDb={selectedDb}
                    setSelectedDb={setSelectedDb}
                  />

                  <PromptPicker onSelect={handlePromptSelect} />
                </div>
                {" "}
              </div>
            </div>
          </motion.div>

        )}
      </AnimatePresence>


      <div className={`flex items-center justify-between space-x-2 ${!showOptions ? "pt-2" : ""} `}>
        <div className="flex-shrink-0 ">
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            isProcessing={isProcessingVoice}
          />
        </div>

        <div className="flex items-center justify-center flex-1">
          <TextareaAutosize
            id="chat-input"
            ref={textareaRef}
            autoFocus
            value={localInput}
            onChange={handleInputChange}
            placeholder="メッセージを書いてね！"
            className="px-3 py-2 focus:ring-2 focus:ring-pink-100 text-xs sm:text-sm min-h-[40px] max-h-[200px] resize-none w-full border rounded-lg"
            minRows={1}
            maxRows={7}
            onKeyDown={handleKeyDown}
            spellCheck={false} // Disable spell checking for better performance
            autoComplete="off" // Disable browser autocomplete
            autoCorrect="off" // Disable autocorrect
          />
        </div>

        <motion.button
          id="send-button"
          type="submit"
          disabled={sendDisabled}
          className={`flex items-center justify-center space-x-1 rounded-full p-3 
            ${isMobile ? "rounded-full " : "space-x-1 p-2"}
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
        className="absolute -top-5 md:-top-9 left-0 mx-auto right-0 z-20 w-fit bg-white border border-gray-300 p-1.5 rounded-full shadow-md transition-transform duration-200 hover:bg-gray-100"
        aria-label="Toggle options"
      >
        <ChevronDown
          className={`h-2 w-2 sm:w-5 sm:h-5 text-gray-600 transition-transform duration-300 ${showOptions ? "rotate-0" : "rotate-180"
            }`}
        />
      </button>

    </form>
  );
});

export default ChatInput;