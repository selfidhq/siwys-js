// Mock dependencies before importing the module
jest.mock("@mdip/keymaster", () => ({
  default: jest.fn(),
}));

jest.mock("@mdip/gatekeeper", () => ({
  GatekeeperClient: jest.fn(),
}));

jest.mock("./cipher-react-native.js", () => ({
  default: jest.fn(),
}));

import * as MainExports from "./index.js";

describe("index (barrel exports)", () => {
  it("should export KeymasterReactNative", () => {
    expect(MainExports.KeymasterReactNative).toBeDefined();
    expect(typeof MainExports.KeymasterReactNative).toBe("function");
  });

  it("should export GatekeeperReactNative", () => {
    expect(MainExports.GatekeeperReactNative).toBeDefined();
    expect(typeof MainExports.GatekeeperReactNative).toBe("function");
  });

  it("should export CipherReactNative", () => {
    expect(MainExports.CipherReactNative).toBeDefined();
  });

  it("should export type definitions", () => {
    // Type exports can't be tested at runtime, but we can verify they're present in TypeScript
    // by checking the module structure
    const exports = Object.keys(MainExports);

    // Main classes
    expect(exports).toContain("KeymasterReactNative");
    expect(exports).toContain("GatekeeperReactNative");

    // GatekeeperTypes namespace
    expect(exports).toContain("GatekeeperTypes");
    expect(MainExports.GatekeeperTypes).toBeDefined();
  });
});
