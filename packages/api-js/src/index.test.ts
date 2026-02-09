jest.mock("@mdip/gatekeeper/client", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("@mdip/cipher/node", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("@mdip/keymaster", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("@mdip/keymaster/client", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("@mdip/gatekeeper", () => ({
  GatekeeperClient: jest.fn(),
}));

import * as apiJs from "./index.js";

describe("barrel exports", () => {
  it("should export Keymaster", () => {
    expect(apiJs.Keymaster).toBeDefined();
  });

  it("should export KeymasterExternalClient", () => {
    expect(apiJs.KeymasterExternalClient).toBeDefined();
  });

  it("should export GatekeeperClient", () => {
    expect(apiJs.GatekeeperClient).toBeDefined();
  });
});
