// 클릭/노출 이벤트 → themuselab.kr API. 실패 silent.

const TRACK_ENDPOINT = "https://themuselab.kr/api/track";

type EventName =
  | "session_start"
  | "impression"
  | "alert_click"
  | "pin_click"
  | "missed_view"
  | "deeplink_open";

type Platform = "toss" | "web";

type EventPayload = {
  variant?: "A" | "B";
  shopId?: string;
  shopCategory?: string;
  shopDistrict?: string;
  ms?: number; // dwell or time-to-click (이벤트 종류에 따라)
  source?: string;
  campaignId?: string;
  platform?: Platform;
};

let sessionId = "";
function getSessionId() {
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return sessionId;
}

// 토스 앱 안 vs 일반 웹 구분
let cachedPlatform: Platform | null = null;
export function getPlatform(): Platform {
  if (cachedPlatform) return cachedPlatform;
  if (typeof window === "undefined") {
    cachedPlatform = "web";
    return cachedPlatform;
  }
  // 1. URL 쿼리 명시 (콘솔 deeplink ?platform=toss)
  const params = new URLSearchParams(window.location.search);
  if (params.get("platform") === "toss") {
    cachedPlatform = "toss";
    return cachedPlatform;
  }
  // 2. UserAgent 검사
  const ua = (navigator.userAgent || "").toLowerCase();
  if (ua.includes("toss") || ua.includes("appsintoss")) {
    cachedPlatform = "toss";
    return cachedPlatform;
  }
  // 3. SDK가 주입한 글로벌 객체
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.__APPS_IN_TOSS__ || w.AppsInToss || w.TossApp) {
    cachedPlatform = "toss";
    return cachedPlatform;
  }
  cachedPlatform = "web";
  return cachedPlatform;
}

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
        platform: getPlatform(),
        ...payload,
      }),
      keepalive: true,
    });
  } catch {
    // silent
  }
}
