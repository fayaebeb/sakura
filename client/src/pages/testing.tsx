import { Button } from "@/components/ui/button";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import Autoplay from "embla-carousel-autoplay"

import React, { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, Book, Crown, FileText, Globe, Mic, Sparkle } from "lucide-react";
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





const Testing = () => {




    return (
        // <SidebarProvider>
        //     {/* <TableOfContent /> */}
        //     <FloatingSidebar scrollFns={scrollFns} />
        //     <div className="bg-gradient-to-br from-[#ffefd5] to-[#fff0f5] relative h-full w-full flex flex-col  items-center justify-center">
        //         {/* <Navbar /> */}
        //         {/* <SidebarTrigger className="fixed top-1/2 bottom-0 rounded-full bg-pink-200 border-2 border-pink-500 p-5 text-xl left-10 z-20" /> */}

        //         <div className="w-full flex items-center justify-center relative ">
        //             <img className="absolute left-0 -bottom-1 " src="/images/wave.svg" />
        //             <div className="flex flex-col md:flex-row relative md:space-x-5 items-center justify-center max-w-5xl p-10 md:px-20">
        //                 <div className="md:w-1/2 hidden md:block ">
        //                     <img className="" src="/images/sakura-explain-2.png" alt="" />
        //                 </div>
        //                 <div className="md:hidden flex items-center justify-center">
        //                     <img className="w-1/2" src="/images/sakura-explain-4.png" alt="" />
        //                 </div>
        //                 <div className="flex flex-col md:w-1/2 space-y-4 ">
        //                     <Card className="relative p-5 rounded-2xl shadow-lg bg-gradient-to-br from-pink-800 to-pink-500 text-white font-sm">
        //                         Lorem ipsum dolor sit, amet consectetur adipisicing elit. Corrupti et consequuntur illo, esse, cupiditate facere sunt cum officiis temporibus perspiciatis ad laudantium aliquid earum quidem ipsam doloremque voluptatum unde tempora.
        //                         <span className="absolute -right-4 -bottom-2 text-5xl -rotate-45">🌸</span>
        //                     </Card>

        //                     <Card className="rounded-2xl">
        //                         <Table className="rounded-2xl">
        //                             <TableHeader className="rounded-2xl text-center">
        //                                 <TableRow>
        //                                     <TableHead className="w-12 text-center">Rank</TableHead>
        //                                     <TableHead className="text-center">質問内容</TableHead>
        //                                     <TableHead className="w-24 text-center">件数</TableHead>
        //                                 </TableRow>
        //                             </TableHeader>
        //                             <TableBody className="rounded-2xl">

        //                                 <TableRow className="cursor-pointer" onClick={() => usePrompt(faqs[0].question)} key={faqs[0].question}>
        //                                     <TableCell className="font-medium tabular-nums flex items-center justify-center ">
        //                                         <Crown className="text-[#FFD700] " fill="#FFD700" />
        //                                     </TableCell>
        //                                     <TableCell className="">{faqs[0].question}</TableCell>
        //                                     <TableCell className="text-center tabular-nums ">
        //                                         {faqs[0].count}

        //                                     </TableCell>
        //                                 </TableRow>
        //                                 <TableRow className="cursor-pointer" onClick={() => usePrompt(faqs[1].question)} key={faqs[1].question}>
        //                                     <TableCell className="font-medium tabular-nums text-center flex items-center justify-center">
        //                                         <Crown className="text-[#C0C0C0] " fill="#C0C0C0" />

        //                                     </TableCell>
        //                                     <TableCell className="">{faqs[1].question}</TableCell>
        //                                     <TableCell className="text-center tabular-nums">
        //                                         {faqs[1].count}
        //                                     </TableCell>
        //                                 </TableRow>
        //                                 <TableRow className="cursor-pointer" onClick={() => usePrompt(faqs[2].question)} key={faqs[2].question}>
        //                                     <TableCell className="font-medium tabular-nums text-center flex items-center justify-center">
        //                                         <Crown className="text-[#CD7F32] " fill="#CD7F32" />
        //                                     </TableCell>
        //                                     <TableCell className="">{faqs[2].question}</TableCell>
        //                                     <TableCell className="text-center tabular-nums">
        //                                         {faqs[2].count}
        //                                     </TableCell>
        //                                 </TableRow>

        //                             </TableBody>

        //                         </Table>
        //                     </Card>
        //                     <Card onClick={openRankingDialog} className="bg-white rounded-2xl"><Button className="w-full rounded-2xl bg-white text-black hover:text-white hover:bg-gradient-to-tr from-pink-800 to-pink-500"><ArrowDown /></Button></Card>

        //                 </div>
        //             </div>
        //         </div>
        //         <div className="relative w-full flex items-center justify-center">
        //             <img className="absolute left-0 top-0 rotate-180" src="/images/wave.svg" />

        //             <div className="max-w-3xl p-10 h-full md:max-w-4xl  lg:max-w-[55rem]  rounded-3xl flex items-center justify-center w-full ">
        //                 <MainGrid scrollFns={scrollFns} />
        //             </div>
        //             {/* <img className="absolute left-0 -bottom-1 " src="/images/wave-2.svg" /> */}

        //         </div>

        //         <div ref={aboutRef} className="relative w-full flex flex-col items-center justify-center py-20 ">
        //             {/* <img className="absolute left-0 -top-1 rotate-180" src="/images/wave-2.svg" /> */}
        //             <div className=" flex flex-col items-center justify-center  xl:max-w-4xl z-20 space-y-10 p-5 md:p-0">
        //                 <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-pink-800 to-pink-500 bg-clip-text">さくらボットとは
        //                     <img className="absolute left-0 -bottom-0  " src="/images/wave-2.svg" />
        //                 </h1>
        //                 <SakurabotDefinition />
        //             </div>



        //         </div>


        //         <div ref={usageRef} className="relative w-full flex items-center justify-center py-20">
        //             {/* <img className="absolute left-0 -top-1 rotate-180" src="/images/wave-2.svg" /> */}
        //             <div className="flex flex-col items-center justify-center  xl:max-w-4xl z-20 w-fit ">
        //                 <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r w-fit from-pink-800 to-pink-500 bg-clip-text">サイトの使い方</h1>
        //                 <ImageHighlightPage menuRef={menuRef} databaseRef={databaseRef} userTypeRef={userTypeRef} activeSlide={active} onChange={setActive} />
        //             </div>
        //             <img className="absolute left-0 -bottom-0 " src="/images/wave-2.svg" />

        //         </div>

        //         <div ref={askRef} className="relative w-full py-20 flex items-center justify-center">
        //             {/* <img className="absolute left-0 -top-1 rotate-180" src="/images/wave-2.svg" /> */}
        //             <div className="flex flex-col items-center justify-center  xl:max-w-4xl z-20 w-fit">
        //                 <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r w-fit from-pink-800 to-pink-500 bg-clip-text">よい質問の仕方</h1>
        //                 <HowToAskGoodQuestions />
        //             </div>
        //             <img className="absolute left-0 -bottom-0 z-0" src="/images/wave-2.svg" />
        //         </div>

        //         <Footer />

        //     </div>
        //     <AlertDialog open={isRankOpen} onOpenChange={setIsRankOpen}>
        //         <AlertDialogContent className=" bg-gradient-to-br from-[#ffefd5] to-[#fff0f5] mx-auto max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-xl p-6">
        //             <AlertDialogHeader>
        //                 <AlertDialogTitle className="text-pink-600">質問ランキング</AlertDialogTitle>
        //                 <AlertDialogDescription className="text-black">

        //                     <ScrollArea
        //                         /* 4 × 48 px rows  +  56 px header  = 248 px   tweak if your row/header differs */
        //                         className="h-[248px] overflow-hidden rounded-2xl px-2"
        //                         type="scroll"       /* common vertical scrollbar */

        //                     >
        //                         <Table className="bg-white rounded-2xl">
        //                             <TableHeader>
        //                                 <TableRow>
        //                                     <TableHead className="w-12">#</TableHead>
        //                                     <TableHead>質問内容</TableHead>
        //                                     <TableHead className="w-24 text-right">件数</TableHead>
        //                                 </TableRow>
        //                             </TableHeader>
        //                             <TableBody>
        //                                 {faqs.map((faq, idx) => (
        //                                     <TableRow className="cursor-pointer" onClick={() => usePrompt(faq.question)} key={faq.question}>
        //                                         <TableCell className="font-medium tabular-nums">
        //                                             {idx + 1}
        //                                         </TableCell>
        //                                         <TableCell>{faq.question}</TableCell>
        //                                         <TableCell className="text-right tabular-nums">
        //                                             {faq.count}
        //                                         </TableCell>
        //                                     </TableRow>
        //                                 ))}
        //                             </TableBody>
        //                         </Table>
        //                     </ScrollArea>
        //                 </AlertDialogDescription>
        //             </AlertDialogHeader>
        //             <AlertDialogFooter className="relative">
        //                 <AlertDialogCancel className="bg-pink-500 hover:bg-pink-600 text-white border border-pink-400">
        //                     閉じる
        //                 </AlertDialogCancel>
        //                 <img className="absolute -left-10 -bottom-6 w-16 h-20  hidden md:block" src="/images/sakura-explain-5.png" />

        //             </AlertDialogFooter>

        //         </AlertDialogContent>

        //     </AlertDialog>
        // </SidebarProvider>
        <>
            <Card className="relative flex w-fit max-w-sm md:hidden overflow-visible bg-white/90 rounded-2xl pl-0 pr-0 pt-0 pb-0 bg-gradient-to-r from-pink-200 via-pink-200 to-white border-0 border-b-4 border-rose-600 shadow-xl ">

                {/* Left: Speech bubble area */}
                <div className=" ">
                    <div className="bg-white text-gray-800 text-xs rounded-lg shadow px-3 py-2 border border-pink-300 mt-3 ml-3 mr-2 mb-3 space-y-2 w-fit" >
                        <h2 className="text-base font-bold text-sakura-600 mb-1 w-fit">会話のヒント！</h2>
                        <p className="leading-snug w-fit">
                            ここで会話形式を選べるよ！​<br />
                            どんな答え方が良いか教えてね！
                        </p>
                        <div className="rounded-2xl w-1/2 shadow-md shadow-pink-300">
                            <img className=" " src="/images/suggestions_tutorial.png" alt="" />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-1 ml-3 mb-3">
                        <Button variant="outline" className="bg-pink-100 rounded-full text-xs px-3 py-1">
                            スキップ
                        </Button>
                        <Button className="bg-pink-300 hover:bg-pink-300 text-pink-800 rounded-full text-xs px-4 py-1">
                            戻る
                        </Button>
                        <Button className="rounded-full text-xs px-4 py-1 bg-pink-500 text-white hover:bg-pink-600">
                            次へ
                        </Button>
                    </div>
                </div>

                <img className="absolute bottom-0 -right-2 w-20 h-20" src="/images/sakura-thinking.png" alt="" />


                {/* Right: Mascot Image */}
                {/* <div className="relative w-[100px] flex items-end justify-center overflow-visible -mr-2">
                            <img
                                src="/images/sakura-explain-3.png"
                                alt="Sakura-chan"
                                className="absolute bottom-0 pointer-events-none h-[160px] w-[160px] select-none"
                                style={{ zIndex: 1 }}
                            />
                        </div> */}
            </Card>

            <Card className="hidden relative md:flex w-full max-w-lg overflow-visible bg-white/90 rounded-3xl pl-0 pr-0 pt-0 pb-0 bg-gradient-to-r from-pink-200 via-pink-200 to-white border-0 border-b-4 border-rose-600 shadow-2xl">

                {/* Left: Speech bubble area */}
                <div className="flex-1 flex flex-col justify-between">
                    <div className="bg-white text-gray-800 text-sm rounded-xl shadow px-4 py-3 border border-pink-300 mt-4 ml-4 mr-2 mb-4 space-y-2">
                        <h2 className="text-lg font-bold text-sakura-600 mb-1">会話のヒント！</h2>
                        <p className="leading-snug">
                            ここで会話形式を選べるよ！​<br />

                            どんな答え方が良いか教えてね！

                        </p>

                        <div className="rounded-2xl flex items-center justify-center shadow-md shadow-pink-300">
                            <img className="rounded-2xl" src="/images/suggestions_tutorial.png" alt="" />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-1 ml-4 mb-4 ">
                        <Button variant="outline" className="bg-pink-100 rounded-full text-sm">
                            スキップ
                        </Button>
                        <Button className="bg-pink-300 hover:bg-pink-300 text-pink-800 rounded-full px-6">
                            戻る
                        </Button>
                        <Button className="rounded-full text-sm bg-pink-500 text-white hover:bg-pink-600">
                            次へ
                        </Button>
                    </div>
                </div>

               

                {/* Right: Mascot Image */}
                <div className="relative w-[200px] flex items-end justify-center overflow-visible -mr-3">
                    <img
                        src="/images/sakura-thinking.png"
                        alt="Sakura-chan"
                        className="absolute bottom-0 pointer-events-none h-[250px] w-[250px] select-none"
                        style={{ zIndex: 1 }}
                    />

                </div>
            </Card>
        </>

    );
};

export default Testing;



