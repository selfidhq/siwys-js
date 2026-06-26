// Mock setup - must be before imports
const mockKeymasterInstance = {
  createChallenge: jest.fn().mockResolvedValue("challenge-did"),
  bindCredential: jest.fn().mockResolvedValue({ credential: "bound" }),
  createResponse: jest.fn().mockResolvedValue("response-did"),
  backupWallet: jest.fn().mockResolvedValue("backup-url"),
  issueCredential: jest.fn().mockResolvedValue("credential-did"),
  publishCredential: jest.fn().mockResolvedValue({ published: true }),
  acceptCredential: jest.fn().mockResolvedValue(true),
  decryptMnemonic: jest.fn().mockResolvedValue("test mnemonic words"),
  verifyResponse: jest.fn().mockResolvedValue({ verified: true }),
  decryptMessage: jest.fn().mockResolvedValue("decrypted message"),
  getCredential: jest.fn().mockResolvedValue({ id: "cred-1" }),
  removeCredential: jest.fn().mockResolvedValue(true),
  updateCredential: jest.fn().mockResolvedValue(true),
  createId: jest.fn().mockResolvedValue("did:test:123"),
  createIdOperation: jest.fn().mockResolvedValue({ type: "create" }),
  removeId: jest.fn().mockResolvedValue(true),
  resolveDID: jest.fn().mockResolvedValue({ did: "did:test:123" }),
  setCurrentId: jest.fn().mockResolvedValue(true),
  createSchema: jest.fn().mockResolvedValue("schema-did"),
  loadWallet: jest.fn().mockResolvedValue({ wallet: "data" }),
  saveWallet: jest.fn().mockResolvedValue(true),
  newWallet: jest.fn().mockResolvedValue({ wallet: "new" }),
  recoverWallet: jest.fn().mockResolvedValue({ wallet: "recovered" }),
  resolveSeedBank: jest
    .fn()
    .mockResolvedValue({ didDocumentData: { wallet: "did:test:backup" } }),
  hdKeyPair: jest
    .fn()
    .mockResolvedValue({ publicJwk: { pub: true }, privateJwk: { priv: true } }),
  resolveAsset: jest.fn().mockResolvedValue({ backup: "encrypted-backup-blob" }),
};

const mockGatekeeperConnect = jest.fn().mockResolvedValue(undefined);
const mockGatekeeperAddCustomHeader = jest.fn();
const mockGatekeeperRemoveCustomHeader = jest.fn();

jest.mock("@mdip/keymaster", () => {
  const mockConstructor = jest
    .fn()
    .mockImplementation(() => mockKeymasterInstance);
  return mockConstructor;
});

jest.mock("@mdip/gatekeeper", () => ({
  GatekeeperClient: jest.fn().mockImplementation(() => ({
    connect: mockGatekeeperConnect,
    addCustomHeader: mockGatekeeperAddCustomHeader,
    removeCustomHeader: mockGatekeeperRemoveCustomHeader,
  })),
}));

jest.mock("./cipher-react-native.js", () => ({
  default: jest.fn(),
}));

const mockEncMnemonic = jest
  .fn()
  .mockResolvedValue({ salt: "s", iv: "i", data: "d" });

jest.mock("@mdip/keymaster/encryption", () => ({
  encMnemonic: (...args: unknown[]) => mockEncMnemonic(...args),
}));

import {
  KeymasterReactNative,
  KeymasterConfig,
} from "./keymaster-react-native.js";

