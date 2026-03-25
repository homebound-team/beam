import { trussEsbuildPlugin } from "@homebound/truss/plugin";
import { type Plugin } from "esbuild";
import { defineConfig } from "tsup";

const trussPlugin = trussEsbuildPlugin({ mapping: "./src/Css.json" }) as Plugin;

export default defineConfig({
  entry: ["src/index.ts", "src/utils/rtlUtils.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  esbuildPlugins: [trussPlugin],
  // Ship with JSX tags still in the bundled source, so the Truss plugin can rewrite them as
  // part of the final application build.
  esbuildOptions(options) {
    options.jsx = "preserve";
  },
  outExtension({ format }) {
    return { js: format === "esm" ? ".jsx" : ".cjs" };
  },
});
