import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Heart, Wand2, MessageSquare, } from "lucide-react";
import { Message } from "@shared/schema";
import { nanoid } from "nanoid";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ChatMessage from "./chat-message";
import ChatInput from "./chatInput";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import FloatingMascot from "./floating-mascot";
import ChatLoadingIndicator, { SakuraPetalLoading } from "./chat-loading-indicator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const onlineEmojis = ["🌸", "✨", "💮", "🌟", "🎀"];
const offlineEmojis = ["😴", "💤", "🥱", "🌙", "☁️"];

// Helper to get random emoji
const getRandomEmoji = (emojiArray: string[]) => {
  return emojiArray[Math.floor(Math.random() * emojiArray.length)];
};

// Audio player for bot responses
const AudioPlayer = ({ audioUrl, isPlaying, onPlayComplete }: { audioUrl: string, isPlaying: boolean, onPlayComplete: () => void }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error("Audio playback error:", err));
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isPlaying]);

  return (
    <audio 
      ref={audioRef} 
      src={audioUrl} 
      onEnded={onPlayComplete}
      className="hidden"
    />
  );
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
      description: "「桜AI」は、PCKKにおいて、情報提供や質問への回答を行うAIです。私の役割は、さまざまなトピックについて正確で分かりやすい情報を提供し、ユーザーのリクエストに的確にお応えすることです。たとえば、データに基づくご質問には、社内資料や外部情報を参照しながら丁寧にお答えします。",
      icon: <Sparkles className="h-5 w-5 text-pink-400" />
    },
    {
      title: "楽しくお話ししましょう！",
      description: "「桜AI」は、OpenAIの生成モデル「ChatGPT-4o」を使用しています。社内の全国うごき統計に関する営業資料や、人流に関する社内ミニ講座の内容を基礎データとして取り込み、さらにWikipediaやGoogleのAPIを通じてインターネット上の情報も収集しています。これらの情報をもとに、最適な回答を生成しています。",
      icon: <Heart className="h-5 w-5 text-red-400" />
    },
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
                  className={`w-2 h-2 rounded-full ${idx + 1 === step ? "bg-primary" : "bg-muted"}`}
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
              {step < steps.length ? "次へ" : "さあ、始めましょう！！"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

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

    interface EmotionButtonsProps {
      onSelect: (message: string) => void;
      onClose: () => void;
    }

    const EmotionButtons: React.FC<EmotionButtonsProps> = ({ onSelect, onClose }) => {
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
                  message: "質問に対してさらに理解を深めるために、どのような指示をすればよいか提案して",
                  description: "より良い指示の出し方をアドバイスします",
                },
                {
                  text: "「外部情報なし」🚫",
                  message: "インターネットからの情報を利用しないで",
                  description: "外部情報を使わずに回答します",
                },
                {
                  text: "初心者向け📘",
                  message: "説明に出てくる専門用語には、それぞれ説明を加え、初心者でも理解しやすいように。具体的な例を挙げながら丁寧に解説して",
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
      ]
    }
  ];

  // Handle close button click
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    onClose();
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".emoji-picker")) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <motion.div
      className="absolute bottom-full left-0 mb-2 w-full bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl border shadow-lg z-10 emoji-picker"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">プロンプトを選択</h3>
        <button
          type="button" // Explicitly set button type to prevent form submission
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleClose}
        >
          ✖
        </button>
      </div>

<div className="space-y-4">
  {promptCategories.map((category, idx) => (
    <div key={idx} className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {category.icon}
        <span>{category.name}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {category.prompts.map((prompt, promptIdx) => (
          <TooltipProvider key={promptIdx}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  onClick={() => {
                    // Use prompt.message if available, otherwise fallback to prompt.text
                    onSelect(prompt.message ? prompt.message : prompt.text);
                    onClose();
                  }}
                  className="px-3 py-2 text-sm bg-background hover:bg-accent rounded-full transition-colors border border-input hover:border-accent-foreground/20 flex items-center gap-1"
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
);
};

const CHAT_SESSION_KEY_PREFIX = "chat_session_id_user_";
const TUTORIAL_SHOWN_KEY_PREFIX = "tutorial_shown_user_";

const ChatInterface = () => {
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showTutorial, setShowTutorial] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showEmotions, setShowEmotions] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);


  // Detect mobile devices
  const isMobile = typeof navigator !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => { 
    if (!showTutorial && !showEmotions) { 
      textareaRef.current?.focus(); 
    } 
  }, [showTutorial, showEmotions]);

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
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleCloseTutorial = () => {
    if (!user) return;
    const tutorialShownKey = `${TUTORIAL_SHOWN_KEY_PREFIX}${user.id}`;
    setShowTutorial(false);
    localStorage.setItem(tutorialShownKey, "true");
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
        sessionId,
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
  const handleVoiceRecording = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const { transcribedText } = await res.json();
      setTimeout(() => setInput(transcribedText), 50);

      toast({
        title: "音声認識成功",
        description: "テキストに変換されました！",
        duration: 3000,
      });
    } catch {
      toast({
        title: "音声処理エラー",
        description: "認識できませんでした。もう一度試してね！",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const playMessageAudio = async (messageId: number, text: string) => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      setCurrentAudioUrl(null);
      setPlayingMessageId(null);
      return;
    }

    try {
      setIsPlayingAudio(true);
      setPlayingMessageId(messageId);

      const res = await fetch('/api/voice/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error();

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);
    } catch (error) {
      toast({
        title: "音声生成エラー",
        description: "音声を生成できませんでした。",
        variant: "destructive",
      });
      setIsPlayingAudio(false);
      setPlayingMessageId(null);
    }
  };
  
  // Handle audio playback completion
  const handlePlaybackComplete = () => {
    setIsPlayingAudio(false);
    setPlayingMessageId(null);
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const message = input;
    setInput("");
    setShowEmotions(false);
    sendMessage.mutate(message);
  };

  const handleEmotionSelect = (emoji: string) => {
    setInput((prev) => prev + " " + emoji);
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
                  scale: 0.5 + Math.random() * 1,
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
                  ease: "easeOut",
                }}
              >
                {Math.random() > 0.3
                  ? "🌸"
                  : ["✨", "💮", "🎀", "🌟", "💕"][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
      </AnimatePresence>

      <NetworkStatus isOnline={isOnline} />
      {currentAudioUrl && (
        <AudioPlayer 
          audioUrl={currentAudioUrl} 
          isPlaying={isPlayingAudio} 
          onPlayComplete={handlePlaybackComplete} 
        />
      )}


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
              <div className="w-full max-w-full group" key={message.id}>
                <ChatMessage 
                  message={message}
                  isPlayingAudio={isPlayingAudio}
                  playingMessageId={playingMessageId}
                  onPlayAudio={playMessageAudio}
                />
                
              </div>
            ))
          )}

          {sendMessage.isPending && (
            <div className="flex justify-center pt-2 pb-4">
              <ChatLoadingIndicator variant="character" message="桜AIが一生懸命考えてるよ...！" />
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>

      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        handleVoiceRecording={handleVoiceRecording}
        isProcessing={isProcessingVoice || sendMessage.isPending}
        sendDisabled={sendMessage.isPending}
        showEmotions={showEmotions}
        setShowEmotions={setShowEmotions}
        isMobile={isMobile}
        textareaRef={textareaRef}
      />


      <FloatingMascot />
    </Card>
  );
};

export default ChatInterface;