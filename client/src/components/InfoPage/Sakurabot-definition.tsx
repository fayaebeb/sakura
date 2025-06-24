import React, { useState } from 'react'

import { useRef, useEffect, useCallback } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { Star, TheaterIcon } from 'lucide-react';

/* -------------- constants you can tweak -------------- */
const TOTAL = 100;
const PETAL_SRC =
    "https://djjjk9bjm164h.cloudfront.net/petal.png"; // or use /assets/petal.png

/* ---------------------- types ------------------------ */
interface Petal {
    x: number;
    y: number;
    w: number;
    h: number;
    opacity: number;
    flip: number;
    flipSpeed: number;
    xSpeed: number;
    ySpeed: number;
}

/* ----------------------------------------------------- */
const PetalCard: React.FC<
    React.PropsWithChildren<{
        title?: string;
        className?: string;
    }>
> = ({ title = "Sakura Card", children, className = "" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const petalImgRef = useRef<HTMLImageElement | null>(null);
    const petalsRef = useRef<Petal[]>([]);
    const mouseXRef = useRef(0);
    const frameRef = useRef<number>();

    /* ---------- helpers ---------- */
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);

    /* ---------- init petals ---------- */
    const initPetals = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !petalImgRef.current) return;
        petalsRef.current = Array.from({ length: TOTAL }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 2 - canvas.height,
            w: 25 + Math.random() * 15,
            h: 20 + Math.random() * 10,
            opacity: 0.6 + Math.random() * 0.4,
            flip: Math.random(),
            flipSpeed: Math.random() * 0.03,
            xSpeed: 1.5 + Math.random() * 2,
            ySpeed: 1 + Math.random() * 1,
        }));
    }, []);

    /* ---------- animation loop ---------- */
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = petalImgRef.current;
        const petals = petalsRef.current;

        if (!canvas || !ctx || !img) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        petals.forEach((p) => {
            /* reset if out of screen */
            if (p.y > canvas.height || p.x > canvas.width) {
                p.x = -img.width;
                p.y = Math.random() * canvas.height * 2 - canvas.height;
                p.xSpeed = 1.5 + Math.random() * 2;
                p.ySpeed = 1 + Math.random() * 1;
                p.flip = Math.random();
            }

            /* draw */
            ctx.globalAlpha = p.opacity;
            ctx.drawImage(
                img,
                p.x,
                p.y,
                p.w * (0.6 + Math.abs(Math.cos(p.flip)) / 3),
                p.h * (0.8 + Math.abs(Math.sin(p.flip)) / 5),
            );

            /* update */
            p.x += p.xSpeed + mouseXRef.current * 5;
            p.y += p.ySpeed + mouseXRef.current * 2;
            p.flip += p.flipSpeed;
        });

        frameRef.current = requestAnimationFrame(animate);
    }, []);

    /* ---------- lifecycle ---------- */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        resizeCanvas();

        /* load image */
        const img = new Image();
        img.src = PETAL_SRC;
        img.onload = () => {
            petalImgRef.current = img;
            initPetals();
            animate();
        };

        /* events */
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX =
                "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as MouseEvent).clientX;
            mouseXRef.current = clientX / window.innerWidth;
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("touchmove", handleMove);
        window.addEventListener("resize", resizeCanvas);

        /* cleanup */
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("resize", resizeCanvas);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [resizeCanvas, initPetals, animate]);

    /* ---------- render ---------- */
    return (
        <Card
            className={`relative overflow-hidden  rounded-3xl shadow-xl ${className}`}
        >
            {/* animated canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            />
            {/* blur to soften petals behind content */}
            <div className="absolute inset-0" />

            {/* foreground content */}

            <CardContent className="relative z-10">{children}</CardContent>
        </Card>
    );
};

import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MarkerType,
    Node,
    Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
    MapPin,
    Users,
    Search,
    BookOpen,
} from "lucide-react";
import { Button } from '../ui/button';

/* ---------- shared tailwind box ---------- */
const box =
    "rounded-xl border-2 border-pink-500 bg-white/70 backdrop-blur-md px-4 py-3 shadow text-sm whitespace-pre-wrap";

/* ---------- nodes ---------- */
const nodes: Node[] = [
    {
        id: "sakura",
        type: "input",
        position: { x: 0, y: 0 },
        data: { label: "🌸 Sakura.bot" },
        className: `${box} font-bold text-pink-600`,
    },
    {
        id: "purpose",
        position: { x: -220, y: 150 },
        data: { label: "営業支援\n(ビッグデータ3兄弟)" },
        className: box,
    },
    {
        id: "datasources",
        position: { x: 220, y: 150 },
        data: {
            label: (
                <div className="flex flex-col gap-1 text-left">
                    <span className="flex items-center gap-1">
                        <MapPin size={16} /> 全国うごき統計
                    </span>
                    <span className="flex items-center gap-1">
                        <Users size={16} /> 全国インバウンド統計
                    </span>
                    <span className="flex items-center gap-1">
                        <Search size={16} /> 検索 × 人流
                    </span>
                </div>
            ),
        },
        className: box,
    },
    {
        id: "materials",
        position: { x: -220, y: 320 },
        data: {
            label: (
                <div className="flex flex-col gap-1 text-left">
                    <span className="flex items-center gap-1">
                        <BookOpen size={16} /> 部内人流講座
                    </span>
                    <span className="flex items-center gap-1">📑 営業資料</span>
                </div>
            ),
        },
        className: box,
    },
    {
        id: "web",
        position: { x: 0, y: 320 },
        data: {
            label: (
                <span className="flex items-center gap-1">
                    <Search size={16} /> Web検索
                </span>
            ),
        },
        className: box,
    },
    {
        id: "answers",
        position: { x: 220, y: 320 },
        data: { label: "データ概要\n活用事例\n差別化ポイント…" },
        className: box,
    },
    {
        id: "benefit",
        type: "output",
        position: { x: 0, y: 480 },
        data: { label: "“聞きにくい”疑問\n“時間がない”アイデア → 即回答✨" },
        className: `${box} font-semibold text-center`,
    },
];

