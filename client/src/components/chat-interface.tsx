import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Check, Sparkles, Heart, Star, Music } from "lucide-react";
import { Message } from "@shared/schema";
import { nanoid } from "nanoid";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ChatMessage from "./chat-message";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import FloatingMascot from "./floating-mascot";
import ChatLoadingIndicator, { SakuraPetalLoading } from "./chat-loading-indicator";
import { motion, AnimatePresence } from "framer-motion";

const CHAT_SESSION_KEY_PREFIX = "chat_session_id_user_";
const TUTORIAL_SHOWN_KEY_PREFIX = "tutorial_shown_user_";

// Array of cute emoji mood indicators for the network status
const onlineEmojis = ["🌸", "✨", "💮", "🌟", "🎀"];
const offlineEmojis = ["😴", "💤", "🥱", "🌙", "☁️"];

// Helper to get random emoji
const getRandomEmoji = (emojiArray: string[]) => {
  return emojiArray[Math.floor(Math.random() * emojiArray.length)];
};

const NetworkStatus = ({ isOnline }: { isOnline: boolean }) => {
  const [emoji, setEmoji] = useState(isOnline ? getRandomEmoji(onlineEmojis) : getRandomEmoji(offlineEmojis));
  
  // Change emoji periodically for fun
  useEffect(() => {
    const interval = setInterval(() => {
      setEmoji(isOnline ? getRandomEmoji(onlineEmojis) : getRandomEmoji(offlineEmojis));
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isOnline]);
  
  return (
    <motion.div 
      className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg z-50 text-[10px] sm:text-xs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.span 
        className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
        animate={isOnline ? { 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7] 
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.span 
        className="text-muted-foreground"
        animate={{ y: [0, -1, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      >
        {emoji} {isOnline ? "オンライン" : "オフライン"}
      </motion.span>
    </motion.div>
  );
};

const Tutorial = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const steps = [
    {
      title: "ようこそ！",
      description: "桜AIへようこそ！私があなたのチャット相手です♪",
      icon: <Sparkles className="h-5 w-5 text-pink-400" />
    },
    {
      title: "メッセージを送ってみよう！",
      description: "下のテキストボックスにメッセージを入力して、送信ボタンを押してね！",
      icon: <Send className="h-5 w-5 text-blue-400" />
    },
    {
      title: "楽しくお話ししましょう！",
      description: "私が返事をするのを待っている間は、かわいい待機アニメーションが表示されるよ♪",
      icon: <Heart className="h-5 w-5 text-red-400" />
    }
  ];
  
  return (
    <motion.div 
      className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Card className="w-[80%] max-w-md p-6 space-y-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            >
              {steps[step - 1].icon}
            </motion.div>
            <h3 className="text-lg font-semibold">{steps[step - 1].title}</h3>
          </div>
          <p className="text-muted-foreground">{steps[step - 1].description}</p>
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx + 1 === step ? "bg-primary" : "bg-muted"
                  }`}
                  animate={idx + 1 === step ? {
                    scale: [1, 1.3, 1],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ))}
            </div>
            <Button
              onClick={() => {
                if (step < steps.length) {
                  setStep(step + 1);
                } else {
                  onClose();
                }
              }}
            >
              {step < steps.length ? "次へ" : "始めましょう！"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// Buttons that appear when hovering over the input field
const EmotionButtons = ({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) => {
  const emotions = [
    "「外部情報なし」🚫", "「最高の結果を出す指示は？」🎯", "「AさんとBさんの会話形式で。」💬","❤️", "😊", "🎉", "✨", "🌸", "😂", "🥰", "👍", "🔥", "🎂", "💖", "😎", "👏", "🌿", "💡", "🚀"
  ];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".emoji-picker")) {
        onClose(); // Close the emoji picker
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <motion.div 
      className="absolute bottom-full left-0 mb-2 w-full bg-white/90 backdrop-blur-sm px-2 py-2 rounded-xl border shadow-sm z-10 
                 flex flex-wrap gap-2 max-w-full max-h-40 overflow-y-auto emoji-picker"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Close Button (optional) */}
      <button 
        className="absolute top-1 right-2 text-gray-500 hover:text-red-500"
        onClick={onClose}
      >
        ✖
      </button>

      {emotions.map((emoji, index) => (
        <motion.button
          key={index}
          type="button"
          onClick={() => {
            onSelect(emoji);
            onClose(); // Close after selecting an emoji
          }}
          className="px-3 py-2 sm:px-4 sm:py-2 text-base sm:text-lg flex items-center justify-center rounded-full 
                     hover:bg-pink-50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
};




export default function ChatInterface() {
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showEmotions, setShowEmotions] = useState(false);
  const [confetti, setConfetti] = useState(false);
  
  // Handle tutorial display
  useEffect(() => {
    if (!user) return;
    const tutorialShownKey = `${TUTORIAL_SHOWN_KEY_PREFIX}${user.id}`;
    const tutorialShown = localStorage.getItem(tutorialShownKey);
    if (!tutorialShown) {
      setShowTutorial(true);
    }
  }, [user]);
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleCloseTutorial = () => {
    if (!user) return;
    const tutorialShownKey = `${TUTORIAL_SHOWN_KEY_PREFIX}${user.id}`;
    setShowTutorial(false);
    localStorage.setItem(tutorialShownKey, 'true');
  };

  const [sessionId, setSessionId] = useState<string>(() => {
    if (!user) return "";

    const storageKey = `${CHAT_SESSION_KEY_PREFIX}${user.id}`;
    const savedSessionId = localStorage.getItem(storageKey);
    if (savedSessionId) return savedSessionId;

    const newSessionId = nanoid();
    localStorage.setItem(storageKey, newSessionId);
    return newSessionId;
  });

  useEffect(() => {
    if (!user) return;

    const storageKey = `${CHAT_SESSION_KEY_PREFIX}${user.id}`;
    const savedSessionId = localStorage.getItem(storageKey);

    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newSessionId = nanoid();
      localStorage.setItem(storageKey, newSessionId);
      setSessionId(newSessionId);
    }
  }, [user]);

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${sessionId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("メッセージを取ってこられなかったよ...ごめんね！");
      return res.json();
    },
    enabled: !!user && !!sessionId,
  });
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        content,
        sessionId,
        isBot: false,
      });
      return res.json();
    },
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/messages", sessionId] });
  
      const previousMessages = queryClient.getQueryData<Message[]>(["/api/messages", sessionId]) || [];
  
      // Use a temporary ID for optimistic updates
      const optimisticUserMessage: Message = {
        id: Date.now(), // Using timestamp as a temporary numeric ID
        userId: user?.id || 0, // Default to 0 if user id is not available
        content,
        timestamp: new Date(),
        isBot: false,
        sessionId
      };
  
      queryClient.setQueryData<Message[]>(["/api/messages", sessionId], [
        ...previousMessages,
        optimisticUserMessage,
      ]);
  
      return { previousMessages };
    },
    onSuccess: (newBotMessage: Message) => {
      queryClient.setQueryData<Message[]>(["/api/messages", sessionId], (old) => [
        ...(old || []),
        newBotMessage,
      ]);
      toast({
        title: "メッセージ送信したよ！",
        description: (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" /> メッセージ届いたよ！ありがとう♡
          </div>
        ),
        duration: 2000,
      });
      
      // Show celebration confetti occasionally
      if (Math.random() > 0.7) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
      }
    },
    onError: (_, __, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["/api/messages", sessionId], context.previousMessages);
      }
      toast({
        title: "送信エラー",
        description: "メッセージが送れなかったよ...もう一度試してみてね！",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;
  
    const message = input;
    setInput("");
    setShowEmotions(false);
    sendMessage.mutate(message); 
  };
  
  const handleEmotionSelect = (emoji: string) => {
    setInput(prev => prev + " " + emoji);
  };

  if (isLoadingMessages) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <SakuraPetalLoading />
        <p className="text-sm text-muted-foreground animate-pulse">チャット履歴をお届け中...ちょっと待っててね！</p>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] relative overflow-hidden">
      {/* Celebration confetti animation */}
      <AnimatePresence>
        {confetti && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  top: "-10%", 
                  left: `${Math.random() * 100}%`,
                  opacity: 1,
                  rotate: 0,
                  scale: 0.5 + Math.random() * 1
                }}
                animate={{ 
                  top: "110%", 
                  left: `${Math.random() * 100}%`,
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 360,
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 2 + Math.random() * 3,
                  ease: "easeOut"
                }}
              >
                {Math.random() > 0.3 ? 
                  "🌸" : 
                  ["✨", "💮", "🎀", "🌟", "💕"][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
      </AnimatePresence>
      
      <NetworkStatus isOnline={isOnline} />
      
      <ScrollArea className="flex-1 px-1 sm:px-4 py-3 w-full" ref={scrollAreaRef}>
        <div className="space-y-4 w-full max-w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="h-10 w-10 text-pink-300 mb-3" />
                <h3 className="text-lg font-medium mb-2">会話を始めましょう！</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm sm:text-base">
                  下のテキストボックスにメッセージを入力して、桜AIとおしゃべりしてみてね♪
                </p>
              </motion.div>
            </div>
          ) : (
            messages.map((message) => (
              <div className="w-full max-w-full" key={message.id}>
                <ChatMessage message={message} />
              </div>
            ))
          )}
          
          {sendMessage.isPending && (
            <div className="flex justify-center pt-2 pb-4">
              <ChatLoadingIndicator 
                variant="character" 
                message="桜AIが一生懸命考えてるよ...！" 
              />
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t flex flex-col gap-2 relative">
  {/* Emoji Picker Positioned Above Input */}
  <AnimatePresence>
    {showEmotions && (
      <div className="absolute bottom-full left-0 w-full flex justify-center">
        <EmotionButtons onSelect={handleEmotionSelect} onClose={() => setShowEmotions(false)} />
      </div>
    )}
  </AnimatePresence>

  <div className="flex gap-2">
    {/* Input Field */}
    <div className="relative flex-1 min-w-0">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="メッセージを書いてね！"
        className="pr-10 focus:ring-2 focus:ring-pink-100 text-sm sm:text-base"
      />
      <motion.button
        type="button"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
        whileHover={{ scale: 1.2, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowEmotions(prev => !prev)} // Toggle emoji picker
      >
        <Star className="h-4 w-4" />
      </motion.button>
    </div>

    {/* Send Button */}
    <motion.button
      type="submit"
      disabled={sendMessage.isPending}
      className="px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md flex items-center gap-1 disabled:opacity-70 flex-shrink-0"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Send className="h-4 w-4" />
      <span className="text-xs hidden sm:inline">送信</span>
      {/* Send button decorations */}
      <motion.span
            className="absolute -top-1 -right-1 text-xs"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✨
          </motion.span>
    </motion.button>
  </div>
</form>


      
      <FloatingMascot />
    </Card>
  );
}