import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import ChatInterface from "@/components/chat-interface";
import { motion } from "framer-motion";
import { Heart, Sparkles, AudioLines, Gem, Trash2, LogOut, User, Menu, MessageSquare, BookOpen, BadgeInfo } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { tourState } from "@/state/tourState";
import { useSetRecoilState } from "recoil";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentGreeting, setCurrentGreeting] = useState("");


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
      <Navbar/>
      

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
      <Footer/>

    </div>
  );
}