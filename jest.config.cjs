/* global module */
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",

  testEnvironment: "node",

  extensionsToTreatAsEsm: [".ts"],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json",
      },
    ],
  },

  testMatch: ["**/*.test.ts"],

  clearMocks: true,

  collectCoverage: true,

  coverageProvider: "v8",

  coverageDirectory: "coverage",

  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
};
