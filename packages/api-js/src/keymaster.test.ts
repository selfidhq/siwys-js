// --- Mock functions for @mdip/gatekeeper/client ---
const mockGkConnect = jest.fn().mockResolvedValue(undefined);
const mockGkAddCustomHeader = jest.fn();
const mockGkRemoveCustomHeader = jest.fn();

// --- Mock functions for @mdip/keymaster ---
const mockKmCreateChallenge = jest.fn().mockResolvedValue("did:test:challenge");
const mockKmBindCredential = jest.fn().mockResolvedValue({ id: "vc-1" });
const mockKmCreateResponse = jest.fn().mockResolvedValue("did:test:response");
const mockKmBackupWallet = jest.fn().mockResolvedValue("backup-did");
const mockKmIssueCredential = jest.fn().mockResolvedValue("issued-did");
const mockKmPublishCredential = jest
  .fn()
  .mockResolvedValue({ type: ["VerifiableCredential"] });
const mockKmAcceptCredential = jest.fn().mockResolvedValue(true);
const mockKmDecryptMnemonic = jest.fn().mockResolvedValue("word1 word2 word3");
const mockKmVerifyResponse = jest.fn().mockResolvedValue({ match: true });
const mockKmDecryptMessage = jest.fn().mockResolvedValue("decrypted");
const mockKmGetCredential = jest.fn().mockResolvedValue({ id: "cred-1" });
const mockKmRemoveCredential = jest.fn().mockResolvedValue(true);
const mockKmUpdateCredential = jest.fn().mockResolvedValue(true);
const mockKmCreateId = jest.fn().mockResolvedValue("did:test:newid");
const mockKmRemoveId = jest.fn().mockResolvedValue(true);
const mockKmResolveDID = jest.fn().mockResolvedValue({ id: "did:test:1" });
const mockKmSetCurrentId = jest.fn().mockResolvedValue(true);
const mockKmCreateSchema = jest.fn().mockResolvedValue("did:test:schema");
const mockKmSetSchema = jest.fn().mockResolvedValue(true);
const mockKmNewWallet = jest.fn().mockResolvedValue({ ids: {} });
const mockKmRecoverWallet = jest.fn().mockResolvedValue({ ids: {} });
const mockKmLoadWallet = jest.fn().mockResolvedValue({
  ids: { "test-id": "did:test:1" },
});

jest.mock("@mdip/gatekeeper/client", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    connect: mockGkConnect,
    addCustomHeader: mockGkAddCustomHeader,
    removeCustomHeader: mockGkRemoveCustomHeader,
  })),
}));

jest.mock("@mdip/cipher/node", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@mdip/keymaster", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    createChallenge: mockKmCreateChallenge,
    bindCredential: mockKmBindCredential,
    createResponse: mockKmCreateResponse,
    backupWallet: mockKmBackupWallet,
    issueCredential: mockKmIssueCredential,
    publishCredential: mockKmPublishCredential,
    acceptCredential: mockKmAcceptCredential,
    decryptMnemonic: mockKmDecryptMnemonic,
    verifyResponse: mockKmVerifyResponse,
    decryptMessage: mockKmDecryptMessage,
    getCredential: mockKmGetCredential,
    removeCredential: mockKmRemoveCredential,
    updateCredential: mockKmUpdateCredential,
    createId: mockKmCreateId,
    removeId: mockKmRemoveId,
    resolveDID: mockKmResolveDID,
    setCurrentId: mockKmSetCurrentId,
    createSchema: mockKmCreateSchema,
    setSchema: mockKmSetSchema,
    newWallet: mockKmNewWallet,
    recoverWallet: mockKmRecoverWallet,
    loadWallet: mockKmLoadWallet,
  })),
}));

import { Keymaster } from "./keymaster.js";

const mockLoadWalletDb = jest.fn().mockResolvedValue(null);
const mockSaveWalletDb = jest.fn().mockResolvedValue(undefined);

