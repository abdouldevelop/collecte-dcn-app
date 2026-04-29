const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  setupFilesAfterFramework: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathPattern: ["**/__tests__/**/*.test.ts?(x)", "**/*.test.ts?(x)"],
};

module.exports = createJestConfig(customJestConfig);
