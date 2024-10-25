import BaseDb from "./base";
import BrowserDb from "./browser";

export enum DbType {
  Web = "web",
}

export function initalizeWalletDb(dbType: DbType): BaseDb {
  switch (dbType) {
    case DbType.Web:
      return new BrowserDb();
    // TODO: support more DB stores
    default:
      throw new Error(`Unsupported db type ${dbType}`);
  }
}
