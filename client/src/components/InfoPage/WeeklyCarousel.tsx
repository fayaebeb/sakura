import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const ITEMS = [
  { title: "🌸 Sakura AI をどう続ければ…", body: "メンバーが…" },
  { title: "📊 インパクト測定チャートが…", body: "COOが…" },
  { title: "👑 既存テンプレートを変えたい", body: "開発部から…" },
];

export default function WeeklyCarousel() {
  const [val, setVal] = useState("0");
  useEffect(() => {
    const id = setInterval(() => setVal((p) => `${(Number(p) + 1) % ITEMS.length}`), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mb-14">
      <h2 className="font-extrabold text-2xl text-center mb-6">今週のよくある質問</h2>
      <Tabs value={val} onValueChange={setVal} className="relative">
        <TabsList className="sr-only">
          {ITEMS.map((_, i) => <TabsTrigger key={i} value={`${i}`} />)}
        </TabsList>

        {ITEMS.map((it, i) => (
          <TabsContent key={i} value={`${i}`} asChild>
            <motion.div
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              transition={{ duration: .5 }}>
              <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur border border-pink-200 rounded-2xl p-6 shadow">
                <h3 className="font-semibold">{it.title}</h3>
                <p className="text-sm opacity-80">{it.body}</p>
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
