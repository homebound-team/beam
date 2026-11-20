import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],

  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  // react-docgen-typescript follows imported and inherited prop types (e.g. PresentationFieldProps), so
  // `<ArgTypes>` tables in MDX list every Beam prop with its JSDoc. Props from node_modules (DOM, react-aria) are dropped.
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => !prop.parent || !prop.parent.fileName.includes("node_modules"),
    },
  },

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
