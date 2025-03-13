import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import ChatInterface from "@/components/chat-interface";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Music, Star } from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [showPetals, setShowPetals] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState("");

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

  // Floating cherry blossom petals animation trigger
  useEffect(() => {
    // Show petal animation on initial load
    setShowPetals(true);
    const timer = setTimeout(() => setShowPetals(false), 5000);
    
    // Show petals again every so often
    const interval = setInterval(() => {
      setShowPetals(true);
      setTimeout(() => setShowPetals(false), 5000);
    }, 25000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Cherry blossom petal animation
  const CherryBlossomPetals = () => (
    <AnimatePresence>
      {showPetals && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {Array.from({ length: 20 }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute text-lg"
              initial={{ 
                top: `-5%`,
                left: `${Math.random() * 100}%`,
                rotate: 0,
                opacity: 0
              }}
              animate={{ 
                top: `${Math.random() * 110 + 10}%`,
                left: `${Math.random() * 100}%`,
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: [0, 1, 0.8, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 5 + Math.random() * 7,
                ease: "easeInOut"
              }}
            >
              {Math.random() > 0.5 ? "🌸" : "💮"}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );

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
      
      {/* Cherry blossom petal animation */}
      <CherryBlossomPetals />

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

          {/* User Info & Logout */}
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
                    {displayName}-さん
                  </motion.span>
                  <Star className="h-3 w-3 text-pink-400" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
              >
                <motion.span
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
          {displayName && `${displayName}-さん、`}{currentGreeting}
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
            🌸 桜AI - あなたの心に寄り添う会話パートナー 🌸
          </motion.p>
        </div>
      </footer>
    </div>
  );
}