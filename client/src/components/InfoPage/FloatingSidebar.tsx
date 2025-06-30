import React, { useState } from "react";
import {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Menu,
    Home,
    FileText,
    Settings,
    Info,
    ChevronRight,
    Dot,
    AudioLines,
    User,
    Trash2,
    MessageSquare,
    Gem,
    MessageCircleQuestion,
    SettingsIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { ScrollHandlers } from "@/pages/info-page";
import FeedbackDialog from "../feedback-dialog";
import { useRecoilState } from "recoil";
import { settingsStateAtom } from "@/state/settingsState";

/* -------------------------------------------------------------------------- */
/*                               Nav definition                               */
/* -------------------------------------------------------------------------- */

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactElement;
    children?: NavItem[];
    scrollTo?: keyof ScrollHandlers;
}

const nav: NavItem[] = [
    { label: "さくらボットとは", href: "/", icon: <Home size={18} /> },
    { label: "さくらボットとは", icon: <MessageCircleQuestion size={18} />, scrollTo: "about" },

    {
        label: "サイトの使い方",
        icon: <FileText size={18} />,
        scrollTo: "usage",
        children: [
            { label: "メニュー", icon: <Dot size={20} />, scrollTo: "menu" },
            { label: "質問オプション", icon: <Dot size={20} />, scrollTo: "userType" },
            { label: "参照先データ", icon: <Dot size={20} />, scrollTo: "database" },
        ],
    },

    { label: "よい質問の仕方", icon: <Settings size={18} />, scrollTo: "ask" },
    { label: "利用上の注意", icon: <Info size={18} />, scrollTo: "terms" },
];

/* -------------------------------------------------------------------------- */
/*                               Sidebar component                            */
/* -------------------------------------------------------------------------- */

interface FloatingSidebarProps {
    scrollFns: ScrollHandlers;
}

