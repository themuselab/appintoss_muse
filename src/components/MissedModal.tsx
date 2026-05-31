import { useMemo, useState } from "react";
import type { Shop } from "../data/shops";
import { CATEGORY_COLORS, SHOPS } from "../data/shops";
import { distanceMeters, fmtDistance } from "../lib/geo";

type Props = {
  shop: Shop;
  myPos?: { lat: number; lng: number } | null;
  onClose: () => void;
  onSelectNearby: (shop: Shop) => void;
};

export function MissedModal({ shop, myPos, onClose, onSelectNearby }: Props) {
  // 동시에 보고 있는 인원수: 가게 ID 기반 결정적 1~3 (모달 다시 열어도 같은 가게면 같음)
  const otherCount = useMemo(() => {
    let h = 0;
    for (let i = 0; i < shop.id.length; i++) h = (h * 31 + shop.id.charCodeAt(i)) | 0;
    return (Math.abs(h) % 3) + 1; // 1, 2, 3
  }, [shop.id]);

  const color = CATEGORY_COLORS[shop.category];

  const distStr = myPos
    ? fmtDistance(distanceMeters(myPos.lat, myPos.lng, shop.lat, shop.lng))
    : null;

  // 내 위치 기준 가까운 같은 카테고리 가게 (현 가게 제외) 3개
  const nearby = useMemo(() => {
    const pool = SHOPS.filter(
      (s) => s.category === shop.category && s.id !== shop.id,
    );
    const ranked = myPos
      ? pool
          .map((s) => ({
            s,
            d: distanceMeters(myPos.lat, myPos.lng, s.lat, s.lng),
          }))
          .sort((a, b) => a.d - b.d)
      : pool.map((s) => ({ s, d: 0 })).sort((a, b) => b.s.repeatRate - a.s.repeatRate);
    return ranked.slice(0, 4).map((r) => ({ shop: r.s, d: r.d }));
  }, [shop.id, shop.category, myPos]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "18px 18px 28px 18px",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            background: "#e5e5e5",
            borderRadius: 999,
            margin: "0 auto 14px auto",
          }}
        />

        {/* 메인 메시지 배너 — 알림 시간 일치 */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #be185d 0%, #ec4899 100%)",
            borderRadius: 12,
            padding: "18px 18px",
            marginBottom: 16,
            color: "white",
            boxShadow: "0 6px 20px rgba(190, 24, 93, 0.25)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.22)",
              padding: "4px 9px",
              borderRadius: 999,
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: 1.2,
              marginBottom: 10,
            }}
          >
            마감 완료
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 800,
              lineHeight: 1.3,
              marginBottom: 6,
              letterSpacing: -0.3,
            }}
          >
            {shop.emptySlot} 자리, 이미 예약됐어요
          </div>
          <div
            style={{
              fontSize: 12.5,
              opacity: 0.92,
              lineHeight: 1.5,
            }}
          >
            방금 다른 고객이 결제 완료했어요.
            <br />
            지금 이 자리를 <strong>{otherCount}분</strong>이 동시에 보고 있어요.
          </div>
        </div>

        {/* 가게명 + 카테고리 배지 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#9e9e9e",
                marginBottom: 2,
              }}
            >
              놓치신 곳
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1f1f1f",
                lineHeight: 1.3,
              }}
            >
              {shop.district} {shop.category}샵
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: color,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {shop.specialty}
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: color,
              background: `${color}15`,
              padding: "3px 7px",
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            {shop.category}
          </span>
        </div>

        {/* 신뢰 지표 */}
        <div
          style={{
            fontSize: 11.5,
            color: "#666",
            marginTop: 8,
            marginBottom: 14,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span>
            ★{" "}
            <strong style={{ color: "#1f1f1f" }}>{shop.rating.toFixed(1)}</strong>{" "}
            ({shop.reviewCount})
          </span>
          <span>·</span>
          <span>
            재방문 <strong style={{ color: "#ec4899" }}>{shop.repeatRate}%</strong>
          </span>
          <span>·</span>
          <span>경력 {shop.yearsInBusiness}년</span>
          {distStr && (
            <>
              <span>·</span>
              <span>
                내 위치 <strong style={{ color: "#1f1f1f" }}>{distStr}</strong>
              </span>
            </>
          )}
        </div>

        {/* 가격 (시그니처) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "11px 12px",
            background: "#fafafa",
            borderRadius: 8,
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, color: "#999", marginBottom: 2 }}>
              아쉬워하신 시술
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1f1f1f" }}>
              {shop.menu[0].name}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10.5,
                color: "#999",
                textDecoration: "line-through",
              }}
            >
              {shop.originalPrice.toLocaleString()}원
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#ec4899",
                letterSpacing: -0.3,
              }}
            >
              {shop.discountedPrice.toLocaleString()}원
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: "#1f1f1f",
              marginBottom: 7,
            }}
          >
            전체 메뉴
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {shop.menu.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12.5,
                  padding: "6px 0",
                  borderBottom:
                    i < shop.menu.length - 1 ? "1px solid #f5f5f5" : "none",
                }}
              >
                <span style={{ color: "#1f1f1f" }}>{m.name}</span>
                <span style={{ color: "#666", fontWeight: 600 }}>
                  {m.price.toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 운영 정보 */}
        <div
          style={{
            background: "#fafafa",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 11.5,
            color: "#666",
            marginBottom: 14,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>영업 시간</span>
            <span style={{ color: "#1f1f1f", fontWeight: 600 }}>
              {shop.openHours}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>누적 시술</span>
            <span style={{ color: "#1f1f1f", fontWeight: 600 }}>
              {shop.visitCount.toLocaleString()}회
            </span>
          </div>
        </div>

        {/* 후기 */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: "#1f1f1f",
              marginBottom: 7,
            }}
          >
            인기 후기
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {shop.reviews.map((r, i) => (
              <div
                key={i}
                style={{
                  background: "#fafafa",
                  borderRadius: 6,
                  padding: "9px 11px",
                  fontSize: 12,
                  color: "#1f1f1f",
                  lineHeight: 1.45,
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#ec4899",
                    fontWeight: 700,
                    marginBottom: 2,
                  }}
                >
                  ★ {r.rating.toFixed(1)}
                </div>
                "{r.text}"
              </div>
            ))}
          </div>
        </div>

        {/* 근처 샵 — 클릭 가능 */}
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#1f1f1f",
            marginBottom: 7,
          }}
        >
          근처 샵
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {nearby.map(({ shop: s, d }) => (
            <button
              key={s.id}
              onClick={() => onSelectNearby(s)}
              style={{
                border: "1px solid #ededed",
                background: "white",
                borderRadius: 8,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: CATEGORY_COLORS[s.category],
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#1f1f1f",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.district} {s.category}샵 · {s.specialty}
                </div>
                <div style={{ fontSize: 10.5, color: "#666", marginTop: 1 }}>
                  ★ {s.rating.toFixed(1)} · 재방문 {s.repeatRate}%
                  {myPos && d > 0 && ` · ${fmtDistance(d)}`}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1f1f1f",
                }}
              >
                {s.discountedPrice.toLocaleString()}원
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "12px 0",
            background: "#ec4899",
            color: "white",
            border: 0,
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          지도에서 다른 자리 보기
        </button>
      </div>
    </div>
  );
}
