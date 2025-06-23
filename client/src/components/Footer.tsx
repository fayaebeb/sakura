import React from 'react'
import { motion } from "framer-motion";

const Footer = () => {
    return (
        <footer className="border-t border-pink-100 py-2 bg-white/50 backdrop-blur-sm w-full">
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
    )
}

export default Footer