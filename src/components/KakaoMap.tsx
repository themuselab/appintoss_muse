// SVG mock 지도 — 토스 WebView + 카카오 JS SDK 호환성 이슈로 인해 SVG fallback 사용.
// 실제 카카오/네이버 지도 의존성 0 → 토스 미니앱 100% 호환.
import { useState } from "react";
import {
  SHOPS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  type Shop,
  type ServiceCategory,
} from "../data/shops";

type Props = {
  shops?: Shop[];
  highlightedShopId?: string;
  onPinClick: (shop: Shop) => void;
  myPos?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  radiusKm?: number;
};

// 서울 위경도 범위 → SVG viewBox 좌표 변환
const LNG_MIN = 126.85;
const LNG_MAX = 127.18;
const LAT_MIN = 37.45;
const LAT_MAX = 37.69;
const VB_W = 1000;
const VB_H = 900;

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VB_W;
  const y = VB_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * VB_H;
  return { x, y };
}

const DISTRICT_LABELS = [
  { name: "강남", lat: 37.4979, lng: 127.0276 },
  { name: "홍대", lat: 37.5563, lng: 126.9239 },
  { name: "성수", lat: 37.5447, lng: 127.0557 },
  { name: "잠실", lat: 37.5113, lng: 127.1003 },
  { name: "노원", lat: 37.6542, lng: 127.0568 },
  { name: "이태원", lat: 37.5343, lng: 126.9943 },
  { name: "건대", lat: 37.5408, lng: 127.0697 },
  { name: "합정", lat: 37.5495, lng: 126.9134 },
];

export function KakaoMap({
  shops,
  highlightedShopId,
  onPinClick,
  myPos,
  radiusKm = 10,
}: Props) {
  const [filter, setFilter] = useState<ServiceCategory | "전체">("전체");
  const pool = shops || SHOPS;
  const visibleShops =
    filter === "전체" ? pool : pool.filter((s) => s.category === filter);

  const myPosSvg = myPos ? latLngToSvg(myPos.lat, myPos.lng) : null;

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
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width={VB_W} height={VB_H} fill="#eeeeee" />

        {/* 한강 */}
        <path
          d="M 0 500 Q 200 480 380 510 T 720 490 T 1000 510 L 1000 540 Q 720 560 380 540 T 0 530 Z"
          fill="#cfe2ff"
        />

        {/* 도로 grid */}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 90}
            x2={VB_W}
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
            y2={VB_H}
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        ))}

        {/* 주요 도로 */}
        <line x1="0" y1="270" x2={VB_W} y2="270" stroke="#c8c8c8" strokeWidth="2" />
        <line x1="0" y1="630" x2={VB_W} y2="630" stroke="#c8c8c8" strokeWidth="2" />
        <line x1="340" y1="0" x2="340" y2={VB_H} stroke="#c8c8c8" strokeWidth="2" />
        <line x1="680" y1="0" x2="680" y2={VB_H} stroke="#c8c8c8" strokeWidth="2" />

        {/* 동네 라벨 */}
        {DISTRICT_LABELS.map((d) => {
          const p = latLngToSvg(d.lat, d.lng);
          return (
            <text
              key={d.name}
              x={p.x}
              y={p.y - 90}
              textAnchor="middle"
              fontSize="16"
              fontWeight="600"
              fill="#9e9e9e"
              style={{ userSelect: "none" }}
            >
              {d.name}
            </text>
          );
        })}

        {/* 가게 핀 */}
        {visibleShops.map((shop) => {
          const isH = shop.id === highlightedShopId;
          const color = CATEGORY_COLORS[shop.category];
          const p = latLngToSvg(shop.lat, shop.lng);
          return (
            <g
              key={shop.id}
              onClick={() => onPinClick(shop)}
              style={{ cursor: "pointer" }}
              transform={`translate(${p.x}, ${p.y})`}
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

        {/* 내 위치 마커 */}
        {myPosSvg && (
          <g transform={`translate(${myPosSvg.x}, ${myPosSvg.y})`}>
            <circle r="14" fill="#3b82f6" opacity="0.2" />
            <circle r="6" fill="#3b82f6" stroke="white" strokeWidth="2.5" />
          </g>
        )}
      </svg>

      {/* 필터 */}
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
        내 위치 {radiusKm}km · {pool.length}곳
      </div>
    </div>
  );
}
