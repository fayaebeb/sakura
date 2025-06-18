import { useState, useEffect } from "react";
import { Lightbulb, MessageSquare, Wand2, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Prompt {
  text: string;
  message?: string;
  description: string;
}

interface PromptCategory {
  name: string;
  icon: JSX.Element;
  prompts: Prompt[];
}

interface PromptPickerProps {
  onSelect: (message: string) => void;
}

export default function PromptPicker({ onSelect }: PromptPickerProps) {
  const [showPrompts, setShowPrompts] = useState(false);

  const promptCategories: PromptCategory[] = [
    {
      name: "出力形式",
      icon: <MessageSquare className="h-4 w-4" />,
      prompts: [
        {
          text: "会話形式で💬",
          message: "AさんとBさんの会話形式で出力して",
          description: "フレンドリーな会話形式で回答します",
        },
        {
          text: "箇条書き形式で📝",
          message: "箇条書き形式で出力して",
          description: "箇条書き形式で出力します",
        },
        {
          text: "表形式で📊",
          message: "表形式で出力して",
          description: "表形式で出力します",
        },
        {
          text: "FAQ形式で❓",
          message: "FAQ形式で出力して",
          description: "FAQ形式で出力します",
        },
        {
          text: "比喩・たとえ話形式🎭",
          message: "比喩・たとえ話形式で出力して",
          description: "比喩・たとえ話形式で出力します",
        },
        {
          text: "簡潔に要約✨",
          message: "簡潔に要約で出力して",
          description: "簡潔に要約で出力します",
        },
      ],
    },
    {
      name: "アシスタント",
      icon: <Wand2 className="h-4 w-4" />,
      prompts: [
        {
          text: "＋指示のコツ🎯",
          message:
            "質問に対してさらに理解を深めるために、どのような指示をすればよいか提案して",
          description: "より良い指示の出し方をアドバイスします",
        },
        {
          text: "初心者向け📘",
          message:
            "説明に出てくる専門用語には、それぞれ説明を加え、初心者でも理解しやすいように。具体的な例を挙げながら丁寧に解説して",
          description: "具体的な例を挙げながら丁寧に解説します",
        },
      ],
    },
    {
      name: "感情表現",
      icon: <Heart className="h-4 w-4" />,
      prompts: [
        { text: "❤️", description: "優しく温かい雰囲気で" },
        { text: "😊", description: "フレンドリーな雰囲気で" },
        { text: "✨", description: "明るく元気な雰囲気で" },
        { text: "🌸", description: "華やかで優雅な雰囲気で" },
      ],
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      if (
        !targetElement.closest(".prompt-picker") &&
        !targetElement.closest(".prompt-picker-button")
      ) {
        setShowPrompts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePromptSelect = (text: string) => {
    onSelect(text);
    setShowPrompts(false);
  };

  return (
    <div id="suggestions-button" className="relative prompt-picker">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              type="button"
              className="flex items-center justify-center h-[40px] w-[40px] rounded-full bg-white text-pink-500 border border-pink-200 hover:bg-pink-50 transition-colors shadow-md prompt-picker-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPrompts(!showPrompts)}
            >
              <Lightbulb className="h-5 w-5" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>プロンプトを選択</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {showPrompts && (
          <motion.div
            className="fixed sm:absolute bottom-[140px] sm:bottom-full sm:mb-2 left-2 sm:right-0 sm:left-auto translate-x-0 sm:translate-x-0 z-50 w-[min(95vw,480px)] max-h-[80vh] overflow-y-auto bg-white/90 backdrop-blur-sm px-3 py-3 rounded-xl border shadow-lg prompt-picker-dropdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                プロンプトを選択
              </h3>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPrompts(false)}
              >
                ✖
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {promptCategories.map((category, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {category.icon}
                    <span>{category.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.prompts.map((prompt, promptIdx) => (
                      <TooltipProvider key={promptIdx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.button
                              type="button"
                              onClick={() =>
                                handlePromptSelect(
                                  prompt.message ? prompt.message : prompt.text,
                                )
                              }
                              className="px-2 py-1.5 text-xs sm:text-sm bg-background hover:bg-accent rounded-full transition-colors border border-input hover:border-accent-foreground/20 flex items-center gap-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {prompt.text}
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{prompt.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}