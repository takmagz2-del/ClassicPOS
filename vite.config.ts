import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    dyadComponentTagger(),
    react({
      // Explicitly set the JSX runtime for SWC
      swc: {
        jsc: {
          transform: {
            react: {
              jsxRuntime: 'automatic',
            },
          },
        },
      },
      // Explicitly include .ts and .tsx files for processing
      include: "**/*.{ts,tsx}",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure relative paths for assets in Capacitor builds
  base: '',
}));