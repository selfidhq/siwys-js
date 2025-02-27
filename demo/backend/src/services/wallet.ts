import fs from "fs";

const dataFolder = "data";
const walletName = `${dataFolder}/wallet.json`;

export async function saveWallet(w, overwrite = false) {
  if (fs.existsSync(walletName) && !overwrite) {
    return true;
  }

  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
  }

  fs.writeFileSync(walletName, JSON.stringify(w, null, 4));
  return true;
}

export function loadWallet() {
  if (fs.existsSync(walletName)) {
    const walletJson = fs.readFileSync(walletName);
    return JSON.parse(walletJson.toString());
  }

  return null;
}
