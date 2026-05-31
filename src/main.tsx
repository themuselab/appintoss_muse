import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

// AIT 빌드(토스 미니앱)에서만 TDSMobileAITProvider 적용.
// Vercel 빌드는 vercel.json의 VITE_TARGET=vercel 환경변수로 구분 → Provider 스킵.
// 동적 import라 Vercel 번들에는 모듈 자체가 포함되지 않음 → 가드 throw X.
const IS_VERCEL_BUILD = import.meta.env.VITE_TARGET === "vercel";

async function bootstrap() {
  let element = <App />;

  if (!IS_VERCEL_BUILD) {
    // AIT 빌드: TDS Provider로 wrap (SDK lifecycle 초기화 필수)
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
      // eslint-disable-next-line no-console
      console.warn("[shak] TDS Provider load failed:", e);
    }
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>{element}</StrictMode>,
  );
}

bootstrap();
