import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Character animations and expressions for the loading indicator
const characterVariants = {
  thinking: {
    rotate: [0, 5, 0, -5, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  typing: {
    x: [0, -3, 0, 3, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const thinkingExpressions = [
  "🤔",
  "🧐",
  "💭",
  "💫",
  "🪄",
  "✨"
];

const thinkingMessages = [
  "考え中...",
  "ちょっと待ってね...",
  "いい返事を考えてるよ...",
  "言葉を選んでるところ...",
  "魔法をかけてるよ...",
];

type ChatLoadingIndicatorProps = {
  variant?: "minimal" | "character" | "dots";
  message?: string;
};

export function ChatLoadingIndicator({
  variant = "character",
  message,
}: ChatLoadingIndicatorProps) {
  const [expression, setExpression] = useState(thinkingExpressions[0]);
  const [thinkingMessage, setThinkingMessage] = useState(thinkingMessages[0]);
  
  // Periodically change the expressions for more dynamic animation
  useEffect(() => {
    const expressionInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * thinkingExpressions.length);
      setExpression(thinkingExpressions[randomIndex]);
    }, 2000);
    
    const messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * thinkingMessages.length);
      setThinkingMessage(thinkingMessages[randomIndex]);
    }, 3000);
    
    return () => {
      clearInterval(expressionInterval);
      clearInterval(messageInterval);
    };
  }, []);
  
  // Minimal dot animation (existing animation style)
  if (variant === "dots") {
    return (
      <div className="flex items-center gap-1 text-primary">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    );
  }
  
  // Character-based loading animation
  if (variant === "character") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex items-center gap-3">
          {/* Animated character */}
          <motion.div
            className="bg-pink-100 text-2xl p-3 rounded-full border-2 border-pink-200 shadow-md"
            variants={characterVariants}
            animate="thinking"
          >
            {expression}
          </motion.div>
          
          {/* Speech bubble with animated dots */}
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm relative flex items-center">
            <span className="text-gray-600 mr-2">{message || thinkingMessage}</span>
            <div className="flex items-center gap-1">
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-pink-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }} 
              />
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-pink-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} 
              />
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-pink-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} 
              />
            </div>
            
            {/* Speech bubble tail */}
            <div className="absolute left-[-6px] top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-gray-200 rotate-45" />
          </div>
        </div>
      </div>
    );
  }
  
  // Minimal loading indicator (fallback)
  return (
    <div className="flex items-center justify-center p-2">
      <motion.div
        className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {message && <span className="ml-2 text-sm text-muted-foreground">{message}</span>}
    </div>
  );
}

// Sakura petal animation for more decorative loading
export function SakuraPetalLoading() {
  return (
    <div className="relative h-20 w-full overflow-hidden flex items-center justify-center">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute text-lg"
          initial={{ 
            y: -20, 
            x: Math.random() * 100 - 50,
            opacity: 0,
            rotate: 0,
            scale: 0.5
          }}
          animate={{ 
            y: 100, 
            x: Math.random() * 100 - 50,
            opacity: [0, 1, 0],
            rotate: 360,
            scale: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            repeat: Infinity, 
            delay: index * 0.4,
            ease: "easeInOut" 
          }}
        >
          🌸
        </motion.div>
      ))}
      <div className="z-10 bg-background/60 backdrop-blur-sm px-4 py-1 rounded-full shadow-sm">
        <span className="text-sm text-primary font-medium">Loading...</span>
      </div>
    </div>
  );
}

// Export both components for flexibility
export default ChatLoadingIndicator;