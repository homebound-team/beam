import { trussPlugin } from "@homebound/truss/plugin";
import stylexPlugin from "@stylexjs/unplugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    trussPlugin({ mapping: "./src/Css.json" }),
    stylexPlugin({
      // Keep the `Component__css_df` out of the `className`s -- we have our own `data-truss-cs`
      enableDevClassNames: false,
      // Turn off `data-style-src
      debug: false,
      // Use layers instead of the `:not(#\#)` hack it's widely supported since ~2022
      useCSSLayers: true,
    }),
  ],
  resolve: { tsconfigPaths: true },
});
