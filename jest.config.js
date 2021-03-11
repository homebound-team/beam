// Copy/pasted from tsdx, but here so that Webstorm can see it.
// See https://github.com/formium/tsdx/blob/master/src/createJestConfig.ts
module.exports = {
  transform: {
    ".(ts|tsx)$": require.resolve("ts-jest/dist"),
    ".(js|jsx)$": require.resolve("babel-jest"), // jest's default
  },
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx,js,jsx}"],
};
