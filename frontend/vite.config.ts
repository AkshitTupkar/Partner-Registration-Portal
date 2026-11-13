import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = fileURLToPath(new URL("./src", import.meta.url));
const atomUi = `${src}/vendor/atomberg-ui`;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // "@/..." resolves from src/, as in atlas-frontend.
      { find: /^@\//, replacement: `${src}/` },
      // Vendored Atomberg UI; remove once @atomberg/ui is installable (see src/vendor/atomberg-ui/README.md).
      { find: /^@atomberg\/ui$/, replacement: `${atomUi}/index.js` },
      { find: /^@atomberg\/ui\/(.*)$/, replacement: `${atomUi}/$1` },
    ],
  },
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:4000" },
  },
});