const createValidConfig = () => ({
  gatekeeperConfig: { url: "http://localhost:4224" },
  walletConfig: { id: "test-id", registry: "local" as const },
  walletDb: {
    loadWallet: mockLoadWalletDb,
    saveWallet: mockSaveWalletDb,
  } as any,
  passphrase: "test-passphrase",
  didPrefix: "did:test",
});

describe("Keymaster", () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation();
    errorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    (Keymaster as any).instance = null;
    logSpy.mockRestore();
    errorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe("singleton pattern", () => {
    it("should create instance on initialize()", () => {
      Keymaster.initialize(createValidConfig());
      expect(logSpy).toHaveBeenCalledWith("✅ Keymaster initialized");
    });

    it("should warn on re-initialization", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      Keymaster.initialize(createValidConfig());
      Keymaster.initialize(createValidConfig());
      expect(warnSpy).toHaveBeenCalledWith(
        "Keymaster already initialized, ignoring re-initialization.",
      );
      warnSpy.mockRestore();
    });

    it("should throw if not initialized when calling static methods", async () => {
      await expect(Keymaster.start()).rejects.toThrow(
        "Keymaster not initialized. Call Keymaster.initialize() first.",
      );
    });
  });

  describe("validation", () => {
    it("should throw if gatekeeperConfig is missing", () => {
      expect(() =>
        Keymaster.initialize({
          walletConfig: { id: "test", registry: "local" },
          walletDb: {
            loadWallet: mockLoadWalletDb,
            saveWallet: mockSaveWalletDb,
          },
          passphrase: "test",
          didPrefix: "did:test",
        } as any),
      ).toThrow("Missing Gatekeeper config");
    });

    it("should throw if didPrefix is missing", () => {
      expect(() =>
        Keymaster.initialize({
          gatekeeperConfig: { url: "http://localhost:4224" },
          walletConfig: { id: "test", registry: "local" },
          walletDb: {
            loadWallet: mockLoadWalletDb,
            saveWallet: mockSaveWalletDb,
          },
          passphrase: "test",
        } as any),
      ).toThrow("Missing didPrefix config");
    });

    it("should throw if walletConfig is missing", () => {
      expect(() =>
        Keymaster.initialize({
          gatekeeperConfig: { url: "http://localhost:4224" },
          walletDb: {
            loadWallet: mockLoadWalletDb,
            saveWallet: mockSaveWalletDb,
          },
          passphrase: "test",
          didPrefix: "did:test",
        } as any),
      ).toThrow("Missing wallet config");
    });

    it("should throw if walletDb.loadWallet is missing", () => {
      expect(() =>
        Keymaster.initialize({
          gatekeeperConfig: { url: "http://localhost:4224" },
          walletConfig: { id: "test", registry: "local" },
          walletDb: { saveWallet: mockSaveWalletDb } as any,
          passphrase: "test",
          didPrefix: "did:test",
        }),
      ).toThrow("Missing load wallet callback");
    });

    it("should throw if walletDb.saveWallet is missing", () => {
      expect(() =>
        Keymaster.initialize({
          gatekeeperConfig: { url: "http://localhost:4224" },
          walletConfig: { id: "test", registry: "local" },
          walletDb: { loadWallet: mockLoadWalletDb } as any,
          passphrase: "test",
          didPrefix: "did:test",
        }),
      ).toThrow("Missing save wallet callback");
    });
  });

  describe("start()", () => {
    it("should connect, create services, and return true", async () => {
      Keymaster.initialize(createValidConfig());
      const result = await Keymaster.start();
      expect(result).toBe(true);
      expect(mockGkConnect).toHaveBeenCalledWith({
        url: "http://localhost:4224",
        waitUntilReady: undefined,
        intervalSeconds: undefined,
        chatty: undefined,
      });
      expect(logSpy).toHaveBeenCalledWith("✅ Keymaster Started");
    });

    it("should add auth header when token is provided", async () => {
      const config = createValidConfig();
      (config.gatekeeperConfig as any).token = "my-secret-token";
      Keymaster.initialize(config);
      await Keymaster.start();
      expect(mockGkAddCustomHeader).toHaveBeenCalledWith(
        "authorization",
        "Bearer my-secret-token",
      );
    });

    it("should return false if walletDb is undefined", async () => {
      Keymaster.initialize(createValidConfig());
      (Keymaster as any).instance.config.walletDb = undefined;
      const result = await Keymaster.start();
      expect(result).toBe(false);
    });

    it("should return false if connect throws", async () => {
      mockGkConnect.mockRejectedValueOnce(new Error("connection failed"));
      Keymaster.initialize(createValidConfig());
      const result = await Keymaster.start();
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        "Error starting Keymaster service:",
        expect.any(Error),
      );
    });
  });

  describe("ensureWalletExists()", () => {
    it("should create new wallet when no existing wallet", async () => {
      mockLoadWalletDb.mockResolvedValueOnce(null);
      Keymaster.initialize(createValidConfig());
      await Keymaster.start();
      expect(mockKmNewWallet).toHaveBeenCalledWith("", true);
      expect(mockKmCreateId).toHaveBeenCalledWith("test-id", {
        registry: "local",
      });
      expect(logSpy).toHaveBeenCalledWith("Created new ID", "did:test:newid");
    });

    it("should use existing wallet when wallet exists with matching ID", async () => {
      mockLoadWalletDb.mockResolvedValueOnce({ some: "wallet" });
      mockKmLoadWallet.mockResolvedValueOnce({
        ids: { "test-id": "did:test:1" },
      });
      Keymaster.initialize(createValidConfig());
      await Keymaster.start();
      expect(mockKmNewWallet).not.toHaveBeenCalled();
      expect(mockKmCreateId).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        "Using existing wallet with ID",
        "test-id",
      );
    });

    it("should create ID when wallet exists but ID is missing", async () => {
      mockLoadWalletDb.mockResolvedValueOnce({ some: "wallet" });
      mockKmLoadWallet.mockResolvedValueOnce({ ids: {} });
      Keymaster.initialize(createValidConfig());
      await Keymaster.start();
      expect(mockKmNewWallet).not.toHaveBeenCalled();
      expect(mockKmCreateId).toHaveBeenCalledWith("test-id", {
        registry: "local",
      });
      expect(logSpy).toHaveBeenCalledWith(
        "Using existing wallet with ID",
        "test-id",
      );
    });

    it("should use mnemonic from walletConfig when creating new wallet", async () => {
      mockLoadWalletDb.mockResolvedValueOnce(null);
      const config = createValidConfig();
      (config.walletConfig as any).mnemonic = "custom mnemonic phrase";
      Keymaster.initialize(config);
      await Keymaster.start();
      expect(mockKmNewWallet).toHaveBeenCalledWith(
        "custom mnemonic phrase",
        true,
      );
    });
  });

  describe("addCustomHeader() / removeCustomHeader()", () => {
    it("should delegate addCustomHeader to gatekeeper", async () => {
      Keymaster.initialize(createValidConfig());
      await Keymaster.start();
      Keymaster.addCustomHeader("x-custom", "value");
      expect(mockGkAddCustomHeader).toHaveBeenCalledWith("x-custom", "value");
    });

    it("should delegate removeCustomHeader to gatekeeper", async () => {
      Keymaster.initialize(createValidConfig());
      await Keymaster.start();
      Keymaster.removeCustomHeader("x-custom");
      expect(mockGkRemoveCustomHeader).toHaveBeenCalledWith("x-custom");
    });

    it("should throw if gatekeeper is not initialized", () => {
      Keymaster.initialize(createValidConfig());
      expect(() => Keymaster.addCustomHeader("x-custom", "value")).toThrow(
        "GatekeeperClient not initialized",
      );
    });
  });

  describe("auto-start behavior", () => {
    it("should auto-start service if not started when calling a method", async () => {
      Keymaster.initialize(createValidConfig());
      const spec = { callback: "https://example.com/callback" };
      const result = await Keymaster.createChallenge(spec as any);
      expect(mockGkConnect).toHaveBeenCalled();
      expect(result.challenge).toBe("did:test:challenge");
    });
  });

  describe("delegated methods", () => {
    beforeEach(async () => {
      Keymaster.initialize(createValidConfig());
      await Keymaster.start();
    });

    it("createChallenge()", async () => {
      const spec = { callback: "https://example.com/callback" };
      const result = await Keymaster.createChallenge(spec as any);
      expect(mockKmCreateChallenge).toHaveBeenCalledWith(spec, undefined);
      expect(result).toEqual({
        challenge: "did:test:challenge",
        challengeUrl:
          "https://example.com/callback?challenge=did:test:challenge",
      });
    });

    it("bindCredential()", async () => {
      const result = await Keymaster.bindCredential(
        "schema-1",
        "did:subject:1",
      );
      expect(mockKmBindCredential).toHaveBeenCalledWith(
        "schema-1",
        "did:subject:1",
        {},
      );
      expect(result).toEqual({ id: "vc-1" });
    });

    it("bindCredential() with options", async () => {
      const options = {
        validFrom: "2024-01-01",
        validUntil: "2025-01-01",
        credential: { name: "John" },
      };
      await Keymaster.bindCredential("schema-1", "did:subject:1", options);
      expect(mockKmBindCredential).toHaveBeenCalledWith(
        "schema-1",
        "did:subject:1",
        options,
      );
    });

    it("createResponse()", async () => {
      const result = await Keymaster.createResponse("did:challenge:1");
      expect(mockKmCreateResponse).toHaveBeenCalledWith(
        "did:challenge:1",
        undefined,
      );
      expect(result).toBe("did:test:response");
    });

    it("backupWallet()", async () => {
      const result = await Keymaster.backupWallet("local");
      expect(mockKmBackupWallet).toHaveBeenCalledWith("local", undefined);
      expect(result).toBe("backup-did");
    });

    it("issueCredential()", async () => {
      const credential = { type: ["VerifiableCredential"] };
      const result = await Keymaster.issueCredential(credential as any);
      expect(mockKmIssueCredential).toHaveBeenCalledWith(credential, {});
      expect(result).toBe("issued-did");
    });

    it("publishCredential()", async () => {
      const result = await Keymaster.publishCredential("did:cred:1");
      expect(mockKmPublishCredential).toHaveBeenCalledWith("did:cred:1", {});
      expect(result).toEqual({ type: ["VerifiableCredential"] });
    });

    it("acceptCredential()", async () => {
      const result = await Keymaster.acceptCredential("did:cred:1");
      expect(mockKmAcceptCredential).toHaveBeenCalledWith("did:cred:1");
      expect(result).toBe(true);
    });

    it("showMnemonic()", async () => {
      const result = await Keymaster.showMnemonic();
      expect(mockKmDecryptMnemonic).toHaveBeenCalled();
      expect(result).toBe("word1 word2 word3");
    });

    it("verifyResponse()", async () => {
      const result = await Keymaster.verifyResponse("did:challenge:1");
      expect(mockKmVerifyResponse).toHaveBeenCalledWith(
        "did:challenge:1",
        undefined,
      );
      expect(result).toEqual({ match: true });
    });

    it("verifyResponse() with options", async () => {
      const options = { retries: 3, delay: 1000 };
      await Keymaster.verifyResponse("did:challenge:1", options);
      expect(mockKmVerifyResponse).toHaveBeenCalledWith(
        "did:challenge:1",
        options,
      );
    });

    it("decryptMessage()", async () => {
      const result = await Keymaster.decryptMessage("did:msg:1");
      expect(mockKmDecryptMessage).toHaveBeenCalledWith("did:msg:1");
      expect(result).toBe("decrypted");
    });

    it("decryptMnemonic()", async () => {
      const result = await Keymaster.decryptMnemonic();
      expect(mockKmDecryptMnemonic).toHaveBeenCalled();
      expect(result).toBe("word1 word2 word3");
    });

    it("getCredential()", async () => {
      const result = await Keymaster.getCredential("cred-1");
      expect(mockKmGetCredential).toHaveBeenCalledWith("cred-1");
      expect(result).toEqual({ id: "cred-1" });
    });

    it("removeCredential()", async () => {
      const result = await Keymaster.removeCredential("cred-1");
      expect(mockKmRemoveCredential).toHaveBeenCalledWith("cred-1");
      expect(result).toBe(true);
    });

    it("updateCredential()", async () => {
      const credential = { id: "cred-1", type: ["VerifiableCredential"] };
      const result = await Keymaster.updateCredential(
        "did:cred:1",
        credential as any,
      );
      expect(mockKmUpdateCredential).toHaveBeenCalledWith(
        "did:cred:1",
        credential,
      );
      expect(result).toBe(true);
    });

    it("createId()", async () => {
      mockKmCreateId.mockClear();
      const result = await Keymaster.createId("my-id", {
        registry: "local",
      } as any);
      expect(mockKmCreateId).toHaveBeenCalledWith("my-id", {
        registry: "local",
      });
      expect(result).toBe("did:test:newid");
    });

    it("removeId()", async () => {
      const result = await Keymaster.removeId("my-id");
      expect(mockKmRemoveId).toHaveBeenCalledWith("my-id");
      expect(result).toBe(true);
    });

    it("resolveDID()", async () => {
      const result = await Keymaster.resolveDID("did:test:1");
      expect(mockKmResolveDID).toHaveBeenCalledWith("did:test:1", undefined);
      expect(result).toEqual({ id: "did:test:1" });
    });

    it("setCurrentId()", async () => {
      const result = await Keymaster.setCurrentId("my-id");
      expect(mockKmSetCurrentId).toHaveBeenCalledWith("my-id");
      expect(result).toBe(true);
    });

    it("createSchema()", async () => {
      const schema = { type: "object", properties: {} };
      const result = await Keymaster.createSchema(schema);
      expect(mockKmCreateSchema).toHaveBeenCalledWith(schema, undefined);
      expect(result).toBe("did:test:schema");
    });

    it("updateSchema()", async () => {
      const schema = { type: "object", properties: { name: {} } };
      const result = await Keymaster.updateSchema("did:schema:1", schema);
      expect(mockKmSetSchema).toHaveBeenCalledWith("did:schema:1", schema);
      expect(result).toBe(true);
    });

    it("newWallet()", async () => {
      mockKmNewWallet.mockClear();
      const result = await Keymaster.newWallet("mnemonic words", true);
      expect(mockKmNewWallet).toHaveBeenCalledWith("mnemonic words", true);
      expect(result).toEqual({ ids: {} });
    });

    it("recoverWallet()", async () => {
      const result = await Keymaster.recoverWallet("did:backup:1");
      expect(mockKmRecoverWallet).toHaveBeenCalledWith("did:backup:1");
      expect(result).toEqual({ ids: {} });
    });
  });

  describe("defensive guards", () => {
    it("should throw 'Keymaster service not running' when start fails and method is called", async () => {
      Keymaster.initialize(createValidConfig());
      (Keymaster as any).instance.config.walletDb = undefined;
      const spec = { callback: "https://example.com/callback" };
      await expect(Keymaster.createChallenge(spec as any)).rejects.toThrow(
        "Keymaster service not running",
      );
    });

    it("should throw if gatekeeperConfig is removed after initialization", async () => {
      Keymaster.initialize(createValidConfig());
      (Keymaster as any).instance.config.gatekeeperConfig = undefined;
      await expect(Keymaster.start()).rejects.toEqual(
        "Missing Gatekeeper config",
      );
    });

    it("should return false and log error when walletConfig is removed before start", async () => {
      mockLoadWalletDb.mockResolvedValueOnce({ some: "wallet" });
      Keymaster.initialize(createValidConfig());
      (Keymaster as any).instance.config.walletConfig = undefined;
      const result = await Keymaster.start();
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        "Error starting Keymaster service:",
        expect.any(Error),
      );
    });
  });
});
