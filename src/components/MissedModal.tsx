import { useEffect, useState } from "react";
import type { Shop } from "../data/shops";
import { CATEGORY_COLORS, SHOPS } from "../data/shops";

type Props = {
  shop: Shop;
  onClose: () => void;
};

export function MissedModal({ shop, onClose }: Props) {
  const [otherCount, setOtherCount] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setOtherCount(2), 1500);
    const t2 = setTimeout(() => setOtherCount(3), 3000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  const similar = SHOPS.filter(
    (s) => s.category === shop.category && s.id !== shop.id,
  )
    .sort((a, b) => b.repeatRate - a.repeatRate)
    .slice(0, 3);
  const color = CATEGORY_COLORS[shop.category];

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

        {/* 신뢰 지표 한 줄 */}
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
            ★ <strong style={{ color: "#1f1f1f" }}>{shop.rating.toFixed(1)}</strong>{" "}
            ({shop.reviewCount})
          </span>
          <span>·</span>
          <span>
            재방문 <strong style={{ color: "#ec4899" }}>{shop.repeatRate}%</strong>
          </span>
          <span>·</span>
          <span>경력 {shop.yearsInBusiness}년</span>
          <span>·</span>
          <span>도보 {shop.walkMinutes}분</span>
        </div>

        {/* 메시지 */}
        <div
          style={{
            background: "#fdf2f8",
            border: "1px solid #fce7f3",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "#be185d",
              marginBottom: 3,
            }}
          >
            방금 다른 고객이 결제했어요
          </div>
          <div style={{ fontSize: 11.5, color: "#9d174d" }}>
            이 자리는 <strong>{otherCount}분</strong>이 동시에 보고 있었어요
          </div>
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

        {/* 메뉴 리스트 */}
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
                  borderBottom: i < shop.menu.length - 1 ? "1px solid #f5f5f5" : "none",
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
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            인기 후기
            <span
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: "#9e9e9e",
                background: "#f5f5f5",
                padding: "2px 5px",
                borderRadius: 3,
              }}
            >
              검증 샘플
            </span>
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

        {/* 비슷한 빈 자리 */}
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#1f1f1f",
            marginBottom: 7,
          }}
        >
          근처 비슷한 빈 자리
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {similar.map((s) => (
            <div
              key={s.id}
              style={{
                border: "1px solid #ededed",
                borderRadius: 8,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
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
                  ★ {s.rating.toFixed(1)} · 재방문 {s.repeatRate}% · {s.emptySlot}
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
            </div>
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

        <div
          style={{
            marginTop: 12,
            fontSize: 10,
            color: "#9e9e9e",
            textAlign: "center",
          }}
        >
          이 화면의 가게/후기는 뮤즈 베타 검증용 가상 데이터입니다
        </div>
      </div>
    </div>
  );
}
