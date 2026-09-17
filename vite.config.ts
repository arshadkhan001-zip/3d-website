import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/3d-website/",
  plugins: [react(), tailwindcss()],
  publicDir: "public",
});
