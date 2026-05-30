import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "muse",
  brand: {
    displayName: "뮤즈",
    primaryColor: "#ec4899", // PDF / 브랜드 핑크 톤
    icon: "/icon.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