const FloatingSidebar: React.FC<FloatingSidebarProps> = ({ scrollFns }) => {
    const { user, logoutMutation } = useAuth();
    const displayName = user?.email?.split("@")[0];
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

    const [_, setIsSettingsOpen] = useRecoilState(settingsStateAtom);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleOpenSheet = () => {

        setIsSettingsOpen(true);
        // setIsSidebarOpen(false)
    };

    return (
        <Sheet>
            {/* ── trigger ── */}
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="fixed top-4 left-4 z-50 rounded-full bg-pink-200 backdrop-blur-md shadow-lg "
                // onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open sidebar</span>
                </Button>
            </SheetTrigger>

            {/* ── transparent overlay (no darkening) ── */}
            <SheetPortal>
                <SheetOverlay className="bg-transparent backdrop-blur-0" />

                {/* ── drawer ── */}
                <SheetContent
                    side="left"
                    className="w-72 sm:w-80 flex flex-col h-full bg-pink-300/20 backdrop-blur-2xl"
                >
                    {/* header */}
                    <SheetHeader className="p-6">
                        <SheetTitle className="text-xl font-semibold">
                            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                                <Link href="/">
                                    <img
                                        src="/images/pclogo.png"
                                        alt="Company Logo"
                                        className="h-5 sm:h-10"
                                    />
                                </Link>
                            </motion.div>
                        </SheetTitle>
                    </SheetHeader>

                    {/* navigation */}
                    <nav className="px-4 py-4 flex flex-col gap-1 flex-1 overflow-y-auto">
                        {nav.map((item) =>
                            item.children ? (
                                <Accordion
                                    key={item.label}
                                    type="single"
                                    collapsible
                                    defaultValue={item.label}
                                    className="w-full"
                                >
                                    <AccordionItem className="border-none" value={item.label}>
                                        <AccordionTrigger className="flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium hover:bg-gradient-to-br hover:from-pink-700 hover:to-pink-500 hover:text-white">
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    scrollFns.usage();
                                                }}
                                                className="flex items-center gap-3 w-full"
                                            >
                                                {item.icon}
                                                {item.label}
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="pl-8 flex flex-col gap-1">
                                            {item.children.map((sub) =>
                                                sub.scrollTo ? (
                                                    <SheetClose asChild key={sub.label}>
                                                        <button
                                                            onClick={() => scrollFns[sub.scrollTo!]?.()}
                                                            className="hover:bg-gradient-to-br hover:from-pink-800 hover:to-pink-500 hover:text-white flex items-center gap-2 rounded-md px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        >
                                                            {sub.icon}
                                                            {sub.label}
                                                        </button>
                                                    </SheetClose>
                                                ) : sub.href ? (
                                                    <SheetClose asChild key={sub.href}>
                                                        <Link
                                                            href={sub.href}
                                                            className="hover:bg-gradient-to-br hover:from-pink-800 hover:to-pink-500 hover:text-white flex items-center gap-2 rounded-md px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        >
                                                            {sub.icon}
                                                            {sub.label}
                                                        </Link>
                                                    </SheetClose>
                                                ) : null
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            ) : item.scrollTo ? (
                                <SheetClose asChild key={item.label}>
                                    <button
                                        onClick={() => scrollFns[item.scrollTo!]?.()}
                                        className="hover:bg-gradient-to-br hover:from-pink-700 hover:to-pink-500 hover:text-white flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                </SheetClose>
                            ) : item.href ? (
                                <SheetClose asChild key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="hover:bg-gradient-to-br hover:from-pink-700 hover:to-pink-500 hover:text-white flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                </SheetClose>
                            ) : null
                        )}
                    </nav>

                    <SheetFooter className="flex flex-col items-center justify-center space-y-1">
                        <motion.div
                            className="flex items-center justify-center"
                            initial={{ scale: 0.9, y: -10, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            transition={{ type: 'spring', duration: 0.8 }}
                        >
                            <motion.img
                                src="/images/sakura-logo.png"
                                alt="桜AI ロゴ"
                                className="h-16 sm:h-24 w-auto"
                                whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
                                transition={{ rotate: { duration: 0.5 } }}
                            />
                        </motion.div>
                        {user ? (
                            <div className="flex flex-col w-full space-y-1">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative"
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full rounded-xl bg-white hover:bg-pink-500 hover:border-white border hover:text-white text-pink-500"
                                            >
                                                <Avatar className="h-7 w-7 border border-pink-200 bg-pink-100/70">
                                                    <AvatarFallback className="text-pink-700 text-xs">
                                                        {displayName ? displayName[0].toUpperCase() : ""}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <motion.span
                                                    className="text-sm font-medium flex items-center"
                                                    animate={{ scale: [1, 1.05, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    {displayName}さん
                                                    <Gem className="h-3 w-3 text-pink-400 ml-1" />
                                                </motion.span>
                                                <Menu className="h-4 w-4 sm:hidden" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 border-pink-100 bg-white/95 backdrop-blur-sm">
                                            <DropdownMenuLabel className="text-pink-700 flex items-center gap-2">
                                                <User className="h-4 w-4 text-pink-500" />
                                                <span>{displayName}さん</span>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-pink-100/70" />
                                            <Link href="/voice">
                                                <DropdownMenuItem className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800">
                                                    <AudioLines className="h-4 w-4 text-pink-500" />
                                                    音声モード
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem
                                                onClick={() => setShowFeedbackDialog(true)}
                                                className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                                            >
                                                <MessageSquare className="h-4 w-4 text-pink-500" />
                                                フィードバック
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={handleOpenSheet}
                                                className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                                            >
                                                <SettingsIcon className="h-4 w-4 text-pink-500" />
                                                設定
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative w-full"
                                >
                                    <Link className="w-full" href="/auth">
                                        <div
                                            onClick={() => logoutMutation.mutate()}
                                            className="flex items-center justify-center p-1.5 text-sm w-full rounded-xl bg-white hover:bg-pink-500 hover:border-white border hover:text-white text-pink-500"
                                        >
                                            ログアウト
                                        </div>
                                    </Link>
                                </motion.div>

                            </div>
                        ) : (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative w-full"
                            >
                                <Link className="w-full" href="/auth">
                                    <div className="w-full rounded-xl bg-white hover:bg-pink-500 hover:border-white border hover:text-white text-pink-500">
                                        ログイン
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </SheetFooter>
                </SheetContent>
            </SheetPortal>
            <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
        </Sheet>
    );
};

export default FloatingSidebar;
