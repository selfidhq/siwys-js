import { Keymaster, KeymasterConfig } from "@yourself_id/siwys-api-js";

let KEYMASTER: Keymaster;

export async function startKeymaster(
  config: KeymasterConfig
): Promise<Keymaster> {
  if (KEYMASTER) {
    return KEYMASTER;
  }

  const keymaster = new Keymaster(config);

  const initialized = await keymaster.start();
  if (initialized) {
    KEYMASTER = keymaster;
  }

  return KEYMASTER;
}

export function getKeymaster(): Keymaster {
  if (!KEYMASTER) {
    console.error("Keymaster service not started.");
  }
  return KEYMASTER;
}
