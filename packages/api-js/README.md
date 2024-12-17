# Sign in with your SELF API SDK

Sign in with your SELF (SIWYS) is a SELF product that allows users to authenticate with partner apps/dapps using their own private keys and credentials and the MDIP protocol.

This SDK is designed to facilitate the ability to integrate Keymaster functionality into an existing NodeJS web service or to communicate with an existing external Keymaster service.

Please refer to the partner integration guide for more information regarding SIWYS.

# Install

```
npm install @yourself_id/siwys-api-js
```
or
```
yarn add @yourself_id/siwys-api-js
```

# Initialize Keymaster

Initializing the Keymaster client depends on your use case, Integrated vs External Keymaster.

## Integrated Keymaster

Integrated Keymaster requires integrating Keymaster functionality into your existing server. To acheive this you will need to communicate to an existing Gatekeeper service and provide the necessary configuration for managing your digital Wallet.

Initializing a Keymaster client is as easy as creating a class instance of `Keymaster`

```js
import { Keymaster } from "@yourself_id/siwys-api-js";


new Keymaster({
 gatekeeperConfig: {
   url: "https://gatekeeper-url",
   chatty: true,
   waitUntilReady: true,
   intervalSeconds: 5
 },
 walletConfig: {
   id: "my-wallet",
   mnemonic: "red orange yellow green blue indigo violet pink white black brown grey",
   registry: "TFTC"
 },
 walletDb: {
   loadWallet,
   saveWallet
 },
})
```

The following are the configuration options for the `Keymaster` client:

|Parameter|Type|Description|Required|Default|
|--|-|-|-|-|
|gatekeeperConfig.url|string|URL of the external Gatekeeper service|Yes||
|gatekeeperConfig.chatty|boolean|Control the log "noisyness"|No|false|
|gatekeeperConfig.waitUntilReady|boolean|Whether or not to wait for the Gatekeeper service to become operational|No|false|
|gatekeeperConfig.intervalSeconds|number|How often to poll for readyness|No|5|
|walletConfig.id|string|Human-friendly alias for the digital wallet|Yes||
|walletConfig.mnemonic|string|User-supplied mnemonic device used during wallet creation|No|Auto-generated|
|walletConfig.registry|string|Registry to use for transactions, one of "hyperswarm", "TBTC", or "TFTC"|No|TFTC|
|walletDb.loadWallet|func|Callback for loading the wallet.<br/><br/>Must return a `Promise<Wallet \| null>`|Yes||
|walletDb.saveWallet|func|Callback for saving the wallet.<br/><br/>Accepts two parameters:<br/>1. The Wallet payload as an object<br/>2. Boolean flag indicating whether to overwrite the exsiting wallet<br/><br/>Must return a `Promise<boolean>`|Yes||

### Wallet DB Callbacks

A necessary part of running your server as an Integrate Keymaster is that you will be responsible for managing your digital Wallet. Consequently,
you must provide the methods for loading and saving the wallet.

The following are minimal examples for achieving this:

Save to the file system
```js
import fs from "fs";

import type { Wallet } from "@yourself_id/siwys-api-js";

const dataFolder = "data"
const walletName = `${dataFolder}/wallet.json`

async function loadWallet(): Promise<Wallet | null> {
  if (fs.existsSync(walletName)) {
    const walletJson = fs.readFileSync(walletName);
    return JSON.parse(walletJson.toString());
  }

  return null;
}

async function saveWallet(wallet: Wallet, overwrite: booelan = false): Promise<boolean> {
  try {
    if (fs.existsSync(walletName) && !overwrite) {
      return true;
    }

    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder, { recursive: true });
    }

    fs.writeFileSync(walletName, JSON.stringify(wallet, null, 4));
    return true;
  } catch (e) {
    return false;
  }
}
```

Save to Firestore
```js
import fs from "fs";

import { collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

import type { Wallet } from "@yourself_id/siwys-api-js";

const walletCollection = "wallet"
const walletName = "server-wallet"

async function loadWallet(): Promise<Wallet | null> {
  const walletDoc = await getDoc(doc(db, walletCollection, walletName));

  if (walletDoc.exists()) {
    return walletDoc.data() as Wallet;
  }

  return null;
}

async function saveWallet(wallet: Wallet, overwrite: booelan = false): Promise<boolean> {
  try {
    const walletDoc = await getDoc(doc(db, walletCollection, walletName));

    const walletExists = walletDoc.exists();
    if (walletExists && !overwrite) {
      return true
    }

    await setDoc(doc(collection(db, walletCollection), walletName), wallet);
    return true;
  } catch (e) {
    // handle error
    return false;
  }
}
```

> [!IMPORTANT]
> The `seed` key of the wallet contains sensitive data regarding your Wallet. Please consider this when deciding on the appropriate wallet storage mechanism. The following is an updated example of omitting the seed data when persisting to Firestore.

