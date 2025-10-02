import {
  GatekeeperClient as GatekeeperClientMdip,
  MdipDocument,
  GetDIDOptions,
  VerifyDbResult,
  GetStatusResult,
  Operation,
  ResolveDIDOptions,
  GatekeeperEvent,
  ImportBatchResult,
  ProcessEventsResult,
  BlockId,
  BlockInfo,
  GatekeeperClientOptions,
} from "@mdip/gatekeeper";

export class GatekeeperClient {
  private static instance: GatekeeperClient | null = null;

  private config: GatekeeperClientOptions;
  private gatekeeperClient!: GatekeeperClientMdip;

  private constructor(config: GatekeeperClientOptions) {
    this.validateConfig(config);
    this.config = config;
  }

  public static initialize(config: GatekeeperClientOptions) {
    if (!GatekeeperClient.instance) {
      GatekeeperClient.instance = new GatekeeperClient(config);
    } else {
      console.warn(
        "GatekeeperClient already initialized, ignoring re-initialization."
      );
    }
  }

  private ensureInitialized() {
    if (!GatekeeperClient.instance) {
      throw new Error(
        "GatekeeperClient not initialized. Call GatekeeperClient.initialize() first."
      );
    }
  }

  // Delegated STATIC methods

  public static async start() {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().startInternal();
  }

  public static addCustomHeader(header: string, value: string): void {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addCustomHeaderInternal(
      header,
      value
    );
  }

  public static removeCustomHeader(header: string): void {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().removeCustomHeaderInternal(header);
  }

