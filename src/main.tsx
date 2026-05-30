import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

// 토스 미니앱 외 환경(Vercel 미리보기 등)에서도 작동하도록 TDSMobileAITProvider 제거.
// 우리는 토스 TDS 컴포넌트(Top/Button 등) 사용 X, inline 스타일만 씀.
// 검수 시 Provider 필요해지면 환경 감지해서 조건부 wrap 가능.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
