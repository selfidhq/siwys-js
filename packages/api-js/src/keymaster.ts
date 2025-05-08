import GatekeeperClient from "@mdip/gatekeeper/client";
import CipherNode from "@mdip/cipher/node";
import KeymasterLib from "@mdip/keymaster";
import {
  CreateChallengeResponse,
  CreateChallengeSpec,
  SdkConfig,
  WalletConfig,
} from "./types/index.js";
import {
  ChallengeResponse,
  CreateAssetOptions,
  IssueCredentialsOptions,
  StoredWallet,
  VerifiableCredential,
  WalletBase,
} from "@mdip/keymaster/types";

export interface KeymasterConfig {
  gatekeeperConfig?: SdkConfig;
  walletDb?: WalletBase;
  walletConfig?: WalletConfig;
}

export class Keymaster {
  private static instance: Keymaster | null = null;

  private config: KeymasterConfig;
  private keymasterService!: KeymasterLib;
  private serviceStarted = false;

  private constructor(config: KeymasterConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  public static initialize(config: KeymasterConfig) {
    if (!Keymaster.instance) {
      Keymaster.instance = new Keymaster(config);
      console.log("✅ Keymaster initialized");
    } else {
      console.warn(
        "Keymaster already initialized, ignoring re-initialization."
      );
    }
  }

  private ensureInitialized() {
    if (!Keymaster.instance) {
      throw new Error(
        "Keymaster not initialized. Call Keymaster.initialize() first."
      );
    }
  }

  // Delegated STATIC methods

  public static async start() {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().startInternal();
  }

  public static async createChallenge(
    ...args: Parameters<Keymaster["createChallengeInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().createChallengeInternal(...args);
  }

  public static async bindCredential(
    ...args: Parameters<Keymaster["bindCredentialInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().bindCredentialInternal(...args);
  }

  public static async issueCredential(
    ...args: Parameters<Keymaster["issueCredentialInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().issueCredentialInternal(...args);
  }

  public static async publishCredential(
    ...args: Parameters<Keymaster["publishCredentialInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().publishCredentialInternal(...args);
  }

  public static async acceptCredential(
    ...args: Parameters<Keymaster["acceptCredentialInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().acceptCredentialInternal(...args);
  }

  public static async showMnemonic(
    ...args: Parameters<Keymaster["showMnemonicInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().showMnemonicInternal(...args);
  }

  public static async verifyResponse(
    ...args: Parameters<Keymaster["verifyResponseInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().verifyResponseInternal(...args);
  }

  public static async decryptMessage(
    ...args: Parameters<Keymaster["decryptMessageInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().decryptMessageInternal(...args);
  }

  public static async decryptMnemonic(
    ...args: Parameters<Keymaster["decryptMnemonicInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().decryptMnemonicInternal(...args);
  }

  public static async getCredential(
    ...args: Parameters<Keymaster["getCredentialInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().getCredentialInternal(...args);
  }

  public static async removeCredential(
    ...args: Parameters<Keymaster["removeCredentialInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().removeCredentialInternal(...args);
  }

  public static async updateCredential(
    ...args: Parameters<Keymaster["updateCredentialInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().updateCredentialInternal(...args);
  }

  public static async createId(
    ...args: Parameters<Keymaster["createIdInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().createIdInternal(...args);
  }

  public static async removeId(
    ...args: Parameters<Keymaster["removeIdInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().removeIdInternal(...args);
  }

  public static async resolveDID(
    ...args: Parameters<Keymaster["resolveDIDInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().resolveDIDInternal(...args);
  }

  public static async setCurrentId(
    ...args: Parameters<Keymaster["setCurrentIdInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().setCurrentIdInternal(...args);
  }

  public static async createSchema(
    ...args: Parameters<Keymaster["createSchemaInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().createSchemaInternal(...args);
  }

  public static async newWallet(
    ...args: Parameters<Keymaster["newWalletInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().newWalletInternal(...args);
  }

  public static async recoverWallet(
    ...args: Parameters<Keymaster["recoverWalletInternal"]>
  ) {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().recoverWalletInternal(...args);
  }

  private static getInstance(): Keymaster {
    if (!Keymaster.instance) {
      throw new Error(
        "Keymaster not initialized. Call Keymaster.initialize() first."
      );
    }
    return Keymaster.instance;
  }

  // -------- Internal instance methods (originals renamed with Internal) -------

  private async ensureServiceIsRunning() {
    if (!(await this.serviceRunning())) {
      throw new Error("Keymaster service not running");
    }
  }

  private async startInternal(): Promise<boolean> {
    if (this.config.gatekeeperConfig) {
      this.serviceStarted = await this.startIntegratedKeymaster();
    } else {
      throw "Missing Gatekeeper config";
    }
    return this.serviceStarted;
  }

  private async startIntegratedKeymaster(): Promise<boolean> {
    console.log(`Starting integrated Keymaster service`);

    try {
      if (this.config.walletDb) {
        const gatekeeper = new GatekeeperClient();
        await gatekeeper.connect(this.config.gatekeeperConfig);

        const cipher = new CipherNode();

        this.keymasterService = new KeymasterLib({
          gatekeeper,
          wallet: this.config.walletDb,
          cipher,
        });

        await this.ensureWalletExists();
      } else {
        return false;
      }
    } catch (e) {
      console.error("Error starting Keymaster service:", e);
      return false;
    }

    console.log(`Started integrated Keymaster service`);
    return true;
  }

  private async createChallengeInternal(
    spec: CreateChallengeSpec,
    options?: CreateAssetOptions
  ): Promise<CreateChallengeResponse> {
    await this.ensureServiceIsRunning();
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
    await this.ensureServiceIsRunning();
    return this.keymasterService.bindCredential(schemaId, subjectId, options);
  }

  private async issueCredentialInternal(
    credential: Partial<VerifiableCredential>,
    options: IssueCredentialsOptions = {}
  ): Promise<string> {
    await this.ensureServiceIsRunning();
    return this.keymasterService.issueCredential(credential, options);
  }

  private async publishCredentialInternal(
    did: string,
    options: { reveal?: boolean } = {}
  ): Promise<VerifiableCredential> {
    await this.ensureServiceIsRunning();
    return this.keymasterService.publishCredential(did, options);
  }

  private async acceptCredentialInternal(did: string): Promise<boolean> {
    await this.ensureServiceIsRunning();
    return this.keymasterService.acceptCredential(did);
  }

  private async showMnemonicInternal(): Promise<string> {
    await this.ensureServiceIsRunning();
    return this.keymasterService.decryptMnemonic();
  }

  private async verifyResponseInternal(
    did: string,
    options?: { retries?: number; delay?: number }
  ): Promise<ChallengeResponse> {
    await this.ensureServiceIsRunning();
    return this.keymasterService.verifyResponse(did, options);
  }

  private async decryptMessageInternal(
    ...args: Parameters<KeymasterLib["decryptMessage"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.decryptMessage(...args);
  }

  private async decryptMnemonicInternal(
    ...args: Parameters<KeymasterLib["decryptMnemonic"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.decryptMnemonic(...args);
  }

  private async getCredentialInternal(
    ...args: Parameters<KeymasterLib["getCredential"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.getCredential(...args);
  }

  private async removeCredentialInternal(
    ...args: Parameters<KeymasterLib["removeCredential"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.removeCredential(...args);
  }

  private async updateCredentialInternal(
    ...args: Parameters<KeymasterLib["updateCredential"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.updateCredential(...args);
  }

  private async createIdInternal(
    ...args: Parameters<KeymasterLib["createId"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.createId(...args);
  }

  private async removeIdInternal(
    ...args: Parameters<KeymasterLib["removeId"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.removeId(...args);
  }

  private async resolveDIDInternal(
    ...args: Parameters<KeymasterLib["resolveDID"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.resolveDID(...args);
  }

  private async setCurrentIdInternal(
    ...args: Parameters<KeymasterLib["setCurrentId"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.setCurrentId(...args);
  }

  private async createSchemaInternal(
    ...args: Parameters<KeymasterLib["createSchema"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.createSchema(...args);
  }

  private async newWalletInternal(
    ...args: Parameters<KeymasterLib["newWallet"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.newWallet(...args);
  }

  private async recoverWalletInternal(
    ...args: Parameters<KeymasterLib["recoverWallet"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.recoverWallet(...args);
  }

  private async ensureWalletExists(): Promise<void> {
    console.log("Ensuring wallet exists");
    const existing: StoredWallet | null =
      (await this.config?.walletDb?.loadWallet()) || null;
    if (existing && "current" in existing) {
      console.log(`Using existing wallet with ID ${existing.current}`);
      return;
    }

    const walletConfig = this.config.walletConfig;
    console.log(`Creating wallet with ID ${walletConfig?.id}`);
    if (walletConfig?.mnemonic) {
      await this.keymasterService.newWallet(walletConfig.mnemonic, true);
    }

    if (walletConfig?.id) {
      const did = await this.keymasterService.createId(walletConfig.id, {
        registry: walletConfig.registry,
      });
      console.log("Did ", did);
      console.log(`Created wallet with ID ${walletConfig.id}`);
    }
  }

  private async serviceRunning(): Promise<boolean> {
    return this.serviceStarted || (await this.startInternal());
  }

  private validateConfig(config: KeymasterConfig): void {
    if (!config.gatekeeperConfig) {
      throw new Error("Missing Gatekeeper config");
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
