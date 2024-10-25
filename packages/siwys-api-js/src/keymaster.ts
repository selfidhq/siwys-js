// @ts-ignore
// @ts-nocheck
//import * as cipher_node from "@mdip/cipher/node";
import * as cipher_web from "@mdip/cipher/web";
import * as gatekeeper_sdk from "@mdip/gatekeeper/sdk";
import * as keymaster_lib from "@mdip/keymaster/lib";

import { initalizeWalletDb, DbType } from "./db";

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

export interface GatekeeperConfig {
  url: string;
  waitUntilReady?: boolean;
  intervalSeconds?: number;
  chatty?: boolean;
}

export interface KeymasterConfig {
  gatekeeperConfig: GatekeeperConfig;
  walletDb: DbType;
}

export class Keymaster {
  private _gatekeeperConfig;
  private _keymasterConfig;
  private _initialized = false;

  constructor(options: KeymasterConfig) {
    console.debug(`Keymaster options:`, options);
    this._gatekeeperConfig = {
      url: options.gatekeeperConfig.url,
      waitUntilReady: true,
      intervalSeconds: 5,
      chatty: true,
    };
    console.debug(`Gatekeepr config:`, this._gatekeeperConfig);
    this._keymasterConfig = {
      gatekeeper: gatekeeper_sdk,
      cipher: cipher_web,
      wallet: initalizeWalletDb(options.walletDb),
    };
    console.debug(`Keymaster config:`, this._keymasterConfig);
  }

  public async init() {
    console.debug(`Initializing Gatekeeper and Keymaster services.`);
    await gatekeeper_sdk.start(this._gatekeeperConfig);
    console.debug(`Started Gatekeeper.`);
    console.log(`loadWallet():`, this._keymasterConfig.wallet.loadWallet());
    await keymaster_lib.start(this._keymasterConfig);
    console.debug(`Started Keymaster.`);
    this._initialized = true;
  }

  async createChallenge(
    spec?: CreateChallengeSpec,
    options?: CreateChallengeOptions
  ): Promise<CreateChallengeResponse> {
    if (!this._initialized) {
      await this.init();
    }

    const response = await keymaster_lib.createChallenge(spec, options);
    console.debug("Created challenge:", response);
    return response;
  }

  async verifyResponse(
    did: string,
    options?: VerifyResponseOptions
  ): Promise<VerifyResponseResponse> {
    if (!this._initialized) {
      await this.init();
    }

    const response = await keymaster_lib.verifyResponse(did, options);
    console.debug("Verified response:", response);
    return response;
  }
}
