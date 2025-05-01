import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import ChatInterface from "@/components/chat-interface";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Music, Star, Trash2,LogOut  } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [currentGreeting, setCurrentGreeting] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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

  // Extract username before '@' from email
  const displayName = user?.username?.split("@")[0];

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
      <header className="border-b border-pink-100 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
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
              src="/images/slogo.png" 
              alt="桜AI ロゴ" 
              className="h-16 sm:h-24 w-auto"
              whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
              transition={{ rotate: { duration: 0.5 } }}
            />
          </motion.div>

          {/* User Info & Buttons */}
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {displayName && (
                <motion.div 
                  className="hidden sm:flex items-center gap-2 bg-pink-50 px-3 py-1 rounded-full border border-pink-100"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span 
                    className="text-sm font-medium text-pink-700"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {displayName}さん
                  </motion.span>
                  <Star className="h-3 w-3 text-pink-400" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Delete Chat History Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteChatMutation.isPending}
                className="border-pink-200 text-pink-700 hover:bg-pink-50 flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <motion.span
                  animate={{ scale: deleteChatMutation.isPending ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: deleteChatMutation.isPending ? Infinity : 0 }}
                  className="hidden sm:inline"
                >
                  履歴削除
                </motion.span>
              </Button>
            </motion.div>

            {/* Logout Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(true)}
                disabled={logoutMutation.isPending}
                className="border-pink-200 text-pink-700 hover:bg-pink-50 flex items-center gap-1"
              >
                {/* Icon for mobile */}
                <motion.span
                  className="sm:hidden"
                  animate={{ scale: logoutMutation.isPending ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: logoutMutation.isPending ? Infinity : 0 }}
                >
                  <LogOut className="h-4 w-4" />
                </motion.span>

                {/* Text for desktop */}
                <motion.span
                  className="hidden sm:inline"
                  animate={{ scale: logoutMutation.isPending ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: logoutMutation.isPending ? Infinity : 0 }}
                >
                  ログアウト
                </motion.span>
              </Button>

            </motion.div>
          </div>
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
    </div>
  );
}