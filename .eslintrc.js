module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended"],
  // Maybe eventually put this back, it's pretty strict on any/object/return types
  // , "plugin:@typescript-eslint/recommended"],
};
