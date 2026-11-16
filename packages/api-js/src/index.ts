export { Keymaster, KeymasterConfig } from "./keymaster.js";
export { KeymasterExternalClient } from "./keymasterClient.js";
export { GatekeeperClient } from "./gatekepeerClient.js";

export {
  SdkConfig,
  WalletConfig,
  CreateChallengeResponse,
  CreateChallengeSpec,
  RequestedCredentialSpec,
} from "./types/index.js";
export { InvalidParameterError } from "./challengeSpec.js";

export * from "@mdip/keymaster";
import type * as GatekeeperTypes from "@mdip/gatekeeper";

export { GatekeeperTypes };
