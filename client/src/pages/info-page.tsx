import React from 'react'
import { motion } from "framer-motion";
import { Heart, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MainGrid } from '@/components/InfoPage/MainGrid';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TableOfContent } from '@/components/InfoPage/TableOfContent';

const InfoPage = () => {
  return (
    <SidebarProvider>
      <TableOfContent />
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
      {/* <Navbar /> */}
      <div className='w-full flex items-center justify-center'>
        <div className="max-w-3xl h-[100rem] xl:max-w-2xl rounded-3xl flex items-center justify-center w-full ">
          <MainGrid />
        </div>
      </div>


      {/* Footer with subtle branding */}
      <Footer />

    </div>
    </SidebarProvider>
  )
}

export default InfoPage