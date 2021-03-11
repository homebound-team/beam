module.exports = {
  preset: "ts-jest",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx,js,jsx}"],
  moduleNameMapper: {
    "^src/(.*)": "<rootDir>/src/$1",
  },
};
