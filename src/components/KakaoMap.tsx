import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map,
  MapMarker,
  MarkerClusterer,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any;
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
  myPos?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
};

// fallback center
const FALLBACK_CENTER = { lat: 37.555, lng: 127.0 };

// SVG → dataURL (카카오 마커 이미지로 사용)
function pinDataUrl(color: string, highlighted = false): string {
  const size = highlighted ? 22 : 14;
  const stroke = highlighted ? 2.5 : 1.4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - stroke}" fill="${color}" stroke="white" stroke-width="${stroke}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 카카오 키 — VITE_KAKAO_KEY 환경변수에서 (배포 시 카카오 디벨로퍼 콘솔 등록 필요)
const KAKAO_KEY = import.meta.env.VITE_KAKAO_KEY as string | undefined;

export function KakaoMap({ highlightedShopId, onPinClick, myPos, center }: Props) {
  const [filter, setFilter] = useState<ServiceCategory | "전체">("전체");
  const mapRef = useRef<MapInstance>(null);

  const [loading, error] = useKakaoLoader({
    appkey: KAKAO_KEY || "",
    libraries: ["clusterer"],
  });

  const visibleShops = useMemo(
    () =>
      filter === "전체" ? SHOPS : SHOPS.filter((s) => s.category === filter),
    [filter],
  );

  // highlighted shop 가운데로 panTo
  useEffect(() => {
    if (!highlightedShopId || !mapRef.current) return;
    const shop = SHOPS.find((s) => s.id === highlightedShopId);
    if (!shop) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.kakao?.maps?.LatLng) {
      mapRef.current.panTo(new w.kakao.maps.LatLng(shop.lat, shop.lng));
    }
  }, [highlightedShopId]);

  if (!KAKAO_KEY) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#fafafa",
          textAlign: "center",
          color: "#666",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1f1f1f" }}>
          카카오 지도 키 미설정
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5 }}>
          <code
            style={{
              background: "#f5f5f5",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            .env.local
          </code>{" "}
          파일에{" "}
          <code
            style={{
              background: "#f5f5f5",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            VITE_KAKAO_KEY=...
          </code>{" "}
          추가 필요
          <br />
          <a
            href="https://developers.kakao.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#ec4899", marginTop: 8, display: "inline-block" }}
          >
            카카오 디벨로퍼에서 JavaScript 키 발급 →
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#dc2626",
          fontSize: 12,
          padding: 20,
          textAlign: "center",
        }}
      >
        카카오 지도 로드 실패. 도메인 등록 확인 필요.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9e9e9e",
          fontSize: 12,
        }}
      >
        지도 불러오는 중…
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Map
        center={center || myPos || FALLBACK_CENTER}
        level={myPos ? 5 : 9}
        style={{ width: "100%", height: "100%" }}
        onCreate={(m) => {
          mapRef.current = m;
        }}
      >
        {/* 내 위치 마커 */}
        {myPos && (
          <MapMarker
            position={myPos}
            image={{
              src: `data:image/svg+xml;utf8,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="#3b82f6" fill-opacity="0.2"/><circle cx="14" cy="14" r="6" fill="#3b82f6" stroke="white" stroke-width="2.5"/></svg>`,
              )}`,
              size: { width: 28, height: 28 },
            }}
          />
        )}
        <MarkerClusterer averageCenter minLevel={6} disableClickZoom={false}>
          {visibleShops.map((s) => {
            const isH = s.id === highlightedShopId;
            const color = CATEGORY_COLORS[s.category];
            const url = pinDataUrl(color, isH);
            return (
              <MapMarker
                key={s.id}
                position={{ lat: s.lat, lng: s.lng }}
                image={{
                  src: url,
                  size: { width: isH ? 22 : 14, height: isH ? 22 : 14 },
                }}
                onClick={() => onPinClick(s)}
              />
            );
          })}
        </MarkerClusterer>
      </Map>

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
          zIndex: 5,
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
          zIndex: 5,
        }}
      >
        내 위치 5km 반경 · {SHOPS.length}곳
      </div>
    </div>
  );
}
