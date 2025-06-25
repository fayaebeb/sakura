import { Button } from "@/components/ui/button";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import Autoplay from "embla-carousel-autoplay"

import React, { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, Book, Crown, FileText, Mic, Sparkle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TableOfContent } from "@/components/InfoPage/TableOfContent";
import {
    Table,
    TableHeader,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableFooter,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart } from "recharts";
import { useSetRecoilState } from "recoil";
import { chatInputState } from "@/state/chatInputState";
import ImageFlow from "@/components/InfoPage/ImageFlow";
import ImageHighlightPage from "@/components/InfoPage/ImageFlow";
import FloatingSidebar from "@/components/InfoPage/FloatingSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SakurabotDefinition from "@/components/InfoPage/Sakurabot-definition";
import SakuraFlow from "@/components/InfoPage/SakuraFlow";
import MainGrid from "@/components/InfoPage/MainGrid";
import HowToAskGoodQuestions from "@/components/InfoPage/HowToAskGoodQuestions";
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

;

interface FaqItem {
    question: string;
    count: number;
}

interface FaqLastWeekSample {
    generatedAt: string;
    totalQuestions: number;
    trendText: string;
    faqs: FaqItem[];
}

const sampleData: FaqLastWeekSample = {
    generatedAt: "2025-06-15T10:00:00Z",
    totalQuestions: 42,
    trendText: "生成AI × 業務効率化が急上昇！",
    faqs: [
        { question: "ChatGPT は社内データを学習しますか？", count: 10 },
        { question: "プロンプトの書き方にコツはありますか？", count: 7 },
        { question: "社内での利用ガイドラインは？", count: 6 },
        { question: "API キーの取得方法を教えてください。", count: 5 },
        { question: "セキュリティ上のリスクは？", count: 4 },
        { question: "費用はどのくらいかかりますか？", count: 3 },
        { question: "マルチリンガル対応していますか？", count: 3 },
        { question: "プラグインの導入方法は？", count: 2 },
        { question: "トークン制限について教えて。", count: 1 },
        { question: "画像生成との違いは？", count: 1 },
    ],
};

export type ScrollHandlers = {
    about: () => void;             // さくらボットとは
    usage: () => void;             // サイトの使い方
    chat: () => void;              // チャット画面
    options: () => void;           // 質問オプション
    ask: () => void;               // よい質問の仕方
    terms: () => void;             // 利用上の注意
    menu: () => void;             // 利用上の注意
    userType: () => void;             // 利用上の注意
    database: () => void;             // 利用上の注意
};





