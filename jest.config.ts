// jest.config.ts
import type { JestConfigWithTsJest } from "ts-jest";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// https://kulshekhar.github.io/ts-jest/docs/guides/esm-support

const jestConfig: JestConfigWithTsJest = {
  // [...]
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testPathIgnorePatterns: ["/reference/"],
  verbose: true,
};

export default jestConfig;
