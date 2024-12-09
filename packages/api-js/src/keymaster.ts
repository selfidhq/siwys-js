// @ts-ignore
// @ts-nocheck
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
  onSaveWallet: (w: Wallet, overwrite?: boolean) => Promise<boolean>;
  onLoadWallet: () => Promise<Wallet | null>;
}

export interface IntegratedKeymasterConfig {
  gatekeeperConfig: SdkConfig;
  walletConfig: WalletConfig;
  onSaveWallet: (w: Wallet, overwrite?: boolean) => Promise<boolean>;
  onLoadWallet: () => Promise<Wallet | null>;
}

export interface ExternalKeymasterConfig {
  keymasterConfig: SdkConfig;
}

export interface KeymasterConfig {
  /**
   * Config for connecting to an external Keymaster service when
   * the consuming applciation is connecting to an external Keymaster.
   */
  keymasterConfig?: SdkConfig;
  /**
   * All of the following are required when the consuming application
   * is acting as its own (integrated) Keymaster service.
   *
   * The service must connect to an external gatekeeper and provide
   * the necessary configuration for persisting its own wallet.
   */
  gatekeeperConfig?: SdkConfig;
  walletConfig?: WalletConfig;
  walletDb?: WalletDb;
}

export class Keymaster {
  private _config: KeymasterConfig;
  /**
   * Underlying Keymaster libray based on the use-case:
   * Integrated Keymaster = keymaster_lib
   * External Keymaster = keymaster_sdk
   */
  private _keymasterService;
  private _serviceStarted = false;
  constructor(config: KeymasterConfig) {
    this.validateConfig(config);

    this._config = config;
  }

  public async start(): Promise<boolean> {
    if (this._config.gatekeeperConfig) {
      console.log(`Starting integrated Keymaster service`);
      this._serviceStarted = await this.startIntegratedKeymaster();
      console.log(`Started integrated Keymaster service`);
    } else if (this._config.keymasterConfig) {
      console.log(`Starting external Keymaster service`);
      this._serviceStarted = this.startExternalKeymaster();
      this._keymasterService = keymaster_sdk;
      console.log(`Started external Keymaster service`);
    } else {
      throw "Missing Gatekeeper or Keymaster config";
    }
    return this._serviceStarted;
  }

  private async startIntegratedKeymaster(): Promise<boolean> {
    try {
      const gatekeeper_sdk = await import("@mdip/gatekeeper/sdk");
      await gatekeeper_sdk.start(this._config.gatekeeperConfig);
    } catch (e) {
      console.error("Error starting Gatekeeper service:", e);
      return false;
    }

    try {
      const keymaster_lib = await import("@mdip/keymaster/lib");
      const cipher = await import("@mdip/cipher/node");
      await keymaster_lib.start({
        gatekeeper: gatekeeper_sdk,
        wallet: this._config.walletDb,
        cipher: cipher,
      });
      this._keymasterService = keymaster_lib;
    } catch (e) {
      console.error("Error starting Keymaster service:", e);
      return false;
    }

    try {
      await this.ensureWalletExists();
    } catch (e) {
      console.error("Error verifying existing wallet:", e);
      return false;
    }

    return true;
  }

  private async startExternalKeymaster(): Promise<boolean> {
    try {
      const keymaster_sdk = await import("@mdip/keymaster/sdk");
      await keymaster_sdk.start(this._config.keymasterConfig);
      this._keymasterService = keymaster_sdk;
    } catch (e) {
      console.error(`Error starting ${serviceType}:`, e);
      return false;
    }

    return true;
  }

  async createChallenge(
    spec: CreateChallengeSpec,
    options?: CreateChallengeOptions
  ): Promise<CreateChallengeResponse> {
    if (!this.serviceRunning()) {
      return;
    }
    const challengeSpec = { challenge: spec };
    const challenge: string = await this._keymasterService.createChallenge(
      challengeSpec,
      options
    );
    return {
      challenge: challenge,
      challengeUrl: `${spec.callback}?challenge=${challenge}`,
    };
  }

  async showMnemonic(): Promise<string> {
    if (!this.serviceRunning()) {
      return;
    }
    return this._keymasterService.decryptMnemonic();
  }

  async verifyResponse(
    did: string,
    options?: VerifyResponseOptions
  ): Promise<VerifyResponseResponse> {
    if (!this.serviceRunning()) {
      return;
    }
    const response: VerifyResponseResponse =
      await this._keymasterService.verifyResponse(did, options);
    return response;
  }

  private async ensureWalletExists(): Promise<void> {
    const existing: Wallet | null = await this._config.walletDb.loadWallet();
    if (existing?.current) {
      console.log(`Using existing wallet with ID ${existing.current}`);
      return;
    }

    const walletConfig = this._config.walletConfig;
    console.log(`Creating wallet with ID ${walletConfig.id}`);
    // wallet was just created, recreate based on config
    if (walletConfig.mnemonic) {
      // create the wallet with a custom mnemonic first
      await this._keymasterService.newWallet(spec.mnenomic, true);
    }
    // create ID and set as current, createId() will save wallet
    await this._keymasterService.createId(
      walletConfig.id,
      walletConfig.registry
    );
    console.log(`Created wallet with ID ${walletConfig.id}`);
  }

  private async serviceRunning(): Promise<boolean> {
    return this._serviceStarted || (await this.start());
  }

  private validateConfig(config: KeymasterConfig): void {
    if (config.gatekeeperConfig && config.keymasterConfig) {
      throw new Error("Cannot provide both a Gatekeeper and Keymaster config");
    }

    if (config.gatekeeperConfig) {
      if (!config.walletConfig) {
        throw new Error("Missing walletConfig");
      }
      if (!config.onSaveWallet) {
        throw new Error("Missing onSaveWallet callback");
      }
      if (!config.onLoadWallet) {
        throw new Error("Missing onLoadWallet callback");
      }
    }
  }
}
