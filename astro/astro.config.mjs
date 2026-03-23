import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE || "https://example.com",
  base: process.env.BASE_PATH || "/",
  trailingSlash: "always",
  server: {
    host: true
  },
  vite: {
    server: {
      fs: {
        allow: [".."]
      }
    }
  }
});