/* ---------- edges ---------- */
const arrow = {
    markerEnd: { type: MarkerType.ArrowClosed, color: "#ec4899" },
};

const edges: Edge[] = [
    { id: "e1", source: "sakura", target: "purpose", animated: true, ...arrow },
    { id: "e2", source: "sakura", target: "datasources", animated: true, ...arrow },
    { id: "e3", source: "datasources", target: "answers", ...arrow },
    { id: "e4", source: "materials", target: "answers", ...arrow },
    { id: "e5", source: "web", target: "answers", ...arrow },
    { id: "e6", source: "answers", target: "benefit", animated: true, ...arrow },
    { id: "e7", source: "purpose", target: "materials", ...arrow },
    { id: "e8", source: "purpose", target: "web", ...arrow },
];
function useIsTouchDevice() {
    const [isTouch, setIsTouch] = React.useState(() =>
        typeof window !== "undefined" &&
        window.matchMedia("(pointer: coarse)").matches,
    );

    React.useEffect(() => {
        const mq = window.matchMedia("(pointer: coarse)");
        const handler = () => setIsTouch(mq.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return isTouch;
}

/* ---------- component ---------- */
function SakuraFlow() {
    const isTouch = useIsTouchDevice();
    return (
        <div className="h-[500px] w-full rounded-2xl bg-[#fff7f9] dark:bg-[#2b2b36] p-4 shadow-lg border border-pink-500">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={isTouch}
                panOnScroll={false}

                zoomOnScroll={!isTouch}
                zoomOnPinch={isTouch}
                zoomOnDoubleClick={!isTouch}
                selectionOnDrag={false}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }} /* keep 1× zoom */

                proOptions={{ hideAttribution: true }} /* tiny text bottom-right */
            >
                <Background
                    gap={32}
                    size={2}
                    color="#f9a8d4"
                    variant={BackgroundVariant.Dots}
                />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}


const SakurabotDefinition = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <>
            <PetalCard className=' md:p-10 bg-pink-300/20 backdrop-blur-2xl w-full h-full rounded-2xl shadow-2xl relative space-y-5'>
                <div className='  rounded-2xl  md:p-4 space-y-5'>
                    <h1 className='text-3xl font-extrabold text-pink-500 text-center md:text-left'>さくらボット🌺</h1>
                    <p className='text-black/90 text-pretty font'>“Sakura.bot”は、DX事業推進部で開発している「全国うごき統計」「全国インバウンド統計」「検索×人流ビッグデータ」の人流3兄弟ビッグデータの営業支援を目的として作成されたサイトです。
                        営業資料や部内人流講座資料を基軸に、必要に応じてWeb検索も利用することで、データの概要や具体的活用ケース、他社との差別化部分など幅広い質問に答えることができます。
                        「気になっていたけど聞きにくかった」「アイデアを考えたかったけど暇がなかった」等考えたことある方、ぜひご活用ください。
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-3  items-center justify-center gap-5 '>
                        <Card className='p-5 flex flex-col space-y-2 items-center justify-center bg-white backdrop-blur-lg border border-pink-500 rounded-2xl'>
                            <Star fill='#e7008a' stroke='#e7008a' />
                            <h4 className='text-xl font-semibold text-pink-500'>Heading </h4>
                        </Card>
                        <Card className='p-5 flex flex-col space-y-2 items-center justify-center bg-white backdrop-blur-lg border border-pink-500 rounded-2xl'>
                            <Star fill='#e7008a' stroke='#e7008a' />
                            <h4 className='text-xl font-semibold text-pink-500'>Heading </h4>
                        </Card>
                        <Card className='p-5 flex flex-col space-y-2 items-center justify-center bg-white backdrop-blur-lg border border-pink-500 rounded-2xl'>
                            <Star fill='#e7008a' stroke='#e7008a' />
                            <h4 className='text-xl font-semibold text-pink-500'>Heading </h4>
                        </Card>
                    </div>
                    <Button onClick={() => setIsOpen(true)} className='rounded-2xl w-full bg-gradient-to-br from-pink-800 to-pink-500'>FlowChart</Button>

                </div>
            </PetalCard>
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent className=" bg-gradient-to-br from-[#ffefd5] to-[#fff0f5] mx-auto max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-pink-600">Flow Chart</AlertDialogTitle>
                        <AlertDialogDescription className="text-black">

                            <div>
                                <SakuraFlow />
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white text-pink-500 border-pink-200 hover:bg-pink-50">
                            閉じる
                        </AlertDialogCancel>

                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default SakurabotDefinition