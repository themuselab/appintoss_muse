import { useEffect, useState } from "react";
import type { Shop } from "../data/shops";
import { CATEGORY_COLORS } from "../data/shops";

type Props = {
  shop: Shop;
  variant: "A" | "B";
  onClick: () => void;
  onClose: () => void;
};

function buildCopy(shop: Shop, variant: "A" | "B"): { title: string; body: string } {
  const discountPct = Math.round(
    ((shop.originalPrice - shop.discountedPrice) / shop.originalPrice) * 100,
  );

  if (variant === "A") {
    return {
      title: `${shop.district} ${shop.category}샵, 지금 ${discountPct}% 할인`,
      body: `${shop.specialty} · 도보 ${shop.walkMinutes}분 · ${shop.emptySlot}`,
    };
  }
  return {
    title: `${shop.district} ${shop.category}샵 빈 자리 1개 남았어요`,
    body: `${shop.specialty} · ${shop.discountedPrice.toLocaleString()}원 · ${shop.emptySlot}`,
  };
}

export function AlertCard({ shop, variant, onClick, onClose }: Props) {
  const [time, setTime] = useState("방금 전");

  useEffect(() => {
    const t = setInterval(
      () => setTime(`${Math.floor(Math.random() * 3) + 1}초 전`),
      8000,
    );
    return () => clearInterval(t);
  }, []);

  const copy = buildCopy(shop, variant);
  const color = CATEGORY_COLORS[shop.category];

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        background: "white",
        borderRadius: 8,
        boxShadow:
          "0 4px 14px rgba(15, 23, 42, 0.10), 0 1px 3px rgba(15, 23, 42, 0.06)",
        border: "1px solid #ebebeb",
        padding: "11px 12px",
        cursor: "pointer",
        zIndex: 10,
        animation: "slideDown 0.35s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 5,
        }}
      >
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: color,
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#1f1f1f" }}>
          뮤즈
        </span>
        <span style={{ fontSize: 10, color: "#9e9e9e" }}>· {time}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            marginLeft: "auto",
            background: "none",
            border: 0,
            color: "#9e9e9e",
            fontSize: 14,
            cursor: "pointer",
            padding: "2px 4px",
            lineHeight: 1,
          }}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <div
        style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: "#1f1f1f",
          marginBottom: 3,
          lineHeight: 1.35,
        }}
      >
        {copy.title}
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: "#666",
          lineHeight: 1.4,
        }}
      >
        {copy.body}
      </div>
    </div>
  );
}
