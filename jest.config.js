module.exports = {
  preset: "ts-jest",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx,js,jsx}"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.tsx"],
  moduleNameMapper: {
    "^src(.*)": "<rootDir>/src$1",
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },
  snapshotSerializers: ["@emotion/jest/serializer"],
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
};
