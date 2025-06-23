import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  MapPin,
  Users,
  Search,
  BookOpen,
} from "lucide-react";

/* ---------- shared tailwind box ---------- */
const box =
  "rounded-xl border-2 border-pink-500 bg-white/70 backdrop-blur-md px-4 py-3 shadow text-sm whitespace-pre-wrap";

/* ---------- nodes ---------- */
const nodes: Node[] = [
  {
    id: "sakura",
    type: "input",
    position: { x: 0, y: 0 },
    data: { label: "🌸 Sakura.bot" },
    className: `${box} font-bold text-pink-600`,
  },
  {
    id: "purpose",
    position: { x: -220, y: 150 },
    data: { label: "営業支援\n(ビッグデータ3兄弟)" },
    className: box,
  },
  {
    id: "datasources",
    position: { x: 220, y: 150 },
    data: {
      label: (
        <div className="flex flex-col gap-1 text-left">
          <span className="flex items-center gap-1">
            <MapPin size={16} /> 全国うごき統計
          </span>
          <span className="flex items-center gap-1">
            <Users size={16} /> 全国インバウンド統計
          </span>
          <span className="flex items-center gap-1">
            <Search size={16} /> 検索 × 人流
          </span>
        </div>
      ),
    },
    className: box,
  },
  {
    id: "materials",
    position: { x: -220, y: 320 },
    data: {
      label: (
        <div className="flex flex-col gap-1 text-left">
          <span className="flex items-center gap-1">
            <BookOpen size={16} /> 部内人流講座
          </span>
          <span className="flex items-center gap-1">📑 営業資料</span>
        </div>
      ),
    },
    className: box,
  },
  {
    id: "web",
    position: { x: 0, y: 320 },
    data: {
      label: (
        <span className="flex items-center gap-1">
          <Search size={16} /> Web検索
        </span>
      ),
    },
    className: box,
  },
  {
    id: "answers",
    position: { x: 220, y: 320 },
    data: { label: "データ概要\n活用事例\n差別化ポイント…" },
    className: box,
  },
  {
    id: "benefit",
    type: "output",
    position: { x: 0, y: 480 },
    data: { label: "“聞きにくい”疑問\n“時間がない”アイデア → 即回答✨" },
    className: `${box} font-semibold text-center`,
  },
];

/* ---------- edges ---------- */
const arrow = {
  markerEnd: { type: MarkerType.ArrowClosed, color: "#ec4899" },
};

const edges: Edge[] = [
  { id: "e1", source: "sakura", target: "purpose", animated: true, ...arrow },
  { id: "e2", source: "sakura", target: "datasources", animated: true, ...arrow },
  { id: "e3", source: "datasources", target: "answers", ...arrow },
  { id: "e4", source: "materials", target: "answers", ...arrow },
  { id: "e5", source: "web", target: "answers", ...arrow },
  { id: "e6", source: "answers", target: "benefit", animated: true, ...arrow },
  { id: "e7", source: "purpose", target: "materials", ...arrow },
  { id: "e8", source: "purpose", target: "web", ...arrow },
];

/* ---------- component ---------- */
export default function SakuraFlow() {
  return (
    <div className="h-[600px] w-full rounded-2xl bg-[#fff7f9] dark:bg-[#2b2b36] p-4 shadow-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
      
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        selectionOnDrag={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }} /* keep 1× zoom */

        proOptions={{ hideAttribution: true }} /* tiny text bottom-right */
      >
        <Background
          gap={32}
          size={2}
          color="#f9a8d4"
          variant={BackgroundVariant.Dots}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}