import * as cipher from "@mdip/cipher/node";
import * as keymaster_lib from "@mdip/keymaster/lib";

export interface CreateChallengeSpec {
  challenge?: {
    credentials?: [];
  };
}

export interface CreateChallengeOptions {
  registry?: string;
  validUntil?: string; // ISO string
}

export interface CreateChallengeResponse {
  challenge: string; // DID
  challengeUrl: string;
}

export interface VerifyResponseOptions {
  retries?: number;
  delay?: number;
}

export interface VerifyResponseResponse {
  match: boolean;
  challenge: string;
  responder: string;
  // ...rest
}

export interface Wallet {
  seed: {
    mnemonic: string;
    hdkey: {
      xpriv: string;
      xpub: string;
    };
  };
  counter: number;
  ids: any;
}

export interface KeymasterOptions {
  gatekeeperUrl: string;
  wallet?: Wallet;
  mnemonicDevice?: string;
}

export class Keymaster {
  private _keymaster;

  constructor(options: KeymasterOptions) {
    console.debug(`Initializing keymaster with config:`, options);
    let wallet = options.wallet;

    if (!wallet) {
      if (process.env.SIWYS_WALLET_JSON) {
        console.debug(`Parsing wallet from env:`, wallet);
        wallet = JSON.parse(process.env.SIWYS_WALLET_JSON);
      } else {
        if (!options.mnemonicDevice) {
          throw new Error("No wallet or mnemonic device configured.");
        }
        wallet = this.generateWalletFromMnemonic(options.mnemonicDevice);
        console.debug(`Generated wallet:`, wallet);
      }
    }

    console.debug(`Starting Keymaster...`);
    this._keymaster = keymaster_lib.start({
      gatekeeper: options.gatekeeperUrl,
      cipher: cipher,
      wallet: wallet,
    });
  }

  private generateWalletFromMnemonic(mnemonic: string): Wallet {
    const hdkey = cipher.generateHDKey(mnemonic);
    const keypair = cipher.generateJwk(hdkey.privateKey);
    const backup = cipher.encryptMessage(
      keypair.publicJwk,
      keypair.privateJwk,
      mnemonic
    );

    return {
      seed: {
        mnemonic: backup,
        hdkey: hdkey.toJSON(),
      },
      counter: 0,
      ids: {},
    };
  }

  async createChallenge(
    spec?: CreateChallengeSpec,
    options?: CreateChallengeOptions
  ): Promise<CreateChallengeResponse> {
    const response = await this._keymaster.createChallenge(spec, options);
    console.debug("Created challenge:", response);
    return response;
  }

  async verifyResponse(
    did: string,
    options?: VerifyResponseOptions
  ): Promise<VerifyResponseResponse> {
    const response = await this._keymaster.verifyResponse(did, options);
    console.debug("Verified response:", response);
    return response;
  }
}
