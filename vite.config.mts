import { trussPlugin } from "@homebound/truss/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [trussPlugin({ mapping: "./src/Css.json" })],
  resolve: { tsconfigPaths: true },
});
