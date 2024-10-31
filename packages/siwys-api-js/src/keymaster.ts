// @ts-ignore
// @ts-nocheck
import * as cipher from "@mdip/cipher/node";
import * as gatekeeper_sdk from "@mdip/gatekeeper/sdk";
import * as keymaster_lib from "@mdip/keymaster/lib";

import { initalizeWalletDb, DbType } from "./db";
import * as wallet_db from "./db/test";

export interface CreateChallengeSpec {
  callback: string;
  credentials?: [];
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

export interface GatekeeperConfig {
  url: string;
  waitUntilReady?: boolean;
  intervalSeconds?: number;
  chatty?: boolean;
}

export interface KeymasterConfig {
  gatekeeperConfig: GatekeeperConfig;
  onSaveWallet: (w: Wallet, overwrite?: boolean) => Promise<void>;
  onLoadWallet: () => Promise<string | null>;
}

export class Keymaster {
  private _gatekeeperConfig;
  private _walletDb;
  private _serviceStarted = false;

  constructor(config: KeymasterConfig) {
    this._gatekeeperConfig = {
      url: config.gatekeeperConfig.url,
      waitUntilReady: true,
      intervalSeconds: 5,
      chatty: true,
    };
    this._walletDb = {
      saveWallet: config.onSaveWallet,
      loadWallet: config.onLoadWallet,
    };
    gatekeeper_sdk.setURL(config.gatekeeperConfig.url);
  }

  public async start(): Promise<boolean> {
    try {
      await gatekeeper_sdk.waitUntilReady();
    } catch (e) {
      console.error("Error starting Gatekeeper service:", e);
    }

    try {
      await keymaster_lib.start(gatekeeper_sdk, this._walletDb, cipher);
      this._serviceStarted = true;
    } catch (e) {
      console.error("Error starting Keymaster service:", e);
    }

    return this._serviceStarted;
  }

  async createChallenge(
    spec: CreateChallengeSpec,
    options?: CreateChallengeOptions
  ): Promise<CreateChallengeResponse> {
    if (!this.serviceRunning()) {
      return;
    }
    const challengeSpec = { challenge: spec };
    const challenge: string = await keymaster_lib.createChallenge(
      challengeSpec,
      options
    );
    return {
      challenge: challenge,
      challengeUrl: `${spec.callback}?challenge=${challenge}`,
    };
  }

  async verifyResponse(
    did: string,
    options?: VerifyResponseOptions
  ): Promise<VerifyResponseResponse> {
    if (!this.serviceRunning()) {
      return;
    }
    const response: VerifyResponseResponse = await keymaster_lib.verifyResponse(
      did,
      options
    );
    return response;
  }

  // TOOD: expose checkAuth

  private async serviceRunning(): Promise<boolean> {
    return this._serviceStarted || (await this.start());
  }
}
