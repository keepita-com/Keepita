import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js')) {
              return 'vendor-chartjs';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion';
            }
            if (id.includes('gsap')) {
              return 'vendor-gsap';
            }
            if (id.includes('@rive-app')) {
              return 'vendor-rive';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-react-query';
            }
            if (id.includes('jszip')) {
              return 'vendor-jszip';
            }
            if (id.includes('lucide-react')) {
                return 'vendor-lucide';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});