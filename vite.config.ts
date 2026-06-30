import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA. Base is "./" so the build can be hosted from any sub-path on a CDN.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
