import { useEffect, useMemo, useRef, useState } from "react";
import { KakaoMap } from "./components/KakaoMap";
import { AlertCard } from "./components/AlertCard";
import { MissedModal } from "./components/MissedModal";
import { SHOPS, type Shop } from "./data/shops";
import { track, getEntryInfo } from "./lib/track";
import { getUserPosition, distanceMeters, SEOUL_CENTER } from "./lib/geo";
import "./App.css";

function pickVariant(): "A" | "B" {
  const h = `${Date.now()}-${Math.random()}`;
  let n = 0;
  for (let i = 0; i < h.length; i++) n += h.charCodeAt(i);
  return n % 2 === 0 ? "A" : "B";
}

function pickRandomShop(exceptId?: string): Shop {
  const pool = exceptId ? SHOPS.filter((s) => s.id !== exceptId) : SHOPS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// 내 위치 가까운 가게 우선 픽 (없으면 fallback to random)
function pickNearbyShop(
  myLat: number,
  myLng: number,
  exceptId?: string,
): Shop {
  const pool = exceptId ? SHOPS.filter((s) => s.id !== exceptId) : SHOPS;
  const ranked = pool
    .map((s) => ({
      shop: s,
      d: distanceMeters(myLat, myLng, s.lat, s.lng),
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 30); // top 30 가까운 곳
  if (!ranked.length) return pool[0];
  return ranked[Math.floor(Math.random() * ranked.length)].shop;
}

function App() {
  const [variant] = useState<"A" | "B">(() => pickVariant());
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [alertShop, setAlertShop] = useState<Shop | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [highlightedShopId, setHighlightedShopId] = useState<string | undefined>();
  const modalOpenedAt = useRef<number | null>(null);
  const nextAlertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 위치 가져오기 (1회)
  useEffect(() => {
    getUserPosition().then((p) => {
      setMyPos({ lat: p.lat, lng: p.lng });
    });
  }, []);

  // 세션 시작 + deeplink
  useEffect(() => {
    const entry = getEntryInfo();
    track("session_start", {
      variant,
      source: entry.source,
      campaignId: entry.campaignId,
    });
    if (entry.source !== "organic") {
      track("deeplink_open", {
        variant,
        source: entry.source,
        campaignId: entry.campaignId,
        shopId: entry.shopId || undefined,
      });
    }
  }, [variant]);

  // 첫 알림 — 위치 받은 후
  useEffect(() => {
    if (!myPos) return;
    const entry = getEntryInfo();
    const deeplinkShop = entry.shopId
      ? SHOPS.find((s) => s.id === entry.shopId)
      : undefined;
    const shop = deeplinkShop || pickNearbyShop(myPos.lat, myPos.lng);
    setAlertShop(shop);

    if (deeplinkShop) {
      setHighlightedShopId(deeplinkShop.id);
      setSelectedShop(deeplinkShop);
      modalOpenedAt.current = Date.now();
      return;
    }

    const t = setTimeout(() => {
      setShowAlert(true);
      track("impression", {
        variant,
        shopId: shop.id,
        shopCategory: shop.category,
        shopDistrict: shop.district,
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [myPos, variant]);

  const scheduleNextAlert = (delayMs: number, exceptId?: string) => {
    if (nextAlertTimer.current) clearTimeout(nextAlertTimer.current);
    nextAlertTimer.current = setTimeout(() => {
      const next = myPos
        ? pickNearbyShop(myPos.lat, myPos.lng, exceptId)
        : pickRandomShop(exceptId);
      setAlertShop(next);
      setShowAlert(true);
      track("impression", {
        variant,
        shopId: next.id,
        shopCategory: next.category,
        shopDistrict: next.district,
      });
    }, delayMs);
  };

  const handleAlertClick = () => {
    if (!alertShop) return;
    track("alert_click", {
      variant,
      shopId: alertShop.id,
      shopCategory: alertShop.category,
      shopDistrict: alertShop.district,
    });
    setHighlightedShopId(alertShop.id);
    setShowAlert(false);
    setTimeout(() => {
      setSelectedShop(alertShop);
      modalOpenedAt.current = Date.now();
    }, 500);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    scheduleNextAlert(30000, alertShop?.id);
  };

  const handlePinClick = (shop: Shop) => {
    track("pin_click", {
      variant,
      shopId: shop.id,
      shopCategory: shop.category,
      shopDistrict: shop.district,
    });
    setHighlightedShopId(shop.id);
    setSelectedShop(shop);
    modalOpenedAt.current = Date.now();
  };

  // 모달에서 "근처 샵" 카드 클릭 → 그 가게로 모달 전환
  const handleSelectNearby = (shop: Shop) => {
    if (modalOpenedAt.current && selectedShop) {
      const dwell = Date.now() - modalOpenedAt.current;
      track("missed_view", {
        variant,
        shopId: selectedShop.id,
        shopCategory: selectedShop.category,
        ms: dwell,
      });
    }
    track("pin_click", {
      variant,
      shopId: shop.id,
      shopCategory: shop.category,
      shopDistrict: shop.district,
    });
    setHighlightedShopId(shop.id);
    setSelectedShop(shop);
    modalOpenedAt.current = Date.now();
  };

  const handleCloseModal = () => {
    if (modalOpenedAt.current && selectedShop) {
      const dwell = Date.now() - modalOpenedAt.current;
      track("missed_view", {
        variant,
        shopId: selectedShop.id,
        shopCategory: selectedShop.category,
        ms: dwell,
      });
    }
    modalOpenedAt.current = null;
    setSelectedShop(null);
    setHighlightedShopId(undefined);
    scheduleNextAlert(20000, alertShop?.id);
  };

  const shopCount = useMemo(() => SHOPS.length, []);
  const center = myPos || SEOUL_CENTER;

  return (
    <div className="muse-app">
      <div className="muse-header">
        <div className="muse-logo-wrap">
          <div className="muse-logo">
            <img src="/icon.png" alt="뮤즈" />
          </div>
          <div>
            <div className="muse-title">뮤즈</div>
            <div className="muse-subtitle">내 위치 5km · {shopCount}곳</div>
          </div>
        </div>
        <div className="muse-variant-badge">{variant}</div>
      </div>

      <div className="muse-map-wrap">
        <KakaoMap
          highlightedShopId={highlightedShopId}
          onPinClick={handlePinClick}
          myPos={myPos}
          center={center}
        />
        {showAlert && alertShop && (
          <AlertCard
            shop={alertShop}
            variant={variant}
            myPos={myPos}
            onClick={handleAlertClick}
            onClose={handleAlertClose}
          />
        )}
      </div>

      {selectedShop && (
        <MissedModal
          shop={selectedShop}
          myPos={myPos}
          onClose={handleCloseModal}
          onSelectNearby={handleSelectNearby}
        />
      )}
    </div>
  );
}

export default App;
