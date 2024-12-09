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

export interface KeymasterConfig {
  /**
   * Config for connecting to an external Keymaster service
   * when the consuming applciation is connecting to an external Keymaster.
   */
  keymasterConfig?: SdkConfig;
  /**
   * Config for connecting to an external Keymaster service when
   * the consuming applciation is acting as its own (integrated) Keymaster service.
   */
  gatekeeperConfig?: SdkConfig;
  /**
   * Config for custom user-defined values of the underlying wallet.
   *
   * Required for an integrated Keymaster.
   */
  walletConfig?: WalletConfig;
  /**
   * Config that contains the callbacks for persisting a
   * wallet to a backing Database.
   */
  walletDb?: WalletDb;
}

export class Keymaster {
  private config: KeymasterConfig;
  /**
   * Underlying Keymaster libray based on the use-case:
   *
   * Integrated Keymaster = keymaster_lib
   *
   * External Keymaster = keymaster_sdk
   */
  private keymasterService;
  private serviceStarted = false;

  constructor(config: KeymasterConfig) {
    this.validateConfig(config);

    this.config = config;
  }

  public async start(): Promise<boolean> {
    if (this.config.gatekeeperConfig) {
      this.serviceStarted = await this.startIntegratedKeymaster();
    } else if (this.config.keymasterConfig) {
      this.serviceStarted = this.startExternalKeymaster();
    } else {
      throw "Missing Gatekeeper or Keymaster config";
    }
    return this.serviceStarted;
  }

  private async startIntegratedKeymaster(): Promise<boolean> {
    console.log(`Starting integrated Keymaster service`);

    try {
      const gatekeeper_sdk = await import("@mdip/gatekeeper/sdk");
      await gatekeeper_sdk.start(this.config.gatekeeperConfig);

      const cipher = await import("@mdip/cipher/node");

      this.keymasterService = await import("@mdip/keymaster/lib");
      await this.keymasterService.start({
        cipher: cipher,
        gatekeeper: gatekeeper_sdk,
        wallet: {
          loadWallet: this.config.walletDb?.onLoadWallet,
          saveWallet: this.config.walletDb?.onSaveWallet,
        },
      });

      // ensure wallet exists on startup
      await this.ensureWalletExists();
    } catch (e) {
      console.error("Error starting Keymaster service:", e);
      return false;
    }

    console.log(`Started integrated Keymaster service`);
    return true;
  }

  private async startExternalKeymaster(): Promise<boolean> {
    console.log(`Starting external Keymaster service`);
    try {
      this.keymasterService = await import("@mdip/keymaster/sdk");
      await this.keymasterService.start(this.config.keymasterConfig);
    } catch (e) {
      console.error(`Error starting Keymaster serivce:`, e);
      return false;
    }

    console.log(`Started external Keymaster service`);
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
    const challenge: string = await this.keymasterService.createChallenge(
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
    return this.keymasterService.decryptMnemonic();
  }

  async verifyResponse(
    did: string,
    options?: VerifyResponseOptions
  ): Promise<VerifyResponseResponse> {
    if (!this.serviceRunning()) {
      return;
    }
    const response: VerifyResponseResponse =
      await this.keymasterService.verifyResponse(did, options);
    return response;
  }

  private async ensureWalletExists(): Promise<void> {
    const existing: Wallet | null = await this.config.walletDb.loadWallet();
    if (existing?.current) {
      console.log(`Using existing wallet with ID ${existing.current}`);
      return;
    }

    const walletConfig = this.config.walletConfig;
    console.log(`Creating wallet with ID ${walletConfig.id}`);
    // wallet was just created, recreate based on config
    if (walletConfig.mnemonic) {
      // create the wallet with a custom mnemonic first
      await this.keymasterService.newWallet(spec.mnenomic, true);
    }
    // create ID and set as current, createId() will save wallet
    await this.keymasterService.createId(
      walletConfig.id,
      walletConfig.registry
    );
    console.log(`Created wallet with ID ${walletConfig.id}`);
  }

  private async serviceRunning(): Promise<boolean> {
    return this.serviceStarted || (await this.start());
  }

  private validateConfig(config: KeymasterConfig): void {
    if (config.gatekeeperConfig && config.keymasterConfig) {
      throw new Error("Cannot provide both a Gatekeeper and Keymaster config");
    }

    if (config.gatekeeperConfig) {
      if (!config.walletConfig) {
        throw new Error("Missing walletConfig");
      }
      if (!config.walletDb?.onSaveWallet) {
        throw new Error("Missing onSaveWallet callback");
      }
      if (!config.walletDb?.onSaveWallet) {
        throw new Error("Missing onLoadWallet callback");
      }
    }
  }
}
