export {
  KeymasterReactNative,
  KeymasterConfig as KeymasterReactNativeConfig,
} from "./keymaster-react-native.js";
export { GatekeeperReactNative } from "./gatekeeper-react-native.js";

export {
  SdkConfig,
  WalletConfig,
  CreateChallengeResponse,
  CreateChallengeSpec,
} from "./types/index.js";

import * as KeymasterTypes from "@mdip/keymaster/types";
import * as GatekeeperTypes from "@mdip/gatekeeper/types";

export { KeymasterTypes, GatekeeperTypes };