  public static async listRegistries(): Promise<string[]> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().listRegistriesInternal();
  }

  public static async resetDb(): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().resetDbInternal();
  }

  public static async verifyDb(): Promise<VerifyDbResult> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().verifyDbInternal();
  }

  public static async isReady(): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().isReadyInternal();
  }

  public static async getVersion(): Promise<number> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getVersionInternal();
  }

  public static async getStatus(): Promise<GetStatusResult> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getStatusInternal();
  }

  public static async createDID(operation: Operation): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().createDIDInternal(operation);
  }

  public static async resolveDID(
    did: string,
    options?: ResolveDIDOptions
  ): Promise<MdipDocument> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().resolveDIDInternal(did, options);
  }

  public static async updateDID(operation: Operation): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().updateDIDInternal(operation);
  }

  public static async deleteDID(operation: Operation): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().deleteDIDInternal(operation);
  }

  public static async getDIDs({
    dids,
    resolve,
  }: GetDIDOptions): Promise<string[] | MdipDocument[]> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getDIDsInternal({ dids, resolve });
  }

  public static async exportDIDs(
    dids?: string[]
  ): Promise<GatekeeperEvent[][]> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().exportDIDsInternal(dids);
  }

  public static async importDIDs(
    dids: GatekeeperEvent[][]
  ): Promise<ImportBatchResult> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().importDIDsInternal(dids);
  }

  public static async exportBatch(dids?: string[]): Promise<GatekeeperEvent[]> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().exportBatchInternal(dids);
  }

  public static async importBatch(
    batch: GatekeeperEvent[]
  ): Promise<ImportBatchResult> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().importBatchInternal(batch);
  }

  public static async removeDIDs(dids: string[]): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().removeDIDsInternal(dids);
  }

  public static async getQueue(registry: string): Promise<Operation[]> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getQueueInternal(registry);
  }

  public static async clearQueue(
    registry: string,
    events: Operation[]
  ): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().clearQueueInternal(registry, events);
  }

  public static async processEvents(): Promise<ProcessEventsResult> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().processEventsInternal();
  }

  public static async addJSON(data: object): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addJSONInternal(data);
  }

  public static async getJSON(cid: string): Promise<object> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getJSONInternal(cid);
  }

  public static async addText(data: string): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addTextInternal(data);
  }

  public static async getText(cid: string): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getTextInternal(cid);
  }

  public static async addData(data: Buffer): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addDataInternal(data);
  }

  public static async getData(
    ...args: Parameters<GatekeeperClient["getDataInternal"]>
  ): Promise<Buffer> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getDataInternal(...args);
  }

  public static async getBlock(cid: string): Promise<BlockInfo | null> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getBlockInternal(cid);
  }

  public static async addBlock(
    registry: string,
    block: BlockInfo
  ): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addBlockInternal(registry, block);
  }

  private static getInstance(): GatekeeperClient {
    if (!GatekeeperClient.instance) {
      throw new Error(
        "GatekeeperClient not initialized. Call GatekeeperClient.initialize() first."
      );
    }
    return GatekeeperClient.instance;
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
      this.gatekeeperClient = new GatekeeperClientMdip();
      await this.gatekeeperClient.connect({
        ...this.config,
      });
    } catch (e) {
      console.error("Error starting GatekeeperClient service:", e);
      return false;
    }
    return true;
  }

  private addCustomHeaderInternal(header: string, value: string): void {
    this.gatekeeperClient.addCustomHeader(header, value);
  }

  private removeCustomHeaderInternal(header: string): void {
    this.gatekeeperClient.removeCustomHeader(header);
  }

  private async listRegistriesInternal(): Promise<string[]> {
    return await this.gatekeeperClient.listRegistries();
  }

  private async resetDbInternal(): Promise<boolean> {
    return await this.gatekeeperClient.resetDb();
  }

  private async verifyDbInternal(): Promise<VerifyDbResult> {
    return await this.gatekeeperClient.verifyDb();
  }

  private async isReadyInternal(): Promise<boolean> {
    return await this.gatekeeperClient.isReady();
  }

  private async getVersionInternal(): Promise<number> {
    return await this.gatekeeperClient.getVersion();
  }

  private async getStatusInternal(): Promise<GetStatusResult> {
    return await this.gatekeeperClient.getStatus();
  }

  private async createDIDInternal(operation: Operation): Promise<string> {
    return await this.gatekeeperClient.createDID(operation);
  }

  private async resolveDIDInternal(
    did: string,
    options?: ResolveDIDOptions
  ): Promise<MdipDocument> {
    return await this.gatekeeperClient.resolveDID(did, options);
  }

  private async updateDIDInternal(operation: Operation): Promise<boolean> {
    return await this.gatekeeperClient.updateDID(operation);
  }

  private async deleteDIDInternal(operation: Operation): Promise<boolean> {
    return await this.gatekeeperClient.deleteDID(operation);
  }

  private async getDIDsInternal({
    dids,
    resolve,
  }: GetDIDOptions): Promise<string[] | MdipDocument[]> {
    return await this.gatekeeperClient.getDIDs({ dids, resolve });
  }

  private async exportDIDsInternal(
    dids?: string[]
  ): Promise<GatekeeperEvent[][]> {
    return await this.gatekeeperClient.exportDIDs(dids);
  }

  private async importDIDsInternal(
    dids: GatekeeperEvent[][]
  ): Promise<ImportBatchResult> {
    return await this.gatekeeperClient.importDIDs(dids);
  }

  private async exportBatchInternal(
    dids?: string[]
  ): Promise<GatekeeperEvent[]> {
    return await this.gatekeeperClient.exportBatch(dids);
  }

  private async importBatchInternal(
    batch: GatekeeperEvent[]
  ): Promise<ImportBatchResult> {
    return await this.gatekeeperClient.importBatch(batch);
  }

  private async removeDIDsInternal(dids: string[]): Promise<boolean> {
    return await this.gatekeeperClient.removeDIDs(dids);
  }

  private async getQueueInternal(registry: string): Promise<Operation[]> {
    return await this.gatekeeperClient.getQueue(registry);
  }

  private async clearQueueInternal(
    registry: string,
    events: Operation[]
  ): Promise<boolean> {
    return await this.gatekeeperClient.clearQueue(registry, events);
  }

  private async processEventsInternal(): Promise<ProcessEventsResult> {
    return await this.gatekeeperClient.processEvents();
  }

  private async addJSONInternal(data: object): Promise<string> {
    return await this.gatekeeperClient.addJSON(data);
  }

  private async getJSONInternal(cid: string): Promise<object> {
    return await this.gatekeeperClient.getJSON(cid);
  }

  private async addTextInternal(data: string): Promise<string> {
    return await this.gatekeeperClient.addText(data);
  }

  private async getTextInternal(cid: string): Promise<string> {
    return await this.gatekeeperClient.getText(cid);
  }

  private async addDataInternal(data: Buffer): Promise<string> {
    return await this.gatekeeperClient.addData(data);
  }

  private async getDataInternal(cid: string): Promise<Buffer> {
    return await this.gatekeeperClient.getData(cid);
  }

  private async getBlockInternal(
    registry: string,
    block?: BlockId
  ): Promise<BlockInfo | null> {
    return await this.gatekeeperClient.getBlock(registry, block);
  }

  private async addBlockInternal(
    registry: string,
    block: BlockInfo
  ): Promise<boolean> {
    return await this.gatekeeperClient.addBlock(registry, block);
  }

  private validateConfig(config: GatekeeperClientOptions): void {
    if (!config) {
      throw new Error("Missing Gatekeeper config");
    }
  }
}
