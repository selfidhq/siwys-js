// @ts-ignore
// @ts-nocheck
import * as cipher from "@mdip/cipher";
import * as keymaster_lib from "@mdip/keymaster/lib";

export interface CreateChallengeSpec {
  challenge?: {
    credentials?: [];
  };
}

export interface CreateChallengeOptions {
  registry?: string;
  validUntil?: string; // ISO string
}

export interface CreateChallengeResponse {
  challenge: string; // DID
  challengeUrl: string;
}

export interface VerifyResponseOptions {
  retries?: number;
  delay?: number;
}

export interface VerifyResponseResponse {
  match: boolean;
  challenge: string;
  responder: string;
  // ...rest
}

export interface Wallet {
  seed: {
    mnemonic: string;
    hdkey: {
      xpriv: string;
      xpub: string;
    };
  };
  counter: number;
  ids: any;
}

export interface KeymasterOptions {
  gatekeeperUrl: string;
  wallet?: Wallet;
}

export class Keymaster {
  private _keymaster;

  constructor(options: KeymasterOptions) {
    console.debug(`Initializing keymaster with config:`, options);
    let wallet =
      options.wallet || JSON.parse(process.env.SIWYS_WALLET_JSON || {});

    if (!wallet) {
      throw new Error("No wallet configured.");
    }

    console.debug(`Starting Keymaster...`);
    this._keymaster = keymaster_lib.start({
      gatekeeper: options.gatekeeperUrl,
      cipher: cipher,
      wallet: wallet,
    });
  }

  async createChallenge(
    spec?: CreateChallengeSpec,
    options?: CreateChallengeOptions
  ): Promise<CreateChallengeResponse> {
    const response = await this._keymaster.createChallenge(spec, options);
    console.debug("Created challenge:", response);
    return response;
  }

  async verifyResponse(
    did: string,
    options?: VerifyResponseOptions
  ): Promise<VerifyResponseResponse> {
    const response = await this._keymaster.verifyResponse(did, options);
    console.debug("Verified response:", response);
    return response;
  }
}
