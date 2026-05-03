import { defineConfig } from "evalite/config";

export default defineConfig({
  testTimeout: 500 * 1000, // 500 seconds
  server: {
    port: 3006,
  },
});
