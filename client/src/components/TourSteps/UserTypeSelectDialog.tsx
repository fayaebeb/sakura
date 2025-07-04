import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipRenderProps } from "react-joyride";

import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"
import { Building, Landmark, User } from "lucide-react";



interface Slide {
  id: number;
  title: string;
  description: string
  style: string;
  icon: React.ReactNode
}

const UserTypeSelectDialog: React.FC<TooltipRenderProps> = ({
  primaryProps,
  skipProps,
  closeProps,
  backProps,
}) => {
  const slides: Slide[] = [
    {
      id: 0,
      title: "民間",
      description: "「民間企業からこんな質問があった！」などあればこれを押してね！",
      icon: <User className="w-full h-full text-pink-600 bg-pink-200 rounded-xl p-2 shadow-2xl" />,

      style: "bg-pink-100 border border-pink-300 text-pink-800"

    },
    {
      id: 1,
      title: "自分",
      description: "自分が疑問に思ったことや自分が意見したいことであればこれを押してね！",
      style: "bg-green-100 border border-green-300  text-green-800",
      icon: <Building className="w-full h-full text-green-600 bg-green-200 rounded-xl p-2 shadow-2xl " />,

    },
    {
      id: 2,
      title: "行政",
      icon: <Landmark className="w-full h-full text-blue-600 bg-blue-200 rounded-xl p-2 shadow-2xl" />,
      description: "「行政からこんな質問があった！」などあればこれを押してね！",
      style: "bg-blue-100 border border-blue-300  text-blue-800"


    },
  ];


  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    // Initialize count & current slide once Embla is ready
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    // Update current slide on every selection change
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);

    // Cleanup listener on unmount
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <>
      <Card className=" relative flex md:hidden w-[95%] max-w-sm overflow-visible bg-white/90 rounded-2xl bg-gradient-to-r from-pink-200 via-pink-200 to-white border-0 border-b-4 border-rose-600 shadow-xl">

        {/* Left: Speech bubble area */}
        <div className="flex-1 flex flex-col justify-between p-4 space-y-4">
          <div className="bg-white text-gray-800 text-sm rounded-xl shadow px-4 py-3 border border-pink-300 space-y-5">
            <div>
              <h2 className="text-base font-bold text-rose-600 mb-1">誰からの質問か選んでね！✨</h2>
              <p className="leading-snug">
                ここでは誰からの質問/意見か選べるよ！​<br />
                ニーズ調査のためにぜひ協力お願いします！
              </p>
            </div>

            <div>
              <Carousel
                setApi={setApi}
                opts={{ loop: true }} // Enable infinite looping
                plugins={[
                  Autoplay({ delay: 4000, stopOnInteraction: false }), // Autoplay every 2 seconds
                ]}
              >
                <CarouselContent className="px-1 ">
                  {slides.map((slide) => (
                    <CarouselItem key={slide.id} >
                      <div className={`flex  p-1 rounded-lg shadow-lg items-center h-full ${slide.style} space-x-1 `}>
                        <div className=" p-1 h-full">
                          {slide.icon}
                        </div>
                        <div className="w-fit space-y-1">
                          <h2 className="font-bold">{slide.title}</h2>
                          <h2 className="text-xs font-light">{slide.description}</h2>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <div className="flex justify-center mt-2">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => api?.scrollTo(index)}
                    className={`mx-1 h-2 w-2 rounded-full transition-colors ${current === index ? "bg-rose-600" : "bg-rose-300"
                      }`}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-1 ml-3 mb-3">
            <Button variant="outline" {...closeProps} className="bg-pink-100 rounded-full text-xs px-3 py-1">
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

        <img className="absolute bottom-0 -right-2 w-20 h-24" src="/images/sakura-explain-4.png" alt="" />
        {/* Right: Mascot Image */}

      </Card>
      <Card className="hidden relative md:flex w-full max-w-sm overflow-visible bg-white/90 rounded-2xl bg-gradient-to-r from-pink-200 via-pink-200 to-white border-0 border-b-4 border-rose-600 shadow-xl">

        {/* Left: Speech bubble area */}
        <div className="flex-1 flex flex-col justify-between p-4 space-y-4">
          <div className="bg-white text-gray-800 text-sm rounded-xl shadow px-4 py-3 border border-pink-300 space-y-5">
            <div>
              <h2 className="text-base font-bold text-rose-600 mb-1">誰からの質問か選んでね！✨</h2>
              <p className="leading-snug">
                ここでは誰からの質問/意見か選べるよ！​<br />
                ニーズ調査のためにぜひ協力お願いします！
              </p>
            </div>

            <div>
              <Carousel
                setApi={setApi}
                opts={{ loop: true }} // Enable infinite looping
                plugins={[
                  Autoplay({ delay: 4000, stopOnInteraction: false }), // Autoplay every 2 seconds
                ]}
              >
                <CarouselContent className="px-1 ">
                  {slides.map((slide) => (
                    <CarouselItem key={slide.id} >
                      <div className={`flex  p-1 rounded-lg shadow-lg items-center h-full ${slide.style} space-x-1 `}>
                        <div className="w-1/4 p-1 h-full">
                          {slide.icon}
                        </div>
                        <div className="w-fit space-y-1">
                          <h2 className="font-bold">{slide.title}</h2>
                          <h2 className="text-xs font-light">{slide.description}</h2>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <div className="flex justify-center mt-2">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => api?.scrollTo(index)}
                    className={`mx-1 h-2 w-2 rounded-full transition-colors ${current === index ? "bg-rose-600" : "bg-rose-300"
                      }`}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-1 ml-3 mb-3">
            <Button variant="outline" {...closeProps} className="bg-pink-100 rounded-full text-xs px-3 py-1">
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

        <img className="absolute bottom-0 -right-2 w-20 h-24" src="/images/sakura-explain-4.png" alt="" />
        {/* Right: Mascot Image */}

      </Card>
    </>
  );
};

export default UserTypeSelectDialog;
