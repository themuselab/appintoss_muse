// 클릭/노출 이벤트를 themuselab.kr API로 전송. 실패해도 silent.

const TRACK_ENDPOINT = "https://themuselab.kr/api/track";

type EventName =
  | "session_start" // 앱 진입
  | "impression" // 알림 카드 노출
  | "alert_click" // 알림 카드 클릭
  | "pin_click" // 지도 핀 클릭
  | "missed_view" // "이미 다른 고객" 모달 머문 시간
  | "deeplink_open"; // 푸시 deeplink 통해 진입한 직후

type EventPayload = {
  variant?: "A" | "B";
  shopId?: string;
  shopCategory?: string;
  shopDistrict?: string;
  ms?: number;
  // deeplink 추적 (push 진입 시)
  source?: string; // "push_a", "push_b", "organic" 등
  campaignId?: string; // "20260530_01"
};

let sessionId = "";
function getSessionId() {
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return sessionId;
}

// URL 쿼리에서 deeplink 정보 추출 (1회만 호출, 이후 캐시)
let cachedEntry: {
  source: string;
  campaignId: string;
  shopId: string;
} | null = null;
export function getEntryInfo(): {
  source: string;
  campaignId: string;
  shopId: string;
} {
  if (cachedEntry) return cachedEntry;
  if (typeof window === "undefined") {
    cachedEntry = { source: "organic", campaignId: "", shopId: "" };
    return cachedEntry;
  }
  const params = new URLSearchParams(window.location.search);
  cachedEntry = {
    source: params.get("src") || "organic",
    campaignId: params.get("cid") || "",
    shopId: params.get("sid") || "",
  };
  return cachedEntry;
}

export async function track(event: EventName, payload: EventPayload = {}) {
  try {
    await fetch(`${TRACK_ENDPOINT}?app=ait-mock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        sessionId: getSessionId(),
        ts: Date.now(),
        ...payload,
      }),
      keepalive: true,
    });
  } catch {
    // silent
  }
}
