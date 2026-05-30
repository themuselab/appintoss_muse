import { useEffect, useMemo, useRef, useState } from "react";
import { KakaoMap } from "./components/KakaoMap";
import { AlertCard } from "./components/AlertCard";
import { MissedModal } from "./components/MissedModal";
import { SHOPS, type Shop } from "./data/shops";
import { track, getEntryInfo } from "./lib/track";
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

function App() {
  const [variant] = useState<"A" | "B">(() => pickVariant());
  const [alertShop, setAlertShop] = useState<Shop | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [highlightedShopId, setHighlightedShopId] = useState<string | undefined>();
  const modalOpenedAt = useRef<number | null>(null);
  const nextAlertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 진입 추적: deeplink 정보 + session_start
  useEffect(() => {
    const entry = getEntryInfo();
    track("session_start", {
      variant,
      source: entry.source,
      campaignId: entry.campaignId,
    });
    // push deeplink 진입 → 별도 이벤트 (CTR 분석용)
    if (entry.source !== "organic") {
      track("deeplink_open", {
        variant,
        source: entry.source,
        campaignId: entry.campaignId,
        shopId: entry.shopId || undefined,
      });
    }
  }, [variant]);

  // 첫 알림 — deeplink로 진입했으면 그 가게로, 아니면 랜덤
  useEffect(() => {
    const entry = getEntryInfo();
    const deeplinkShop = entry.shopId
      ? SHOPS.find((s) => s.id === entry.shopId)
      : undefined;
    const shop = deeplinkShop || pickRandomShop();
    setAlertShop(shop);

    // deeplink 진입이면 즉시 모달 오픈 (푸시 클릭 → 가게 정보 바로 봄)
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
  }, [variant]);

  const scheduleNextAlert = (delayMs: number, exceptId?: string) => {
    if (nextAlertTimer.current) clearTimeout(nextAlertTimer.current);
    nextAlertTimer.current = setTimeout(() => {
      const next = pickRandomShop(exceptId);
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
        />
        {showAlert && alertShop && (
          <AlertCard
            shop={alertShop}
            variant={variant}
            onClick={handleAlertClick}
            onClose={handleAlertClose}
          />
        )}
      </div>

      {selectedShop && (
        <MissedModal shop={selectedShop} onClose={handleCloseModal} />
      )}

      <div className="muse-footer">
        뮤즈 베타 검증용 샘플 · 실제 결제·예약은 진행되지 않습니다
      </div>
    </div>
  );
}

export default App;
