import { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],

  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions"],

  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: { check: false },

  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      esbuild: {
        // ignoring console warns of "Top-level "this" will be replaced with undefined since this file is an ECMAScript module"
        // See https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
        logOverride: { "this-is-undefined-in-esm": "silent" },
      },
      // Add aliasing to resolve absolute paths for imports
      resolve: { alias: { src: path.resolve(__dirname, "../src") } },
    });
  },

  staticDirs: ["../storybookAssets"],

  framework: {
    name: "@storybook/react-vite",
    options: { strictMode: false },
  },
};

export default config;
