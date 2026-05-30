import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  SHOPS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  type Shop,
  type ServiceCategory,
} from "../data/shops";

type Props = {
  highlightedShopId?: string;
  onPinClick: (shop: Shop) => void;
};

const DISTRICT_LABELS = [
  { name: "강남", x: 520, y: 700 },
  { name: "홍대", x: 220, y: 360 },
  { name: "성수", x: 700, y: 330 },
  { name: "합정", x: 160, y: 440 },
  { name: "노원", x: 760, y: 70 },
  { name: "잠실", x: 820, y: 760 },
  { name: "이태원", x: 400, y: 560 },
  { name: "건대", x: 870, y: 440 },
];

export function MockMap({ highlightedShopId, onPinClick }: Props) {
  const [filter, setFilter] = useState<ServiceCategory | "전체">("전체");

  const visibleShops =
    filter === "전체" ? SHOPS : SHOPS.filter((s) => s.category === filter);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#f5f5f5",
        position: "relative",
      }}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.7}
        maxScale={4}
        wheel={{ step: 0.2 }}
        doubleClick={{ disabled: false, mode: "zoomIn", step: 0.7 }}
        panning={{ velocityDisabled: false }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          <svg
            viewBox="0 0 1000 900"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
          >
            <rect width="1000" height="900" fill="#eeeeee" />

            {/* 한강 */}
            <path
              d="M 0 500 Q 200 480 380 510 T 720 490 T 1000 510 L 1000 540 Q 720 560 380 540 T 0 530 Z"
              fill="#cfe2ff"
            />

            {/* 도로 grid (얇게) */}
            {Array.from({ length: 11 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 90}
                x2="1000"
                y2={i * 90}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 90}
                y1="0"
                x2={i * 90}
                y2="900"
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            ))}

            {/* 주요 도로 */}
            <line x1="0" y1="270" x2="1000" y2="270" stroke="#c8c8c8" strokeWidth="2" />
            <line x1="0" y1="630" x2="1000" y2="630" stroke="#c8c8c8" strokeWidth="2" />
            <line x1="340" y1="0" x2="340" y2="900" stroke="#c8c8c8" strokeWidth="2" />
            <line x1="680" y1="0" x2="680" y2="900" stroke="#c8c8c8" strokeWidth="2" />

            {/* 동네 라벨 */}
            {DISTRICT_LABELS.map((d) => (
              <text
                key={d.name}
                x={d.x}
                y={d.y - 100}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill="#9e9e9e"
                style={{ userSelect: "none" }}
              >
                {d.name}
              </text>
            ))}

            {/* 핀 — 작은 원형 */}
            {visibleShops.map((shop) => {
              const isH = shop.id === highlightedShopId;
              const color = CATEGORY_COLORS[shop.category];
              return (
                <g
                  key={shop.id}
                  onClick={() => onPinClick(shop)}
                  style={{ cursor: "pointer" }}
                  transform={`translate(${shop.x}, ${shop.y})`}
                >
                  {isH && <circle r="14" fill={color} opacity="0.25" />}
                  {isH && <circle r="9" fill={color} opacity="0.45" />}
                  <circle
                    r={isH ? 5 : 4}
                    fill={color}
                    stroke="white"
                    strokeWidth="1.2"
                  />
                </g>
              );
            })}
          </svg>
        </TransformComponent>
      </TransformWrapper>

      {/* 필터 (좌하단) */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          background: "white",
          padding: 4,
          borderRadius: 6,
          display: "flex",
          gap: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #ededed",
        }}
      >
        {(["전체", ...CATEGORY_ORDER] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              fontSize: 11,
              padding: "5px 8px",
              borderRadius: 4,
              border: 0,
              background: filter === c ? "#ec4899" : "transparent",
              color: filter === c ? "white" : "#666",
              fontWeight: filter === c ? 600 : 500,
              cursor: "pointer",
            }}
          >
            {c}
            {c !== "전체" && (
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: CATEGORY_COLORS[c as ServiceCategory],
                  marginLeft: 5,
                  verticalAlign: "middle",
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* 5km 반경 안내 (우하단) */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          background: "white",
          padding: "5px 9px",
          borderRadius: 6,
          fontSize: 10,
          color: "#555",
          fontWeight: 500,
          border: "1px solid #ededed",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        내 위치 5km 반경 · {SHOPS.length}곳
      </div>
    </div>
  );
}
