module.exports = {
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "prettier"],
  // Maybe eventually put this back, it's pretty strict on any/object/return types
  // , "plugin:@typescript-eslint/recommended"],
};
