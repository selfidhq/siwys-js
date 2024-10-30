import fs from "fs";

const dataFolder = "data";
const walletName = `${dataFolder}/wallet.json`;

export async function saveWallet(wallet, overwrite = false) {
  if (fs.existsSync(walletName) && !overwrite) {
    return;
  }

  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
  }

  fs.writeFileSync(walletName, JSON.stringify(wallet, null, 4));
  return;
}

export function loadWallet() {
  if (fs.existsSync(walletName)) {
    const walletJson = fs.readFileSync(walletName);
    return JSON.parse(walletJson.toString());
  }

  return null;
}
