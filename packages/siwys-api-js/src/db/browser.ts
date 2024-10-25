import BaseDb, { Wallet } from "./base";

class BrowserDb extends BaseDb {
  private _walletName = "mdip-keymaster";

  async saveWallet(wallet: Wallet, overwrite: boolean): Promise<void> {
    if (!overwrite) {
      const existingWallet = await this.loadWallet();
      if (existingWallet) {
        throw new Error(
          "Wallet already exists. Use overwrite option to replace."
        );
      }
    }
    localStorage.setItem(this._walletName, JSON.stringify(wallet));
  }

  async loadWallet(): Promise<string | null> {
    return localStorage.getItem(this._walletName);
  }
}

export default BrowserDb;
