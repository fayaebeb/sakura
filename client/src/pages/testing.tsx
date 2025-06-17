import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MessageCircleMore, Sparkle } from "lucide-react";
import React from "react";

const Testing = () => {
    return (
        <div className="bg-black/10 h-screen w-full flex  items-center justify-center">
            <Card className="relative flex w-full max-w-sm overflow-visible bg-white/90 rounded-2xl pl-0 pr-0 pt-0 pb-0 bg-gradient-to-r from-pink-200 via-pink-200 to-white border-0 border-b-4 border-rose-600 shadow-xl">

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
                        <Button  variant="outline" className="bg-pink-100 rounded-full text-xs px-3 py-1">
                            スキップ
                        </Button>
                        <Button  className="bg-pink-300 hover:bg-pink-300 text-pink-800 rounded-full text-xs px-4 py-1">
                            戻る
                        </Button>
                        <Button  className="rounded-full text-xs px-4 py-1 bg-pink-500 text-white hover:bg-pink-600">
                            次へ
                        </Button>
                    </div>
                </div>

                {/* Right: Mascot Image */}
                
            </Card>
        </div>

    );
};

export default Testing;


// {/* <Card className="relative flex flex-col md:flex-row overflow-hidden w-full max-w-md bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-pink-200 p-0">

//                 {/* Mascot section */}
//                 <div className="relative w-full md:w-28 bg-pink-50 flex items-center justify-center py-4 md:pb-4 md:items-end border-b md:border-b-0 md:border-r border-pink-200 rounded-t-3xl md:rounded-t-none md:rounded-l-3xl">
//                     <img
//                         src="/images/sakura_welcome_transparent.png"
//                         alt="Sakura-chan"
//                         className="w-20 md:w-24 drop-shadow-md"
//                     />
//                 </div>

//                 {/* Right / bottom content */}
//                 <div className="p-5 md:p-6 flex-1">
//                     {/* Speech bubble */}
//                     <div className="relative text-sm bg-white border border-pink-100 rounded-lg px-4 py-2 shadow text-gray-800 mb-4
//           before:content-[''] before:absolute before:left-4 md:before:left-[-10px] before:top-full md:before:top-1/2 md:before:-translate-y-1/2
//           before:border-[8px] before:border-transparent before:border-t-white md:before:border-t-transparent md:before:border-r-white">
//                         ここがメインチャット画面だよ！<br />
//                         さくらちゃんとたくさん話してね 💖
//                     </div>

//                     {/* Heading */}
//                     <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2 mb-1">
//                         <MessageCircleMore className="w-5 h-5" />
//                         チャットの使い方
//                     </h2>

//                     <p className="text-sm text-gray-700 leading-relaxed mb-3">
//                         ここでは、あなたの質問やメッセージに応じて<br />
//                         <span className="text-rose-500 font-semibold">さくらちゃん</span> が応答します🌸<br />
//                         過去のやりとりは
//                         <span className="inline-flex items-center gap-1 ml-1">
//                             <Clock className="w-4 h-4 text-gray-500" />
//                             チャット履歴
//                         </span> に保存されます。
//                     </p>

//                     {/* Hint box */}
//                     <div className="bg-pink-50 border-l-4 border-rose-400 p-3 rounded-md shadow-inner text-sm text-gray-700 mb-5">
//                         💡 <strong>ヒント：</strong> コマンドも試してみてね！「翻訳して」「要約して」などもOK ✨
//                     </div>

//                     {/* Buttons */}
//                     <div className="flex justify-between flex-wrap gap-2">
//                         <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
//                             スキップする
//                         </Button>
//                         <Button variant="outline">
//                             戻る
//                         </Button>
//                         <Button className="bg-rose-500 text-white hover:bg-rose-600">
//                             次へ
//                         </Button>
//                     </div>
//                 </div>
//             </Card> */}