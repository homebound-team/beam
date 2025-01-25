import { type StorybookConfig } from "@storybook/react-vite";
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
      // If you see weird errors around `createElement is undefined`, it is likely because of
      // React now wanting the `key` prop to always come first:
      //
      // - https://github.com/facebook/react/pull/25697/files?diff=unified&w=1
      // - https://github.com/vitejs/vite/issues/6215
      // - https://github.com/mui/material-ui/issues/39833
    });
  },

  staticDirs: ["../storybookAssets"],

  framework: {
    name: "@storybook/react-vite",
    options: { strictMode: false },
  },
};

export default config;
