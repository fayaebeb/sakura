import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Autoplay from "embla-carousel-autoplay"

import React, { useEffect, useRef, useState } from "react";
import { Book, FileText, Mic, Sparkle } from "lucide-react";

interface Slide {
    id: number;
    title: string;
    description: string
    style: string;
    icon: React.ReactNode
}
const step = 1;
const totalSteps = 10;

const databases = [
    {
        Icon: Book,
        title: "うごき統計",
        description: "Curated articles, FAQs and reference material the AI can cite for factual answers."
    },
    {
        Icon: FileText,
        title: "来た来ぬ",
        description: "Your project specifications, design docs and reports – kept up to date and fully searchable."
    },
    {
        Icon: Mic,
        title: "インバウンド",
        description: "Auto‑generated summaries and full transcripts of past meetings for quick context lookup."
    }
];


const MotionCard = motion(Card);
const Testing = () => {
    //  const setLocalInput = useSetRecoilState(chatInputState);
    //     const setPromptInChatInput = (prompt: string) => {

    //         setLocalInput(prompt);
    //     }

    return (


        <div className="bg-black/10 h-screen w-full flex  items-center justify-center">

            <Card className="relative overflow-hidden px-5 pb-2 pt-10 md:px-10 md:pt-10 md:pb-8 w-[350px] flex flex-col md:flex-row md:w-[700px] gap-6 rounded-2xl bg-gradient-to-b from-pink-200 via-pink-100 to-white border-0 border-b-4 border-rose-600 shadow-2xl">

                {/* 🌸 Sakura Petals */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    {[
                        { left: "10%", size: "text-xl", delay: "0s", duration: "12s" },
                        { left: "30%", size: "text-2xl", delay: "1s", duration: "10s" },
                        { left: "50%", size: "text-3xl", delay: "2s", duration: "14s" },
                        { left: "70%", size: "text-xl", delay: "0.5s", duration: "13s" },
                        { left: "85%", size: "text-2xl", delay: "1.5s", duration: "11s" },
                        { left: "25%", size: "text-xl", delay: "3s", duration: "15s" },
                        { left: "60%", size: "text-2xl", delay: "2.5s", duration: "9s" },
                    ].map((petal, idx) => (
                        <div
                            key={idx}
                            className={`absolute top-[-10%] ${petal.size}`}
                            style={{
                                left: petal.left,
                                animation: `fall ${petal.duration} linear infinite`,
                                animationDelay: petal.delay,
                            }}
                        >
                            🌸
                        </div>
                    ))}
                </div>

                {/* 💬 Left: Dialog */}
                <div className="flex flex-col justify-between gap-2 md:gap-4 w-full z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkle className="w-5 h-5 text-pink-500 animate-bounce " />
                            <h1 className="text-xl font-bold text-sakura-600">ようこそ！</h1>
                        </div>

                        {/* 💬 Speech Bubble */}
                        <div className="relative bg-white p-4 rounded-2xl border border-pink-300 shadow-md before:content-[''] before:absolute before:-bottom-3 md:before:bottom-10 md:before:-right-10 before:left-5  before:border-t-white before:border-x-transparent before:border-b-0 before:border-solid  z-10">
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed space-y-2 font-[Noto Sans JP]">
                                <span className="block">こんにちは、はじめまして〜🌸</span>
                                <span className="block">
                                    私はこのサイトの案内役、<span className="font-semibold text-pink-600">サクラちゃん</span> ですっ！(๑˃̵ᴗ˂̵)و✨
                                </span>
                                <span className="block">やさしくご案内しますので、ご安心くださいね📖</span>
                                <span className="block">
                                    準備ができたら <strong className="text-rose-500">「はじめる！」</strong> を押してね💞
                                </span>
                            </p>
                            {/* 🔘 Buttons */}
                            <div className="flex justify-center md:justify-start  gap-3 mt-4">
                                <Button className="bg-pink-200 hover:bg-pink-300 text-pink-800 rounded-full px-6">スキップする</Button>
                                <Button className="bg-rose-400 hover:bg-rose-500 text-white rounded-full px-6">はじめる！✨</Button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* 🧸 Right: Mascot */}
                <div className="relative z-0 w-full md:w-[300px] flex items-end justify-center ">
                    <div className=' -top-10  z-0 md:block absolute md:top-10 md:-left-4 rounded-full border w-8 h-8 bg-white border-pink-300 shadow-md' />
                    <div className='-top-1 md:block absolute md:top-[4.1rem] md:left-3 rounded-full border w-4 h-4 bg-white border-pink-300 shadow-md' />
                    <img
                        src="/images/sakura_welcome_transparent.png"
                        alt="Sakura AI"
                        className="w-1/2 md:w-full object-contain"
                    />
                </div>

                {/* ✨ Embedded Sakura Falling Animation */}
                <style>{`
                       @keyframes fall {
                           0% {
                               transform: translateY(-10%) rotate(0deg);
                               opacity: 1;
                           }
                           100% {
                               transform: translateY(120%) rotate(360deg);
                               opacity: 0;
                           }
                       }
                   `}</style>


            </Card>

        </div>

    );
};

export default Testing;

