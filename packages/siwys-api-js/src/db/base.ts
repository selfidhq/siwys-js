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

abstract class BaseDb {
  abstract saveWallet(wallet: Wallet, overwrite?: boolean): Promise<void>;
  abstract loadWallet(): Promise<string | null>;
}

export default BaseDb;
