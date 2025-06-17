import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Autoplay from "embla-carousel-autoplay"

import React, { useEffect, useRef, useState } from "react";
import { Book, FileText, Mic } from "lucide-react";

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


    return (


        <div className="bg-black/10 h-screen w-full flex  items-center justify-center">

            <Card
                className="relative mx-auto flex w-[90%] max-w-lg overflow-visible rounded-2xl border-0 border-b-4 border-rose-600 bg-gradient-to-br from-pink-200 via-white to-pink-200 bg-white/90 p-4 md:p-6 shadow-xl"
            >


                {/* Layout wrapper */}
                <div className=" flex w-full flex-col gap-6 md:flex-row md:items-start">
                    {/* Mascot */}
                    {/* <motion.img
                        src="/images/sakura-flower.png"
                        alt="Sakura mascot waving"
                        initial={{ rotate: -5, scale: 0.9, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                        className="pointer-events-none mx-auto w-24 select-none md:mx-0 md:w-32"
                    /> */}
                        <img className="hidden md:absolute md:block bottom-0 h-[20rem] w-[15rem] -left-4" src="/images/sakura-flower.png" alt="sakura-flower" />
                        <img className="md:hidden absolute bottom-0 h-[5rem] w-[5rem] -left-1" src="/images/sakura-explain-5.png" alt="sakura-flower" />
                    <div className="w-40 relative h-full">
                    </div>
                    {/* Content area */}
                    <div className="flex flex-1 flex-col space-y-4">
                        <h2 className="text-base text-center md:text-left font-bold text-rose-600">データベースのご紹介！✨</h2>

                        {/* Database cards in a grid */}
                        <div className="grid grid-cols-1 gap-3">
                            {databases.map(({ Icon, title, description }) => (
                                <div
                                    key={title}
                                    className="group flex items-start gap-3 rounded-lg bg-white/80 p-3 shadow-lg transition hover:bg-pink-100/70"
                                >
                                    <div className="mt-1 shrink-0 rounded-full bg-pink-200/70 p-2 shadow">
                                        <Icon className="h-5 w-5 text-pink-700" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-pink-900">{title}</p>
                                        <p className="text-xs leading-snug text-pink-800/90">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 self-end">
                            <Button

                                variant="outline"
                                className="rounded-full bg-pink-50 px-3 py-1 text-xs"
                            >
                                スキップ
                            </Button>
                            <Button

                                className="rounded-full bg-pink-300 px-4 py-1 text-xs text-pink-800 hover:bg-pink-300"
                            >
                                戻る
                            </Button>
                            <Button

                                className="rounded-full bg-pink-500 px-4 py-1 text-xs text-white hover:bg-pink-600"
                            >
                                次へ
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>

    );
};

export default Testing;

