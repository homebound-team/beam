import type { Config } from "@jest/types";
import { createDefaultEsmPreset } from "ts-jest";

const presetConfig = createDefaultEsmPreset({ isolatedModules: true });

const config: Config.InitialOptions = {
  ...presetConfig,
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^src(.*)": "<rootDir>/src$1",
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.tsx"],
  testMatch: ["<rootDir>/src/**/*.test.(ts|tsx)"],
};

export default config;
