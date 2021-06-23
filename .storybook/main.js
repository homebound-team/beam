module.exports = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "storybook-addon-performance/register"],
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: { check: false },
  webpackFinal: async (config) => {
    // Make our `src/...` imports work
    config.resolve.modules.push(__dirname, "./");
    return config;
  },
  reactOptions: { fastRefresh: true, strictMode: true },
};
