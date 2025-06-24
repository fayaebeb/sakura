import { motion } from "framer-motion";
import { Sparkle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const Loading = () => {
  return (
    <div className="bg-gradient-to-br from-[#ffefd5] to-[#fff0f5] relative h-screen w-screen p-5 flex flex-col items-center justify-center">
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-5xl"
        >
          🌸✨
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-bold text-pink-600 drop-shadow">
          データを読み込んでいます...
        </h1>
        <p className="text-pink-700 text-lg md:text-xl">桜ちゃんががんばって準備中です〜💪</p>

        <motion.div
          className="mt-8 flex justify-center"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          <Card className="p-6 flex items-center gap-4 bg-pink-100 text-pink-700 border border-pink-300 shadow-lg rounded-2xl">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>少々お待ちくださいね〜</span>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;
