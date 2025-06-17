import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Heart } from "lucide-react";
import { Message } from "@shared/schema";
import { nanoid } from "nanoid";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ChatMessage from "./chatMessage";
import ChatInput, { MessageCategory } from "./chatInput";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import FloatingMascot from "./floating-mascot";
import ChatLoadingIndicator, { SakuraPetalLoading } from "./chat-loading-indicator";
import { motion, AnimatePresence } from "framer-motion";
import TranscriptionConfirmation from "./transcription-confirmation";
import SuggestionPanel from "@/components/suggestion-panel";
import { useRecoilValue } from "recoil";
import { tourState } from "@/state/tourState";
import { sampleMessageData, sampleMessageDataPc } from "@/lib/sampleData";


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


const Tutorial = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "ようこそ！",
      description:
        "「桜AI」は、PCKKにおいて、情報提供や質問への回答を行うAIです。私の役割は、さまざまなトピックについて正確で分かりやすい情報を提供し、ユーザーのリクエストに的確にお応えすることです。たとえば、データに基づくご質問には、社内資料や外部情報を参照しながら丁寧にお答えします。",
      icon: <Sparkles className="h-5 w-5 text-pink-400" />,
    },
    {
      title: "楽しくお話ししましょう！",
      description:
        "「桜AI」は、社内の全国うごき統計に関する営業資料や、人流に関する社内ミニ講座の内容を基礎データとして取り込み、さらにWikipediaやGoogleのAPIを通じてインターネット上の情報も収集しています。これらの情報をもとに、最適な回答を生成しています。",
      icon: <Heart className="h-5 w-5 text-red-400" />,
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex items-center justify-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Card className="w-[80%] max-w-md p-6 space-y-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
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
                  className={`w-2 h-2 rounded-full ${idx + 1 === step ? "bg-primary" : "bg-muted"
                    }`}
                  animate={
                    idx + 1 === step
                      ? {
                        scale: [1, 1.3, 1],
                      }
                      : {}
                  }
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
const CHAT_SESSION_KEY_PREFIX = "chat_session_id_user_";
const TUTORIAL_SHOWN_KEY_PREFIX = "tutorial_shown_user_";

const ChatInterface = () => {
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageTopRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [showTranscriptionConfirmation, setShowTranscriptionConfirmation] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [useDb, setUseDb] = useState(true);
  const [selectedDb, setSelectedDb] = useState("files");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  //tour state
  const tour = useRecoilValue(tourState);
  const isTourRunning = tour.run;

  // Detect mobile devices
  const isMobile = typeof navigator !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (!showTutorial) {
      textareaRef.current?.focus();
    }
  }, [showTutorial]);

  // Handle tutorial display
  useEffect(() => {
    if (!user) return;
    const tutorialShownKey = `${TUTORIAL_SHOWN_KEY_PREFIX}${user.id}`;
    const tutorialShown = localStorage.getItem(tutorialShownKey);
    if (!tutorialShown) {
      setShowTutorial(true);
    }
  }, [user]);


  const handleCloseTutorial = () => {
    if (!user) return;
    const tutorialShownKey = `${TUTORIAL_SHOWN_KEY_PREFIX}${user.id}`;
    setShowTutorial(false);
    localStorage.setItem(tutorialShownKey, "true");
  };

  const [sessionId, setSessionId] = useState<string>("");

  // Initialize and manage session ID based on user
  useEffect(() => {
    if (!user?.id) return;

    const storageKey = `${CHAT_SESSION_KEY_PREFIX}${user.id}`;
    let savedSessionId = localStorage.getItem(storageKey);

    // Validate saved session ID
    if (!savedSessionId || savedSessionId.trim() === "") {
      console.log("Creating new session ID - no previous ID found");
      savedSessionId = nanoid();
      localStorage.setItem(storageKey, savedSessionId);
    }

    console.log(`Using session ID: ${savedSessionId}`);
    setSessionId(savedSessionId);

    const persistentSessionId = user.email.split('@')[0];

    if (savedSessionId !== persistentSessionId) {
      console.log(
        `Note: localStorage session ID (${savedSessionId}) differs from persistent ID (${persistentSessionId})`
      );
    }

    // Setup periodic check for session integrity
    const interval = setInterval(() => {
      const currentStoredId = localStorage.getItem(storageKey);
      if (currentStoredId !== savedSessionId) {
        console.log("Session ID changed in another tab, updating");
        setSessionId(currentStoredId || savedSessionId);
        // Restore the session ID if it was accidentally cleared
        if (!currentStoredId) {
          localStorage.setItem(storageKey, savedSessionId);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
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
  // useEffect(() => {
  //   if (messageEndRef.current) {
  //     messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

  useEffect(() => {
    if (!messageEndRef.current || !messageTopRef.current) return;

    if (isTourRunning) {
      // Scroll to top when tour is running
      messageTopRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      // Scroll to bottom as usual
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTourRunning]);

  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      category,
      useWeb,
      useDb,
      db,
    }: {
      content: string;
      category: MessageCategory;
      useWeb: boolean;
      useDb: boolean;
      db: string;
    }) => {
      if (!user?.id) {
        throw new Error("ユーザー情報が見つかりません。再ログインしてください。");
      }

      if (!sessionId) {
        throw new Error("セッションIDが見つかりません。再ログインしてください。");
      }

      const res = await apiRequest("POST", "/api/chat", {
        content,
        sessionId,
        isBot: false,
        category,
        useWeb,
        useDb,
        db,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`Failed to send message: ${res.status} ${errorText}`);
      }

      return res.json();
    },
    onMutate: async ({ content, category }: { content: string, category: MessageCategory }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/messages", sessionId] });

      // Get current messages
      const previousMessages = queryClient.getQueryData<Message[]>(["/api/messages", sessionId]) || [];

      // Create optimistic user message with a temporary negative ID to avoid conflicts
      // This helps distinguish it from real IDs which are always positive
      const optimisticUserMessage: Message = {
        id: -Date.now(), // Using negative timestamp as a temporary ID to avoid conflicts
        userId: user?.id || 0,
        content,
        timestamp: new Date(),
        isBot: false,
        sessionId,
        category,
      };

      // Update the messages in the cache with our optimistic message
      queryClient.setQueryData<Message[]>(["/api/messages", sessionId], [
        ...previousMessages,
        optimisticUserMessage,
      ]);

      // Return previous messages for potential rollback
      return { previousMessages, optimisticUserMessage };
    },
    onSuccess: async (newBotMessage: Message, variables, context) => {
      // Create a user message with the same data as the optimistic one, but with real ID
      // First, extract the content and category from variables
      const { content, category } = variables;

      // We need to ensure both the user message and bot message are in the cache
      queryClient.setQueryData<Message[]>(["/api/messages", sessionId], (old = []) => {
        // Filter out our optimistic message if it exists
        const filteredMessages = context?.optimisticUserMessage
          ? old.filter(msg => msg.id !== context.optimisticUserMessage.id)
          : old;

        // Create a proper user message (the optimistic one gets replaced with this)
        const userMessage: Message = {
          id: newBotMessage.id - 1, // User message would have been created right before the bot message
          userId: user?.id || 0,
          content,
          timestamp: new Date(new Date(newBotMessage.timestamp).getTime() - 1000), // Slightly earlier
          isBot: false,
          sessionId,
          category,
        };

        // Add both messages to the cache and sort them by ID to ensure correct order
        const allMessages = [...filteredMessages, userMessage, newBotMessage];
        return allMessages.sort((a, b) => {
          // For negative IDs (optimistic updates), always sort them at the end
          if (a.id < 0 && b.id < 0) return a.id - b.id;
          if (a.id < 0) return 1;
          if (b.id < 0) return -1;
          return a.id - b.id;
        });
      });

      // Show a success toast
      toast({
        title: "メッセージ送信したよ！",
        description: (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" /> メッセージ届いたよ！ありがとう♡
          </div>
        ),
        duration: 2000,
      });
      try {
        const suggestionRes = await fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: content }),
        });
        const suggestionData = await suggestionRes.json();
        setSuggestions(suggestionData?.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]); // fallback
      }
    },
    onError: (error, _, context) => {
      // On error, revert to the previous state
      if (context?.previousMessages) {
        queryClient.setQueryData(["/api/messages", sessionId], context.previousMessages);
      }

      // Show an error toast with more detailed message
      toast({
        title: "送信エラー",
        description: error instanceof Error
          ? `メッセージが送れませんでした: ${error.message}`
          : "メッセージが送れなかったよ...もう一度試してみてね！",
        variant: "destructive",
      });
    },
  });
  const handleVoiceRecording = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);

    try {
      // Show a toast to indicate processing
      toast({
        title: "音声認識中...",
        description: "あなたの声を認識しています。少々お待ちください。",
        duration: 2500,
      });

      // Validate audio blob
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error("音声データが空です。もう一度録音してください。");
      }

      // Check audio blob type 
      if (!audioBlob.type.includes('audio') && !audioBlob.type.includes('webm')) {
        console.warn(`Unexpected audio blob type: ${audioBlob.type}, size: ${audioBlob.size}`);
      }

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`Transcription failed with status ${res.status}: ${errorText}`);
      }

      const data = await res.json().catch(() => {
        throw new Error("Invalid JSON response from transcription service");
      });

      if (!data || !data.transcribedText) {
        throw new Error("音声認識結果が取得できませんでした。");
      }

      // Show confirmation with the transcribed text
      setTranscribedText(data.transcribedText);
      setShowTranscriptionConfirmation(true);

      toast({
        title: "音声認識成功",
        description: "内容を確認してから送信してください",
        duration: 3000,
      });
    } catch (error) {
      console.error("Voice transcription error:", error);
      toast({
        title: "音声処理エラー",
        description: error instanceof Error
          ? `認識できませんでした: ${error.message}`
          : "認識できませんでした。もう一度試してね！",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Handle confirming the transcribed text
  const handleConfirmTranscription = (confirmedText: string) => {
    setTranscribedText(null);
    setShowTranscriptionConfirmation(false);

    if (confirmedText.trim()) {
      sendMessage.mutate({
        content: confirmedText,
        category: "SELF",
        useWeb: useWeb,
        useDb: useDb,
        db: selectedDb,
      });
    }
  };

  // Handle editing the transcribed text
  const handleEditTranscription = (editedText: string) => {
    setTranscribedText(editedText);
  };

  // Handle canceling the transcription
  const handleCancelTranscription = () => {
    setTranscribedText(null);
    setShowTranscriptionConfirmation(false);
  };

  const playMessageAudio = async (messageId: number, text: string) => {
    // If the same message is already playing, toggle it off
    if (isPlayingAudio && playingMessageId === messageId) {
      setIsPlayingAudio(false);
      setPlayingMessageId(null);
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        setCurrentAudioUrl(null);
      }
      return;
    }

    try {
      setIsPlayingAudio(true);
      setPlayingMessageId(messageId);

      // Show a toast to indicate audio is being prepared
      toast({
        title: "音声生成中...",
        description: "音声を準備しています。しばらくお待ちください。",
        duration: 2000,
      });

      const res = await fetch('/api/voice/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`Failed to fetch TTS stream: ${res.status} ${errorText}`);
      }

      if (!res.body) {
        throw new Error("Response body is null");
      }

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalLength = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            totalLength += value.length;
          }
        }
      } catch (readError) {
        console.error("Error reading stream:", readError);
        throw new Error("音声データの読み込み中にエラーが発生しました。");
      }

      // Make sure we got some data
      if (totalLength === 0) {
        throw new Error("No audio data received");
      }

      const audioData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }

      const audioBlob = new Blob([audioData], { type: "audio/wav" });
      if (audioBlob.size === 0) {
        throw new Error("Empty audio blob created");
      }

      // Revoke any previously active audio URL
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);

      toast({
        title: "音声準備完了",
        description: "音声の再生を開始します。",
        duration: 1500,
      });
    } catch (error) {
      console.error("TTS Error:", error);
      toast({
        title: "音声生成エラー",
        description: error instanceof Error ?
          `音声を生成できませんでした: ${error.message}` :
          "音声を生成できませんでした。",
        variant: "destructive",
      });
      setIsPlayingAudio(false);
      setPlayingMessageId(null);
      // Clean up any partial resources
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        setCurrentAudioUrl(null);
      }
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

  const handleSubmit = (
    e: React.FormEvent,
    category: MessageCategory = "SELF",
    web: boolean = true,
    db: boolean = true
  ) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const message = input;
    setInput("");

    sendMessage.mutate({
      content: message,
      category,
      useWeb: useWeb,
      useDb: useDb,
      db: selectedDb,
    });

  };

  // Optimized emotion selection handler with direct DOM manipulation for better performance
  const handleEmotionSelect = (message: string) => {
    try {
      // Ensure we have access to the textarea element
      if (!textareaRef.current) {
        console.warn("Textarea ref not available");
        setInput(message);
        return;
      }

      // Direct DOM manipulation for better performance
      const textarea = textareaRef.current;

      // Focus first to ensure we have the correct selection
      textarea.focus();

      // Get the current cursor positions
      const cursorStart = textarea.selectionStart || 0;
      const cursorEnd = textarea.selectionEnd || 0;

      // Get the current value directly from the DOM
      const currentValue = textarea.value;

      // Create the new value with the insertion
      const beforeCursor = currentValue.substring(0, cursorStart);
      const afterCursor = currentValue.substring(cursorEnd);
      const newValue = beforeCursor + message + afterCursor;

      // Calculate new cursor position
      const newCursorPosition = cursorStart + message.length;

      // Directly set the value using the DOM API (faster than React state updates)
      textarea.value = newValue;

      // Set the cursor position immediately
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);

      // Update React state after direct DOM updates (for consistency)
      setInput(newValue);

      // Make sure the cursor is visible by scrolling if needed
      const textareaLineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const cursorLine = (newValue.substring(0, newCursorPosition).match(/\n/g) || []).length;
      const approxScrollTop = cursorLine * textareaLineHeight;

      if (approxScrollTop > textarea.clientHeight) {
        textarea.scrollTop = approxScrollTop - textarea.clientHeight / 2;
      }
    } catch (error) {
      console.error("Error inserting text:", error);
      // Fallback - direct state setting
      setInput(prev => prev + message);
    }
  };

  if (isLoadingMessages) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <SakuraPetalLoading />
        <p className="text-sm text-muted-foreground animate-pulse">チャット履歴をお届け中...ちょっと待っててね！</p>
      </div>
    );
  }

  const displayMessages = isTourRunning
    ? (isMobile ? sampleMessageDataPc : sampleMessageData)
    : messages;

  return (
    <Card id="chat-interface" className="flex flex-col h-[calc(100vh-12rem)] relative overflow-visible">

      <AnimatePresence>
        {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
      </AnimatePresence>


      {currentAudioUrl && (
        <AudioPlayer
          audioUrl={currentAudioUrl}
          isPlaying={isPlayingAudio}
          onPlayComplete={handlePlaybackComplete}
        />
      )}


      <ScrollArea className="flex-1 px-1 sm:px-4 py-3 w-full" ref={scrollAreaRef}>
        <div className="space-y-4 w-full max-w-full">
          <div ref={messageTopRef} />

          {displayMessages.length === 0 ? (
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
            displayMessages.map((message) => (
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

      {/* Form with emotions picker */}
      <div className="relative">
        {/* Transcription Confirmation */}
        <AnimatePresence>
          {showTranscriptionConfirmation && transcribedText && (
            <div className="px-4 pt-2">
              <TranscriptionConfirmation
                text={transcribedText}
                onConfirm={handleConfirmTranscription}
                onCancel={handleCancelTranscription}
                onEdit={handleEditTranscription}
              />
            </div>
          )}
        </AnimatePresence>

        {showSuggestions && (
          <SuggestionPanel
            suggestions={suggestions}
            onSelect={(sugg) => {
              setInput(sugg);
              textareaRef.current?.focus();
            }}
            onClose={() => setShowSuggestions(false)}
          />
        )}



        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          handleVoiceRecording={handleVoiceRecording}
          isProcessing={isProcessingVoice || sendMessage.isPending}
          isProcessingVoice={isProcessingVoice}
          sendDisabled={!input.trim() || sendMessage.isPending}
          handlePromptSelect={handleEmotionSelect}
          isMobile={isMobile}
          textareaRef={textareaRef}
          useWeb={useWeb}
          setUseWeb={setUseWeb}
          useDb={useDb}
          setUseDb={setUseDb}
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
        />
      </div>


      <FloatingMascot />
    </Card>
  );
};

export default ChatInterface;