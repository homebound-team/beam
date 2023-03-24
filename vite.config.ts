import { defineConfig } from "vite";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [externalizeDeps(), tsconfigPaths()],
  build: {
    lib: {
      entry: ["src/index.ts", "src/mocks.ts"],
      name: "beam",
    },
  },
});
