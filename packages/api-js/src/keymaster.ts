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

export interface GatekeeperConfig {
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

export interface KeymasterConfig {
  gatekeeperConfig: GatekeeperConfig;
  walletConfig: WalletConfig;
  onSaveWallet: (w: Wallet, overwrite?: boolean) => Promise<void>;
  onLoadWallet: () => Promise<Wallet | null>;
}

export class Keymaster {
  private _gatekeeperConfig;
  private _walletConfig;
  private _walletDb;
  private _serviceStarted = false;

  constructor(config: KeymasterConfig) {
    this._gatekeeperConfig = {
      url: config.gatekeeperConfig.url,
      waitUntilReady: true,
      intervalSeconds: 5,
      chatty: true,
    };
    this._walletConfig = config.walletConfig;
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

    try {
      await this.ensureWalletExists();
    } catch (e) {
      console.error("Error verifying existing wallet:", e);
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

  private async ensureWalletExists(): Promise<void> {
    const existing: Wallet = await keymaster_lib.loadWallet();
    if (existing.current) {
      // pre-existing wallet has current ID set
      console.log(`Using existing wallet with ID ${existing.current}`);
      return;
    }

    console.log(`Creating wallet with ID ${this._walletConfig.id}`);
    // wallet was just created, recreate based on config
    if (this._walletConfig.mnemonic) {
      // create the wallet with a custom mnemonic first
      await keymaster_lib.newWallet(spec.mnenomic, true);
    }
    // create ID and set as current, createId() will save wallet
    await keymaster_lib.createId(
      this._walletConfig.id,
      this._walletConfig.registry
    );
    console.log(`Created wallet with ID ${this._walletConfig.id}`);
  }

  private async serviceRunning(): Promise<boolean> {
    return this._serviceStarted || (await this.start());
  }
}
