import { InvalidParameterError, normalizeChallengeSpec } from "./challengeSpec.js";

const callback = "https://partner.com/api/verify";
const schema = "did:self:schema-kyc-v1";
const netki = "did:self:netki-attester-did";
const acme = "did:self:acme-id-attester-did";

describe("normalizeChallengeSpec()", () => {
  describe("normalization", () => {
    it("returns the spec unchanged when no credentials are requested", () => {
      const spec = { callback };
      expect(normalizeChallengeSpec(spec)).toBe(spec);
    });

    it("maps attesters to issuers and strips the alias", () => {
      const result = normalizeChallengeSpec({
        callback,
        credentials: [{ schema, attesters: [netki, acme] }],
      });
      expect(result).toEqual({
        callback,
        credentials: [{ schema, issuers: [netki, acme] }],
      });
      expect(result.credentials![0]).not.toHaveProperty("attesters");
    });

    it("maps acceptedAttesters to issuers identically to attesters", () => {
      const fromAttesters = normalizeChallengeSpec({
        callback,
        credentials: [{ schema, attesters: [netki] }],
      });
      const fromAccepted = normalizeChallengeSpec({
        callback,
        credentials: [{ schema, acceptedAttesters: [netki] }],
      });
      expect(fromAccepted).toEqual(fromAttesters);
      expect(fromAccepted.credentials![0]).not.toHaveProperty(
        "acceptedAttesters",
      );
    });

    it("keeps legacy issuers working", () => {
      const result = normalizeChallengeSpec({
        callback,
        credentials: [{ schema, issuers: [netki] }],
      });
      expect(result.credentials).toEqual([{ schema, issuers: [netki] }]);
    });

    it("leaves credentials without attester constraints untouched", () => {
      const result = normalizeChallengeSpec({
        callback,
        credentials: [{ schema }],
      });
      expect(result.credentials).toEqual([{ schema }]);
      expect(result.credentials![0]).not.toHaveProperty("issuers");
    });

    it("normalizes each credential independently", () => {
      const result = normalizeChallengeSpec({
        callback,
        credentials: [
          { schema, attesters: [netki] },
          { schema: "did:self:schema-age-v1", issuers: [acme] },
        ],
      });
      expect(result.credentials).toEqual([
        { schema, issuers: [netki] },
        { schema: "did:self:schema-age-v1", issuers: [acme] },
      ]);
    });

    it("does not mutate the input spec", () => {
      const spec = {
        callback,
        credentials: [{ schema, attesters: [` ${netki} `, netki] }],
      };
      const snapshot = JSON.parse(JSON.stringify(spec));
      normalizeChallengeSpec(spec);
      expect(spec).toEqual(snapshot);
    });
  });

  describe("sanitization", () => {
    it("trims whitespace and deduplicates preserving first occurrence order", () => {
      const result = normalizeChallengeSpec({
        callback,
        credentials: [
          { schema, attesters: [`  ${acme}`, netki, `${acme}  `, netki] },
        ],
      });
      expect(result.credentials![0].issuers).toEqual([acme, netki]);
    });

    it("accepts DIDs from other methods and with colon-separated ids", () => {
      const result = normalizeChallengeSpec({
        callback,
        credentials: [
          { schema, attesters: ["did:test:abc123", "did:web:example.com:user"] },
        ],
      });
      expect(result.credentials![0].issuers).toEqual([
        "did:test:abc123",
        "did:web:example.com:user",
      ]);
    });
  });

  describe("validation", () => {
    const invalidEntries: [string, unknown][] = [
      ["empty string", ""],
      ["whitespace only", "   "],
      ["non-DID string", "netki"],
      ["missing method-specific id", "did:self:"],
      ["uppercase method", "did:SELF:abc"],
      ["inner whitespace", "did:self:ab c"],
      ["number", 42],
      ["null", null],
    ];

    it.each(invalidEntries)(
      "throws InvalidParameterError for an invalid entry (%s)",
      (_label, entry) => {
        expect(() =>
          normalizeChallengeSpec({
            callback,
            credentials: [{ schema, attesters: [netki, entry as string] }],
          }),
        ).toThrow(
          new InvalidParameterError(
            `challenge.credentials[0].attesters[1] must be a valid DID string (received ${JSON.stringify(entry)})`,
          ),
        );
      },
    );

    it.each(["attesters", "acceptedAttesters", "issuers"])(
      "throws when %s is not an array",
      (field) => {
        expect(() =>
          normalizeChallengeSpec({
            callback,
            credentials: [{ schema, [field]: netki } as any],
          }),
        ).toThrow(
          `Invalid parameter: challenge.credentials[0].${field} must be an array of DID strings`,
        );
      },
    );

    // self-api sends `issuers: []` for schemas without attester constraints, and
    // the extension and mobile wallets read an empty list as "any attester"
    it("passes an empty issuers list through unchanged", () => {
      const result = normalizeChallengeSpec({
        callback,
        credentials: [{ schema, issuers: [] }],
      });
      expect(result.credentials).toEqual([{ schema, issuers: [] }]);
    });

    it("maps an empty attesters list to an empty issuers list", () => {
      const result = normalizeChallengeSpec({
        callback,
        credentials: [{ schema, attesters: [] }],
      });
      expect(result.credentials).toEqual([{ schema, issuers: [] }]);
    });

    it("throws when credentials is not an array", () => {
      expect(() =>
        normalizeChallengeSpec({ callback, credentials: {} as any }),
      ).toThrow("Invalid parameter: challenge.credentials must be an array");
    });

    it("throws when a credential entry is not an object", () => {
      expect(() =>
        normalizeChallengeSpec({ callback, credentials: [null as any] }),
      ).toThrow("Invalid parameter: challenge.credentials[0] must be an object");
    });

    it("reports the index of the offending credential", () => {
      expect(() =>
        normalizeChallengeSpec({
          callback,
          credentials: [
            { schema, attesters: [netki] },
            { schema, attesters: ["bad"] },
          ],
        }),
      ).toThrow(/challenge\.credentials\[1\]\.attesters\[0\]/);
    });

    it("throws an instance of InvalidParameterError with type and detail", () => {
      let caught: unknown;
      try {
        normalizeChallengeSpec({
          callback,
          credentials: [{ schema, attesters: ["bad"] }],
        });
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(InvalidParameterError);
      expect(caught).toBeInstanceOf(Error);
      expect((caught as InvalidParameterError).type).toBe("Invalid parameter");
      expect((caught as InvalidParameterError).name).toBe(
        "InvalidParameterError",
      );
    });
  });

  describe("conflicting attester fields", () => {
    it("accepts attesters and issuers when they describe the same set", () => {
      const result = normalizeChallengeSpec({
        callback,
        credentials: [
          { schema, attesters: [netki, acme], issuers: [acme, ` ${netki}`] },
        ],
      });
      expect(result.credentials).toEqual([
        { schema, issuers: [netki, acme] },
      ]);
    });

    it("rejects attesters and issuers with different values", () => {
      expect(() =>
        normalizeChallengeSpec({
          callback,
          credentials: [{ schema, attesters: [netki], issuers: [acme] }],
        }),
      ).toThrow(InvalidParameterError);
      expect(() =>
        normalizeChallengeSpec({
          callback,
          credentials: [{ schema, attesters: [netki], issuers: [acme] }],
        }),
      ).toThrow(/ambiguous attester configuration/);
    });

    it("rejects an empty issuers list combined with non-empty attesters", () => {
      expect(() =>
        normalizeChallengeSpec({
          callback,
          credentials: [{ schema, attesters: [netki], issuers: [] }],
        }),
      ).toThrow(/ambiguous attester configuration/);
    });

    it("rejects attesters and acceptedAttesters with different values", () => {
      expect(() =>
        normalizeChallengeSpec({
          callback,
          credentials: [
            { schema, attesters: [netki], acceptedAttesters: [netki, acme] },
          ],
        }),
      ).toThrow(/ambiguous attester configuration/);
    });
  });
});
