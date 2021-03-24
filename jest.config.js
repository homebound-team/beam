module.exports = {
  preset: "ts-jest",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx,js,jsx}"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.tsx"],
  moduleNameMapper: {
    "^src(.*)": "<rootDir>/src$1",
  },
  snapshotSerializers: ["@emotion/jest/serializer"],
};
