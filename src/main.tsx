import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

// TDSMobileAITProvider는 Vercel 등 토스 외 환경에서 import만 해도 가드 throw → React 크래시.
// 토스 "서비스 사용 불가"는 콘솔 측 stuck 문제이므로 TDS 와 무관.
// Vercel 작동 우선 → Provider 제거.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