describe("KeymasterReactNative", () => {
  const mockWalletDb = {
    loadWallet: jest.fn(),
    saveWallet: jest.fn(),
  };

  const mockCipher = {
    decryptMessage: jest.fn(() =>
      JSON.stringify({
        version: 1,
        seed: { mnemonicEnc: { salt: "corrupt", iv: "corrupt", data: "corrupt" } },
        enc: "encrypted-ids",
      }),
    ),
  };

  const validConfig: KeymasterConfig = {
    gatekeeperConfig: {
      url: "http://localhost:4224",
      waitUntilReady: true,
      intervalSeconds: 5,
      chatty: false,
    },
    walletDb: mockWalletDb as any,
    cipher: mockCipher as any,
    passphrase: "test-passphrase",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton
    (KeymasterReactNative as any).instance = null;
  });

  describe("Singleton pattern", () => {
    it("should create instance on first initialize()", () => {
      KeymasterReactNative.initialize(validConfig);
      expect((KeymasterReactNative as any).instance).not.toBeNull();
    });

    it("should warn and ignore re-initialization", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      KeymasterReactNative.initialize(validConfig);
      KeymasterReactNative.initialize(validConfig);

      expect(warnSpy).toHaveBeenCalledWith(
        "KeymasterReactNative already initialized, ignoring re-initialization.",
      );

      warnSpy.mockRestore();
    });

    it("should allow re-initialization after resetInstance()", () => {
      const logSpy = jest.spyOn(console, "log").mockImplementation();

      KeymasterReactNative.initialize(validConfig);
      expect((KeymasterReactNative as any).instance).not.toBeNull();

      KeymasterReactNative.resetInstance();
      expect((KeymasterReactNative as any).instance).toBeNull();
      expect(logSpy).toHaveBeenCalledWith(
        "✅ KeymasterReactNative instance reset",
      );

      KeymasterReactNative.initialize(validConfig);
      expect((KeymasterReactNative as any).instance).not.toBeNull();

      logSpy.mockRestore();
    });

    it("should throw error when calling static method without initialization", async () => {
      await expect(KeymasterReactNative.start()).rejects.toThrow(
        "KeymasterReactNative not initialized. Call KeymasterReactNative.initialize() first.",
      );
    });
  });

  describe("Validation", () => {
    it("should throw when gatekeeperConfig is missing", () => {
      const invalidConfig = {
        ...validConfig,
        gatekeeperConfig: undefined,
      } as any;

      expect(() => {
        KeymasterReactNative.initialize(invalidConfig);
      }).toThrow("Missing Gatekeeper config");
    });

    it("should throw when walletDb.loadWallet is missing", () => {
      const invalidConfig = {
        ...validConfig,
        walletDb: { saveWallet: jest.fn() },
      } as any;

      expect(() => {
        KeymasterReactNative.initialize(invalidConfig);
      }).toThrow("Missing load wallet callback");
    });

    it("should throw when walletDb.saveWallet is missing", () => {
      const invalidConfig = {
        ...validConfig,
        walletDb: { loadWallet: jest.fn() },
      } as any;

      expect(() => {
        KeymasterReactNative.initialize(invalidConfig);
      }).toThrow("Missing save wallet callback");
    });

    it("should throw when passphrase is missing", () => {
      const invalidConfig = {
        ...validConfig,
        passphrase: undefined,
      } as any;

      expect(() => {
        KeymasterReactNative.initialize(invalidConfig);
      }).toThrow("Missing passphrase");
    });
  });

  describe("start()", () => {
    it("should connect gatekeeper and create Keymaster, returning true", async () => {
      KeymasterReactNative.initialize(validConfig);
      const result = await KeymasterReactNative.start();

      expect(result).toBe(true);
      expect(mockGatekeeperConnect).toHaveBeenCalledWith({
        url: validConfig.gatekeeperConfig?.url,
        waitUntilReady: validConfig.gatekeeperConfig?.waitUntilReady,
        intervalSeconds: validConfig.gatekeeperConfig?.intervalSeconds,
        chatty: validConfig.gatekeeperConfig?.chatty,
      });
    });

    it("should return false when connect fails", async () => {
      const errorSpy = jest.spyOn(console, "error").mockImplementation();
      mockGatekeeperConnect.mockRejectedValueOnce(
        new Error("Connection failed"),
      );

      KeymasterReactNative.initialize(validConfig);
      const result = await KeymasterReactNative.start();

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        "Error starting KeymasterReactNative service:",
        expect.any(Error),
      );

      errorSpy.mockRestore();
    });

    it("should return false when walletDb is missing", async () => {
      const configWithoutWallet = {
        ...validConfig,
        walletDb: undefined,
        cipher: undefined,
      } as any;

      // Bypass validation by setting config after initialization
      KeymasterReactNative.initialize(validConfig);
      const instance = (KeymasterReactNative as any).instance;
      instance.config = configWithoutWallet;

      const result = await KeymasterReactNative.start();
      expect(result).toBe(false);
    });

    it("should add authorization header when token is provided", async () => {
      const configWithToken = {
        ...validConfig,
        gatekeeperConfig: {
          ...validConfig.gatekeeperConfig!,
          token: "test-token",
        },
      };

      KeymasterReactNative.initialize(configWithToken);
      await KeymasterReactNative.start();

      expect(mockGatekeeperAddCustomHeader).toHaveBeenCalledWith(
        "authorization",
        "Bearer test-token",
      );
    });
  });

  describe("createChallenge()", () => {
    it("should create challenge and return challenge with URL", async () => {
      const spec = {
        credentials: [{ schema: "email-schema", issuers: ["did:issuer:1"] }],
        callback: "https://example.com/callback",
      };

      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.createChallenge(spec);

      expect(mockKeymasterInstance.createChallenge).toHaveBeenCalledWith(
        spec,
        undefined,
      );
      expect(result).toEqual({
        challenge: "challenge-did",
        challengeUrl: "https://example.com/callback?challenge=challenge-did",
      });
    });

    it("should pass options to createChallenge", async () => {
      const spec = {
        credentials: [{ schema: "email-schema", issuers: ["did:issuer:1"] }],
        callback: "https://example.com",
      };
      const options = { registry: "custom-registry" };

      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      await KeymasterReactNative.createChallenge(spec, options as any);

      expect(mockKeymasterInstance.createChallenge).toHaveBeenCalledWith(
        spec,
        options,
      );
    });
  });

  describe("bindCredential()", () => {
    it("should bind credential with schema and subject", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.bindCredential(
        "schema-id",
        "subject-did",
      );

      expect(mockKeymasterInstance.bindCredential).toHaveBeenCalledWith(
        "schema-id",
        "subject-did",
        undefined,
      );
      expect(result).toEqual({ credential: "bound" });
    });

    it("should pass options to bindCredential", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const options = {
        validFrom: "2024-01-01",
        validUntil: "2025-01-01",
        credential: { email: "test@example.com" },
      };

      await KeymasterReactNative.bindCredential(
        "schema-id",
        "subject-did",
        options,
      );

      expect(mockKeymasterInstance.bindCredential).toHaveBeenCalledWith(
        "schema-id",
        "subject-did",
        options,
      );
    });
  });

  describe("createResponse()", () => {
    it("should create response for challenge", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.createResponse("challenge-did");

      expect(mockKeymasterInstance.createResponse).toHaveBeenCalledWith(
        "challenge-did",
        undefined,
      );
      expect(result).toBe("response-did");
    });

    it("should pass options to createResponse", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const options = { reveal: true };

      await KeymasterReactNative.createResponse(
        "challenge-did",
        options as any,
      );

      expect(mockKeymasterInstance.createResponse).toHaveBeenCalledWith(
        "challenge-did",
        options,
      );
    });
  });

  describe("backupWallet()", () => {
    it("should backup wallet without parameters", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.backupWallet();

      expect(mockKeymasterInstance.backupWallet).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toBe("backup-url");
    });

    it("should backup wallet with registry and wallet", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const wallet = { ids: {} } as any;
      const result = await KeymasterReactNative.backupWallet(
        "custom-registry",
        wallet,
      );

      expect(mockKeymasterInstance.backupWallet).toHaveBeenCalledWith(
        "custom-registry",
        wallet,
      );
      expect(result).toBe("backup-url");
    });
  });

  describe("issueCredential()", () => {
    it("should issue credential", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const credential = {
        credentialSubject: {
          id: "did:test:subject",
          email: "test@example.com",
        },
      };
      const result = await KeymasterReactNative.issueCredential(credential);

      expect(mockKeymasterInstance.issueCredential).toHaveBeenCalledWith(
        credential,
        undefined,
      );
      expect(result).toBe("credential-did");
    });

    it("should pass options to issueCredential", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const credential = { credentialSubject: { id: "did:test:subject" } };
      const options = { registry: "custom" };

      await KeymasterReactNative.issueCredential(credential, options as any);

      expect(mockKeymasterInstance.issueCredential).toHaveBeenCalledWith(
        credential,
        options,
      );
    });
  });

  describe("publishCredential()", () => {
    it("should publish credential", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.publishCredential("cred-did");

      expect(mockKeymasterInstance.publishCredential).toHaveBeenCalledWith(
        "cred-did",
        undefined,
      );
      expect(result).toEqual({ published: true });
    });

    it("should pass options to publishCredential", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const options = { reveal: true };

      await KeymasterReactNative.publishCredential("cred-did", options);

      expect(mockKeymasterInstance.publishCredential).toHaveBeenCalledWith(
        "cred-did",
        options,
      );
    });
  });

  describe("acceptCredential()", () => {
    it("should accept credential", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.acceptCredential("cred-did");

      expect(mockKeymasterInstance.acceptCredential).toHaveBeenCalledWith(
        "cred-did",
      );
      expect(result).toBe(true);
    });
  });

  describe("showMnemonic()", () => {
    it("should delegate to decryptMnemonic", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.showMnemonic();

      expect(mockKeymasterInstance.decryptMnemonic).toHaveBeenCalled();
      expect(result).toBe("test mnemonic words");
    });
  });

  describe("verifyResponse()", () => {
    it("should verify response", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.verifyResponse("response-did");

      expect(mockKeymasterInstance.verifyResponse).toHaveBeenCalledWith(
        "response-did",
        undefined,
      );
      expect(result).toEqual({ verified: true });
    });

    it("should pass options to verifyResponse", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const options = { retries: 3, delay: 1000 };

      await KeymasterReactNative.verifyResponse("response-did", options);

      expect(mockKeymasterInstance.verifyResponse).toHaveBeenCalledWith(
        "response-did",
        options,
      );
    });
  });

  describe("decryptMessage()", () => {
    it("should decrypt message", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.decryptMessage("message-did");

      expect(mockKeymasterInstance.decryptMessage).toHaveBeenCalledWith(
        "message-did",
      );
      expect(result).toBe("decrypted message");
    });
  });

  describe("decryptMnemonic()", () => {
    it("should decrypt mnemonic", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.decryptMnemonic();

      expect(mockKeymasterInstance.decryptMnemonic).toHaveBeenCalled();
      expect(result).toBe("test mnemonic words");
    });
  });

  describe("getCredential()", () => {
    it("should get credential by id", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.getCredential("cred-1");

      expect(mockKeymasterInstance.getCredential).toHaveBeenCalledWith(
        "cred-1",
      );
      expect(result).toEqual({ id: "cred-1" });
    });
  });

  describe("removeCredential()", () => {
    it("should remove credential", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.removeCredential("cred-1");

      expect(mockKeymasterInstance.removeCredential).toHaveBeenCalledWith(
        "cred-1",
      );
      expect(result).toBe(true);
    });
  });

  describe("updateCredential()", () => {
    it("should update credential", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const credential = { id: "cred-1" } as any;
      const result = await KeymasterReactNative.updateCredential(
        "did:test:123",
        credential,
      );

      expect(mockKeymasterInstance.updateCredential).toHaveBeenCalledWith(
        "did:test:123",
        credential,
      );
      expect(result).toBe(true);
    });
  });

  describe("createId()", () => {
    it("should create id without options", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.createId("test-id");

      expect(mockKeymasterInstance.createId).toHaveBeenCalledWith(
        "test-id",
        undefined,
      );
      expect(result).toBe("did:test:123");
    });

    it("should create id with options", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const options = { registry: "custom-registry" };
      await KeymasterReactNative.createId("test-id", options);

      expect(mockKeymasterInstance.createId).toHaveBeenCalledWith(
        "test-id",
        options,
      );
    });
  });

  describe("createIdOperation()", () => {
    it("should create id operation without options", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.createIdOperation("test-id", 0);

      expect(mockKeymasterInstance.createIdOperation).toHaveBeenCalledWith(
        "test-id",
        0,
        undefined,
      );
      expect(result).toEqual({ type: "create" });
    });

    it("should create id operation with options", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const options = { registry: "custom-registry" };
      await KeymasterReactNative.createIdOperation("test-id", 0, options);

      expect(mockKeymasterInstance.createIdOperation).toHaveBeenCalledWith(
        "test-id",
        0,
        options,
      );
    });
  });

  describe("removeId()", () => {
    it("should remove id", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.removeId("test-id");

      expect(mockKeymasterInstance.removeId).toHaveBeenCalledWith("test-id");
      expect(result).toBe(true);
    });
  });

  describe("resolveDID()", () => {
    it("should resolve DID without options", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.resolveDID("did:test:123");

      expect(mockKeymasterInstance.resolveDID).toHaveBeenCalledWith(
        "did:test:123",
        undefined,
      );
      expect(result).toEqual({ did: "did:test:123" });
    });

    it("should resolve DID with options", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const options = { verify: true };
      await KeymasterReactNative.resolveDID("did:test:123", options as any);

      expect(mockKeymasterInstance.resolveDID).toHaveBeenCalledWith(
        "did:test:123",
        options,
      );
    });
  });

  describe("setCurrentId()", () => {
    it("should set current id", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.setCurrentId("test-id");

      expect(mockKeymasterInstance.setCurrentId).toHaveBeenCalledWith(
        "test-id",
      );
      expect(result).toBe(true);
    });
  });

  describe("createSchema()", () => {
    it("should create schema without options", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const schema = { type: "test-schema" };
      const result = await KeymasterReactNative.createSchema(schema);

      expect(mockKeymasterInstance.createSchema).toHaveBeenCalledWith(
        schema,
        undefined,
      );
      expect(result).toBe("schema-did");
    });

    it("should create schema with options", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const schema = { type: "test-schema" };
      const options = { registry: "custom" };

      await KeymasterReactNative.createSchema(schema, options as any);

      expect(mockKeymasterInstance.createSchema).toHaveBeenCalledWith(
        schema,
        options,
      );
    });
  });

  describe("loadWallet()", () => {
    it("should load wallet", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.loadWallet();

      expect(mockKeymasterInstance.loadWallet).toHaveBeenCalled();
      expect(result).toEqual({ wallet: "data" });
    });
  });

  describe("saveWallet()", () => {
    it("should save wallet with default overwrite", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const wallet = { ids: {} } as any;
      const result = await KeymasterReactNative.saveWallet(wallet);

      expect(mockKeymasterInstance.saveWallet).toHaveBeenCalledWith(
        wallet,
        true,
      );
      expect(result).toBe(true);
    });

    it("should save wallet with explicit overwrite flag", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const wallet = { ids: {} } as any;
      await KeymasterReactNative.saveWallet(wallet, false);

      expect(mockKeymasterInstance.saveWallet).toHaveBeenCalledWith(
        wallet,
        false,
      );
    });
  });

  describe("newWallet()", () => {
    it("should create new wallet without parameters", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.newWallet();

      expect(mockKeymasterInstance.newWallet).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual({ wallet: "new" });
    });

    it("should create new wallet with mnemonic and overwrite", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const mnemonic = "test mnemonic words";
      await KeymasterReactNative.newWallet(mnemonic, true);

      expect(mockKeymasterInstance.newWallet).toHaveBeenCalledWith(
        mnemonic,
        true,
      );
    });
  });

  describe("addCustomHeader()", () => {
    it("should add custom header to gatekeeper", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      KeymasterReactNative.addCustomHeader("X-Custom-Header", "test-value");

      expect(mockGatekeeperAddCustomHeader).toHaveBeenCalledWith(
        "X-Custom-Header",
        "test-value",
      );
    });

    it("should throw error if gatekeeper not initialized", () => {
      KeymasterReactNative.initialize(validConfig);
      const instance = (KeymasterReactNative as any).instance;
      instance.gatekeeper = null;

      expect(() => {
        KeymasterReactNative.addCustomHeader("X-Custom-Header", "test-value");
      }).toThrow("GatekeeperClient not initialized");
    });
  });

  describe("removeCustomHeader()", () => {
    it("should remove custom header from gatekeeper", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      KeymasterReactNative.removeCustomHeader("X-Custom-Header");

      expect(mockGatekeeperRemoveCustomHeader).toHaveBeenCalledWith(
        "X-Custom-Header",
      );
    });

    it("should throw error if gatekeeper not initialized", () => {
      KeymasterReactNative.initialize(validConfig);
      const instance = (KeymasterReactNative as any).instance;
      instance.gatekeeper = null;

      expect(() => {
        KeymasterReactNative.removeCustomHeader("X-Custom-Header");
      }).toThrow("GatekeeperClient not initialized");
    });
  });

  describe("recoverWallet()", () => {
    it("should recover wallet without did", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.recoverWallet();

      expect(mockKeymasterInstance.recoverWallet).toHaveBeenCalledWith(
        undefined,
      );
      expect(result).toEqual({ wallet: "recovered" });
    });

    it("should recover wallet with did", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result =
        await KeymasterReactNative.recoverWallet("did:test:backup");

      expect(mockKeymasterInstance.recoverWallet).toHaveBeenCalledWith(
        "did:test:backup",
      );
      expect(result).toEqual({ wallet: "recovered" });
    });
  });

  describe("recoverWalletWithRepair()", () => {
    it("repairs the backup mnemonicEnc before decrypting and returns the loaded wallet", async () => {
      mockKeymasterInstance.loadWallet.mockResolvedValueOnce({
        version: 1,
        ids: { foo: { did: "did:test:foo" } },
      });

      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      const result = await KeymasterReactNative.recoverWalletWithRepair();

      // Resolves the backup DID from the seed bank, then the asset.
      expect(mockKeymasterInstance.resolveAsset).toHaveBeenCalledWith("did:test:backup");
      // Decrypts the backup blob with the HD keypair.
      expect(mockCipher.decryptMessage).toHaveBeenCalledWith(
        { pub: true },
        { priv: true },
        "encrypted-backup-blob",
      );
      // Repairs mnemonicEnc from the known-good local mnemonic + passphrase.
      expect(mockEncMnemonic).toHaveBeenCalledWith("test mnemonic words", "test-passphrase");

      // Saves the repaired wallet (enc preserved, mnemonicEnc rewritten) and reloads.
      const saved = mockKeymasterInstance.saveWallet.mock.calls[0][0];
      expect(saved.enc).toBe("encrypted-ids");
      expect(saved.seed.mnemonicEnc).toEqual({ salt: "s", iv: "i", data: "d" });
      expect(mockKeymasterInstance.saveWallet).toHaveBeenCalledWith(saved, true);
      expect(result).toEqual({ version: 1, ids: { foo: { did: "did:test:foo" } } });
    });

    it("uses the provided did and skips the seed bank lookup", async () => {
      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      await KeymasterReactNative.recoverWalletWithRepair("did:test:explicit");

      expect(mockKeymasterInstance.resolveSeedBank).not.toHaveBeenCalled();
      expect(mockKeymasterInstance.resolveAsset).toHaveBeenCalledWith("did:test:explicit");
    });

    it("throws when the backup asset is missing", async () => {
      mockKeymasterInstance.resolveAsset.mockResolvedValueOnce({});

      KeymasterReactNative.initialize(validConfig);
      await KeymasterReactNative.start();

      await expect(
        KeymasterReactNative.recoverWalletWithRepair("did:test:explicit"),
      ).rejects.toThrow('Asset "backup" is missing or not a string');
    });

    it("throws when not initialized", async () => {
      await expect(
        KeymasterReactNative.recoverWalletWithRepair(),
      ).rejects.toThrow("KeymasterReactNative not initialized");
    });
  });

  describe("Defensive guards", () => {
    it("should throw when gatekeeperConfig is nullified post-initialization", async () => {
      KeymasterReactNative.initialize(validConfig);
      const instance = (KeymasterReactNative as any).instance;
      instance.config.gatekeeperConfig = null;

      await expect(KeymasterReactNative.start()).rejects.toEqual(
        "Missing Gatekeeper config",
      );
    });
  });
});
