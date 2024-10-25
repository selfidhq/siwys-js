// @ts-ignore
// @ts-nocheck
//import * as cipher_node from "@mdip/cipher/node";
import * as cipher_web from "@mdip/cipher/web";
import * as gatekeeper_sdk from "@mdip/gatekeeper/sdk";
import * as keymaster_lib from "@mdip/keymaster/lib";

import BrowserDb from "./db/browser";
import BaseDb from "./db/base";

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

export type WalletDbType = "web";

export interface KeymasterOptions {
  gatekeeperUrl: string;
  walletDb: WalletDbType;
}

export class Keymaster {
  private _gatekeeperUrl;
  private _keymaster;
  private _walletDb: BaseDb;
  private _initialized = false;

  constructor(options: KeymasterOptions) {
    console.debug(`Keymaster options:`, options);
    this._gatekeeperUrl = options.gatekeeperUrl;
    this._keymaster = keymaster_lib;

    if (options.walletDb === "web") {
      this._walletDb = new BrowserDb();
    }
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
    await this._keymaster.start({
      gatekeeper: gatekeeper_sdk,
      cipher: cipher_web, // TODO: dynamically pass correct cipher lib
      wallet: this._walletDb,
    });
    console.debug(`Started Keymaster.`);
    this._initialized = true;
  }

  async createChallenge(
    spec?: CreateChallengeSpec,
    options?: CreateChallengeOptions
  ): Promise<CreateChallengeResponse> {
    if (!this._initialized) {
      this.init();
    }

    const response = await this._keymaster.createChallenge(spec, options);
    console.debug("Created challenge:", response);
    return response;
  }

  async verifyResponse(
    did: string,
    options?: VerifyResponseOptions
  ): Promise<VerifyResponseResponse> {
    if (!this._initialized) {
      this.init();
    }

    const response = await this._keymaster.verifyResponse(did, options);
    console.debug("Verified response:", response);
    return response;
  }
}
