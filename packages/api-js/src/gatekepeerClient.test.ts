const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockAddCustomHeader = jest.fn();
const mockRemoveCustomHeader = jest.fn();
const mockListRegistries = jest.fn().mockResolvedValue(["local", "hyperswarm"]);
const mockResetDb = jest.fn().mockResolvedValue(true);
const mockVerifyDb = jest.fn().mockResolvedValue({ valid: true });
const mockIsReady = jest.fn().mockResolvedValue(true);
const mockGetVersion = jest.fn().mockResolvedValue(1);
const mockGetStatus = jest.fn().mockResolvedValue({ status: "ok" });
const mockCreateDID = jest.fn().mockResolvedValue("did:test:created");
const mockGenerateDID = jest.fn().mockResolvedValue("did:test:generated");
const mockResolveDID = jest.fn().mockResolvedValue({ id: "did:test:1" });
const mockUpdateDID = jest.fn().mockResolvedValue(true);
const mockDeleteDID = jest.fn().mockResolvedValue(true);
const mockGetDIDs = jest.fn().mockResolvedValue(["did:test:1"]);
const mockExportDIDs = jest.fn().mockResolvedValue([[]]);
const mockImportDIDs = jest.fn().mockResolvedValue({ count: 1 });
const mockExportBatch = jest.fn().mockResolvedValue([]);
const mockImportBatch = jest.fn().mockResolvedValue({ count: 1 });
const mockRemoveDIDs = jest.fn().mockResolvedValue(true);
const mockGetQueue = jest.fn().mockResolvedValue([]);
const mockClearQueue = jest.fn().mockResolvedValue(true);
const mockProcessEvents = jest.fn().mockResolvedValue({ processed: 0 });
const mockAddJSON = jest.fn().mockResolvedValue("cid-json");
const mockGetJSON = jest.fn().mockResolvedValue({ data: "test" });
const mockAddText = jest.fn().mockResolvedValue("cid-text");
const mockGetText = jest.fn().mockResolvedValue("hello");
const mockAddData = jest.fn().mockResolvedValue("cid-data");
const mockGetData = jest.fn().mockResolvedValue(Buffer.from("data"));
const mockGetBlock = jest.fn().mockResolvedValue({ id: "block-1" });
const mockAddBlock = jest.fn().mockResolvedValue(true);

jest.mock("@mdip/gatekeeper", () => ({
  GatekeeperClient: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    addCustomHeader: mockAddCustomHeader,
    removeCustomHeader: mockRemoveCustomHeader,
    listRegistries: mockListRegistries,
    resetDb: mockResetDb,
    verifyDb: mockVerifyDb,
    isReady: mockIsReady,
    getVersion: mockGetVersion,
    getStatus: mockGetStatus,
    createDID: mockCreateDID,
    generateDID: mockGenerateDID,
    resolveDID: mockResolveDID,
    updateDID: mockUpdateDID,
    deleteDID: mockDeleteDID,
    getDIDs: mockGetDIDs,
    exportDIDs: mockExportDIDs,
    importDIDs: mockImportDIDs,
    exportBatch: mockExportBatch,
    importBatch: mockImportBatch,
    removeDIDs: mockRemoveDIDs,
    getQueue: mockGetQueue,
    clearQueue: mockClearQueue,
    processEvents: mockProcessEvents,
    addJSON: mockAddJSON,
    getJSON: mockGetJSON,
    addText: mockAddText,
    getText: mockGetText,
    addData: mockAddData,
    getData: mockGetData,
    getBlock: mockGetBlock,
    addBlock: mockAddBlock,
  })),
}));

import { GatekeeperClient } from "./gatekepeerClient.js";

const validConfig = { url: "http://localhost:4224" };