```js
import fs from "fs";

import { collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

import type { Wallet, WalletSeed } from "@yourself_id/siwys-api-js";

const walletCollection = "wallet"
const walletName = "server-wallet"

async function getSeedFromSecretManager(): Promise<WalletSeed> {
  // implement your Secret Manager fetching logic
}

async function saveSeedToSecretManager(seed: WalletSeed): Promise<void> {
  const existingSeed = await getSeedFromSecretManager();
  if (existingSeed) {
    return existingSeed;
  } else {
    // implement your Secret Manager saving logic
  }
  return;
}

async function loadWallet(): Promise<Wallet | null> {
  const walletDoc = await getDoc(doc(db, walletCollection, walletName));

  if (walletDoc.exists()) {
    const walletData = walletDoc.data() as Wallet;
    const seedData = await getSeedFromSecretManager();
    const wallet: Wallet = {
      ...walletData,
      ...seedData
    };
    return wallet;
  }

  return null;
}

async function saveWallet(wallet: Wallet, overwrite: booelan = false): Promise<boolean> {
  try {
    const walletDoc = await getDoc(doc(db, walletCollection, walletName));

    const walletExists = walletDoc.exists();
    if (walletExists && !overwrite) {
      return true
    }

    const { seed, ...rest } = wallet;

    // save the seed in Secret Manager
    await saveSeedToSecretManager(seed);
    // save the rest of the Wallet in Firestore
    await setDoc(doc(collection(db, walletCollection), walletName), rest);
    return true;
  } catch (e) {
    // handle error
    return false;
  }
}
```


## External Keymaster

If you want your server to simply communicate with an existing, external Keymaster you just need to provide the Keymaster config.

```js
import { Keymaster } from "@yourself_id/siwys-api-js";


new Keymaster({
 keymasterConfig: {
   url: "https://keymaster-url",
   chatty: true,
   waitUntilReady: true,
   intervalSeconds: 5
 },
})
```

The following are the configuration options for the `Keymaster` client:


|Parameter|Type|Description|Required|Default|
|--|-|-|-|-|
|keymasterConfig.url|string|URL of the external Keymaster service|Yes||
|keymasterConfig.chatty|boolean|Control the log "noisyness"|No|false|
|keymasterConfig.waitUntilReady|boolean|Whether or not to wait for the Keymaster service to become operational|No|false|
|keymasterConfig.intervalSeconds|number|How often to poll for readyness|No|5|


# Starting Keymaster

The Keymaster client must be manually started once it has been configured.

The easiest way to do this is to start it when your server starts up.

```js

import express from "express";
import { Keymaster, KeymasterConfig } from "@yourself_id/siwys-api-js";

const app = express();

app.listen(8080, () => {
  const config: KeymasterConfig = {}
  const keymaster = new Keymaster(config).start()
});
```

You can keep a global reference for easy use where you need it
```js
import { Keymaster, KeymasterConfig } from "@yourself_id/siwys-api-js";

let keymaster: Keymaster;
async startKeymaster () => {
  const config: KeymasterConfig = {}
  keymaster = new Keymaster(config)
  await keymaster.start()
  return keymaster
}
startKeymaster()
```

# Add SIWYS API Endpoints

The SIWYS workflow is as follows:
1. User clicks the SIWYS button and a challenge is rendered via a QR code
2. The user completes the challenge via scanning the QR code in their SELF mobile app
3. The mobile app executes the specified callback function for the challenge on a successful scan
4. Optionally, the UI can poll for challenge completion and perform the appropriate steps once complete

You need to add the following endpoints to help facilitate this workflow

### Create Challenge

Endpoint to create and return a Challenge

```js
app.post("/challenges", async (_, res) => {
// callbackUrl should be the endpoint defined in Step 3 (above)

 const callbackUrl = "http://your-server-url/auth";
 // use the keymaster service you started earlier
 const challenge = await keymaster.createChallenge({
   callback: callbackUrl,
 });
 
 res.json(challenge);
});
```

### Accept Challenge Callback
The endpoint the SELF app will hit to signify a completed Challenge

> [!IMPORTANT]
> This endpoint **MUST** be publicly accessbile as the callback will be executed from the SELF mobile app on the user's device.

