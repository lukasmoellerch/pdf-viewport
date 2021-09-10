import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  /* optimizeDeps: {
    include: ["pdf-viewport"],
  },*/
  resolve: {
    alias: {
      "pdf-viewport": path.resolve("../src"),
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "dark-mode": path.resolve(__dirname, "dark-mode/index.html"),
      },
    },
  },
});
