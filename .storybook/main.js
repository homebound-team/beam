const { mergeConfig } = require("vite");
const path = require("path");
const reactPlugin = require("@vitejs/plugin-react");
const turbosnap = require("vite-plugin-turbosnap");
module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.tsx"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-designs",
    "@storybook/addon-mdx-gfm",
  ],

  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: { check: false },

  features: { previewMdx2: true },

  async viteFinal(config, { configType }) {
    const mergedConfig = mergeConfig(config, {
      esbuild: {
        // ignoring console warns of "Top-level "this" will be replaced with undefined since this file is an ECMAScript module"
        // See https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
        logOverride: { "this-is-undefined-in-esm": "silent" },
      },
      resolve: {
        // Add aliasing to resolve absolute paths for imports
        alias: {
          src: path.resolve(__dirname, "../src"),
        },
      },
    });
    return {
      ...mergedConfig,
      plugins: [
        // Filter out `vite:react-jsx` per suggestion in `plugin-react`...
        // "You should stop using "vite:react-jsx" since this plugin conflicts with it."
        // Implementation suggestion from: https://github.com/storybookjs/builder-vite/issues/113#issuecomment-940190931
        ...config.plugins.filter(
          (plugin) => !(Array.isArray(plugin) && plugin.some((p) => p.name === "vite:react-jsx")),
        ),
        reactPlugin({
          exclude: [/\.stories\.tsx?$/, /node_modules/],
          jsxImportSource: "@emotion/react",
        }),
        ...(configType === "PRODUCTION" ? [turbosnap({ rootDir: config.root ?? process.cwd() })] : []),
      ],
      optimizeDeps: [
        ...(mergedConfig.optimizeDeps ? mergedConfig.optimizeDeps.include || [] : []),
        "@emotion/react/jsx-dev-runtime",
      ],
    };
  },

  staticDirs: ["../storybookAssets"],

  framework: {
    name: "@storybook/react-vite",
    options: {
      fastRefresh: true,
      strictMode: false,
    },
  },
};
