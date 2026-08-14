import KeymasterClient from "@mdip/keymaster/client";
import {
  ChallengeResponse,
  CreateAssetOptions,
  IssueCredentialsOptions,
  PublishChallengeReceiptOptions,
  VerifiableCredential,
} from "@mdip/keymaster";
import {
  CreateChallengeResponse,
  CreateChallengeSpec,
  SdkConfig,
} from "./types/index.js";

export interface KeymasterConfig {
  keymasterConfig?: SdkConfig;
  didPrefix?: string;
}

export class KeymasterExternalClient {
  private config: KeymasterConfig;
  private keymasterService!: KeymasterClient;
  private serviceStarted = false;

  constructor(config: KeymasterConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  public async start(): Promise<boolean> {
    if (this.config.keymasterConfig) {
      this.serviceStarted = await this.startExternalKeymaster();
    } else {
      throw "Missing Keymaster config";
    }
    return this.serviceStarted;
  }

  public async startExternal(): Promise<boolean> {
    if (this.config.keymasterConfig) {
      this.serviceStarted = await this.startExternalKeymaster();
    } else {
      throw "Missing Gatekeeper or Keymaster config";
    }
    return this.serviceStarted;
  }

  private async startExternalKeymaster(): Promise<boolean> {
    try {
      this.keymasterService = new KeymasterClient();
      await this.keymasterService.connect(this.config.keymasterConfig);
    } catch (e) {
      console.error(`Error starting Keymaster service:`, e);
      return false;
    }

    return true;
  }

  async createChallenge(
    spec: CreateChallengeSpec,
    options?: CreateAssetOptions
  ): Promise<CreateChallengeResponse> {
    if (!this.serviceRunning()) {
      throw new Error("Keymaster service not running");
    }
    const challenge: string = await this.keymasterService?.createChallenge(
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
  ): Promise<boolean> {
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
    options?: {
      retries?: number;
      delay?: number;
    }
  ): Promise<ChallengeResponse> {
    if (!this.serviceRunning()) {
      throw new Error("Keymaster service not running");
    }
    const response: ChallengeResponse =
      await this.keymasterService.verifyResponse(did, options);
    return response;
  }

  async publishReceipt(
    responseDID: string,
    options?: PublishChallengeReceiptOptions
  ): Promise<string[]> {
    if (!this.serviceRunning()) {
      throw new Error("Keymaster service not running");
    }
    return this.keymasterService.publishChallengeReceipts(responseDID, options);
  }

  private async serviceRunning(): Promise<boolean> {
    return this.serviceStarted || (await this.start());
  }

  private validateConfig(config: KeymasterConfig): void {
    if (!config.keymasterConfig) {
      throw new Error("Missing Keymaster config");
    }

    if (!config.didPrefix) {
      throw new Error("Missing didPrefix config");
    }
  }
}
