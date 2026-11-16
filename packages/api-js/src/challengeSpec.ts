import { CreateChallengeSpec, RequestedCredentialSpec } from "./types/index.js";

// Mirrors the shape of @mdip/common's InvalidParameterError (message: "Invalid parameter: <detail>").
// Defined locally because @mdip/common is not a declared dependency of this package.
export class InvalidParameterError extends Error {
  static type = "Invalid parameter";
  type: string;
  detail?: string;

  constructor(detail?: string) {
    super(
      detail
        ? `${InvalidParameterError.type}: ${detail}`
        : InvalidParameterError.type,
    );
    this.name = "InvalidParameterError";
    this.type = InvalidParameterError.type;
    this.detail = detail;
    // Keeps `instanceof` working when compiled to ES5
    Object.setPrototypeOf(this, InvalidParameterError.prototype);
  }
}

// W3C DID syntax: did:<method-name>:<method-specific-id>
const DID_PATTERN =
  /^did:[a-z0-9]+:(?:[A-Za-z0-9._-]|%[0-9A-Fa-f]{2})*(?::(?:[A-Za-z0-9._-]|%[0-9A-Fa-f]{2})*)*(?:[A-Za-z0-9._-]|%[0-9A-Fa-f]{2})$/;

type AttesterField = "attesters" | "acceptedAttesters" | "issuers";

const ATTESTER_FIELDS: AttesterField[] = [
  "attesters",
  "acceptedAttesters",
  "issuers",
];

function sanitizeAttesterList(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    throw new InvalidParameterError(`${path} must be an array of DID strings`);
  }
  const result: string[] = [];
  value.forEach((entry, index) => {
    const did = typeof entry === "string" ? entry.trim() : entry;
    if (typeof did !== "string" || !DID_PATTERN.test(did)) {
      throw new InvalidParameterError(
        `${path}[${index}] must be a valid DID string (received ${JSON.stringify(entry)})`,
      );
    }
    if (result.indexOf(did) === -1) {
      result.push(did);
    }
  });
  return result;
}

/**
 * Decides the final accepted-attester list when a credential spec provides
 * more than one of `attesters`, `acceptedAttesters` and `issuers`.
 *
 * @param provided Sanitized (trimmed, deduplicated, DID-validated) lists keyed by the
 *   field name they came from. Only fields that were present in the input are included,
 *   and there are always at least two entries.
 * @param path Location of the credential spec in the challenge, for error messages
 *   (e.g. "challenge.credentials[0]").
 * @returns The list to send to MDIP as `issuers`.
 * @throws InvalidParameterError when the configuration is ambiguous.
 */
function resolveAttesterConflict(
  provided: Partial<Record<AttesterField, string[]>>,
  path: string,
): string[] {
  const fields = Object.keys(provided) as AttesterField[];
  const reference = provided[fields[0]] as string[];

  // Lists are already deduplicated, so equal length + full inclusion means equal sets
  const conflicting = fields.some((field) => {
    const list = provided[field] as string[];
    return (
      list.length !== reference.length ||
      list.some((did) => reference.indexOf(did) === -1)
    );
  });

  if (conflicting) {
    throw new InvalidParameterError(
      `${path} has an ambiguous attester configuration: ${fields.join(", ")} must contain the same DIDs when provided together`,
    );
  }
  return reference;
}

function normalizeRequestedCredential(
  credential: RequestedCredentialSpec,
  path: string,
): RequestedCredentialSpec {
  if (!credential || typeof credential !== "object" || Array.isArray(credential)) {
    throw new InvalidParameterError(`${path} must be an object`);
  }

  const { attesters, acceptedAttesters, issuers, ...rest } = credential;
  const raw: Record<AttesterField, unknown> = {
    attesters,
    acceptedAttesters,
    issuers,
  };

  const provided: Partial<Record<AttesterField, string[]>> = {};
  ATTESTER_FIELDS.forEach((field) => {
    if (raw[field] !== undefined) {
      provided[field] = sanitizeAttesterList(raw[field], `${path}.${field}`);
    }
  });

  const presentFields = Object.keys(provided) as AttesterField[];
  if (presentFields.length === 0) {
    return rest;
  }
  if (presentFields.length === 1) {
    return { ...rest, issuers: provided[presentFields[0]] };
  }
  return { ...rest, issuers: resolveAttesterConflict(provided, path) };
}

/**
 * Validates a challenge spec and maps the SELF-idiomatic `attesters` /
 * `acceptedAttesters` fields to the protocol-level `issuers` array expected by
 * @mdip/keymaster and the wallets. The alias fields are stripped from the output.
 */
export function normalizeChallengeSpec(
  spec: CreateChallengeSpec,
): CreateChallengeSpec {
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
    throw new InvalidParameterError("challenge must be an object");
  }
  if (spec.credentials === undefined) {
    return spec;
  }
  if (!Array.isArray(spec.credentials)) {
    throw new InvalidParameterError("challenge.credentials must be an array");
  }

  return {
    ...spec,
    credentials: spec.credentials.map((credential, index) =>
      normalizeRequestedCredential(
        credential,
        `challenge.credentials[${index}]`,
      ),
    ),
  };
}
