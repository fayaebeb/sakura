import React from "react";
import { Card } from "../ui/card";
import { TooltipRenderProps } from "react-joyride";
import { Button } from "../ui/button";
import { Clock, MessageCircleMore } from "lucide-react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isMobileState } from "@/state/isMobileState";
import { chatInputState } from "@/state/chatInputState";
import { useOnboarding } from "@/hooks/useOnBoarding";
import { useAuth } from "@/hooks/use-auth";

const ChatInputDialog: React.FC<TooltipRenderProps> = ({
    primaryProps,
    skipProps,
    closeProps,
    backProps,
}) => {

    const { user } = useAuth()

    const completeOnboarding = useOnboarding();

    const handleFinish = async () => {
        if (user?.onboardingCompletedAt === null) {
            await completeOnboarding.mutateAsync();
        }
    };

    const setLocalInput = useSetRecoilState(chatInputState);
    const setPromptInChatInput = (prompt: string) => {

        setLocalInput(prompt);
    }

    return (
        <>
            <Card className="relative flex w-[95%] max-w-sm md:hidden overflow-visible bg-white/90 rounded-2xl pl-0 pr-0 pt-0 pb-0 bg-gradient-to-r from-pink-200 via-pink-200 to-white border-0 border-b-4 border-rose-600 shadow-xl">

                {/* Left: Speech bubble area */}
                <div className="flex-1 flex flex-col justify-between">
                    <div className="bg-white text-gray-800 text-xs rounded-lg shadow px-3 py-2 border border-pink-300 mt-3 ml-3 mr-2 mb-3">
                        <h2 className="text-base font-bold text-sakura-600 mb-1">チャット画面だよ！✨</h2>
                        <p className="leading-snug">
                            ここで桜ちゃんと自由におしゃべりできるよ〜💬<br />
                            以前の会話も一覧で見れるんだ！便利でしょ？
                        </p>

                        <div onClick={() => setPromptInChatInput("こんにちは！")} className="rounded-lg px-4 py-2 mt-3 mb-1 bg-gradient-to-r from-pink-200 via-pink-100 to-white border-r-4 border-b-4 border text-xs border-pink-300 text-pink-500 italic font-bold font-sans cursor-pointer ">
                            <span className="px-2 border-l-2 border-l-pink-500">こんにちは！ </span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-1 ml-3 mb-3">
                        <Button {...closeProps} variant="outline" className="bg-pink-100 rounded-full text-xs px-3 py-1">
                            スキップ
                        </Button>
                        <Button {...backProps} className="bg-pink-300 hover:bg-pink-300 text-pink-800 rounded-full text-xs px-4 py-1">
                            戻る
                        </Button>
                        <Button {...primaryProps} className="rounded-full text-xs px-4 py-1 bg-pink-500 text-white hover:bg-pink-600">
                            次へ
                        </Button>
                    </div>
                </div>

                <img className="absolute bottom-0 -right-2 w-20 h-20" src="/images/sakura-explain-5.png" alt="" />


            </Card>

            <Card className="hidden relative md:flex w-full max-w-lg overflow-visible bg-white/90 rounded-3xl pl-0 pr-0 pt-0 pb-0 bg-gradient-to-r from-pink-200 via-pink-200 to-white border-0 border-b-4 border-rose-600 shadow-2xl">

                {/* Left: Speech bubble area */}
                <div className="flex-1 flex flex-col justify-between">
                    <div className="bg-white text-gray-800 text-sm rounded-xl shadow px-4 py-3 border border-pink-300 mt-4 ml-4 mr-2 mb-4 ">
                        <h2 className="text-lg font-bold text-sakura-600 mb-1">チャット画面だよ！✨</h2>
                        <p className="leading-snug">
                            ここで桜ちゃんと自由におしゃべりできるよ〜💬<br />
                            以前の会話も一覧で見れるんだ！便利でしょ？
                        </p>
                        <div onClick={() => setPromptInChatInput("こんにちは！")} className="rounded-lg px-4 py-2 mt-3 mb-1 bg-gradient-to-r from-pink-200 via-pink-100 to-white border-r-4 border-b-4 border text-xs border-pink-300 text-pink-500 italic font-bold font-sans cursor-pointer ">
                            <span className="px-2 border-l-2 border-l-pink-500">こんにちは！</span>
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex gap-1 ml-4 mb-4 ">
                        <Button {...closeProps} onClick={async (e) => {
                            closeProps.onClick?.(e);
                            await handleFinish();
                        }} variant="outline" className="bg-pink-100 rounded-full text-sm">
                            スキップ
                        </Button>
                        <Button {...backProps} className="bg-pink-300 hover:bg-pink-300 text-pink-800 rounded-full px-6">
                            戻る
                        </Button>
                        <Button {...primaryProps} className="rounded-full text-sm bg-pink-500 text-white hover:bg-pink-600">
                            次へ
                        </Button>
                    </div>
                </div>

                {/* Right: Mascot Image */}
                <div className="relative w-[200px] flex items-end justify-center overflow-visible -mr-3">
                    <img
                        src="/images/sakura-explain-5.png"
                        alt="Sakura-chan"
                        className="absolute bottom-0 pointer-events-none h-[250px] w-[250px] select-none"
                        style={{ zIndex: 1 }}
                    />

                </div>
            </Card>
        </>




    );
};

export default ChatInputDialog;
