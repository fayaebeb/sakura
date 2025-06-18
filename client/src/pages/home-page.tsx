import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import ChatInterface from "@/components/chat-interface";
import { motion } from "framer-motion";
import { Heart, Sparkles, AudioLines, Gem, Trash2, LogOut, User, Menu, MessageSquare, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import FeedbackDialog from "@/components/feedback-dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { tourState } from "@/state/tourState";
import { useSetRecoilState } from "recoil";


export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [currentGreeting, setCurrentGreeting] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const setTour = useSetRecoilState(tourState);

  const startTour = () => {
    setTour((prev) => ({
      ...prev,
      run: true,
      stepIndex: 0,
      key: new Date().getTime(), // force Joyride to restart
    }));
  };

  // Get session ID from local storage
  const getSessionId = () => {
    if (!user?.id) return "";
    const storageKey = `chat_session_id_user_${user.id}`;
    return localStorage.getItem(storageKey) || "";
  };

  // Delete chat history mutation
  const deleteChatMutation = useMutation({
    mutationFn: async () => {
      const sessionId = getSessionId();
      if (!sessionId) {
        throw new Error("セッションIDが見つかりません。");
      }

      const res = await apiRequest("DELETE", `/api/messages/${sessionId}`);
      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`Failed to delete chat history: ${res.status} ${errorText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      // Clear current messages in the cache
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });

      toast({
        title: "履歴削除完了",
        description: "チャット履歴が削除されました。",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "削除エラー",
        description: error instanceof Error ? error.message : "履歴の削除に失敗しました。",
        variant: "destructive",
        duration: 4000,
      });
    }
  });

  const displayName = user?.email?.split("@")[0];

  // Cute Japanese greetings for different times of day
  const greetings = [
    "おはよう！",
    "こんにちは！",
    "こんばんは！",
    "お元気ですか？",
    "今日も素敵な一日を！",
    "よろしくね！"
  ];

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = "";

    if (hour >= 5 && hour < 12) {
      greeting = greetings[0]; // Good morning
    } else if (hour >= 12 && hour < 17) {
      greeting = greetings[1]; // Hello (afternoon)
    } else {
      greeting = greetings[2]; // Good evening
    }

    // Add a random additional greeting sometimes
    if (Math.random() > 0.7) {
      const randomIndex = Math.floor(Math.random() * (greetings.length - 3)) + 3;
      greeting += " " + greetings[randomIndex];
    }

    setCurrentGreeting(greeting);
  }, []);

  useEffect(() => {
    if (user === null) {
      // User is not logged in or still loading
      return;
    }
    if (user.onboardingCompletedAt === null) {
      startTour();
    }
  }, [user]);




  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ffefd5] to-[#fff0f5] relative">
      {/* Floating decorative elements */}
      <div className="absolute top-20 right-10 opacity-30 hidden md:block">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: 360
          }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
        >
          <Heart className="h-16 w-16 text-pink-200" />
        </motion.div>
      </div>

      <div className="absolute bottom-20 left-10 opacity-20 hidden md:block">
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: -360
          }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 25, repeat: Infinity, ease: "linear" }
          }}
        >
          <Sparkles className="h-20 w-20 text-yellow-300" />
        </motion.div>
      </div>

      {/* ヘッダーセクション (Header section) */}
      <header id="welcome-text" className="border-b border-pink-100 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          {/* Company Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <img src="/images/pclogo.png" alt="Company Logo" className="h-5 sm:h-10" />
          </motion.div>

          {/* AI Brand Logo with animation */}
          <motion.div
            className="flex items-center"
            initial={{ scale: 0.9, y: -10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <motion.img
              src="/images/sakura-logo.png"
              alt="桜AI ロゴ"
              className="h-16 sm:h-24 w-auto"
              whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
              transition={{ rotate: { duration: 0.5 } }}
            />
          </motion.div>

          {/* User Dropdown Menu */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="settings-dropdown"
                  variant="outline"
                  size="sm"
                  className="border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 flex items-center gap-2 rounded-full pl-2 pr-3"
                >
                  <Avatar className="h-7 w-7 border border-pink-200 bg-pink-100/70">
                    <AvatarFallback className="text-pink-700 text-xs">
                      {displayName ? displayName[0].toUpperCase() : ""}
                    </AvatarFallback>
                  </Avatar>
                  <motion.span
                    className="text-sm font-medium hidden sm:flex items-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {displayName}さん
                    <Gem className="h-3 w-3 text-pink-400 ml-1" />
                  </motion.span>
                  <Menu className="h-4 w-4 sm:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-pink-100 bg-white/95 backdrop-blur-sm">
                <DropdownMenuLabel className="text-pink-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-pink-500" />
                  <span>{displayName}さん</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-pink-100/70" />

                {/* Voice Mode Option */}
                <Link href="/voice">
                  <DropdownMenuItem className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800">
                    <AudioLines className="h-4 w-4 text-pink-500" />
                    音声モード
                  </DropdownMenuItem>
                </Link>

                {/* Delete Chat History Option */}
                <DropdownMenuItem
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteChatMutation.isPending}
                  className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                >
                  <Trash2 className="h-4 w-4 text-pink-500" />
                  <motion.span
                    animate={{ scale: deleteChatMutation.isPending ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: deleteChatMutation.isPending ? Infinity : 0 }}
                  >
                    履歴削除
                  </motion.span>
                </DropdownMenuItem>

                {/* Feedback Option */}
                <DropdownMenuItem
                  onClick={() => setShowFeedbackDialog(true)}
                  className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                >
                  <MessageSquare className="h-4 w-4 text-pink-500" />
                  フィードバック
                </DropdownMenuItem>

                {/* Onboarding Option */}

                <DropdownMenuItem
                  onClick={startTour}
                  className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                >
                  <BookOpen className="h-4 w-4 text-pink-500" />
                  チュートリアル
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-pink-100/70" />

                {/* Logout Option */}
                <DropdownMenuItem
                  onClick={() => setShowLogoutConfirm(true)}
                  disabled={logoutMutation.isPending}
                  className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                >
                  <LogOut className="h-4 w-4 text-pink-500" />
                  <motion.span
                    animate={{ scale: logoutMutation.isPending ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: logoutMutation.isPending ? Infinity : 0 }}
                  >
                    ログアウト
                  </motion.span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </header>
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="mx-auto max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-pink-600">本当にログアウトしますか？</AlertDialogTitle>
            <AlertDialogDescription className="text-pink-400/80">
              寂しくなっちゃうよ…🌸<br />
              桜AIは、いつでもあなたを待っています！
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-pink-500 border-pink-200 hover:bg-pink-50">
              もう少し一緒にいる
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => logoutMutation.mutate()}
              className="bg-pink-500 hover:bg-pink-600 text-white border border-pink-400"
            >
              ログアウト
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Chat History Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="mx-auto max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-pink-600">チャット履歴を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription className="text-pink-400/80">
              全ての会話履歴が削除されます。この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-pink-500 border-pink-200 hover:bg-pink-50">
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteChatMutation.mutate()}
              className="bg-pink-500 hover:bg-pink-600 text-white border border-pink-400"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Greeting message */}
      <motion.div
        className="container mx-auto px-4 py-2 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.h2
          className="text-lg text-pink-700 font-medium italic"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        >
          {displayName && `${displayName}さん、`}{currentGreeting}
        </motion.h2>
      </motion.div>

      {/* チャットインターフェースセクション (Chat interface section) */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-4 max-w-3xl mx-auto border border-pink-100 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-2 left-2 text-lg opacity-40">🌸</div>
          <div className="absolute top-2 right-2 text-lg opacity-40">✨</div>
          <div className="absolute bottom-2 left-2 text-lg opacity-40">💮</div>
          <div className="absolute bottom-2 right-2 text-lg opacity-40">🌟</div>

          <ChatInterface />
        </motion.div>
      </main>

      {/* Footer with subtle branding */}
      <footer className="border-t border-pink-100 py-2 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <motion.p
            className="text-xs text-pink-400"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🌸 桜AI – あなたの業務を支えるスマートアシスタント 🌸
          </motion.p>
        </div>
      </footer>

      {/* Feedback Dialog */}
      <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
    </div>
  );
}