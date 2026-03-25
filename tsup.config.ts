import { trussEsbuildPlugin } from "@homebound/truss/plugin";
import { type Plugin } from "esbuild";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/utils/rtlUtils.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  esbuildPlugins: [trussEsbuildPlugin({ mapping: "./src/Css.json" }) as Plugin],
});
