import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipRenderProps } from "react-joyride";

const targetOptions = [
  {
    key: "self",
    title: "👤 自分について",
    description: "あなたの就労、健康、教育などに関するサポートをご案内します。",
    points: ["履歴確認", "個人向け制度", "子育て支援"],
  },
  {
    key: "private",
    title: "🏢 民間企業について",
    description: "民間企業・団体向けの制度や補助金、支援策について説明します。",
    points: ["中小企業支援", "雇用助成金", "デジタル化支援"],
  },
  {
    key: "government",
    title: "🏛️ 行政について",
    description: "役所や公的機関に関する手続き・相談窓口をご紹介します。",
    points: ["住民票・手続き", "税金・年金", "自治体支援窓口"],
  },
];

const UserTypeSelectDialog: React.FC<TooltipRenderProps> = ({
    primaryProps,
    skipProps,
    closeProps,
    backProps,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = targetOptions.length;
  const page = targetOptions[pageIndex];

  return (
    <Card className="relative flex flex-col sm:flex-row w-full max-w-lg bg-gradient-to-br from-pink-50 via-white to-pink-100 border border-pink-200 rounded-3xl shadow-xl p-4 sm:p-6 overflow-visible">

      {/* Mascot */}
      <div className="absolute right-[-30px] top-[-60px] sm:top-[-80px] sm:right-[-40px] z-10">
        <img
          src="/images/sakura-explain-1.png"
          alt="Sakura-chan"
          className="h-[120px] sm:h-[180px] select-none pointer-events-none"
        />
      </div>

      {/* Left: Content */}
      <div className="flex-1 flex flex-col justify-between pr-0 sm:pr-6 z-0">

        <h2 className="text-sakura-600 text-base sm:text-lg font-bold mb-2">{page.title}</h2>
        <p className="text-sm text-gray-700 mb-3">{page.description}</p>

        <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
          {page.points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>

        {/* Navigation */}
        <div className="mt-auto flex justify-between items-center gap-2">
          <Button
            variant="ghost"
            className="text-sm text-gray-600"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
          >
            戻る
          </Button>

          <div className="flex-1 text-center text-xs text-gray-400">
            {pageIndex + 1} / {totalPages}
          </div>

          {pageIndex < totalPages - 1 ? (
            <Button
              className="bg-pink-500 text-white rounded-full px-5 hover:bg-pink-600 text-sm"
              onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
            >
              次へ
            </Button>
          ) : (
            <Button
              className="bg-pink-500 text-white rounded-full px-5 hover:bg-pink-600 text-sm"
              onClick={() => alert("選択が完了しました！")}
            >
              決定
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserTypeSelectDialog;
