import React, { useState } from 'react'
import { motion } from "framer-motion";
import { Heart, Sparkles, AudioLines, Gem, Trash2, LogOut, User, Menu, MessageSquare, BookOpen, BadgeInfo, SettingsIcon } from "lucide-react";

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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { tourState } from '@/state/tourState';
import FeedbackDialog from './feedback-dialog';
import { settingsStateAtom } from '@/state/settingsState';



const Navbar = () => {

    const { user, logoutMutation } = useAuth();
    const { toast } = useToast();


    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [_, setIsSettingsOpen] = useRecoilState(settingsStateAtom);

    const setTour = useSetRecoilState(tourState);


    const getSessionId = () => {
        if (!user?.id) return "";
        const storageKey = `chat_session_id_user_${user.id}`;
        return localStorage.getItem(storageKey) || "";
    };

    const deleteChatMutation = useMutation({
        mutationFn: async () => {
            const sessionId = getSessionId();
            if (!sessionId) {
                throw new Error("セッションIDが見つかりません。");
            }

            const res = await apiRequest("DELETE", `/api/messages/${sessionId}`);
            if (!res.ok) {
                const errorText = await res.text().catch(() => "Unknown error");
                throw new Error(`Failed to delete chat history: ${res.status} ${errorText}`);
            }

            return res.json();
        },
        onSuccess: () => {
            // Clear current messages in the cache
            queryClient.invalidateQueries({ queryKey: ["/api/messages"] });

            toast({
                title: "履歴削除完了",
                description: "チャット履歴が削除されました。",
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: "削除エラー",
                description: error instanceof Error ? error.message : "履歴の削除に失敗しました。",
                variant: "destructive",
                duration: 4000,
            });
        }
    });

    const displayName = user?.email?.split("@")[0];

    const startTour = () => {
        setTour((prev) => ({
            ...prev,
            run: true,
            stepIndex: 0,
            key: new Date().getTime(), // force Joyride to restart
        }));
    };

    const handleOpenSheet = () => {

        setIsSettingsOpen(true);
        // setIsSidebarOpen(false)
    };

    return (
        <>
            <header id="welcome-text" className="border-b border-pink-100 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30 w-full">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    {/* Company Logo */}
                    <motion.div
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <img src="/images/pclogo.png" alt="Company Logo" className="h-5 sm:h-10" />
                    </motion.div>

                    {/* AI Brand Logo with animation */}
                    <motion.div
                        className="flex items-center"
                        initial={{ scale: 0.9, y: -10, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ type: "spring", duration: 0.8 }}
                    >
                        <motion.img
                            src="/images/sakura-logo.png"
                            alt="桜AI ロゴ"
                            className="h-16 sm:h-24 w-auto"
                            whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
                            transition={{ rotate: { duration: 0.5 } }}
                        />
                    </motion.div>
                    <div className="md:flex md:space-x-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative hidden md:block"
                        >
                            <Link href="/info">
                                <Button
                                    id="info-page"
                                    variant="outline"
                                    size="sm"
                                    className="border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 flex items-center gap-2 rounded-full p-2.5 justify-center "
                                ><BadgeInfo className="h-5 w-5" />
                                </Button>
                            </Link>
                        </motion.div>
                        {/* User Dropdown Menu */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        id="settings-dropdown"
                                        variant="outline"
                                        size="sm"
                                        className="border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 flex items-center gap-2 rounded-full pl-2 pr-3"
                                    >
                                        <Avatar className="h-7 w-7 border border-pink-200 bg-pink-100/70">
                                            <AvatarFallback className="text-pink-700 text-xs">
                                                {displayName ? displayName[0].toUpperCase() : ""}
                                            </AvatarFallback>
                                        </Avatar>
                                        <motion.span
                                            className="text-sm font-medium hidden sm:flex items-center"
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

                                    {/* Voice Mode Option */}
                                    <Link href="/voice">
                                        <DropdownMenuItem className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800">
                                            <AudioLines className="h-4 w-4 text-pink-500" />
                                            音声モード
                                        </DropdownMenuItem>
                                    </Link>

                                    {/* Delete Chat History Option */}
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={deleteChatMutation.isPending}
                                        className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                                    >
                                        <Trash2 className="h-4 w-4 text-pink-500" />
                                        <motion.span
                                            animate={{ scale: deleteChatMutation.isPending ? [1, 1.1, 1] : 1 }}
                                            transition={{ duration: 0.5, repeat: deleteChatMutation.isPending ? Infinity : 0 }}
                                        >
                                            履歴削除
                                        </motion.span>
                                    </DropdownMenuItem>

                                    {/* Feedback Option */}
                                    <DropdownMenuItem
                                        onClick={() => setShowFeedbackDialog(true)}
                                        className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                                    >
                                        <MessageSquare className="h-4 w-4 text-pink-500" />
                                        フィードバック
                                    </DropdownMenuItem>

                                    {/* Onboarding Option */}
                                    <DropdownMenuItem
                                        onClick={startTour}
                                        className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                                    >
                                        <BookOpen className="h-4 w-4 text-pink-500" />
                                        チュートリアル
                                    </DropdownMenuItem>

                                    {/* Info Page Option */}
                                    <Link href="/info">
                                        <DropdownMenuItem
                                            className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                                        >
                                            <BadgeInfo className="h-4 w-4 text-pink-500" />
                                            情報ページ
                                        </DropdownMenuItem>
                                    </Link>

                                    <DropdownMenuItem
                                        onClick={handleOpenSheet}
                                        className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                                    >
                                        <SettingsIcon className="h-4 w-4 text-pink-500" />
                                        設定
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-pink-100/70" />

                                    {/* Logout Option */}
                                    <DropdownMenuItem
                                        onClick={() => setShowLogoutConfirm(true)}
                                        disabled={logoutMutation.isPending}
                                        className="cursor-pointer text-pink-700 hover:bg-pink-50 focus:bg-pink-50 focus:text-pink-800"
                                    >
                                        <LogOut className="h-4 w-4 text-pink-500" />
                                        <motion.span
                                            animate={{ scale: logoutMutation.isPending ? [1, 1.1, 1] : 1 }}
                                            transition={{ duration: 0.5, repeat: logoutMutation.isPending ? Infinity : 0 }}
                                        >
                                            ログアウト
                                        </motion.span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </motion.div>
                    </div>
                </div>
            </header>
            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <AlertDialogContent className="mx-auto max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-pink-600">本当にログアウトしますか？</AlertDialogTitle>
                        <AlertDialogDescription className="text-pink-400/80">
                            寂しくなっちゃうよ…🌸<br />
                            桜AIは、いつでもあなたを待っています！
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white text-pink-500 border-pink-200 hover:bg-pink-50">
                            もう少し一緒にいる
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => logoutMutation.mutate()}
                            className="bg-pink-500 hover:bg-pink-600 text-white border border-pink-400"
                        >
                            ログアウト
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Chat History Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="mx-auto max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-pink-600">チャット履歴を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription className="text-pink-400/80">
                            全ての会話履歴が削除されます。この操作は元に戻せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white text-pink-500 border-pink-200 hover:bg-pink-50">
                            キャンセル
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteChatMutation.mutate()}
                            className="bg-pink-500 hover:bg-pink-600 text-white border border-pink-400"
                        >
                            削除する
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
        </>
    )
}

export default Navbar   