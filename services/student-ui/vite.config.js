import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT || 3001);

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port,
    },
  };
});
