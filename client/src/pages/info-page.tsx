// src/components/FaqLastWeekCard.tsx
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeInfo, Heart, Loader2, Sparkles } from "lucide-react";
import { useFaqLastWeek } from "@/hooks/useFAQ";
import { motion } from "framer-motion";
import { Header } from "@radix-ui/react-accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


export default function InfoPage() {
  /**
   * The hook returns the usual mutation object:
   *  - mutate        (void → void)  – fire and forget
   *  - mutateAsync   (void → Promise<Data>)
   *  - data          (FaqLastWeekResponse | undefined)
   *  - isLoading, isError, error, etc.
   */
  const {
    mutate: fetchFaqs,
    data,
    isPending,
    isError,
    error,
  } = useFaqLastWeek();

  /* --------------------------------------------------------
   * Pattern 1: auto-fetch once when the component mounts
   * ------------------------------------------------------ */
  useEffect(() => {
    fetchFaqs(); // same as fetchFaqs(undefined)
  }, [fetchFaqs]);

  /* --------------------------------------------------------
   * Pattern 2: expose a “Refresh” button to re-fetch on demand
   * ------------------------------------------------------ */
  const handleRefresh = () => fetchFaqs();

  /* --------------------------------------------------------
   * Pattern 3: call mutateAsync if you need the resolved data
   * ------------------------------------------------------ */
  // const handleManual = async () => {
  //   const snapshot = await fetchFaqsAsync();
  //   console.log(snapshot);
  // };

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

      <Navbar />

      <Footer />


    </div>
    
  );
}
