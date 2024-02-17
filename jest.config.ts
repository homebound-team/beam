import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^src(.*)": "<rootDir>/src$1",
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.tsx"],
  testMatch: ["<rootDir>/src/**/*.test.(ts|tsx)"],
};

export default config;
