import { VerifyResponseResponse } from "@selfidhq/siwys-api-js";
import fs from "fs";

const dbName = "data/db.json";

function loadDb() {
  if (fs.existsSync(dbName)) {
    return JSON.parse(fs.readFileSync(dbName).toString());
  } else {
    return {};
  }
}

function writeDb(db) {
  fs.writeFileSync(dbName, JSON.stringify(db, null, 4));
}

export function writeToDb(did: string) {
  const db = loadDb();

  if (!db.users) {
    db.users = {};
  }

  const now = new Date().toISOString();

  if (Object.keys(db.users).includes(did)) {
    db.users[did].lastLogin = now;
    db.users[did].logins += 1;
  } else {
    db.users[did] = {
      firstLogin: now,
      lastLogin: now,
      logins: 1,
    };
  }

  writeDb(db);
}
