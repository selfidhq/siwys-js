const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockCreateChallenge = jest.fn().mockResolvedValue("did:test:challenge");
const mockBindCredential = jest.fn().mockResolvedValue({ id: "vc-1" });
const mockIssueCredential = jest.fn().mockResolvedValue("issued-did");
const mockPublishCredential = jest.fn().mockResolvedValue(true);
const mockAcceptCredential = jest.fn().mockResolvedValue(true);
const mockDecryptMnemonic = jest.fn().mockResolvedValue("word1 word2 word3");
const mockVerifyResponse = jest.fn().mockResolvedValue({ match: true });

jest.mock("@mdip/keymaster/client", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    createChallenge: mockCreateChallenge,
    bindCredential: mockBindCredential,
    issueCredential: mockIssueCredential,
    publishCredential: mockPublishCredential,
    acceptCredential: mockAcceptCredential,
    decryptMnemonic: mockDecryptMnemonic,
    verifyResponse: mockVerifyResponse,
  })),
}));

import { KeymasterExternalClient } from "./keymasterClient.js";

const validConfig = {
  keymasterConfig: { url: "http://localhost:4226" },
};

describe("KeymasterExternalClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor / validation", () => {
    it("should create an instance with valid config", () => {
      const client = new KeymasterExternalClient(validConfig);
      expect(client).toBeDefined();
    });

    it("should throw if keymasterConfig is missing", () => {
      expect(() => new KeymasterExternalClient({} as any)).toThrow(
        "Missing Keymaster config",
      );
    });
  });

  describe("start()", () => {
    it("should connect and return true on success", async () => {
      const client = new KeymasterExternalClient(validConfig);
      const result = await client.start();
      expect(result).toBe(true);
      expect(mockConnect).toHaveBeenCalledWith(validConfig.keymasterConfig);
    });

    it("should return false if connect throws", async () => {
      mockConnect.mockRejectedValueOnce(new Error("connection failed"));
      const client = new KeymasterExternalClient(validConfig);
      const result = await client.start();
      expect(result).toBe(false);
    });
  });

  describe("startExternal()", () => {
    it("should connect and return true on success", async () => {
      const client = new KeymasterExternalClient(validConfig);
      const result = await client.startExternal();
      expect(result).toBe(true);
      expect(mockConnect).toHaveBeenCalled();
    });

    it("should return false if connect throws", async () => {
      mockConnect.mockRejectedValueOnce(new Error("connection failed"));
      const client = new KeymasterExternalClient(validConfig);
      const result = await client.startExternal();
      expect(result).toBe(false);
    });
  });

  describe("createChallenge()", () => {
    it("should create a challenge and return response with URL", async () => {
      const client = new KeymasterExternalClient(validConfig);
      await client.start();

      const spec = { callback: "https://example.com/callback" };
      const result = await client.createChallenge(spec);

      expect(mockCreateChallenge).toHaveBeenCalledWith(spec, undefined);
      expect(result).toEqual({
        challenge: "did:test:challenge",
        challengeUrl:
          "https://example.com/callback?challenge=did:test:challenge",
      });
    });

    it("should auto-start service if not started", async () => {
      const client = new KeymasterExternalClient(validConfig);
      const spec = { callback: "https://example.com/callback" };
      const result = await client.createChallenge(spec);

      expect(mockConnect).toHaveBeenCalled();
      expect(result.challenge).toBe("did:test:challenge");
    });
  });

  describe("bindCredential()", () => {
    it("should delegate to keymasterService.bindCredential()", async () => {
      const client = new KeymasterExternalClient(validConfig);
      await client.start();

      const result = await client.bindCredential("schema-1", "did:subject:1");
      expect(mockBindCredential).toHaveBeenCalledWith(
        "schema-1",
        "did:subject:1",
        {},
      );
      expect(result).toEqual({ id: "vc-1" });
    });

    it("should pass options to bindCredential", async () => {
      const client = new KeymasterExternalClient(validConfig);
      await client.start();

      const options = {
        validFrom: "2024-01-01",
        validUntil: "2025-01-01",
        credential: { name: "John" },
      };
      await client.bindCredential("schema-1", "did:subject:1", options);
      expect(mockBindCredential).toHaveBeenCalledWith(
        "schema-1",
        "did:subject:1",
        options,
      );
    });
  });

  describe("issueCredential()", () => {
    it("should delegate to keymasterService.issueCredential()", async () => {
      const client = new KeymasterExternalClient(validConfig);
      await client.start();

      const credential = { type: ["VerifiableCredential"] };
      const result = await client.issueCredential(credential as any);
      expect(mockIssueCredential).toHaveBeenCalledWith(credential, {});
      expect(result).toBe("issued-did");
    });
  });

  describe("publishCredential()", () => {
    it("should delegate to keymasterService.publishCredential()", async () => {
      const client = new KeymasterExternalClient(validConfig);
      await client.start();

      const result = await client.publishCredential("did:cred:1");
      expect(mockPublishCredential).toHaveBeenCalledWith("did:cred:1", {});
      expect(result).toBe(true);
    });
  });

  describe("acceptCredential()", () => {
    it("should delegate to keymasterService.acceptCredential()", async () => {
      const client = new KeymasterExternalClient(validConfig);
      await client.start();

      const result = await client.acceptCredential("did:cred:1");
      expect(mockAcceptCredential).toHaveBeenCalledWith("did:cred:1");
      expect(result).toBe(true);
    });
  });

  describe("showMnemonic()", () => {
    it("should delegate to keymasterService.decryptMnemonic()", async () => {
      const client = new KeymasterExternalClient(validConfig);
      await client.start();

      const result = await client.showMnemonic();
      expect(mockDecryptMnemonic).toHaveBeenCalled();
      expect(result).toBe("word1 word2 word3");
    });
  });

  describe("verifyResponse()", () => {
    it("should delegate to keymasterService.verifyResponse()", async () => {
      const client = new KeymasterExternalClient(validConfig);
      await client.start();

      const result = await client.verifyResponse("did:challenge:1");
      expect(mockVerifyResponse).toHaveBeenCalledWith(
        "did:challenge:1",
        undefined,
      );
      expect(result).toEqual({ match: true });
    });

    it("should pass options to verifyResponse", async () => {
      const client = new KeymasterExternalClient(validConfig);
      await client.start();

      const options = { retries: 3, delay: 1000 };
      await client.verifyResponse("did:challenge:1", options);
      expect(mockVerifyResponse).toHaveBeenCalledWith(
        "did:challenge:1",
        options,
      );
    });
  });

  describe("defensive guards", () => {
    it("start() should throw if keymasterConfig is removed after construction", async () => {
      const client = new KeymasterExternalClient({ ...validConfig });
      (client as any).config.keymasterConfig = undefined;
      await expect(client.start()).rejects.toEqual("Missing Keymaster config");
    });

    it("startExternal() should throw if keymasterConfig is removed after construction", async () => {
      const client = new KeymasterExternalClient({ ...validConfig });
      (client as any).config.keymasterConfig = undefined;
      await expect(client.startExternal()).rejects.toEqual(
        "Missing Gatekeeper or Keymaster config",
      );
    });
  });
});
