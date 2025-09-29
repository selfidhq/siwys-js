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

  public static addCustomHeader(
    ...args: Parameters<GatekeeperClient["addCustomHeaderInternal"]>
  ): void {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addCustomHeaderInternal(...args);
  }

  public static removeCustomHeader(
    ...args: Parameters<GatekeeperClient["removeCustomHeaderInternal"]>
  ): void {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().removeCustomHeaderInternal(...args);
  }

  public static async listRegistries(
    ...args: Parameters<GatekeeperClient["listRegistriesInternal"]>
  ) {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().listRegistriesInternal(...args);
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

  public static async createDID(
    ...args: Parameters<GatekeeperClient["createDIDInternal"]>
  ): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().createDIDInternal(...args);
  }

  public static async resolveDID(
    ...args: Parameters<GatekeeperClient["resolveDIDInternal"]>
  ): Promise<MdipDocument> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().resolveDIDInternal(...args);
  }

  public static async updateDID(
    ...args: Parameters<GatekeeperClient["updateDIDInternal"]>
  ): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().updateDIDInternal(...args);
  }

  public static async deleteDID(
    ...args: Parameters<GatekeeperClient["deleteDIDInternal"]>
  ): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().deleteDIDInternal(...args);
  }

  public static async getDIDs(
    ...args: Parameters<GatekeeperClient["getDIDsInternal"]>
  ): Promise<string[] | MdipDocument[]> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getDIDsInternal(...args);
  }

  public static async exportDIDs(
    ...args: Parameters<GatekeeperClient["exportDIDsInternal"]>
  ): Promise<GatekeeperEvent[][]> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().exportDIDsInternal(...args);
  }

  public static async importDIDs(
    ...args: Parameters<GatekeeperClient["importDIDsInternal"]>
  ): Promise<ImportBatchResult> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().importDIDsInternal(...args);
  }

  public static async exportBatch(
    ...args: Parameters<GatekeeperClient["exportBatchInternal"]>
  ): Promise<GatekeeperEvent[]> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().exportBatchInternal(...args);
  }

  public static async importBatch(
    ...args: Parameters<GatekeeperClient["importBatchInternal"]>
  ): Promise<ImportBatchResult> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().importBatchInternal(...args);
  }

  public static async removeDIDs(
    ...args: Parameters<GatekeeperClient["removeDIDsInternal"]>
  ): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().removeDIDsInternal(...args);
  }

  public static async getQueue(
    ...args: Parameters<GatekeeperClient["getQueueInternal"]>
  ): Promise<Operation[]> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getQueueInternal(...args);
  }

  public static async clearQueue(
    ...args: Parameters<GatekeeperClient["clearQueueInternal"]>
  ): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().clearQueueInternal(...args);
  }

  public static async processEvents(
    ...args: Parameters<GatekeeperClient["processEventsInternal"]>
  ): Promise<ProcessEventsResult> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().processEventsInternal(...args);
  }

  public static async addJSON(
    ...args: Parameters<GatekeeperClient["addJSONInternal"]>
  ): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addJSONInternal(...args);
  }

  public static async getJSON(
    ...args: Parameters<GatekeeperClient["getJSONInternal"]>
  ): Promise<object> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getJSONInternal(...args);
  }

  public static async addText(
    ...args: Parameters<GatekeeperClient["addTextInternal"]>
  ): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addTextInternal(...args);
  }

  public static async getText(
    ...args: Parameters<GatekeeperClient["getTextInternal"]>
  ): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getTextInternal(...args);
  }

  public static async addData(
    ...args: Parameters<GatekeeperClient["addDataInternal"]>
  ): Promise<string> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addDataInternal(...args);
  }

  public static async getData(
    ...args: Parameters<GatekeeperClient["getDataInternal"]>
  ): Promise<Buffer> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getDataInternal(...args);
  }

  public static async getBlock(
    ...args: Parameters<GatekeeperClient["getBlockInternal"]>
  ): Promise<BlockInfo | null> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().getBlockInternal(...args);
  }

  public static async addBlock(
    ...args: Parameters<GatekeeperClient["addBlockInternal"]>
  ): Promise<boolean> {
    GatekeeperClient.getInstance().ensureInitialized();
    return GatekeeperClient.getInstance().addBlockInternal(...args);
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
        url: this.config?.url,
        waitUntilReady: this.config?.waitUntilReady,
        intervalSeconds: this.config?.intervalSeconds,
        chatty: this.config?.chatty,
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
    const response = await this.gatekeeperClient.listRegistries();
    return response;
  }

  private async resetDbInternal(): Promise<boolean> {
    return this.gatekeeperClient.resetDb();
  }

  private async verifyDbInternal(): Promise<VerifyDbResult> {
    return this.gatekeeperClient.verifyDb();
  }

  private async isReadyInternal(): Promise<boolean> {
    return this.gatekeeperClient.isReady();
  }

  private async getVersionInternal(): Promise<number> {
    return this.gatekeeperClient.getVersion();
  }

  private async getStatusInternal(): Promise<GetStatusResult> {
    return this.gatekeeperClient.getStatus();
  }

  private async createDIDInternal(operation: Operation): Promise<string> {
    return this.gatekeeperClient.createDID(operation);
  }

  private async resolveDIDInternal(
    did: string,
    options?: ResolveDIDOptions
  ): Promise<MdipDocument> {
    const response = await this.gatekeeperClient.resolveDID(did, options);
    return response;
  }

  private async updateDIDInternal(operation: Operation): Promise<boolean> {
    return this.gatekeeperClient.updateDID(operation);
  }

  private async deleteDIDInternal(operation: Operation): Promise<boolean> {
    return this.gatekeeperClient.deleteDID(operation);
  }

  private async getDIDsInternal({
    dids,
    resolve,
  }: GetDIDOptions): Promise<string[] | MdipDocument[]> {
    const response = await this.gatekeeperClient.getDIDs({ dids, resolve });
    return response;
  }

  private async exportDIDsInternal(
    dids?: string[]
  ): Promise<GatekeeperEvent[][]> {
    return this.gatekeeperClient.exportDIDs(dids);
  }

  private async importDIDsInternal(
    dids: GatekeeperEvent[][]
  ): Promise<ImportBatchResult> {
    return this.gatekeeperClient.importDIDs(dids);
  }

  private async exportBatchInternal(
    dids?: string[]
  ): Promise<GatekeeperEvent[]> {
    return this.gatekeeperClient.exportBatch(dids);
  }

  private async importBatchInternal(
    batch: GatekeeperEvent[]
  ): Promise<ImportBatchResult> {
    return this.gatekeeperClient.importBatch(batch);
  }

  private async removeDIDsInternal(dids: string[]): Promise<boolean> {
    return this.gatekeeperClient.removeDIDs(dids);
  }

  private async getQueueInternal(registry: string): Promise<Operation[]> {
    return this.gatekeeperClient.getQueue(registry);
  }

  private async clearQueueInternal(
    registry: string,
    events: Operation[]
  ): Promise<boolean> {
    return this.gatekeeperClient.clearQueue(registry, events);
  }

  private async processEventsInternal(): Promise<ProcessEventsResult> {
    return this.gatekeeperClient.processEvents();
  }

  private async addJSONInternal(data: object): Promise<string> {
    return this.gatekeeperClient.addJSON(data);
  }

  private async getJSONInternal(cid: string): Promise<object> {
    return this.gatekeeperClient.getJSON(cid);
  }

  private async addTextInternal(data: string): Promise<string> {
    return this.gatekeeperClient.addText(data);
  }

  private async getTextInternal(cid: string): Promise<string> {
    return this.gatekeeperClient.getText(cid);
  }

  private async addDataInternal(data: Buffer): Promise<string> {
    return this.gatekeeperClient.addData(data);
  }

  private async getDataInternal(cid: string): Promise<Buffer> {
    return this.gatekeeperClient.getData(cid);
  }

  private async getBlockInternal(
    registry: string,
    block?: BlockId
  ): Promise<BlockInfo | null> {
    return this.gatekeeperClient.getBlock(registry, block);
  }

  private async addBlockInternal(
    registry: string,
    block: BlockInfo
  ): Promise<boolean> {
    return this.gatekeeperClient.addBlock(registry, block);
  }

  private validateConfig(config: GatekeeperClientOptions): void {
    if (!config) {
      throw new Error("Missing Gatekeeper config");
    }
  }
}