```js
import { collection, doc, setDoc } from "firebase/firestore"; 
import { VerifyResponseResponse } from "@yourself_id/siwys-api-js"

app.post("/auth", async (req, res) => {
  // parse the response from the request body
 const { response } = req.body;

 // verify the response
 const verified: VerifyResponseResponse = await keymaster.verifyResponse(response);

 if (verified.match) {
    /**
     * match = authentication is successful
     * 
     * You should implement the necessary DB logic here for caching this
     * "user login session". A "user login session" can be represented by the
     * challenge DID that was generated paired with the responding user's agent DID
     * who completed the challenge.
     * 
     * The `verified` response contains a "responder" field that
     * represents the user's agent DID. This is the uniquely
     * identifying ID for the user. 
     * 
     * A minimal example has been included below that will
     * cache the challenge and create the user in Firestore.
     */
    const challengeId = verified.challenge
    const userId = verified.responder
      
    // cache challenge
    await setDoc(doc(collection(db, "challenges"), challengeId), verified);
    console.log("Created challenge document with ID", userId);

    // create user
    await setDoc(doc(collection(db, "users"), userId), verified);
    console.log("Created user document with ID", userId);
 }

 res.sendStatus(204);
});
```

### Poll for Challenge Complete

Optionally, you can configure the SIWYS React component to poll for a completed challenge by specifying the polling URL.

If you omit this, you will need to implement the challenge completion logic yourself. For example, you could push a message via WebSocket to the front-end when the challenge has been completed during the callback (above).

> [!IMPORTANT]
> The polling logic in the React component will pass the Challenge DID via a query parameter.

```js
import { collection, doc, getDoc } from "firebase/firestore"; 

app.get("/auth", async (req, res) => {
  // parse the challenge from the query string
  const challengeId = req.query.challenge;
  if (!challengeId || typeof challengeId !== "string") {
    return res.sendStatus(400);
  }

  /**
   * You should implement the necessary DB logic here for looking up
   * an active "user login session". You can refernce the cached challenge
   * created in the callback endpoint from above.
   * 
   * A minimal example has been included below that will fetch the challenge
   * and user from Firestore.
   */

  const challengeDoc = await getDoc(doc(db, "challenges", challengeId));
  if (challengeDoc.exists()) {
    console.log("Found challenge document with ID", challengeId)
    const docData = challengeDoc.data()
    const userId = docData.responder
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      console.log("Found user document with ID", userId)
      const userData = userDoc.data()
      // you add any authentication logic here
      // eg create a cookie and return in result
      res.json(userData);
    }
  }

  res.sendStatus(404);
});

```

# Complete Example

Below is a complete, minimal example using Express and Firestore.
```js
import express from "express"
import { collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { Keymaster, Wallet } from "@yourself_id/siwys-api-js";


const app = express();
const db = getFirestore() // firestore init logic

const walletCollection = "wallet"
const walletName = "server-wallet"

async function loadWallet(): Promise<Wallet | null> {
  const walletDoc = await getDoc(doc(db, walletCollection, walletName));

  if (walletDoc.exists()) {
    return walletDoc.data() as Wallet;
  }

  return null;
}

async function saveWallet(wallet: Wallet, overwrite: booelan = false): Promise<boolean> {
  try {
    const walletDoc = await getDoc(doc(db, walletCollection, walletName));

    const walletExists = walletDoc.exists();
    if (walletExists && !overwrite) {
      return true
    }

    await setDoc(doc(collection(db, walletCollection), walletName), wallet);
    return true;
  } catch (e) {
    // handle error
    return false;
  }
}

let keymaster: Keymaster; // global ref
async () => {
  keymaster = new Keymaster({
    gatekeeperConfig: {
      url: "https://gatekeeper-url",
      waitUntilReady: true,
    },
    walletConfig: {
      id: "my-wallet"
    },
    walletDb: {
      loadWallet,
      saveWallet
    }
  });
  await keymaster.start();
  return keymaster;
}



app.post("/challenges", async (_, res) => {
   const callbackUrl = "http://your-server-url/auth";
   const challenge = await keymaster.createChallenge({
     callback: callbackUrl,
   });
   
   res.json(challenge);
});

app.get("/auth", async (req, res) => {
  const challengeId = req.query.challenge;
  if (!challengeId || typeof challengeId !== "string") {
    return res.sendStatus(400);
  }

  const challengeDoc = await getDoc(doc(db, "challenges", challengeId));
  if (challengeDoc.exists()) {
    console.log("Found challenge document with ID", challengeId)
    const docData = challengeDoc.data()
    const userId = docData.responder
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      console.log("Found user document with ID", userId)
      const userData = userDoc.data()
      // authenticate session and return
      res.json(userData);
    }
  }

  res.sendStatus(404);
});

app.post("/auth", async (req, res) => {
  const { response } = req.body;
  const verified = await keymaster.verifyResponse(response);

  if (verified.match)  {
    const challengeId = verified.challenge
    const userId = verified.responder
    
    // cache challenge
    await setDoc(doc(collection(db, "challenges"), challengeId), verified);
    console.log("Created challenge document with ID", userId);

    // create user
    await setDoc(doc(collection(db, "users"), userId), verified);
    console.log("Created user document with ID", userId);
  }

  res.sendStatus(204);
});

app.listen(8080, async () => {
  console.log(`Server listening on port ${8080}`);
});
```
