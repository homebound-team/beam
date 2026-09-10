import { trussEsbuildPlugin } from "@homebound/truss/plugin";
import type { Plugin } from "esbuild";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/utils/rtlUtils.tsx"],
  format: ["esm", "cjs"],
  // tsup still sets `baseUrl` for the dts build, which TypeScript 6 reports as a deprecation error
  dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
  clean: true,
  sourcemap: true,
  esbuildPlugins: [trussEsbuildPlugin({ mapping: "./src/Css.json" }) as Plugin],
});
