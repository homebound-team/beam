const esbuild = require("esbuild");
const { nodeExternalsPlugin } = require("esbuild-node-externals");

// See the Bundling section of the readme for rationale/thoughts.

esbuild.build({
  entryPoints: ["src/index.ts"],
  sourcemap: true,
  outfile: "dist/index.mjs",
  bundle: true,
  format: "esm",
  plugins: [nodeExternalsPlugin()],
  jsxFactory: "jsx",
  jsxFragment: "Fragment",
  inject: ["./esbuild.inject.js"],
});
