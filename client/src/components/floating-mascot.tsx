import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart, Music, MessageCircleHeart, Sparkles } from "lucide-react";

// Kawaii expressions for our mascot
const expressions = [
  "ʕ•ᴥ•ʔ", "ʕ◕ᴥ◕ʔ", "ʕ￫ᴥ￩ʔ", "(=^･ω･^=)", "(⁀ᗢ⁀)", "(●ᴥ●)", 
  "🌸ᕱ⑅ᕱ🌸", "(◕‿◕✿)", "(｡♥‿♥｡)", "(◠‿◠)", "(*^▽^*)", "(◕ω◕)", 
  "(｡◕‿‿◕｡)", "💮(❀´ ˘ `❀)🌸", "𓇢𓆸", "(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ", "₍ꕤᐢ..ᐢ₎",
  "ฅ(=՞ᆽ՞=)ฅ", "₍˄·͈༝·͈˄*₎◞ ̑̑", "ᕦʕ •ᴥ•ʔᕤ", "(◕‿◕)♡", "(●'◡'●)"
];

// Cute interaction messages
const interactionMessages = [
  "こんにちは！(Hello!)",
  "お元気ですか？(How are you?)",
  "可愛いですよね！(Isn't it cute!)",
  "一緒に話しましょう！(Let's chat together!)",
  "ありがとう♡(Thank you!)",
  "素敵な一日を！(Have a nice day!)",
  "桜の季節大好き！(I love cherry blossom season!)",
  "頑張って！(Do your best!)",
  "またね！(See you!)",
];

export default function FloatingMascot() {
  const controls = useAnimation();
  const [expression, setExpression] = useState(expressions[0]);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  
  // Handle periodic expression changes for more liveliness
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * expressions.length);
      setExpression(expressions[randomIndex]);
      
      // Occasionally show a small wiggle animation
      if (Math.random() > 0.7) {
        controls.start({
          rotate: [0, -3, 3, 0],
          transition: { duration: 0.5 }
        });
      }
    }, 8000); // Change expression every 8 seconds
    
    return () => clearInterval(interval);
  }, [controls]);

  useEffect(() => {
    // Define the float animation
    const floatAnimation = {
      y: [0, -10, 0],
      transition: { 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    };

    // Start the animation
    controls.start(floatAnimation);
    
    // Cleanup function
    return () => controls.stop();
  }, [controls]);

  const handleHover = () => {
    // Change expression on hover
    setExpression(expressions[Math.floor(Math.random() * expressions.length)]);
    
    // Show a random message
    setMessage(interactionMessages[Math.floor(Math.random() * interactionMessages.length)]);
    setShowMessage(true);
    
    // Show happy animation
    controls.start({
      rotate: [0, -8, 8, -5, 5, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.6 }
    });
  };
  
  const handleClick = () => {
    // Show floating emoji animation
    setShowEmoji(true);
    
    // Hide it after animation completes
    setTimeout(() => setShowEmoji(false), 1500);
    
    // Extra happy animation
    controls.start({
      rotate: [0, -10, 10, -5, 5, 0],
      scale: [1, 1.2, 1],
      transition: { duration: 0.8 }
    });
  };
  
  // Hide message when not hovering
  const handleHoverEnd = () => {
    setTimeout(() => setShowMessage(false), 500);
  };

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-3 sm:left-6 z-50 scale-75 sm:scale-100 origin-bottom-left">
      {/* Floating message bubble */}
      {showMessage && (
        <motion.div 
          className="absolute bottom-full mb-2 left-0 bg-pink-50 px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-[10px] sm:text-xs border border-pink-200 shadow-sm w-max max-w-[140px] sm:max-w-[150px]"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{ 
            fontFamily: "'Comic Sans MS', 'Hiragino Maru Gothic ProN', sans-serif"
          }}
        >
          {message}
          {/* Speech bubble tail */}
          <div className="absolute left-4 bottom-[-6px] transform rotate-45 w-3 h-3 bg-pink-50 border-r border-b border-pink-200" />
        </motion.div>
      )}
      
      {/* Emoji reaction animation */}
      {showEmoji && (
        <motion.div
          className="absolute text-lg sm:text-xl"
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{ 
            y: [-20, -40, -60],
            opacity: [0, 1, 0],
            x: [0, 10, 20],
            rotate: 0
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {Math.random() > 0.5 ? "💕" : "✨"}
        </motion.div>
      )}
      
      {/* Main mascot button */}
      <motion.div
        className="relative bg-gradient-to-br from-pink-100 to-white backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-md cursor-pointer select-none border-2 border-pink-200"
        animate={controls}
        whileHover={{ scale: 1.1 }}
        onHoverStart={handleHover}
        onHoverEnd={handleHoverEnd}
        onClick={handleClick}
      >
        <span 
          className="text-sm sm:text-base md:text-lg block" 
          role="img" 
          aria-label="Sakura AI mascot"
          style={{ 
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            fontFamily: "'Comic Sans MS', 'Hiragino Maru Gothic ProN', sans-serif"
          }}
        >
          {expression}
        </span>
        
        {/* Decorative elements */}
        <motion.span 
          className="absolute -top-1 -right-1 text-[10px] sm:text-xs"
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          ✨
        </motion.span>
        <motion.span 
          className="absolute -bottom-1 -left-1 text-[10px] sm:text-xs"
          animate={{ rotate: [0, -360], scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          🌸
        </motion.span>
      </motion.div>
      
      {/* Extra floating decorations */}
      <motion.div 
        className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 opacity-80"
        animate={{ 
          rotate: 360,
          y: [0, -5, 0]
        }}
        transition={{ 
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <Heart size={12} className="text-pink-300 sm:hidden" />
        <Heart size={14} className="text-pink-300 hidden sm:block" />
      </motion.div>
      
      <motion.div 
        className="absolute -top-2 left-6 sm:left-8 opacity-80"
        animate={{ 
          rotate: 360,
          y: [0, -3, 0]
        }}
        transition={{ 
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
        }}
      >
        <Sparkles size={10} className="text-yellow-300 sm:hidden" />
        <Sparkles size={12} className="text-yellow-300 hidden sm:block" />
      </motion.div>
    </div>
  );
}