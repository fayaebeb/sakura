import { ArrowDown, Building, Dot, Landmark, User } from "lucide-react"
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import React from "react";
import Autoplay from "embla-carousel-autoplay"
type Props = {
    /** index we should show (0-based) */
    activeSlide: number;
    /** notify parent when the user swipes / autoplay advances */
    onChange: (index: number) => void;
    menuRef: React.RefObject<HTMLDivElement>;
    userTypeRef: React.RefObject<HTMLDivElement>;
    databaseRef: React.RefObject<HTMLDivElement>;

};

const ImageFlow: React.FC<Props> = ({ activeSlide, onChange, menuRef, userTypeRef, databaseRef }) => {
    const [api, setApi] = React.useState<CarouselApi | null>(null);
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [inView, setInView] = React.useState<number[]>([]);
    // React.useEffect(() => {
    //     if (!api) return;

    //     /** Keep React state in sync with Embla */
    //     const update = () => {
    //         setCurrent(api.selectedScrollSnap());      // index of the snap point now in focus
    //         setCount(api.scrollSnapList().length);     // how many snap points total
    //         setInView(api.slidesInView());             // array of indices currently in view
    //     };

    //     update();                     // run once on mount
    //     api.on("select", update);     // run every time the user (or autoplay) changes slide
    //     api.on("slidesInView", update); // fires on scroll / resize (Embla ≥ v8)

    //     return () => {
    //         api.off("select", update);
    //         api.off("slidesInView", update);
    //     };
    // }, [api]);

    React.useEffect(() => {
        if (api) api.scrollTo(activeSlide, false); // animate, don't jump
    }, [activeSlide, api]);

    /* ⇢ tell parent when carousel changes by itself */
    React.useEffect(() => {
        if (!api) return;

        const handleSelect = () => {
            const idx = api.selectedScrollSnap();
            if (idx !== activeSlide) onChange(idx);   // 🔑 notify parent
        };

        handleSelect();            // run once on mount
        api.on("select", handleSelect);

        return () => {
            api.off("select", handleSelect);          // clean up
        };
    }, [api, activeSlide, onChange]);


    const slides = [
        {
            id: 0,
            title: "チャット画面だよ！✨",
            description: "ここで桜ちゃんと自由におしゃべりできるよ〜💬以前の会話も一覧で見れるんだ！便利でしょ？ loremawiodnaowindo iawnodinwaoid nawoidn iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiwoadowiandoaiwndoiand",
            icon: <User className="w-full h-full text-pink-600 bg-pink-200 rounded-xl p-2 shadow-2xl" />,

            style: "bg-pink-100 border border-pink-300 text-pink-800"

        },
        {
            id: 1,
            title: "履歴をさっと確認👀",
            description: "過去のメッセージをタイムライン形式で確認！キーワード検索ですぐに探せるよ。",
            style: "bg-green-100 border border-green-300  text-green-800",
            icon: <Building className="w-full h-full text-green-600 bg-green-200 rounded-xl p-2 shadow-2xl " />,

        },
        {
            id: 2,
            title: "設定をカスタマイズ⚙️",
            icon: <Landmark className="w-full h-full text-blue-600 bg-blue-200 rounded-xl p-2 shadow-2xl" />,
            description: "テーマカラーや通知設定を自由に変更！自分好みの環境に仕上げよう。",
            style: "bg-blue-100 border border-blue-300  text-blue-800"


        },
    ];

    return (
        <div className="flex flex-col space-y-2 py-5 px-5 relative">
                <div className='hidden md:block absolute top-[52%]  -right-12 h-16 w-16 p-20 -z-10 rounded-full bg-[#e7008a]'/>
            <div className="flex flex-col md:flex-row  rounded-2xl pt-10 ">
                <div className="bg-white  rounded-t-2xl md:rounded-r-none md:rounded-l-2xl md:w-2/3 border border-pink-500 ">
                    <div className="p-4 w-full max-w-full relative bg-white  py-16 rounded-2xl ">

                        <img className="w-full rounded-2xl shadow-2xl shadow-pink-200" src="/images/sakura-home-mb.png" alt="" />

                        <div className="absolute top-4 right-8 md:right-12 flex flex-col items-center justify-center ">
                            <button onClick={() => api?.scrollTo(0, false)} className={`border-pink-500 border   font-sm hover:bg-pink-100  gap-2 rounded-full px-1 py-0.5 flex items-center justify-center text-xs shadow-2xl ${activeSlide === 0 ? " bg-gradient-to-br from-pink-800 to-pink-500 text-white " : "bg-pink-200 text-black"}`}>メニュー</button>
                            <div className=" h-[35px] w-[1px] md:h-[45px] rounded-full bg-pink-500" />
                            {/* <ArrowDown height={10} width={10}/> */}
                        </div>
                        <div className="absolute bottom-4 left-12 md:left-24 flex flex-col items-center justify-center ">
                            <div className=" h-[68px]  md:h-[100px] w-[1px] rounded-full bg-pink-500" />
                            <button onClick={() => api?.scrollTo(1, false)} className={`border-pink-500 border  font-sm hover:bg-pink-100  gap-2 rounded-full px-1 py-0.5 flex items-center justify-center text-xs ${activeSlide === 1 ? "bg-gradient-to-br from-pink-800 to-pink-500 text-white " : "bg-pink-200 text-black"}`}>質問オプション</button>
                            {/* <ArrowDown height={10} width={10}/> */}
                        </div>
                        <div className="absolute bottom-4 right-16 md:right-28  flex flex-col items-center justify-center ">
                            <div className=" h-[68px] w-[1px] md:h-[100px] rounded-full bg-pink-500" />
                            <button onClick={() => api?.scrollTo(2, false)} className={`border-pink-500 border font-sm hover:bg-pink-100  gap-2 rounded-full px-1 py-0.5 flex items-center justify-center text-xs ${activeSlide === 2 ? "bg-gradient-to-br from-pink-800 to-pink-500 text-white" : "bg-pink-200 text-black"}`}>参照先データ</button>
                            {/* <ArrowDown height={10} width={10}/> */}
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-t md:bg-gradient-to-tl text-white from-pink-800 to-pink-500 p-4 rounded-b-2xl md:rounded-l-none md:rounded-r-2xl  md:w-1/3  md:space-y-5 flex flex-col justify-between text-center">
                    <Carousel
                        className="h-full"
                        setApi={setApi}
                        opts={{ loop: true }} // Enable infinite looping
                        plugins={[
                            Autoplay({ delay: 3500, stopOnInteraction: false }), // Autoplay every 2 seconds
                        ]}
                    >
                        <CarouselContent className="h-full">
                            {slides.map((slide) => (
                                <CarouselItem className="h-full" key={slide.id} >


                                    <div className="space-y-2">
                                        <h2 className="font-bold  md:text-lg">{slide.title}</h2>
                                        <p className="text-xs md:text-sm font-light h-full">{slide.description}</p>
                                    </div>

                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    <div className="flex justify-center mt-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => onChange(idx)}
                                className={`mx-1 h-1 w-1 rounded-full ${activeSlide === idx ? "bg-pink-400" : "bg-pink-200"
                                    }`}
                            />
                        ))}
                    </div>

                </div>
            </div>
            <div ref={menuRef} className="rounded-2xl ">
                < div className="bg-white flex flex-col md:flex-row justify-center items-center  md:justify-between p-4 rounded-2xl border border-pink-400  relative md:space-x-5 space-y-5 md:space-y-0">
                    <img className="absolute -right-5 bottom-0 w-20 h-20  hidden md:block" src="/images/sakura-explain-3.png" />
                    <div className="space-y-5 md:w-3/4">
                        <h1 className="text-xl font-semibold text-pink-500">メニュー</h1>
                        <div className=" ">
                            <div className="flex ">
                                <Dot size={20} /><span>音声モードでは、音声入力の会話形式で応答できます。</span>
                            </div>

                            <div className="flex"><Dot size={20} /><span>履歴削除すると今までの履歴が消されます。</span></div>
                            <div className="flex"><Dot size={20} /><span>フィードバックでは、本サイトのレビューを投稿できます。</span></div>
                        </div>
                    </div>
                    <div className="p-5 md:p-0 md:w-1/4 rounded-2xl shadow-2xl shadow-pink-300">
                        <img className="rounded-2xl" src="/images/menu.png" alt="" />
                    </div>
                </div>
            </div>
            <div ref={userTypeRef} className="rounded-2xl  ">
                < div className="bg-white flex flex-col md:flex-row-reverse items-center  justify-between p-4 rounded-2xl border border-pink-400 relative md:space-x-5 space-y-5 md:space-y-0 ">
                    <img className="absolute -left-8 bottom-0 w-16 h-20  hidden md:block" src="/images/sakura-explain-5.png" />
                    <div className="space-y-5 md:w-3/4">
                        <h1 className="text-xl font-semibold text-pink-500">質問オプション</h1>
                        <div className=" ">
                            <div className="flex ">
                                <Dot size={20} /><span>音声モードでは、音声入力の会話形式で応答できます。</span>
                            </div>

                            <div className="flex"><Dot size={20} /><span>履歴削除すると今までの履歴が消されます。</span></div>
                            <div className="flex"><Dot size={20} /><span>フィードバックでは、本サイトのレビューを投稿できます。</span></div>
                        </div>
                    </div>
                    <div className="p-5 md:p-0 md:w-1/4 rounded-2xl shadow-2xl h-fit shadow-pink-300">
                        <img className="rounded-2xl" src="/images/user-type.png" alt="" />
                    </div>
                </div>
            </div>
            <div ref={databaseRef} className="rounded-2xl  ">
                < div className="bg-white flex flex-col md:flex-row justify-center items-center  md:justify-between p-4 rounded-2xl border border-pink-400  relative md:space-x-5 space-y-5 md:space-y-0">
                    <img className="absolute -right-5 bottom-0 w-20 h-20 hidden md:block" src="/images/sakura-explain-4.png" />
                    <div className="space-y-5 md:w-3/4">
                        <h1 className="text-xl font-semibold text-pink-500">参照先データ</h1>
                        <div className=" ">
                            <div className="flex ">
                                <Dot size={20} /><span>音声モードでは、音声入力の会話形式で応答できます。</span>
                            </div>

                            <div className="flex"><Dot size={20} /><span>履歴削除すると今までの履歴が消されます。</span></div>
                            <div className="flex"><Dot size={20} /><span>フィードバックでは、本サイトのレビューを投稿できます。</span></div>
                        </div>
                    </div>
                    <div className="p-5 md:p-0 md:w-1/4 rounded-2xl shadow-2xl shadow-pink-300">
                        <img className="rounded-2xl" src="/images/database-select.png" alt="" />
                    </div>
                </div>
            </div>
            <div className="rounded-2xl  ">
                < div className="bg-white flex flex-col md:flex-row-reverse items-center  justify-between p-4 rounded-2xl border border-pink-400 relative md:space-x-5 space-y-5 md:space-y-0 ">
                    <img className="absolute -left-8 bottom-0 w-16 h-20  hidden md:block" src="/images/sakura-explain-5.png" />
                    <div className="space-y-5 md:w-3/4">
                        <h1 className="text-xl font-semibold text-pink-500">メニュー</h1>
                        <div className=" ">
                            <div className="flex ">
                                <Dot size={20} /><span>音声モードでは、音声入力の会話形式で応答できます。</span>
                            </div>

                            <div className="flex"><Dot size={20} /><span>履歴削除すると今までの履歴が消されます。</span></div>
                            <div className="flex"><Dot size={20} /><span>フィードバックでは、本サイトのレビューを投稿できます。</span></div>
                        </div>
                    </div>
                    <div className="p-5 md:p-0 md:w-1/4 rounded-2xl shadow-2xl h-fit shadow-pink-300">
                        <img className="rounded-2xl" src="/images/suggestions.png" alt="" />
                    </div>
                </div>
            </div>
            <div className="rounded-2xl ">
                < div className="bg-white flex flex-col md:flex-row justify-center items-center  md:justify-between p-4 rounded-2xl border border-pink-400  relative md:space-x-5 space-y-5 md:space-y-0">
                    <img className="absolute -right-5 bottom-0 w-20 h-20 hidden md:block" src="/images/sakura-explain-4.png" />
                    <div className="space-y-5 md:w-3/4">
                        <h1 className="text-xl font-semibold text-pink-500">メニュー</h1>
                        <div className=" ">
                            <div className="flex ">
                                <Dot size={20} /><span>音声モードでは、音声入力の会話形式で応答できます。</span>
                            </div>
                            <div className="flex"><Dot size={20} /><span>履歴削除すると今までの履歴が消されます。</span></div>
                            <div className="flex"><Dot size={20} /><span>フィードバックでは、本サイトのレビューを投稿できます。</span></div>
                        </div>
                    </div>
                    <div className="p-5 md:p-0 md:w-1/4 rounded-2xl shadow-2xl shadow-pink-300">
                        <img className="rounded-2xl" src="/images/feedback.png" alt="" />
                    </div>
                </div>
            </div>
        </div >
    )
}

export default ImageFlow