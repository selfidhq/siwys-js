import { Keymaster, KeymasterConfig } from "@yourself_id/siwys-api-js";

export async function startKeymaster(config: KeymasterConfig): Promise<void> {
  Keymaster.initialize(config);
  await Keymaster.start();
}
