// Imports
import CipherNode from "@mdip/cipher";
import {
  ChallengeResponse,
  CreateAssetOptions,
  CreateResponseOptions,
  IssueCredentialsOptions,
  VerifiableCredential,
  WalletBase,
  WalletFile,
} from "@mdip/keymaster";

import {
  GatekeeperClient,
  MdipDocument,
  ResolveDIDOptions,
} from "@mdip/gatekeeper";
import {
  CreateChallengeResponse,
  CreateChallengeSpec,
  SdkConfig,
} from "./types/index.js";
import KeymasterModule from "@mdip/keymaster";

// @ts-ignore
const Keymaster = KeymasterModule?.default || KeymasterModule;

// Keymaster configuration interface
export interface KeymasterConfig {
  gatekeeperConfig?: SdkConfig;
  walletDb?: WalletBase;
  cipher?: CipherNode;
}
export class KeymasterReactNative {
  private static instance: KeymasterReactNative | null = null;
  private config: KeymasterConfig;
  private keymasterService!: typeof Keymaster;

  private constructor(config: KeymasterConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  // Initializes the instance if not already initialized
  /**
   * Initializes the KeymasterReactNative instance.
   * @param config The configuration object for the Keymaster service.
   */
  public static initialize(config: KeymasterConfig): void {
    if (!KeymasterReactNative.instance) {
      KeymasterReactNative.instance = new KeymasterReactNative(config);
    } else {
      console.warn(
        "KeymasterReactNative already initialized, ignoring re-initialization."
      );
    }
  }

  // Ensures the instance is initialized
  private ensureInitialized(): void {
    if (!KeymasterReactNative.instance) {
      throw new Error(
        "KeymasterReactNative not initialized. Call KeymasterReactNative.initialize() first."
      );
    }
  }

  /**
   * Starts the KeymasterReactNative service.
   * @returns A boolean indicating whether the service was started successfully.
   */
  public static async start(): Promise<boolean> {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().startInternal();
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().createChallengeInternal(
      spec,
      options
    );
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().bindCredentialInternal(
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().createResponseInternal(
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().backupWalletInternal(registry);
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().issueCredentialInternal(
      credential,
      options
    );
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().publishCredentialInternal(
      did,
      options
    );
  }

  // Accept a credential
  /**
   * Accepts a credential.
   * @param did The DID of the credential to accept.
   * @returns A promise indicating whether the credential was successfully accepted.
   */
  public static async acceptCredential(did: string): Promise<boolean> {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().acceptCredentialInternal(did);
  }

  // Show mnemonic
  /**
   * Shows the mnemonic for the wallet.
   * @returns A promise with the mnemonic string.
   */
  public static async showMnemonic(): Promise<string> {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().showMnemonicInternal();
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().verifyResponseInternal(
      did,
      options
    );
  }

  // Decrypt a message
  /**
   * Decrypts a message using the current key.
   * @param did The DID of the message to decrypt.
   * @returns A promise with the decrypted message.
   */
  public static async decryptMessage(did: string): Promise<string> {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().decryptMessageInternal(did);
  }

  // Decrypt mnemonic
  /**
   * Decrypts the mnemonic for the wallet.
   * @returns A promise with the decrypted mnemonic.
   */
  public static async decryptMnemonic(): Promise<string> {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().decryptMnemonicInternal();
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().getCredentialInternal(id);
  }

  // Remove a credential
  /**
   * Removes a verifiable credential.
   * @param id The credential ID to remove.
   * @returns A promise indicating success or failure of the operation.
   */
  public static async removeCredential(id: string): Promise<boolean> {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().removeCredentialInternal(id);
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().updateCredentialInternal(
      did,
      credential
    );
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().createIdInternal(name, options);
  }

  // Remove an ID
  /**
   * Removes an existing DID.
   * @param name The name of the DID to remove.
   * @returns A promise indicating success or failure of the operation.
   */
  public static async removeId(name: string): Promise<boolean> {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().removeIdInternal(name);
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().resolveDIDInternal(did, options);
  }

  // Set the current DID
  /**
   * Sets the current DID in use.
   * @param name The DID name to set as the current one.
   * @returns A promise indicating success or failure of the operation.
   */
  public static async setCurrentId(name: string): Promise<boolean> {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().setCurrentIdInternal(name);
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().createSchemaInternal(
      schema,
      options
    );
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
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().newWalletInternal(
      mnemonic,
      overwrite
    );
  }

  // Recover an existing wallet
  /**
   * Recovers a wallet from a backup.
   * @param did The DID to use for recovery (optional).
   * @returns A promise with the wallet recovery result.
   */
  public static async recoverWallet(did?: string): Promise<WalletFile> {
    KeymasterReactNative.getInstance().ensureInitialized();
    return KeymasterReactNative.getInstance().recoverWalletInternal(did);
  }

  // Helper method to retrieve the instance
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
      if (this.config.walletDb && this.config.cipher) {
        const gatekeeper = new GatekeeperClient();
        await gatekeeper.connect({
          url: this.config.gatekeeperConfig?.url,
          waitUntilReady: this.config.gatekeeperConfig?.waitUntilReady,
          intervalSeconds: this.config.gatekeeperConfig?.intervalSeconds,
          chatty: this.config.gatekeeperConfig?.chatty,
        });
        this.keymasterService = new Keymaster({
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
    ...args: Parameters<(typeof Keymaster)["bindCredential"]>
  ) {
    return this.keymasterService.bindCredential(...args);
  }

  private async createResponseInternal(
    ...args: Parameters<(typeof Keymaster)["createResponse"]>
  ) {
    return this.keymasterService.createResponse(...args);
  }

  private async backupWalletInternal(registry?: string): Promise<string> {
    return this.keymasterService.backupWallet(registry);
  }

  private async issueCredentialInternal(
    ...args: Parameters<(typeof Keymaster)["issueCredential"]>
  ) {
    return this.keymasterService.issueCredential(...args);
  }

  private async publishCredentialInternal(
    ...args: Parameters<(typeof Keymaster)["publishCredential"]>
  ) {
    return this.keymasterService.publishCredential(...args);
  }

  private async acceptCredentialInternal(
    ...args: Parameters<(typeof Keymaster)["acceptCredential"]>
  ) {
    return this.keymasterService.acceptCredential(...args);
  }

  private async showMnemonicInternal(): Promise<string> {
    return this.keymasterService.decryptMnemonic();
  }

  private async verifyResponseInternal(
    ...args: Parameters<(typeof Keymaster)["verifyResponse"]>
  ) {
    return this.keymasterService.verifyResponse(...args);
  }

  private async decryptMessageInternal(
    ...args: Parameters<(typeof Keymaster)["decryptMessage"]>
  ) {
    return this.keymasterService.decryptMessage(...args);
  }

  private async decryptMnemonicInternal() {
    return this.keymasterService.decryptMnemonic();
  }

  private async getCredentialInternal(
    ...args: Parameters<(typeof Keymaster)["getCredential"]>
  ) {
    return this.keymasterService.getCredential(...args);
  }

  private async removeCredentialInternal(
    ...args: Parameters<(typeof Keymaster)["removeCredential"]>
  ) {
    return this.keymasterService.removeCredential(...args);
  }

  private async updateCredentialInternal(
    ...args: Parameters<(typeof Keymaster)["updateCredential"]>
  ) {
    return this.keymasterService.updateCredential(...args);
  }

  private async createIdInternal(
    ...args: Parameters<(typeof Keymaster)["createId"]>
  ) {
    return this.keymasterService.createId(...args);
  }

  private async removeIdInternal(
    ...args: Parameters<(typeof Keymaster)["removeId"]>
  ) {
    return this.keymasterService.removeId(...args);
  }

  private async resolveDIDInternal(
    ...args: Parameters<(typeof Keymaster)["resolveDID"]>
  ) {
    return this.keymasterService.resolveDID(...args);
  }

  private async setCurrentIdInternal(
    ...args: Parameters<(typeof Keymaster)["setCurrentId"]>
  ) {
    return this.keymasterService.setCurrentId(...args);
  }

  private async createSchemaInternal(
    ...args: Parameters<(typeof Keymaster)["createSchema"]>
  ) {
    return this.keymasterService.createSchema(...args);
  }

  private async newWalletInternal(
    ...args: Parameters<(typeof Keymaster)["newWallet"]>
  ) {
    return this.keymasterService.newWallet(...args);
  }

  private async recoverWalletInternal(
    ...args: Parameters<(typeof Keymaster)["recoverWallet"]>
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