const Testing = () => {
    //  const setLocalInput = useSetRecoilState(chatInputState);
    //     const setPromptInChatInput = (prompt: string) => {

    //         setLocalInput(prompt);
    //     }

    const { trendText, totalQuestions, generatedAt, faqs } = sampleData;

    const [isRankOpen, setIsRankOpen] = useState<boolean>(false);
    const [, navigate] = useLocation();
    const [active, setActive] = React.useState(0);

    const openRankingDialog = () => {
        setIsRankOpen(true)
    }

    const setLocalInput = useSetRecoilState(chatInputState);


    const usePrompt = (prompt: string) => {
        setLocalInput(prompt);
        navigate("/")
    }

    const aboutRef = useRef<HTMLDivElement>(null);
    const usageRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const askRef = useRef<HTMLDivElement>(null);
    const termsRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const userTypeRef = useRef<HTMLDivElement>(null);
    const databaseRef = useRef<HTMLDivElement>(null);

    /* build the map of scroll functions */
    const scrollFns: ScrollHandlers = {
        about: () => aboutRef.current?.scrollIntoView({ behavior: "smooth" }),
        usage: () => usageRef.current?.scrollIntoView({ behavior: "smooth" }),
        chat: () => chatRef.current?.scrollIntoView({ behavior: "smooth" }),
        options: () => optionsRef.current?.scrollIntoView({ behavior: "smooth" }),
        ask: () => askRef.current?.scrollIntoView({ behavior: "smooth" }),
        terms: () => termsRef.current?.scrollIntoView({ behavior: "smooth" }),
        menu: () => menuRef.current?.scrollIntoView({ behavior: "smooth" }),
        userType: () => userTypeRef.current?.scrollIntoView({ behavior: "smooth" }),
        database: () => databaseRef.current?.scrollIntoView({ behavior: "smooth" }),
    };


    return (
        <SidebarProvider>
            {/* <TableOfContent /> */}
            <FloatingSidebar scrollFns={scrollFns} />
            <div className="bg-gradient-to-br from-[#ffefd5] to-[#fff0f5] relative h-full w-full flex flex-col  items-center justify-center">
                {/* <Navbar /> */}
                {/* <SidebarTrigger className="fixed top-1/2 bottom-0 rounded-full bg-pink-200 border-2 border-pink-500 p-5 text-xl left-10 z-20" /> */}

                <div className="w-full flex items-center justify-center relative ">
                    <img className="absolute left-0 -bottom-1 " src="/images/wave.svg" />
                    <div className="flex flex-col md:flex-row relative md:space-x-5 items-center justify-center max-w-5xl p-10 md:px-20">
                        <div className="md:w-1/2 hidden md:block ">
                            <img className="" src="/images/sakura-explain-2.png" alt="" />
                        </div>
                        <div className="md:hidden flex items-center justify-center">
                            <img className="w-1/2" src="/images/sakura-explain-4.png" alt="" />
                        </div>
                        <div className="flex flex-col md:w-1/2 space-y-4 ">
                            <Card className="relative p-5 rounded-2xl shadow-lg bg-gradient-to-br from-pink-800 to-pink-500 text-white font-sm">
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Corrupti et consequuntur illo, esse, cupiditate facere sunt cum officiis temporibus perspiciatis ad laudantium aliquid earum quidem ipsam doloremque voluptatum unde tempora.
                                <span className="absolute -right-4 -bottom-2 text-5xl -rotate-45">🌸</span>
                            </Card>

                            <Card className="rounded-2xl">
                                <Table className="rounded-2xl">
                                    <TableHeader className="rounded-2xl text-center">
                                        <TableRow>
                                            <TableHead className="w-12 text-center">Rank</TableHead>
                                            <TableHead className="text-center">質問内容</TableHead>
                                            <TableHead className="w-24 text-center">件数</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="rounded-2xl">

                                        <TableRow className="cursor-pointer" onClick={() => usePrompt(faqs[0].question)} key={faqs[0].question}>
                                            <TableCell className="font-medium tabular-nums flex items-center justify-center ">
                                                <Crown className="text-[#FFD700] " fill="#FFD700" />
                                            </TableCell>
                                            <TableCell className="">{faqs[0].question}</TableCell>
                                            <TableCell className="text-center tabular-nums ">
                                                {faqs[0].count}

                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="cursor-pointer" onClick={() => usePrompt(faqs[1].question)} key={faqs[1].question}>
                                            <TableCell className="font-medium tabular-nums text-center flex items-center justify-center">
                                                <Crown className="text-[#C0C0C0] " fill="#C0C0C0" />

                                            </TableCell>
                                            <TableCell className="">{faqs[1].question}</TableCell>
                                            <TableCell className="text-center tabular-nums">
                                                {faqs[1].count}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="cursor-pointer" onClick={() => usePrompt(faqs[2].question)} key={faqs[2].question}>
                                            <TableCell className="font-medium tabular-nums text-center flex items-center justify-center">
                                                <Crown className="text-[#CD7F32] " fill="#CD7F32" />
                                            </TableCell>
                                            <TableCell className="">{faqs[2].question}</TableCell>
                                            <TableCell className="text-center tabular-nums">
                                                {faqs[2].count}
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>

                                </Table>
                            </Card>
                            <Card onClick={openRankingDialog} className="bg-white rounded-2xl"><Button className="w-full rounded-2xl bg-white text-black hover:text-white hover:bg-gradient-to-tr from-pink-800 to-pink-500"><ArrowDown /></Button></Card>

                        </div>
                    </div>
                </div>
                <div className="relative w-full flex items-center justify-center">
                    <img className="absolute left-0 top-0 rotate-180" src="/images/wave.svg" />

                    <div className="max-w-3xl p-10 h-full md:max-w-4xl  lg:max-w-[55rem]  rounded-3xl flex items-center justify-center w-full ">
                        <MainGrid scrollFns={scrollFns} />
                    </div>
                    {/* <img className="absolute left-0 -bottom-1 " src="/images/wave-2.svg" /> */}

                </div>

                <div ref={aboutRef} className="relative w-full flex flex-col items-center justify-center py-20 ">
                    {/* <img className="absolute left-0 -top-1 rotate-180" src="/images/wave-2.svg" /> */}
                    <div className=" flex flex-col items-center justify-center  xl:max-w-4xl z-20 space-y-10 p-5 md:p-0">
                        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-pink-800 to-pink-500 bg-clip-text">さくらボットとは
                            <img className="absolute left-0 -bottom-0  " src="/images/wave-2.svg" />
                        </h1>
                        <SakurabotDefinition />
                    </div>



                </div>


                <div ref={usageRef} className="relative w-full flex items-center justify-center py-20">
                    {/* <img className="absolute left-0 -top-1 rotate-180" src="/images/wave-2.svg" /> */}
                    <div className="flex flex-col items-center justify-center  xl:max-w-4xl z-20 w-fit ">
                        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r w-fit from-pink-800 to-pink-500 bg-clip-text">サイトの使い方</h1>
                        <ImageHighlightPage menuRef={menuRef} databaseRef={databaseRef} userTypeRef={userTypeRef} activeSlide={active} onChange={setActive} />
                    </div>
                    <img className="absolute left-0 -bottom-0 " src="/images/wave-2.svg" />

                </div>

                <div ref={askRef} className="relative w-full py-20 flex items-center justify-center">
                    {/* <img className="absolute left-0 -top-1 rotate-180" src="/images/wave-2.svg" /> */}
                    <div className="flex flex-col items-center justify-center  xl:max-w-4xl z-20 w-fit">
                        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r w-fit from-pink-800 to-pink-500 bg-clip-text">よい質問の仕方</h1>
                        <HowToAskGoodQuestions />
                    </div>
                    <img className="absolute left-0 -bottom-0 z-0" src="/images/wave-2.svg" />
                </div>

                <Footer />

            </div>
            <AlertDialog open={isRankOpen} onOpenChange={setIsRankOpen}>
                <AlertDialogContent className=" bg-gradient-to-br from-[#ffefd5] to-[#fff0f5] mx-auto max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-pink-600">質問ランキング</AlertDialogTitle>
                        <AlertDialogDescription className="text-black">

                            <ScrollArea
                                /* 4 × 48 px rows  +  56 px header  = 248 px   tweak if your row/header differs */
                                className="h-[248px] overflow-hidden rounded-2xl px-2"
                                type="scroll"       /* common vertical scrollbar */

                            >
                                <Table className="bg-white rounded-2xl">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>質問内容</TableHead>
                                            <TableHead className="w-24 text-right">件数</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {faqs.map((faq, idx) => (
                                            <TableRow className="cursor-pointer" onClick={() => usePrompt(faq.question)} key={faq.question}>
                                                <TableCell className="font-medium tabular-nums">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell>{faq.question}</TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {faq.count}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="relative">
                        <AlertDialogCancel className="bg-pink-500 hover:bg-pink-600 text-white border border-pink-400">
                            閉じる
                        </AlertDialogCancel>
                        <img className="absolute -left-10 -bottom-6 w-16 h-20  hidden md:block" src="/images/sakura-explain-5.png" />

                    </AlertDialogFooter>

                </AlertDialogContent>

            </AlertDialog>
        </SidebarProvider>

    );
};

export default Testing;



