import { Message } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui/avatar";
import { Card } from "./ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Cute decorative elements to randomly add to bot messages
const botDecorations = [
  "🌸", "✨", "💮", "💕", "🎀", "🌟", "⭐", "🌷", "🌹", "🌈"
];

// Helper function to add decorations to bot messages
const addRandomDecoration = (original: string) => {
  // Only add decorations ~30% of the time to avoid being too noisy
  if (Math.random() > 0.3) return original;
  
  const decoration = botDecorations[Math.floor(Math.random() * botDecorations.length)];
  // Add decoration at start, end, or both
  const position = Math.floor(Math.random() * 3);
  
  if (position === 0) return `${decoration} ${original}`;
  if (position === 1) return `${original} ${decoration}`;
  return `${decoration} ${original} ${decoration}`;
};

export default function ChatMessage({ message }: { message: Message }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ x: 0, y: 0 });
  const [decoration, setDecoration] = useState<string | null>(null);

  useEffect(() => {
    if (message.isBot && Math.random() > 0.7) {
      setDecoration(botDecorations[Math.floor(Math.random() * botDecorations.length)]);
    }
  }, [message.isBot]);

  const handleBotMessageHover = () => {
    if (message.isBot) {
      setShowEmoji(true);
      setEmojiPosition({
        x: Math.random() * 40 - 20,
        y: -20 - Math.random() * 20,
      });
      setTimeout(() => setShowEmoji(false), 1000);
    }
  };

  return (
    <div 
      className={cn("flex w-full my-4", { 
        "justify-end": !message.isBot,  // User messages align to the right
        "justify-start": message.isBot  // Bot messages align to the left
      })}
    >
      {/* Bot Avatar (User avatar is removed for cleaner UI) */}
      {message.isBot && (
        <Avatar className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 border border-pink-300 shadow-md">
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ rotate: { duration: 0.5 } }}
          >
            <img
              src="/images/sava.jpg"
              alt="Sakura AI"
              className="w-full h-full object-cover rounded-full border-2 border-pink-400 shadow-md"
            />
          </motion.div>
        </Avatar>
      )}

      {/* Chat Message Card (Properly aligned) */}
      <motion.div
        initial={message.isBot ? { x: -10, opacity: 0 } : { x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={message.isBot ? { scale: 1.02 } : { scale: 1 }}
        onHoverStart={handleBotMessageHover}
        className={cn("max-w-[85%] sm:max-w-[75%] rounded-xl", {
          "ml-auto self-end": !message.isBot,  // User messages to the right
          "mr-auto self-start": message.isBot  // Bot messages to the left
        })}
      >
        <Card
          className={cn(
            "px-2 py-1.5 sm:px-4 sm:py-3 text-sm sm:text-base",
            {
              "bg-[#FFB7C5] text-black border border-[#FF98A5] shadow-md": !message.isBot,
              "bg-gradient-to-br from-white to-pink-50 text-black border border-pink-100 shadow-md": message.isBot,
            }
          )}
        >
          <div className="prose prose-xs sm:prose-sm break-words font-medium w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto w-full">
                    <table className="text-[11px] sm:text-sm border-collapse w-full min-w-[400px]" {...props} />
                  </div>
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-pink-200 px-1 py-0.5 sm:px-2 sm:py-1" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="border border-pink-300 bg-pink-50 px-1 py-0.5 sm:px-2 sm:py-1" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {message.timestamp && (
            <div className="text-[9px] sm:text-[10px] text-gray-400 mt-1 text-right">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
