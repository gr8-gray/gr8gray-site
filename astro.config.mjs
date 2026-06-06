import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://gr8gray.dev",
  vite: {
    plugins: [tailwindcss()],
  },
});
