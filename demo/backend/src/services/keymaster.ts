import { Keymaster, KeymasterConfig } from "@yourself_id/siwys-api-js";

export async function startKeymaster(
  config: KeymasterConfig
): Promise<Keymaster> {
  Keymaster.initialize(config);
  await Keymaster.start();
  return Keymaster;
}

export function getKeymaster(): Keymaster {
  return Keymaster;
}
