// 일시 진단 빌드: react-kakao-maps-sdk 호환성 의심 → SVG placeholder로 대체
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

export function KakaoMap({
  shops,
  onPinClick,
  radiusKm = 10,
}: Props) {
  const [filter, setFilter] = useState<ServiceCategory | "전체">("전체");
  const pool = shops || SHOPS;
  const visible = filter === "전체" ? pool : pool.filter((s) => s.category === filter);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#f5f5f5",
      }}
    >
      <svg
        viewBox="0 0 1000 900"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <rect width="1000" height="900" fill="#eeeeee" />
        <path
          d="M 0 500 Q 200 480 380 510 T 720 490 T 1000 510 L 1000 540 Q 720 560 380 540 T 0 530 Z"
          fill="#cfe2ff"
        />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 90} x2="1000" y2={i * 90} stroke="#e0e0e0" strokeWidth="1" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 90} y1="0" x2={i * 90} y2="900" stroke="#e0e0e0" strokeWidth="1" />
        ))}
        {visible.slice(0, 200).map((shop) => {
          const sx = ((shop.lng - 126.85) / (127.15 - 126.85)) * 1000;
          const sy = 900 - ((shop.lat - 37.45) / (37.7 - 37.45)) * 900;
          const color = CATEGORY_COLORS[shop.category];
          return (
            <g key={shop.id} onClick={() => onPinClick(shop)} style={{ cursor: "pointer" }}>
              <circle cx={sx} cy={sy} r="5" fill={color} stroke="white" strokeWidth="1.2" />
            </g>
          );
        })}
      </svg>

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
        }}
      >
        내 위치 {radiusKm}km · {pool.length}곳
      </div>
    </div>
  );
}
