import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function normalizeBasePath(value: string | undefined) {
  const path = value?.trim() || "./";
  if (path === "/" || path === "./") return path;
  return `/${path.replace(/^\/+|\/+$/g, "")}/`;
}

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    watch:
      process.env.CODEX_SANDBOX === "seatbelt"
        ? { useFsEvents: false, usePolling: true }
        : undefined,
  },
});
