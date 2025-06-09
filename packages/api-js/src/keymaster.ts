// Imports
import { default as GatekeeperClient } from "@mdip/gatekeeper/client";
import { default as CipherNode } from "@mdip/cipher/node";
import { default as KeymasterLib } from "@mdip/keymaster";
import {
  CreateChallengeResponse,
  CreateChallengeSpec,
  SdkConfig,
  WalletConfig,
} from "./types/index.js";
import {
  ChallengeResponse,
  CreateAssetOptions,
  CreateResponseOptions,
  IssueCredentialsOptions,
  StoredWallet,
  VerifiableCredential,
  WalletBase,
  WalletFile,
} from "@mdip/keymaster/types";
import { MdipDocument, ResolveDIDOptions } from "@mdip/gatekeeper";

// Keymaster configuration interface
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

  // Initializes the instance if not already initialized
  /**
   * Initializes the Keymaster instance.
   * @param config The configuration object for the Keymaster service.
   */
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

  // Ensures the instance is initialized
  private ensureInitialized() {
    if (!Keymaster.instance) {
      throw new Error(
        "Keymaster not initialized. Call Keymaster.initialize() first."
      );
    }
  }

  /**
   * Starts the Keymaster service.
   * @returns A boolean indicating whether the service was started successfully.
   */
  public static async start() {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().startInternal();
  }

  // Method to create a challenge
  /**
   * Creates a challenge for the user to solve.
   * @param spec The challenge specifications.
   * @param options Additional options for creating the challenge (optional).
   * @returns A promise with the challenge response, including the challenge and its callback URL.
   */
  public static async createChallenge(
    spec: CreateChallengeSpec,
    options?: CreateAssetOptions
  ): Promise<CreateChallengeResponse> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().createChallengeInternal(spec, options);
  }

  // Method to bind a credential to a user
  /**
   * Binds a credential to a subject.
   * @param schemaId The schema ID for the credential.
   * @param subjectId The subject's DID (Decentralized Identifier).
   * @param options Optional options, such as validity period and credential data.
   * @returns A promise with the verifiable credential that was bound.
   */
  public static async bindCredential(
    schemaId: string,
    subjectId: string,
    options?: {
      validFrom?: string;
      validUntil?: string;
      credential?: Record<string, unknown>;
    }
  ): Promise<VerifiableCredential> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().bindCredentialInternal(
      schemaId,
      subjectId,
      options
    );
  }

  // Method to create a response
  /**
   * Creates a response for the challenge.
   * @param challengeDID The DID of the challenge to respond to.
   * @param options Optional options for creating the response (optional).
   * @returns A promise with the response string.
   */
  public static async createResponse(
    challengeDID: string,
    options?: CreateResponseOptions
  ): Promise<string> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().createResponseInternal(
      challengeDID,
      options
    );
  }

  // Backup wallet
  /**
   * Backups the wallet data.
   * @param registry Optional registry URL for the wallet backup.
   * @returns A promise with a backup string (e.g., backup URL).
   */
  public static async backupWallet(registry?: string): Promise<string> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().backupWalletInternal(registry);
  }

  // Issue credential to a user
  /**
   * Issues a credential to the subject.
   * @param credential The credential to be issued.
   * @param options Optional parameters for issuing the credential.
   * @returns A promise with the credential ID or issuance result.
   */
  public static async issueCredential(
    credential: Partial<VerifiableCredential>,
    options?: IssueCredentialsOptions
  ): Promise<string> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().issueCredentialInternal(credential, options);
  }

  // Publish a credential
  /**
   * Publishes a verifiable credential.
   * @param did The DID of the credential.
   * @param options Optional parameters, such as whether to reveal the credential.
   * @returns A promise with the published credential.
   */
  public static async publishCredential(
    did: string,
    options?: {
      reveal?: boolean;
    }
  ): Promise<VerifiableCredential> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().publishCredentialInternal(did, options);
  }

  // Accept a credential
  /**
   * Accepts a credential.
   * @param did The DID of the credential to accept.
   * @returns A promise indicating whether the credential was successfully accepted.
   */
  public static async acceptCredential(did: string): Promise<boolean> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().acceptCredentialInternal(did);
  }

  // Show mnemonic
  /**
   * Shows the mnemonic for the wallet.
   * @returns A promise with the mnemonic string.
   */
  public static async showMnemonic(): Promise<string> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().showMnemonicInternal();
  }

  // Verify a challenge response
  /**
   * Verifies a response to a challenge.
   * @param did The DID to verify the response for.
   * @param options Optional options, such as retry behavior.
   * @returns A promise with the response verification result.
   */
  public static async verifyResponse(
    did: string,
    options?: { retries?: number; delay?: number }
  ): Promise<ChallengeResponse> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().verifyResponseInternal(did, options);
  }

  // Decrypt a message
  /**
   * Decrypts a message using the current key.
   * @param did The DID of the message to decrypt.
   * @returns A promise with the decrypted message.
   */
  public static async decryptMessage(did: string): Promise<string> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().decryptMessageInternal(did);
  }

  // Decrypt mnemonic
  /**
   * Decrypts the mnemonic for the wallet.
   * @returns A promise with the decrypted mnemonic.
   */
  public static async decryptMnemonic(): Promise<string> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().decryptMnemonicInternal();
  }

  // Get a credential
  /**
   * Retrieves a verifiable credential.
   * @param id The credential ID to retrieve.
   * @returns A promise with the credential data or null if not found.
   */
  public static async getCredential(
    id: string
  ): Promise<VerifiableCredential | null> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().getCredentialInternal(id);
  }

  // Remove a credential
  /**
   * Removes a verifiable credential.
   * @param id The credential ID to remove.
   * @returns A promise indicating success or failure of the operation.
   */
  public static async removeCredential(id: string): Promise<boolean> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().removeCredentialInternal(id);
  }

  // Update a credential
  /**
   * Updates a verifiable credential.
   * @param did The DID of the credential to update.
   * @param credential The new credential data.
   * @returns A promise indicating success or failure of the update operation.
   */
  public static async updateCredential(
    did: string,
    credential: VerifiableCredential
  ): Promise<boolean> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().updateCredentialInternal(did, credential);
  }

  // Method to create an ID
  /**
   * Creates a new DID (Decentralized Identifier).
   * @param name The name for the DID.
   * @param options Optional options, such as registry URL.
   * @returns A promise with the newly created DID.
   */
  public static async createId(
    name: string,
    options?: {
      registry?: string;
    }
  ): Promise<string> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().createIdInternal(name, options);
  }

  // Remove an ID
  /**
   * Removes an existing DID.
   * @param name The name of the DID to remove.
   * @returns A promise indicating success or failure of the operation.
   */
  public static async removeId(name: string): Promise<boolean> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().removeIdInternal(name);
  }

  // Resolve a DID
  /**
   * Resolves a DID to fetch associated data.
   * @param did The DID to resolve.
   * @param options Optional parameters for resolving the DID.
   * @returns A promise with the resolved DID data.
   */
  public static async resolveDID(
    did: string,
    options?: ResolveDIDOptions
  ): Promise<MdipDocument> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().resolveDIDInternal(did, options);
  }

  // Set the current DID
  /**
   * Sets the current DID in use.
   * @param name The DID name to set as the current one.
   * @returns A promise indicating success or failure of the operation.
   */
  public static async setCurrentId(name: string): Promise<boolean> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().setCurrentIdInternal(name);
  }

  // Create a schema
  /**
   * Creates a new schema for credentials.
   * @param schema The schema data to create.
   * @param options Optional options for creating the schema.
   * @returns A promise with the created schema data.
   */
  public static async createSchema(
    schema?: unknown,
    options?: CreateAssetOptions
  ): Promise<string> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().createSchemaInternal(schema, options);
  }

  // Update a schema
  /**
   * Updates an schema for credentials given a schemaDID.
   * @param id The ID of the schema to update.
   * @param schema The schema data to update.
   * @returns A promise with a boolean.
   */
  public static async updateSchema(
    id: string,
    schema?: unknown
  ): Promise<boolean> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().setSchemaInternal(id, schema);
  }

  // Create a new wallet
  /**
   * Creates a new wallet.
   * @param mnemonic Optional mnemonic to initialize the wallet.
   * @param overwrite Optional flag to overwrite the existing wallet.
   * @returns A promise with the wallet creation result.
   */
  public static async newWallet(
    mnemonic?: string,
    overwrite?: boolean
  ): Promise<WalletFile> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().newWalletInternal(mnemonic, overwrite);
  }

  // Recover an existing wallet
  /**
   * Recovers a wallet from a backup.
   * @param did The DID to use for recovery (optional).
   * @returns A promise with the wallet recovery result.
   */
  public static async recoverWallet(did?: string): Promise<WalletFile> {
    Keymaster.getInstance().ensureInitialized();
    return Keymaster.getInstance().recoverWalletInternal(did);
  }

  // Helper method to retrieve the instance
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
    try {
      if (this.config.walletDb) {
        const gatekeeper = await GatekeeperClient.create({
          url: this.config.gatekeeperConfig?.url,
          waitUntilReady: this.config.gatekeeperConfig?.waitUntilReady,
          intervalSeconds: this.config.gatekeeperConfig?.intervalSeconds,
          chatty: this.config.gatekeeperConfig?.chatty,
        });

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

    console.log("✅ Keymaster Started");
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

  private async createResponseInternal(
    challengeDID: string,
    options?: CreateResponseOptions
  ): Promise<string> {
    await this.ensureServiceIsRunning();
    return this.keymasterService.createResponse(challengeDID, options);
  }

  private async backupWalletInternal(registry?: string): Promise<string> {
    await this.ensureServiceIsRunning();
    return this.keymasterService.backupWallet(registry);
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

  private async setSchemaInternal(
    ...args: Parameters<KeymasterLib["setSchema"]>
  ) {
    await this.ensureServiceIsRunning();
    return this.keymasterService.setSchema(...args);
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
    const existing: StoredWallet | null =
      (await this.config?.walletDb?.loadWallet()) || null;
    if (existing && "current" in existing) {
      console.log(`Using existing wallet with ID ${existing.current}`);
      return;
    }

    const walletConfig = this.config.walletConfig;
    if (walletConfig?.mnemonic) {
      await this.keymasterService.newWallet(walletConfig.mnemonic, true);
    }

    if (walletConfig?.id) {
      await this.keymasterService.createId(walletConfig.id, {
        registry: walletConfig.registry,
      });
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
