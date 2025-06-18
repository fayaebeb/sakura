import React from "react";
import { Card } from "../ui/card";
import { TooltipRenderProps } from "react-joyride";
import { Button } from "../ui/button";
import { Clock, MessageCircleMore } from "lucide-react";
import { useRecoilValue } from "recoil";
import { isMobileState } from "@/state/isMobileState";

const SuggestionsDialog: React.FC<TooltipRenderProps> = ({
    primaryProps,
    skipProps,
    closeProps,
    backProps,
}) => {


    const isMobile = useRecoilValue(isMobileState);

    return (
        <>
            <Card className="relative flex w-full max-w-sm md:hidden overflow-visible bg-white/90 rounded-2xl pl-0 pr-0 pt-0 pb-0 bg-gradient-to-r from-pink-200 via-pink-200 to-white border-0 border-b-4 border-rose-600 shadow-xl">

                {/* Left: Speech bubble area */}
                <div className="flex-1 flex flex-col justify-between">
                    <div className="bg-white text-gray-800 text-xs rounded-lg shadow px-3 py-2 border border-pink-300 mt-3 ml-3 mr-2 mb-3">
                        <h2 className="text-base font-bold text-sakura-600 mb-1">チャット画面だよ！✨</h2>
                        <p className="leading-snug">
                            ここで桜ちゃんと自由におしゃべりできるよ〜💬<br />
                            以前の会話も一覧で見れるんだ！便利でしょ？
                        </p>
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
                    <div className="bg-white text-gray-800 text-sm rounded-xl shadow px-4 py-3 border border-pink-300 mt-4 ml-4 mr-2 mb-4">
                        <h2 className="text-lg font-bold text-sakura-600 mb-1">チャット画面だよ！✨</h2>
                        <p className="leading-snug">
                            ここで桜ちゃんと自由におしゃべりできるよ〜💬<br />
                            以前の会話も一覧で見れるんだ！便利でしょ？
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-1 ml-4 mb-4 ">
                        <Button {...closeProps} variant="outline" className="bg-pink-100 rounded-full text-sm">
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

export default SuggestionsDialog;
