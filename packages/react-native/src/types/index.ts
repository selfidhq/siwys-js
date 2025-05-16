// extends the types from the @mdip/keymaster package to include callback and more info on the response
export interface CreateChallengeSpec {
  callback: string;
  credentials?: { schema: string; issuers: string[] }[];
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
}
export interface WalletConfig {
  id: string;
  mnemonic?: string;
  registry?: string;
}
