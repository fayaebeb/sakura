// components/tooltips/TooltipWelcome.tsx
import React from "react";
import { TooltipRenderProps } from "react-joyride";
import { motion } from "framer-motion";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkle } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnBoarding";
import { useAuth } from "@/hooks/use-auth";


const TooltipEnd: React.FC<TooltipRenderProps> = ({
    primaryProps,
    closeProps,
    backProps

}) => {

    const {user} = useAuth()
    const completeOnboarding = useOnboarding();

    const handleFinish = async () => {
        if(user?.onboardingCompletedAt === null) {
            await completeOnboarding.mutateAsync();
        }
    };



    return (
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
                        <h1 className="text-xl font-bold text-sakura-600">ありがとう！</h1>
                    </div>

                    {/* 💬 Speech Bubble */}
                    <div className="relative bg-white p-4 rounded-2xl border border-pink-300 shadow-md before:content-[''] before:absolute before:-bottom-3 md:before:bottom-10 md:before:-right-10 before:left-5  before:border-t-white before:border-x-transparent before:border-b-0 before:border-solid  z-10">
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed space-y-2 font-[Noto Sans JP]">
                            <span className="block">ありがとうございますっ🌸</span>
                            <span className="block">
                                チャットボットでサクラちゃん待機中<span className="font-semibold text-pink-600">(๑˃̵ᴗ˂̵)</span> و✨
                            </span>
                            <span className="block">💬 「チャットをはじめる！」ボタンをポチッ！</span>
                            <span className="block">
                                <strong className="text-rose-500">一緒に楽しくおしゃべりしようね💞</strong>
                            </span>
                        </p>
                        {/* 🔘 Buttons */}
                        <div className="flex justify-center md:justify-start  gap-3 mt-4">
                            <Button {...backProps} className="bg-pink-200 hover:bg-pink-300 text-pink-800 rounded-full px-6">戻る</Button>

                            <Button  {...primaryProps} onClick={async (e) => {
                                primaryProps.onClick?.(e);
                                await handleFinish();
                            }} className="bg-rose-400 hover:bg-rose-500 text-white rounded-full px-6 ">完了！✨</Button>
                        </div>
                    </div>
                </div>

            </div>

            {/* 🧸 Right: Mascot */}
            <div className="relative z-0 w-full md:w-[300px] flex items-end justify-center ">
                <div className=' -top-10  z-0 md:block absolute md:top-10 md:-left-4 rounded-full border w-8 h-8 bg-white border-pink-300 shadow-md' />
                <div className='-top-1 md:block absolute md:top-[4.1rem] md:left-3 rounded-full border w-4 h-4 bg-white border-pink-300 shadow-md' />
                <img
                    src="/images/sakura-end.png"
                    alt="Sakura AI"
                    className="w-3/4 md:w-full object-contain"
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
    );
};

export default TooltipEnd;
