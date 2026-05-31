import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "shak",
  brand: {
    displayName: "샥",
    primaryColor: "#ec4899",
    icon: "/icon-syak.png",
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
