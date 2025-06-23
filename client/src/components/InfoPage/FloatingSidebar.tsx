import React from "react";
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
import { Button } from "@/components/ui/button";
import {
    Menu,
    Home,
    FileText,
    Settings,
    Info,
    ChevronRight,
    Dot,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

/* -------------------------------------------------------------------------- */
/*                               Nav definition                               */
/* -------------------------------------------------------------------------- */

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactElement;
    children?: NavItem[];
}

const nav: NavItem[] = [
    { label: "さくらボットとは", href: "/", icon: <Home size={18} /> },

    {
        label: "サイトの使い方",
        icon: <FileText size={18} />,
        // ↓ sub-pages
        children: [
            { label: "メニュー", href: "/docs/chat", icon: <Dot size={20} /> },
            { label: "質問オプション", href: "/docs/options", icon: <Dot size={20} /> },
            { label: "参照先データ", href: "/docs/options", icon: <Dot size={20} /> },
        ],
    },

    { label: "よい質問の仕方", href: "/ask", icon: <Settings size={18} /> },
    { label: "利用上の注意", href: "/terms", icon: <Info size={18} /> },
];

/* -------------------------------------------------------------------------- */
/*                               Sidebar component                            */
/* -------------------------------------------------------------------------- */

const FloatingSidebar: React.FC = () => {
    const { user, logoutMutation } = useAuth();
    const displayName = user?.email?.split("@")[0];


    return (
        <Sheet>
            {/* ── trigger ── */}
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="fixed top-4 left-4 z-50 rounded-full bg-pink-200 backdrop-blur-md shadow-lg "
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
                    className="
            w-72 sm:w-80  flex flex-col h-full
            bg-pink-300/20 backdrop-blur-2xl
            border-r border-white/30 
          "
                >
                    {/* header */}
                    <SheetHeader className="border-b border-border p-6">
                        <SheetTitle className="text-xl font-semibold">
                            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                                <Link href={"/"}>
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
                    <nav className="px-4 py-6 flex flex-col gap-1  flex-1 overflow-y-auto ">
                        {nav.map((item) =>
                            item.children ? (
                                /* ── accordion parent ── */
                                <Accordion
                                    key={item.label}
                                    type="single"
                                    collapsible
                                    defaultValue={item.label} /* ⇢ open by default */
                                    className="w-full"
                                >
                                    <AccordionItem value={item.label}>
                                        {/* trigger row */}
                                        <AccordionTrigger
                                            className="
                        flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium no-underline hover:no-underline
                        hover:bg-accent hover:text-accent-foreground hover:bg-gradient-to-br hover:from-pink-700 hover:to-pink-500 hover:text-white
                      "
                                        >
                                            {item.icon}
                                            {item.label}

                                        </AccordionTrigger >

                                        {/* children */}
                                        <AccordionContent className="pl-8 flex flex-col gap-1 ">
                                            {item.children.map((sub) => (
                                                <SheetClose asChild key={sub.href}>
                                                    <a
                                                        href={sub.href}
                                                        className=" hover:bg-gradient-to-br hover:from-pink-800 hover:to-pink-500 hover:text-white
                              flex items-center gap-2 rounded-md px-3 py-1.5 text-sm
                              hover:bg-accent hover:text-accent-foreground
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                            "
                                                    >
                                                        {sub.icon}
                                                        {sub.label}
                                                    </a>
                                                </SheetClose>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            ) : (
                                /* ── single-level link ── */
                                <SheetClose className="hover:bg-gradient-to-br hover:from-pink-700 hover:to-pink-500 hover:text-white" asChild key={item.href}>
                                    <a
                                        href={item.href}
                                        className="
                      flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium
                      hover:bg-accent hover:text-accent-foreground
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    "
                                    >
                                        {item.icon}
                                        {item.label}
                                    </a>
                                </SheetClose>
                            )
                        )}
                    </nav>
                    <SheetFooter className=" flex flex-col items-center justify-center space-y-5">
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
                            <div className="flex flex-col space-y-2">
                                <Button className="w-full rounded-xl bg-white text-pink-500">
                                    {displayName}
                                </Button>
                                <Button
                                    onClick={() => logoutMutation.mutate()}
                                    className="w-full rounded-xl bg-white text-pink-500"
                                >
                                    ログアウト
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full rounded-xl bg-white text-pink-500">
                                ログイン
                            </Button>
                        )}

                    </SheetFooter>

                </SheetContent>
            </SheetPortal>
        </Sheet>


    );
};

export default FloatingSidebar;
