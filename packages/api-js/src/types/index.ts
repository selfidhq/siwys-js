export interface CreateChallengeSpec {
  callback: string;
  credentials?: { schema: string; issuers: string[] }[];
}
export interface CreateChallengeOptions {
  registry?: string;
  validUntil?: string; // ISO string
}

export interface Signature {
  signer?: string;
  signed: string;
  hash: string;
  value: string;
}
export interface CreateChallengeResponse {
  challenge: string; // DID
  challengeUrl: string;
}
export interface VerifyResponseOptions {
  retries?: number;
  delay?: number;
}

export interface VerifiableCredential {
  "@context": string[];
  type: string[];
  issuer: string;
  validFrom: string;
  validUntil?: string;
  credentialSubject?: {
    id: string;
  };
  credential?: Record<string, unknown> | null;
  signature?: Signature;
}

export interface Credential {
  vp: string;
}
export interface VerifyResponseResponse {
  match: boolean;
  challenge: string;
  responder: string;
  credentials?: Credential[];
}

export interface IssueCredentialsOptions {
  schema?: string;
  subject?: string;
  registry?: string;
  validFrom?: string;
  validUntil?: string;
  credential?: Record<string, unknown>;
}

export interface WalletSeed {
  mnemonic: string;
  hdkey: {
    xpriv: string;
    xpub: string;
  };
}
export interface Wallet {
  seed: WalletSeed;
  counter: number;
  ids: any;
  current?: string;
}
// config for connecting to an external Gatekeeper or Keymaster
export interface SdkConfig {
  url: string;
  waitUntilReady?: boolean;
  intervalSeconds?: number;
  chatty?: boolean;
}
export interface WalletConfig {
  id: string;
  mnemonic?: string;
  registry?: string;
}
export interface WalletDb {
  loadWallet: () => Promise<Wallet | null>;
  saveWallet: (w: Wallet, overwrite?: boolean) => Promise<boolean>;
}
