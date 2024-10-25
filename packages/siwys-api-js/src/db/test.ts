import { Wallet } from "./base";

const walletName = "mdip-keymaster";

async function saveWallet(wallet: Wallet, overwrite: boolean): Promise<void> {
  if (!overwrite) {
    const existingWallet = await loadWallet();
    if (existingWallet) {
      throw new Error(
        "Wallet already exists. Use overwrite option to replace."
      );
    }
  }
  localStorage.setItem(walletName, JSON.stringify(wallet));
}

async function loadWallet(): Promise<string | null> {
  return localStorage.getItem(walletName);
}
