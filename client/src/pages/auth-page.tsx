import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Heart, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Cute character expressions for the login page
const loginCharacters = [
  "ʕ•ᴥ•ʔ", "ʕ◕ᴥ◕ʔ", "(=^･ω･^=)", "(◕‿◕✿)", "(｡♥‿♥｡)", 
  "(*^▽^*)", "(◕ω◕)", "₍ꕤᐢ..ᐢ₎"
];

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const [currentCharacter, setCurrentCharacter] = useState(loginCharacters[0]);
  const [sakuraCount, setSakuraCount] = useState(0);

  // Periodically change the character expression
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loginCharacters.length);
      setCurrentCharacter(loginCharacters[randomIndex]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // This creates a "sakura petal" effect when the user clicks the logo
  const addSakuraPetal = () => {
    setSakuraCount(prevCount => Math.min(prevCount + 1, 30));
    // Reset petals after 30 clicks
    if (sakuraCount >= 29) {
      setTimeout(() => setSakuraCount(0), 500);
    }
  };

  if (!user) {
    const onSubmit = form.handleSubmit((data) => {
      if (isLogin) {
        loginMutation.mutate(data);
      } else {
        registerMutation.mutate(data);
      }
    });

    return (
      <div className="min-h-screen flex flex-col md:grid md:grid-cols-2 overflow-hidden">
        {/* Floating sakura petals */}
        <AnimatePresence>
          {Array.from({ length: sakuraCount }).map((_, index) => (
            <motion.div
              key={`petal-${index}`}
              className="fixed text-xl z-10 pointer-events-none"
              initial={{ 
                top: "10%", 
                left: "50%", 
                opacity: 0,
                scale: 0.5,
                rotate: 0 
              }}
              animate={{ 
                top: ["10%", "90%"],
                left: [`${50 + (Math.random() * 30 - 15)}%`, `${50 + (Math.random() * 40 - 20)}%`],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 0.8],
                rotate: [0, 180, 360]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 4 + Math.random() * 3,
                ease: "easeInOut"
              }}
            >
              🌸
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bot Logo in Mobile View */}
        <motion.div 
          className="flex flex-col items-center justify-center p-8 md:hidden bg-gradient-to-b from-pink-50 to-pink-100"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.img 
            src="/images/slogo.png" 
            alt="桜AI ロゴ" 
            className="w-24 mb-4 cursor-pointer"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
            transition={{ rotate: { duration: 0.5, repeat: 1 } }}
            onClick={addSakuraPetal}
          />
          <motion.div
            className="text-xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            {currentCharacter}
          </motion.div>
        </motion.div>

        {/* Authentication Card */}
        <motion.div 
          className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-pink-50 to-pink-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.img 
            src="/images/pclogo.png" 
            alt="会社ロゴ" 
            className="w-32 mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              delay: 0.3
            }}
            className="w-full max-w-md"
          >
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-pink-100 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <motion.h1 
                  className="text-2xl font-bold text-pink-800"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  {isLogin ? "お帰りなさい" : "アカウントを作成"}
                </motion.h1>
                <motion.div 
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                >
                  {currentCharacter}
                </motion.div>
              </div>

              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-6">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-pink-700 flex items-center gap-1">
                            <Heart className="h-3 w-3" /> メールアドレス
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              {...field} 
                              className="border-pink-200 focus:border-pink-400 bg-white/80 backdrop-blur-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-pink-700 flex items-center gap-1">
                            <Star className="h-3 w-3" /> パスワード
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              {...field} 
                              className="border-pink-200 focus:border-pink-400 bg-white/80 backdrop-blur-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-medium rounded-xl shadow-md relative"
                      disabled={loginMutation.isPending || registerMutation.isPending}
                    >
                      {loginMutation.isPending || registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isLogin ? (
                        "ログイン"
                      ) : (
                        "アカウントを作成"
                      )}
                      
                      {/* Decorative elements on button */}
                      <motion.span 
                        className="absolute -top-1 -right-1 text-xs pointer-events-none"
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        ✨
                      </motion.span>
                      <motion.span 
                        className="absolute -bottom-1 -left-1 text-xs pointer-events-none"
                        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        💮
                      </motion.span>
                    </Button>
                  </motion.div>
                </form>
              </Form>

              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  {isLogin ? "アカウントが必要ですか？ サインアップ" : "すでにアカウントをお持ちですか？ ログイン"}
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Branding Section (Hidden in Mobile) */}
        <motion.div 
          className="hidden md:flex flex-col justify-center items-center p-8 bg-gradient-to-b from-pink-100 to-pink-200 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Decorative background elements */}
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={`deco-${index}`}
              className="absolute text-4xl text-pink-200 opacity-20 pointer-events-none"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{ 
                rotate: Math.random() > 0.5 ? 360 : -360,
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 10 + Math.random() * 10, 
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              {["🌸", "💮", "✨", "⭐", "🌟", "💕"][index]}
            </motion.div>
          ))}
          
          <motion.img 
            src="/images/slogo.png" 
            alt="桜AI ロゴ" 
            className="w-48 mb-8 cursor-pointer z-10"
            whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
            whileTap={{ scale: 0.95 }}
            onClick={addSakuraPetal}
          />
          
          <motion.div 
            className="max-w-md text-center bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-pink-100 shadow-md z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div 
              className="text-4xl mb-4 font-bold text-pink-700"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              {currentCharacter}
            </motion.div>
            <motion.p 
              className="text-lg text-pink-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              桜AIとのおしゃべりをお楽しみください！
            </motion.p>
            <motion.p 
              className="text-sm text-pink-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              可愛いAIアシスタントがあなたをお待ちしています
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return null;
}