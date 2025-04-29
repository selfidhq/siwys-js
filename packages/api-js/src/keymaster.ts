// @ts-ignore
// @ts-nocheck
import GatekeeperClient from "@mdip/gatekeeper/client";
import CipherNode from "@mdip/cipher/node";
import KeymasterClient from "@mdip/keymaster/client";
import { default as KeymasterLib } from "@mdip/keymaster";
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
      this.serviceStarted = await this.startExternalKeymaster();
    } else {
      throw "Missing Gatekeeper or Keymaster config";
    }
    return this.serviceStarted;
  }

  private async startIntegratedKeymaster(): Promise<boolean> {
    console.log(`Starting integrated Keymaster service`);

    try {
      const gatekeeper = new GatekeeperClient();
      await gatekeeper.connect(this.config.gatekeeperConfig);

      const cipher = new CipherNode();

      this.keymasterService = await new KeymasterLib({
        gatekeeper,
        wallet: this.config.walletDb,
        cipher,
      });

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
      this.keymasterService = new KeymasterClient();
      await this.keymasterService.connect(this.config.keymasterConfig);
    } catch (e) {
      console.error(`Error starting Keymaster service:`, e);
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
      throw new Error("Keymaster service not running");
    }
    const challenge: string = await this.keymasterService.createChallenge(
      spec,
      options
    );
    return {
      challenge: challenge,
      challengeUrl: `${spec.callback}?challenge=${challenge}`,
    };
  }

  async bindCredential(
    schemaId: string,
    subjectId: string,
    options: {
      validFrom?: string;
      validUntil?: string;
      credential?: Record<string, unknown>;
    } = {}
  ): Promise<VerifiableCredential> {
    if (!this.serviceRunning()) {
      throw new Error("Keymaster service not running");
    }

    return this.keymasterService.bindCredential(schemaId, subjectId, options);
  }

  async issueCredential(
    credential: Partial<VerifiableCredential>,
    options: IssueCredentialsOptions = {}
  ): Promise<string> {
    if (!this.serviceRunning()) {
      throw new Error("Keymaster service not running");
    }

    return this.keymasterService.issueCredential(credential, options);
  }

  async publishCredential(
    did: string,
    options: { reveal?: boolean } = {}
  ): Promise<VerifiableCredential> {
    if (!this.serviceRunning()) {
      throw new Error("Keymaster service not running");
    }

    return this.keymasterService.publishCredential(did, options);
  }

  async acceptCredential(did: string): Promise<boolean> {
    if (!this.serviceRunning()) {
      throw new Error("Keymaster service not running");
    }

    return this.keymasterService.acceptCredential(did);
  }

  async showMnemonic(): Promise<string> {
    if (!this.serviceRunning()) {
      throw new Error("Keymaster service not running");
    }
    return this.keymasterService.decryptMnemonic();
  }

  async verifyResponse(
    did: string,
    options?: VerifyResponseOptions
  ): Promise<VerifyResponseResponse> {
    if (!this.serviceRunning()) {
      throw new Error("Keymaster service not running");
    }
    const response: VerifyResponseResponse =
      await this.keymasterService.verifyResponse(did, options);
    return response;
  }

  private async ensureWalletExists(): Promise<void> {
    console.log("Ensuring wallet exists");
    const existing: Wallet | null =
      (await this.config?.walletDb?.loadWallet()) || null;
    if (existing?.current) {
      console.log(`Using existing wallet with ID ${existing.current}`);
      return;
    }

    const walletConfig = this.config.walletConfig;
    console.log(
      `Creating  Creating Creating wallet with ID ${walletConfig?.id}`
    );
    // wallet was just created, recreate based on config
    if (walletConfig?.mnemonic) {
      // create the wallet with a custom mnemonic first
      await this.keymasterService.newWallet(walletConfig.mnemonic, true);
    }
    // create ID and set as current, createId() will save wallet
    const did = await this.keymasterService.createId(
      walletConfig?.id,
      walletConfig?.registry
    );
    console.log("Did ", did);
    console.log(`Created wallet with ID ${walletConfig?.id}`);
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
        throw new Error("Missing wallet config");
      }
      if (!config.walletDb?.loadWallet) {
        throw new Error("Missing load wallet callback");
      }
      if (!config.walletDb?.saveWallet) {
        throw new Error("Missing save wallet callback");
      }
    }
  }
}
