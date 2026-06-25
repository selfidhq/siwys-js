import * as bip39 from "bip39";
import { HDKey } from "@scure/bip32";
import { base64url } from "multiformats/bases/base64";
import CipherBase from "@mdip/cipher/dist/esm/cipher-base.js";

interface HDKeyJSON {
  xpriv: string;
  xpub: string;
}

export default class CipherReactNative extends CipherBase {
  generateHDKey(mnemonic: string): HDKey {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    return HDKey.fromMasterSeed(seed);
  }

  generateHDKeyJSON(json: HDKeyJSON): HDKey {
    return HDKey.fromExtendedKey(json.xpriv);
  }

  generateRandomSalt(): string {
    const array = new Uint8Array(32);
    globalThis.crypto.getRandomValues(array);
    return base64url.encode(array);
  }
}
