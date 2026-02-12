import fs from "fs";
import type { StoredWallet } from "@yourself_id/siwys-api-js";

const dataFolder = "data";
const walletName = `${dataFolder}/wallet.json`;

export async function saveWallet(
  wallet: StoredWallet,
  overwrite = false,
): Promise<boolean> {
  if (fs.existsSync(walletName) && !overwrite) {
    return true;
  }

  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
  }

  fs.writeFileSync(walletName, JSON.stringify(wallet, null, 4));
  return true;
}

export async function loadWallet(): Promise<StoredWallet | null> {
  if (fs.existsSync(walletName)) {
    const walletJson = fs.readFileSync(walletName);
    return JSON.parse(walletJson.toString());
  }

  return null;
}

export async function updateWallet(
  mutator: (wallet: StoredWallet) => void | Promise<void>,
): Promise<void> {
  const wallet = await loadWallet();
  if (!wallet) {
    throw new Error("updateWallet: no wallet found to update");
  }
  const before = JSON.stringify(wallet);
  await mutator(wallet);
  const after = JSON.stringify(wallet);

  if (before === after) {
    return;
  }

  await saveWallet(wallet, true);
}
