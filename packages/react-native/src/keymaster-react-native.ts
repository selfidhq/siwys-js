const GatekeeperClient = require("@mdip/gatekeeper/client").default;
const KeymasterMDIP = require("@mdip/keymaster").default;
import { default as KeymasterLib } from "@mdip/keymaster";
import { Cipher } from "@mdip/cipher/types";
import {
  CreateChallengeResponse,
  CreateChallengeSpec,
  SdkConfig,
} from "./types/index.js";
import {
  ChallengeResponse,
  CreateAssetOptions,
  CreateResponseOptions,
  IssueCredentialsOptions,
  VerifiableCredential,
  WalletBase,
} from "@mdip/keymaster/types";

export interface KeymasterConfig {
  gatekeeperConfig?: SdkConfig;
  walletDb?: WalletBase;
  cipher?: Cipher;
}

export class KeymasterReactNative {
  private static instance: KeymasterReactNative | null = null;

  private config: KeymasterConfig;
  private keymasterService!: KeymasterLib;

  private constructor(config: KeymasterConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  public static initialize(config: KeymasterConfig) {
    if (!KeymasterReactNative.instance) {
      KeymasterReactNative.instance = new KeymasterReactNative(config);
    } else {
      console.warn(
        "KeymasterReactNative already initialized, ignoring re-initialization."
      );
    }
  }

  private ensureInitialized() {
    if (!KeymasterReactNative.instance) {
      throw new Error(
        "KeymasterReactNative not initialized. Call KeymasterReactNative.initialize() first."
      );
    }
  }

  // Delegated STATIC methods

  public static async start() {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().startInternal();
  }

  public static async createChallenge(
    ...args: Parameters<KeymasterReactNative["createChallengeInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().createChallengeInternal(...args);
  }

  public static async bindCredential(
    ...args: Parameters<KeymasterReactNative["bindCredentialInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().bindCredentialInternal(...args);
  }

  public static async backupWallet(
    ...args: Parameters<KeymasterReactNative["backupWalletInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().backupWalletInternal(...args);
  }

  public static async createResponse(
    ...args: Parameters<KeymasterReactNative["createResponseInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().createResponseInternal(...args);
  }

  public static async issueCredential(
    ...args: Parameters<KeymasterReactNative["issueCredentialInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().issueCredentialInternal(...args);
  }

  public static async publishCredential(
    ...args: Parameters<KeymasterReactNative["publishCredentialInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().publishCredentialInternal(
      ...args
    );
  }

  public static async acceptCredential(
    ...args: Parameters<KeymasterReactNative["acceptCredentialInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().acceptCredentialInternal(...args);
  }

  public static async showMnemonic(
    ...args: Parameters<KeymasterReactNative["showMnemonicInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().showMnemonicInternal(...args);
  }

  public static async verifyResponse(
    ...args: Parameters<KeymasterReactNative["verifyResponseInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().verifyResponseInternal(...args);
  }

  public static async decryptMessage(
    ...args: Parameters<KeymasterReactNative["decryptMessageInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().decryptMessageInternal(...args);
  }

  public static async decryptMnemonic(
    ...args: Parameters<KeymasterReactNative["decryptMnemonicInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().decryptMnemonicInternal(...args);
  }

  public static async getCredential(
    ...args: Parameters<KeymasterReactNative["getCredentialInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().getCredentialInternal(...args);
  }

  public static async removeCredential(
    ...args: Parameters<KeymasterReactNative["removeCredentialInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().removeCredentialInternal(...args);
  }

  public static async updateCredential(
    ...args: Parameters<KeymasterReactNative["updateCredentialInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().updateCredentialInternal(...args);
  }

  public static async createId(
    ...args: Parameters<KeymasterReactNative["createIdInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().createIdInternal(...args);
  }

  public static async removeId(
    ...args: Parameters<KeymasterReactNative["removeIdInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().removeIdInternal(...args);
  }

  public static async resolveDID(
    ...args: Parameters<KeymasterReactNative["resolveDIDInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().resolveDIDInternal(...args);
  }

  public static async setCurrentId(
    ...args: Parameters<KeymasterReactNative["setCurrentIdInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().setCurrentIdInternal(...args);
  }

  public static async createSchema(
    ...args: Parameters<KeymasterReactNative["createSchemaInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().createSchemaInternal(...args);
  }

  public static async newWallet(
    ...args: Parameters<KeymasterReactNative["newWalletInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().newWalletInternal(...args);
  }

  public static async recoverWallet(
    ...args: Parameters<KeymasterReactNative["recoverWalletInternal"]>
  ) {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().recoverWalletInternal(...args);
  }

  private static getInstance(): KeymasterReactNative {
    if (!KeymasterReactNative.instance) {
      throw new Error(
        "KeymasterReactNative not initialized. Call KeymasterReactNative.initialize() first."
      );
    }
    return KeymasterReactNative.instance;
  }

  // -------- Internal instance methods (originals renamed with Internal) -------

  private async startInternal(): Promise<boolean> {
    if (this.config.gatekeeperConfig) {
      return await this.startIntegratedKeymaster();
    } else {
      throw "Missing Gatekeeper config";
    }
  }

  private async startIntegratedKeymaster(): Promise<boolean> {
    try {
      if (this.config.walletDb) {
        const gatekeeper = await GatekeeperClient.create({
          url: this.config.gatekeeperConfig?.url,
          waitUntilReady: this.config.gatekeeperConfig?.waitUntilReady,
          intervalSeconds: this.config.gatekeeperConfig?.intervalSeconds,
          chatty: this.config.gatekeeperConfig?.chatty,
        });
        this.keymasterService = new KeymasterMDIP({
          gatekeeper,
          wallet: this.config.walletDb,
          cipher: this.config.cipher,
        });
      } else {
        return false;
      }
    } catch (e) {
      console.error("Error starting KeymasterReactNative service:", e);
      return false;
    }

    return true;
  }

  private async createChallengeInternal(
    spec: CreateChallengeSpec,
    options?: CreateAssetOptions
  ): Promise<CreateChallengeResponse> {
    const challenge: string = await this.keymasterService.createChallenge(
      spec,
      options
    );
    return {
      challenge: challenge,
      challengeUrl: `${spec.callback}?challenge=${challenge}`,
    };
  }

  private async bindCredentialInternal(
    schemaId: string,
    subjectId: string,
    options: {
      validFrom?: string;
      validUntil?: string;
      credential?: Record<string, unknown>;
    } = {}
  ): Promise<VerifiableCredential> {
    return this.keymasterService.bindCredential(schemaId, subjectId, options);
  }

  private async createResponseInternal(
    challengeDID: string,
    options?: CreateResponseOptions
  ): Promise<string> {
    return this.keymasterService.createResponse(challengeDID, options);
  }

  private async backupWalletInternal(registry?: string): Promise<string> {
    return this.keymasterService.backupWallet(registry);
  }

  private async issueCredentialInternal(
    credential: Partial<VerifiableCredential>,
    options: IssueCredentialsOptions = {}
  ): Promise<string> {
    return this.keymasterService.issueCredential(credential, options);
  }

  private async publishCredentialInternal(
    did: string,
    options: { reveal?: boolean } = {}
  ): Promise<VerifiableCredential> {
    return this.keymasterService.publishCredential(did, options);
  }

  private async acceptCredentialInternal(did: string): Promise<boolean> {
    return this.keymasterService.acceptCredential(did);
  }

  private async showMnemonicInternal(): Promise<string> {
    return this.keymasterService.decryptMnemonic();
  }

  private async verifyResponseInternal(
    did: string,
    options?: { retries?: number; delay?: number }
  ): Promise<ChallengeResponse> {
    return this.keymasterService.verifyResponse(did, options);
  }

  private async decryptMessageInternal(
    ...args: Parameters<KeymasterLib["decryptMessage"]>
  ) {
    return this.keymasterService.decryptMessage(...args);
  }

  private async decryptMnemonicInternal(
    ...args: Parameters<KeymasterLib["decryptMnemonic"]>
  ) {
    return this.keymasterService.decryptMnemonic(...args);
  }

  private async getCredentialInternal(
    ...args: Parameters<KeymasterLib["getCredential"]>
  ) {
    return this.keymasterService.getCredential(...args);
  }

  private async removeCredentialInternal(
    ...args: Parameters<KeymasterLib["removeCredential"]>
  ) {
    return this.keymasterService.removeCredential(...args);
  }

  private async updateCredentialInternal(
    ...args: Parameters<KeymasterLib["updateCredential"]>
  ) {
    return this.keymasterService.updateCredential(...args);
  }

  private async createIdInternal(
    ...args: Parameters<KeymasterLib["createId"]>
  ) {
    return this.keymasterService.createId(...args);
  }

  private async removeIdInternal(
    ...args: Parameters<KeymasterLib["removeId"]>
  ) {
    return this.keymasterService.removeId(...args);
  }

  private async resolveDIDInternal(
    ...args: Parameters<KeymasterLib["resolveDID"]>
  ) {
    return this.keymasterService.resolveDID(...args);
  }

  private async setCurrentIdInternal(
    ...args: Parameters<KeymasterLib["setCurrentId"]>
  ) {
    return this.keymasterService.setCurrentId(...args);
  }

  private async createSchemaInternal(
    ...args: Parameters<KeymasterLib["createSchema"]>
  ) {
    return this.keymasterService.createSchema(...args);
  }

  private async newWalletInternal(
    ...args: Parameters<KeymasterLib["newWallet"]>
  ) {
    return this.keymasterService.newWallet(...args);
  }

  private async recoverWalletInternal(
    ...args: Parameters<KeymasterLib["recoverWallet"]>
  ) {
    return this.keymasterService.recoverWallet(...args);
  }

  private validateConfig(config: KeymasterConfig): void {
    if (!config.gatekeeperConfig) {
      throw new Error("Missing Gatekeeper config");
    }

    if (config.gatekeeperConfig) {
      if (!config.walletDb?.loadWallet) {
        throw new Error("Missing load wallet callback");
      }
      if (!config.walletDb?.saveWallet) {
        throw new Error("Missing save wallet callback");
      }
    }
  }
}