describe("GatekeeperClient", () => {
  afterEach(() => {
    (GatekeeperClient as any).instance = null;
    jest.clearAllMocks();
  });

  describe("singleton pattern", () => {
    it("should create instance on initialize()", () => {
      GatekeeperClient.initialize(validConfig);
      expect(() => GatekeeperClient.start()).not.toThrow();
    });

    it("should warn on re-initialization", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      GatekeeperClient.initialize(validConfig);
      GatekeeperClient.initialize(validConfig);
      expect(warnSpy).toHaveBeenCalledWith(
        "GatekeeperClient already initialized, ignoring re-initialization.",
      );
      warnSpy.mockRestore();
    });

    it("should throw if not initialized when calling static methods", async () => {
      await expect(GatekeeperClient.start()).rejects.toThrow(
        "GatekeeperClient not initialized. Call GatekeeperClient.initialize() first.",
      );
    });
  });

  describe("validation", () => {
    it("should throw if config is null", () => {
      expect(() => GatekeeperClient.initialize(null as any)).toThrow(
        "Missing Gatekeeper config",
      );
    });
  });

  describe("start()", () => {
    it("should connect and return true on success", async () => {
      GatekeeperClient.initialize(validConfig);
      const result = await GatekeeperClient.start();
      expect(result).toBe(true);
      expect(mockConnect).toHaveBeenCalledWith({
        url: "http://localhost:4224",
      });
    });

    it("should return false if connect throws", async () => {
      mockConnect.mockRejectedValueOnce(new Error("connection failed"));
      GatekeeperClient.initialize(validConfig);
      const result = await GatekeeperClient.start();
      expect(result).toBe(false);
    });
  });

  describe("addCustomHeader() / removeCustomHeader()", () => {
    it("should delegate addCustomHeader to internal client", async () => {
      GatekeeperClient.initialize(validConfig);
      await GatekeeperClient.start();
      GatekeeperClient.addCustomHeader("authorization", "Bearer token");
      expect(mockAddCustomHeader).toHaveBeenCalledWith(
        "authorization",
        "Bearer token",
      );
    });

    it("should delegate removeCustomHeader to internal client", async () => {
      GatekeeperClient.initialize(validConfig);
      await GatekeeperClient.start();
      GatekeeperClient.removeCustomHeader("authorization");
      expect(mockRemoveCustomHeader).toHaveBeenCalledWith("authorization");
    });
  });

  describe("delegated methods", () => {
    beforeEach(async () => {
      GatekeeperClient.initialize(validConfig);
      await GatekeeperClient.start();
    });

    it("listRegistries()", async () => {
      const result = await GatekeeperClient.listRegistries();
      expect(mockListRegistries).toHaveBeenCalled();
      expect(result).toEqual(["local", "hyperswarm"]);
    });

    it("resetDb()", async () => {
      const result = await GatekeeperClient.resetDb();
      expect(mockResetDb).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("verifyDb()", async () => {
      const result = await GatekeeperClient.verifyDb();
      expect(mockVerifyDb).toHaveBeenCalled();
      expect(result).toEqual({ valid: true });
    });

    it("isReady()", async () => {
      const result = await GatekeeperClient.isReady();
      expect(mockIsReady).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("getVersion()", async () => {
      const result = await GatekeeperClient.getVersion();
      expect(mockGetVersion).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it("getStatus()", async () => {
      const result = await GatekeeperClient.getStatus();
      expect(mockGetStatus).toHaveBeenCalled();
      expect(result).toEqual({ status: "ok" });
    });

    it("createDID()", async () => {
      const op = { type: "create" } as any;
      const result = await GatekeeperClient.createDID(op);
      expect(mockCreateDID).toHaveBeenCalledWith(op);
      expect(result).toBe("did:test:created");
    });

    it("generateDID()", async () => {
      const op = { type: "generate" } as any;
      const result = await GatekeeperClient.generateDID(op);
      expect(mockGenerateDID).toHaveBeenCalledWith(op);
      expect(result).toBe("did:test:generated");
    });

    it("resolveDID()", async () => {
      const result = await GatekeeperClient.resolveDID("did:test:1");
      expect(mockResolveDID).toHaveBeenCalledWith("did:test:1", undefined);
      expect(result).toEqual({ id: "did:test:1" });
    });

    it("updateDID()", async () => {
      const op = { type: "update" } as any;
      const result = await GatekeeperClient.updateDID(op);
      expect(mockUpdateDID).toHaveBeenCalledWith(op);
      expect(result).toBe(true);
    });

    it("deleteDID()", async () => {
      const op = { type: "delete" } as any;
      const result = await GatekeeperClient.deleteDID(op);
      expect(mockDeleteDID).toHaveBeenCalledWith(op);
      expect(result).toBe(true);
    });

    it("getDIDs()", async () => {
      const opts = { dids: ["did:test:1"], resolve: false } as any;
      const result = await GatekeeperClient.getDIDs(opts);
      expect(mockGetDIDs).toHaveBeenCalledWith(opts);
      expect(result).toEqual(["did:test:1"]);
    });

    it("exportDIDs()", async () => {
      const result = await GatekeeperClient.exportDIDs(["did:test:1"]);
      expect(mockExportDIDs).toHaveBeenCalledWith(["did:test:1"]);
      expect(result).toEqual([[]]);
    });

    it("importDIDs()", async () => {
      const dids = [[{ type: "event" }]] as any;
      const result = await GatekeeperClient.importDIDs(dids);
      expect(mockImportDIDs).toHaveBeenCalledWith(dids);
      expect(result).toEqual({ count: 1 });
    });

    it("exportBatch()", async () => {
      const result = await GatekeeperClient.exportBatch();
      expect(mockExportBatch).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([]);
    });

    it("importBatch()", async () => {
      const batch = [{ type: "event" }] as any;
      const result = await GatekeeperClient.importBatch(batch);
      expect(mockImportBatch).toHaveBeenCalledWith(batch);
      expect(result).toEqual({ count: 1 });
    });

    it("removeDIDs()", async () => {
      const result = await GatekeeperClient.removeDIDs(["did:test:1"]);
      expect(mockRemoveDIDs).toHaveBeenCalledWith(["did:test:1"]);
      expect(result).toBe(true);
    });

    it("getQueue()", async () => {
      const result = await GatekeeperClient.getQueue("local");
      expect(mockGetQueue).toHaveBeenCalledWith("local");
      expect(result).toEqual([]);
    });

    it("clearQueue()", async () => {
      const events = [{ type: "op" }] as any;
      const result = await GatekeeperClient.clearQueue("local", events);
      expect(mockClearQueue).toHaveBeenCalledWith("local", events);
      expect(result).toBe(true);
    });

    it("processEvents()", async () => {
      const result = await GatekeeperClient.processEvents();
      expect(mockProcessEvents).toHaveBeenCalled();
      expect(result).toEqual({ processed: 0 });
    });

    it("addJSON() / getJSON()", async () => {
      const data = { key: "value" };
      const addResult = await GatekeeperClient.addJSON(data);
      expect(mockAddJSON).toHaveBeenCalledWith(data);
      expect(addResult).toBe("cid-json");

      const getResult = await GatekeeperClient.getJSON("cid-json");
      expect(mockGetJSON).toHaveBeenCalledWith("cid-json");
      expect(getResult).toEqual({ data: "test" });
    });

    it("addText() / getText()", async () => {
      const addResult = await GatekeeperClient.addText("hello world");
      expect(mockAddText).toHaveBeenCalledWith("hello world");
      expect(addResult).toBe("cid-text");

      const getResult = await GatekeeperClient.getText("cid-text");
      expect(mockGetText).toHaveBeenCalledWith("cid-text");
      expect(getResult).toBe("hello");
    });

    it("addData() / getData()", async () => {
      const buf = Buffer.from("binary");
      const addResult = await GatekeeperClient.addData(buf);
      expect(mockAddData).toHaveBeenCalledWith(buf);
      expect(addResult).toBe("cid-data");

      const getResult = await GatekeeperClient.getData("cid-data");
      expect(mockGetData).toHaveBeenCalledWith("cid-data");
      expect(getResult).toEqual(Buffer.from("data"));
    });

    it("getBlock()", async () => {
      const result = await GatekeeperClient.getBlock("cid-block");
      expect(mockGetBlock).toHaveBeenCalledWith("cid-block", undefined);
      expect(result).toEqual({ id: "block-1" });
    });

    it("addBlock()", async () => {
      const block = { id: "block-new" } as any;
      const result = await GatekeeperClient.addBlock("local", block);
      expect(mockAddBlock).toHaveBeenCalledWith("local", block);
      expect(result).toBe(true);
    });
  });

  describe("defensive guards", () => {
    it("should throw if config is removed after initialization", async () => {
      GatekeeperClient.initialize(validConfig);
      (GatekeeperClient as any).instance.config = null;
      await expect(GatekeeperClient.start()).rejects.toEqual(
        "Missing Gatekeeper config",
      );
    });
  });
});
