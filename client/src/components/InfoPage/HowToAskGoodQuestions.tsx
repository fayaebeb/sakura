import React, { useContext } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Dot } from 'lucide-react'
import { motion } from "framer-motion";
// src/components/QuestionBreakdownFlow.tsx
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    BackgroundVariant,
    Controls,
    MarkerType,
    Node,
    Edge,
} from "@xyflow/react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import {
    AlertTriangle,
    Clock,
    Lock,
    Globe,
} from "lucide-react";
import "@xyflow/react/dist/style.css";
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '../ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';

/* ---------- shared tailwind box ---------- */
const box =
    "rounded-xl border border-pink-500 bg-pink-200 shadow-md shadow-pink-400 backdrop-blur-md px-4 py-3 shadow text-sm whitespace-pre-wrap";

/* ---------- props ---------- */
export interface QuestionBreakdownFlowProps {
    initialQuestion: string;
    parts: string[];
}

export function QuestionBreakdownFlow({
    initialQuestion,
    parts,
}: QuestionBreakdownFlowProps) {
    // layout constants
    const nodeWidth = 240;
    const spacingX = 80;
    // center the initial node above the row of parts
    const initialX = ((parts.length - 1) * (nodeWidth + spacingX)) / 2;

    /* ---------- nodes ---------- */
    const nodes: Node[] = [
        {
            id: "initial",
            type: "input",
            position: { x: initialX, y: 0 },
            data: { label: `Complex Question\n\n${initialQuestion}` },
            className: `${box} font-semibold  text-center`,
            style: { width: nodeWidth },
        },
        ...parts.map((part, i) => ({
            id: `part-${i}`,
            position: { x: i * (nodeWidth + spacingX), y: 200 },
            data: { label: part },
            className: box,
            style: { width: nodeWidth },
        })),
    ];

    /* ---------- edges ---------- */
    const arrow = {
        markerEnd: { type: MarkerType.ArrowClosed, color: "#ec4899" },
        animated: true,
        style: { stroke: "#ec4899", strokeWidth: 2 },
    };
    const edges: Edge[] = parts.map((_, i) => ({
        id: `e-initial-part-${i}`,
        source: "initial",
        target: `part-${i}`,
        ...arrow,
    }));

    const isMobile = useIsMobile()


    return (
        <div className="h-[350px] w-full rounded-2xl bg-white border border-pink-500 dark:bg-[#2b2b36]  shadow-lg z-20">
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    panOnDrag={isMobile}
                    panOnScroll={false}
                    zoomOnScroll={false}
                    zoomOnPinch={isMobile}
                    zoomOnDoubleClick={isMobile}
                    selectionOnDrag={false}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    proOptions={{ hideAttribution: true }}
                    preventScrolling={false}
                >
                    <Background
                        gap={32}
                        size={2}
                        color="#f9a8d4"
                        variant={BackgroundVariant.Dots}
                    />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
}


const items = [
    {
        key: "knowledge-cutoff",
        icon: <AlertTriangle className="h-6 w-6 text-pink-500" />,
        title: "知識のカットオフ",
        description: "2024年6月以降のイベントや最新情報については答えられません。",
    },
    {
        key: "no-real-time",
        icon: <Clock className="h-6 w-6 text-pink-500" />,
        title: "リアルタイムデータなし",
        description: "ライブスコア、株価、現在の天気などの取得はできません。",
    },
    {
        key: "privacy-security",
        icon: <Lock className="h-6 w-6 text-pink-500" />,
        title: "プライバシー・セキュリティ",
        description: "個人の機密情報や認証情報を取り扱うことはありません。",
    },
    {
        key: "unavailable-media",
        icon: <Globe className="h-6 w-6 text-pink-500" />,
        title: "未対応のメディア",
        description: "有料コンテンツや非公開ドキュメント、未公開のメディアにはアクセスできません。",
    },
];

const badges = [
    "医療アドバイス禁止",
    "法的助言禁止",
    "誤情報生成の可能性あり",
    "言語バイアスあり",
];

const HowToAskGoodQuestions = () => {
    return (
        <div className="flex flex-col space-y-2 py-5 px-5">
            <div className="space-y-2 relative ">
                <div className='hidden md:block absolute top-1/2 -left-16 h-16 w-16 p-20 rounded-full bg-[#e7008a]' />
                <div className='hidden md:block absolute top-0 -right-16 h-16 w-16 p-20 rounded-full bg-[#e7008a]' />
                <div className='flex flex-col md:flex-row  rounded-2xl pt-10  w-full md:space-x-2 md:space-y-0 space-x-0 space-y-2'>
                    < div className="bg-white flex flex-col  items-center justify-center p-4 rounded-2xl border border-pink-400 relative  ">
                        <div className="space-y-5 ">
                            <h1 className="text-xl font-semibold text-pink-500">質問オプション</h1>

                            <div className='flex items-center justify-center rounded-2xl shadow-md shadow-pink-500 bg-gradient-to-br from-pink-100 to-pink-50 ' >
                                <img className='h-[200px] pt-2' src="/images/sakura-bad-2.png" alt="" />
                            </div>

                            <div className="rounded-lg shadow-md shadow-red-500 px-4 py-2 mt-3 mb-1 bg-gradient-to-r from-red-200 via-red-100 to-white border-r-4 border-b-4 border text-xs border-red-300 text-red-500 italic font-bold font-sans cursor-pointer ">
                                <span className="px-2 border-l-2 border-l-red-500">こんにちは！</span>
                            </div>
                            <div className=" ">
                                <div className="flex ">
                                    <Dot size={20} /><span>音声モードでは、音声入力の会話形式で応答できます。</span>
                                </div>

                                <div className="flex"><Dot size={20} /><span>履歴削除すると今までの履歴が消されます。</span></div>
                                <div className="flex"><Dot size={20} /><span>フィードバックでは、本サイトのレビューを投稿できます。</span></div>

                            </div>
                        </div>

                    </div>


                    < div className="bg-white flex flex-col  items-center justify-center p-4 rounded-2xl border border-pink-400 relative  h-full">
                        <div className="space-y-5 h-full">
                            <h1 className="text-xl font-semibold text-pink-500">質問オプション</h1>
                            <div className='flex items-center justify-center rounded-2xl shadow-md shadow-pink-500 bg-gradient-to-br from-pink-100 to-pink-50 ' >
                                <img className='h-[200px] pt-3' src="/images/sakura-good.png" alt="" />
                            </div>
                            <div className="rounded-lg shadow-md shadow-green-500 px-4 py-2 mt-3 mb-1 bg-gradient-to-r from-green-200 via-green-100 to-white border-r-4 border-b-4 border text-xs border-green-300 text-green-500 italic font-bold font-sans cursor-pointer ">
                                <span className="px-2 border-l-2 border-l-green-500">こんにちは！</span>
                            </div>
                            <div className=" ">
                                <div className="flex ">
                                    <Dot size={20} /><span>音声モードでは、音声入力の会話形式で応答できます。</span>
                                </div>

                                <div className="flex"><Dot size={20} /><span>履歴削除すると今までの履歴が消されます。</span></div>
                                <div className="flex"><Dot size={20} /><span>フィードバックでは、本サイトのレビューを投稿できます。</span></div>

                            </div>

                        </div>

                    </div>

                </div>
                <div className='z-20 flex'>
                    <QuestionBreakdownFlow
                        initialQuestion="オンラインストアのコンバージョン率を向上させるために、ユーザー行動データの分析からどのような改善策を優先的に実装すれば効果的でしょうか？"
                        parts={[
                            "現在のオンラインストアで最も離脱が多いページやステップはどこか？",
                            "ユーザー行動ログから売上に最も影響を与えている要素は何か？",
                            "A/Bテストで検証すべき仮説と、それを評価するためのKPIは何か？",
                        ]}
                    />
                </div>
                {/* <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-pink-50 border border-pink-200 p-6 rounded-2xl"
                >
                    <Card className="border-pink-300 bg-pink-100 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-pink-700 text-xl">🌸 制限事項</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {items.map(({ key, icon, title, description }) => (
                                    <HoverCard key={key} openDelay={50}>
                                        <HoverCardTrigger asChild>
                                            <motion.div
                                                whileHover={{ scale: 1.03 }}
                                                transition={{ type: "spring", stiffness: 250 }}
                                                className="flex items-center space-x-3 p-4 bg-white border border-pink-200 rounded-lg shadow-sm cursor-pointer"
                                            >
                                                {icon}
                                                <span className="text-pink-600 font-semibold">{title}</span>
                                            </motion.div>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-64 bg-pink-50 border border-pink-200 text-pink-700 rounded-lg shadow-md p-3">
                                            <p>{description}</p>
                                        </HoverCardContent>
                                    </HoverCard>
                                ))}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {badges.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="border-pink-300 text-pink-600"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div> */}


            </div>
        </div>
    )
}

export default HowToAskGoodQuestions