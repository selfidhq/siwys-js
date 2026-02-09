const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockGetDIDs = jest.fn().mockResolvedValue(["did:test:1"]);
const mockAddCustomHeader = jest.fn();
const mockRemoveCustomHeader = jest.fn();
const mockGenerateDID = jest.fn().mockResolvedValue("did:test:generated");

jest.mock("@mdip/gatekeeper", () => ({
  GatekeeperClient: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    getDIDs: mockGetDIDs,
    addCustomHeader: mockAddCustomHeader,
    removeCustomHeader: mockRemoveCustomHeader,
    generateDID: mockGenerateDID,
  })),
}));

import { GatekeeperReactNative } from "./gatekeeper-react-native.js";

const validConfig = { url: "http://localhost:4224" };

describe("GatekeeperReactNative", () => {
  afterEach(() => {
    (GatekeeperReactNative as any).instance = null;
    jest.clearAllMocks();
  });

  describe("singleton pattern", () => {
    it("should create instance on initialize()", () => {
      GatekeeperReactNative.initialize(validConfig);
      expect(() => GatekeeperReactNative.start()).not.toThrow();
    });

    it("should warn on re-initialization", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      GatekeeperReactNative.initialize(validConfig);
      GatekeeperReactNative.initialize(validConfig);
      expect(warnSpy).toHaveBeenCalledWith(
        "GatekeeperReactNative already initialized, ignoring re-initialization.",
      );
      warnSpy.mockRestore();
    });

    it("should throw if not initialized when calling static methods", async () => {
      await expect(GatekeeperReactNative.start()).rejects.toThrow(
        "GatekeeperReactNative not initialized. Call GatekeeperReactNative.initialize() first.",
      );
    });
  });

  describe("validation", () => {
    it("should throw if config is null", () => {
      expect(() => GatekeeperReactNative.initialize(null as any)).toThrow(
        "Missing Gatekeeper config",
      );
    });
  });

  describe("start()", () => {
    it("should connect and return true on success", async () => {
      GatekeeperReactNative.initialize(validConfig);
      const result = await GatekeeperReactNative.start();
      expect(result).toBe(true);
      expect(mockConnect).toHaveBeenCalledWith({
        url: "http://localhost:4224",
        waitUntilReady: undefined,
        intervalSeconds: undefined,
        chatty: undefined,
      });
    });

    it("should return false if connect throws", async () => {
      mockConnect.mockRejectedValueOnce(new Error("connection failed"));
      GatekeeperReactNative.initialize(validConfig);
      const result = await GatekeeperReactNative.start();
      expect(result).toBe(false);
    });
  });

  describe("getDIDs()", () => {
    it("should delegate to gatekeeperClient.getDIDs()", async () => {
      GatekeeperReactNative.initialize(validConfig);
      await GatekeeperReactNative.start();

      const opts = { dids: ["did:test:1"], resolve: false };
      const result = await GatekeeperReactNative.getDIDs(opts as any);
      expect(mockGetDIDs).toHaveBeenCalledWith({
        dids: ["did:test:1"],
        resolve: false,
      });
      expect(result).toEqual(["did:test:1"]);
    });
  });

  describe("addCustomHeader() / removeCustomHeader()", () => {
    it("should delegate addCustomHeader to internal client", async () => {
      GatekeeperReactNative.initialize(validConfig);
      await GatekeeperReactNative.start();
      await GatekeeperReactNative.addCustomHeader({
        header: "authorization",
        value: "Bearer token",
      });
      expect(mockAddCustomHeader).toHaveBeenCalledWith(
        "authorization",
        "Bearer token",
      );
    });

    it("should delegate removeCustomHeader to internal client", async () => {
      GatekeeperReactNative.initialize(validConfig);
      await GatekeeperReactNative.start();
      await GatekeeperReactNative.removeCustomHeader({
        header: "authorization",
      });
      expect(mockRemoveCustomHeader).toHaveBeenCalledWith("authorization");
    });
  });

  describe("generateDID()", () => {
    it("should delegate to gatekeeperClient.generateDID()", async () => {
      GatekeeperReactNative.initialize(validConfig);
      await GatekeeperReactNative.start();

      const op = { type: "generate" } as any;
      const result = await GatekeeperReactNative.generateDID(op);
      expect(mockGenerateDID).toHaveBeenCalledWith(op);
      expect(result).toBe("did:test:generated");
    });
  });

  describe("defensive guards", () => {
    it("should throw if config is removed after initialization", async () => {
      GatekeeperReactNative.initialize(validConfig);
      (GatekeeperReactNative as any).instance.config = null;
      await expect(GatekeeperReactNative.start()).rejects.toEqual(
        "Missing Gatekeeper config",
      );
    });
  });
});
