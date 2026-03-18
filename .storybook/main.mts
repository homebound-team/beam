import { type StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],

  addons: ["@storybook/addon-links"],

  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: { check: false },

  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          // Stub out vitest in Storybook — it's pulled in transitively by
          // @homebound/rtl-react-router-utils (which unconditionally re-exports
          // mocks.js that imports `vi` from vitest). The real fix is splitting
          // that package's exports so withRouter doesn't drag in vitest.
          vitest: new URL("./vitest-stub.mts", import.meta.url).pathname,
        },
      },
    });
  },

  staticDirs: ["../storybookAssets"],

  framework: {
    name: "@storybook/react-vite",
    options: { strictMode: false },
  },
  core: { builder: "@storybook/builder-vite" },
};

export default config;
