// extends the types from the @mdip/keymaster package to include callback and more info on the response
export interface RequestedCredentialSpec {
  /** DID of the credential schema (molecule) being requested. */
  schema: string;
  /**
   * DIDs of the Attesters whose credentials will be accepted for this schema.
   * Normalized to the protocol-level `issuers` field before the challenge is created.
   * Entries are trimmed, deduplicated and must be valid DIDs.
   */
  attesters?: string[];
  /** Alias of `attesters`. */
  acceptedAttesters?: string[];
  /**
   * W3C / MDIP name for the accepted credential issuers.
   * Kept for backward compatibility; prefer `attesters`.
   */
  issuers?: string[];
}

export interface CreateChallengeSpec {
  callback: string;
  credentials?: RequestedCredentialSpec[];
}

export interface CreateChallengeResponse {
  challenge: string; // DID
  challengeUrl: string;
}

// config for connecting to an external Gatekeeper or Keymaster
export interface SdkConfig {
  url: string;
  waitUntilReady?: boolean;
  intervalSeconds?: number;
  chatty?: boolean;
  token?: string;
}
export interface WalletConfig {
  id: string;
  mnemonic?: string;
  registry?: string;
}
