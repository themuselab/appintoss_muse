import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

// 환경 분기:
//   - 토스 미니앱: TDSMobileAITProvider로 wrap (SDK lifecycle 초기화 필수)
//   - Vercel 등 일반 웹: Provider 없이 (import 시 가드 throw → React 크래시 방지)
//
// 동적 import → Vercel에서는 코드 자체 실행 X → 가드 안 트리거.
async function bootstrap() {
  let element = <App />;

  const ua =
    typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = typeof window !== "undefined" ? (window as any) : {};
  const isInToss =
    ua.includes("toss") ||
    ua.includes("appsintoss") ||
    !!w.__APPS_IN_TOSS__ ||
    !!w.AppsInToss ||
    !!w.TossApp;

  if (isInToss) {
    try {
      const tdsMod = await import("@toss/tds-mobile-ait");
      const configMod = await import("../granite.config.ts");
      const Provider = tdsMod.TDSMobileAITProvider;
      const config = configMod.default;
      element = (
        <Provider brandPrimaryColor={config.brand.primaryColor}>
          <App />
        </Provider>
      );
    } catch (e) {
      // 토스 환경인데 TDS 로드 실패 — 콘솔에만 기록, 일단 App 렌더
      // eslint-disable-next-line no-console
      console.warn("[shak] TDS Provider load failed:", e);
    }
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>{element}</StrictMode>,
  );
}

bootstrap();
