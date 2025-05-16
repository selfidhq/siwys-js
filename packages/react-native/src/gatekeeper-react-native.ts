import { SdkConfig } from "./types/index.js";
const GatekeeperClient = require("@mdip/gatekeeper/client").default;
import { GetDIDOptions, MdipDocument } from "@mdip/gatekeeper/types";

export class GatekeeperReactNative {
  private static instance: GatekeeperReactNative | null = null;

  private config: SdkConfig;
  private gatekeeperClient!: typeof GatekeeperClient;

  private constructor(config: SdkConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  public static initialize(config: SdkConfig) {
    if (!GatekeeperReactNative.instance) {
      GatekeeperReactNative.instance = new GatekeeperReactNative(config);
    } else {
      console.warn(
        "GatekeeperReactNative already initialized, ignoring re-initialization."
      );
    }
  }

  private ensureInitialized() {
    if (!GatekeeperReactNative.instance) {
      throw new Error(
        "GatekeeperReactNative not initialized. Call GatekeeperReactNative.initialize() first."
      );
    }
  }

  // Delegated STATIC methods

  public static async start() {
    GatekeeperReactNative.getInstance().ensureInitialized();
    return GatekeeperReactNative.getInstance().startInternal();
  }

  public static async getDIDs(
    ...args: Parameters<GatekeeperReactNative["getDIDsInternal"]>
  ) {
    GatekeeperReactNative.getInstance().ensureInitialized();
    return GatekeeperReactNative.getInstance().getDIDsInternal(...args);
  }

  private static getInstance(): GatekeeperReactNative {
    if (!GatekeeperReactNative.instance) {
      throw new Error(
        "GatekeeperReactNative not initialized. Call GatekeeperReactNative.initialize() first."
      );
    }
    return GatekeeperReactNative.instance;
  }

  // -------- Internal instance methods (originals renamed with Internal) -------

  private async startInternal(): Promise<boolean> {
    if (this.config) {
      return await this.startIntegratedGatekeeper();
    } else {
      throw "Missing Gatekeeper config";
    }
  }

  private async startIntegratedGatekeeper(): Promise<boolean> {
    try {
      this.gatekeeperClient = await GatekeeperClient.create({
        url: this.config?.url,
        waitUntilReady: this.config?.waitUntilReady,
        intervalSeconds: this.config?.intervalSeconds,
        chatty: this.config?.chatty,
      });
    } catch (e) {
      console.error("Error starting GatekeeperReactNative service:", e);
      return false;
    }
    return true;
  }

  private async getDIDsInternal({
    dids,
    resolve,
  }: GetDIDOptions): Promise<string[] | MdipDocument[]> {
    const response = await this.gatekeeperClient.getDIDs({ dids, resolve });
    return response.data;
  }

  private validateConfig(config: SdkConfig): void {
    if (!config) {
      throw new Error("Missing Gatekeeper config");
    }
  }
}
