import { trussPlugin } from "@homebound/truss/plugin";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [trussPlugin({ mapping: "./src/Css.json" })],
  // Vite 8.2 stopped resolving `paths` from a tsconfig that `extends` a package, so alias `src/*` directly
  resolve: { alias: { src: fileURLToPath(new URL("./src", import.meta.url)) } },
});
