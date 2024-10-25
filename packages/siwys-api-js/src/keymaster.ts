// @ts-ignore
// @ts-nocheck
//import * as cipher_node from "@mdip/cipher/node";
import * as cipher_web from "@mdip/cipher/web";
import * as gatekeeper_sdk from "@mdip/gatekeeper/sdk";
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
  private _gatekeeperUrl;
  private _keymaster;
  private _wallet;

  constructor(options: KeymasterOptions) {
    this._gatekeeperUrl = options.gatekeeperUrl;
    this._keymaster = keymaster_lib;

    if (!options.wallet || !process.env.SIWYS_WALLET_JSON) {
      throw new Error("No wallet configured.");
    }

    this._wallet =
      options.wallet || JSON.parse(process.env.SIWYS_WALLET_JSON || {});
  }

  public async init() {
    console.debug(`Initializing Gatekeeper and Keymaster services.`);
    await gatekeeper_sdk.start({
      url: this._gatekeeperUrl,
      waitUntilReady: true,
      intervalSeconds: 5,
      chatty: true,
    });
    console.debug(`Started Gatekeeper.`);
    this._keymaster.start({
      gatekeeper: gatekeeper_sdk,
      cipher: cipher_web, // TODO: dynamically pass correct cipher lib
      wallet: this._wallet,
    });
    console.debug(`Started Keymaster.`);
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
