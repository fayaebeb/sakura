import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Check, Sparkles, Heart } from "lucide-react";
import { Message } from "@shared/schema";
import { nanoid } from "nanoid";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ChatMessage from "./chat-message";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import FloatingMascot from "./floating-mascot";

const CHAT_SESSION_KEY_PREFIX = "chat_session_id_user_";
const TUTORIAL_SHOWN_KEY_PREFIX = "tutorial_shown_user_";

const LoadingDots = () => {
  return (
    <div className="flex items-center gap-1 text-primary">
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
};

const NetworkStatus = ({ isOnline }: { isOnline: boolean }) => {
  return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg z-50">
      {isOnline ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">🌸 オンライン</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-muted-foreground">😴 オフライン</span>
        </>
      )}
    </div>
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
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-[80%] max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          {steps[step - 1].icon}
          <h3 className="text-lg font-semibold">{steps[step - 1].title}</h3>
        </div>
        <p className="text-muted-foreground">{steps[step - 1].description}</p>
        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx + 1 === step ? "bg-primary" : "bg-muted"
                }`}
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
    </div>
  );
};

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const [showTutorial, setShowTutorial] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    if (!user) return;
    const tutorialShownKey = `${TUTORIAL_SHOWN_KEY_PREFIX}${user.id}`;
    const tutorialShown = localStorage.getItem(tutorialShownKey);
    if (!tutorialShown) {
      setShowTutorial(true);
    }
  }, [user]);
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

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        content,
        sessionId,
        isBot: false,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", sessionId] });
      toast({
        title: "メッセージ送信したよ！",
        description: <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> メッセージ届いたよ！ありがとう♡</div>,
        duration: 2000,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const message = input;
    setInput("");
    await sendMessage.mutateAsync(message);
  };

  if (isLoadingMessages) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <LoadingDots />
        <p className="text-sm text-muted-foreground animate-pulse">チャット履歴をお届け中...ちょっと待っててね！</p>
      </div>
    );
  }

  return (
      <Card className="flex flex-col h-[calc(100vh-12rem)] relative">
        {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
        <NetworkStatus isOnline={isOnline} />
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {sendMessage.isPending && (
            <div className="flex flex-col items-center gap-2 p-4">
              <LoadingDots />
              <p className="text-sm text-muted-foreground">桜AIが一生懸命考えてるよ...！</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを書いてね！"
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={sendMessage.isPending}
          className="relative"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      <FloatingMascot />
    </Card>
  );
}
