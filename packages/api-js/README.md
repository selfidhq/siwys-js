# @yourself_id/siwys-api-js

Node.js backend SDK for **Sign In With YourSelf (SIWYS)** and the **Multi-Dimensional Identity Protocol (MDIP)**.

This package provides the tools required for server-side operations, including:
- Creating authentication challenges and callbacks for the SELF Mobile Wallet
- Verifying challenge responses submitted by users
- Issuing, binding, and publishing Verifiable Credentials
- Managing wallets and Decentralized Identifiers (DIDs)
- Communicating with Gatekeeper and Keymaster nodes

---

## Installation

```bash
npm install @yourself_id/siwys-api-js
# or
yarn add @yourself_id/siwys-api-js
```

---

## Two Integration Pathways

You can use this SDK in one of two modes depending on your architecture:

| Pathway | Class | Best For | Architecture |
|---|---|---|---|
| **Embedded Keymaster** | `Keymaster` | Node.js / TypeScript backends | Runs Keymaster in-process, saves encrypted wallet state via pluggable DB adapter. |
| **External Keymaster Client** | `KeymasterExternalClient` | Polyglot / Microservices | Connects over HTTP REST to a standalone Keymaster container (e.g. from `KeychainMDIP/kc`). |

---

## Pathway 1: Embedded Keymaster (`Keymaster`)

Runs the Keymaster service in-process within your Node.js application.

### 1. Configure Wallet Persistence

Keymaster requires a persistence adapter (`WalletBase`) to store the encrypted wallet. Here is an example filesystem adapter:

```typescript
// services/wallet.ts
import fs from "fs";
import type { StoredWallet } from "@yourself_id/siwys-api-js";

const WALLET_FILE = "./data/wallet.json";

export async function saveWallet(wallet: StoredWallet, overwrite = false): Promise<boolean> {
  if (fs.existsSync(WALLET_FILE) && !overwrite) return true;
  fs.mkdirSync("./data", { recursive: true });
  fs.writeFileSync(WALLET_FILE, JSON.stringify(wallet, null, 2));
  return true;
}

export async function loadWallet(): Promise<StoredWallet | null> {
  if (fs.existsSync(WALLET_FILE)) {
    return JSON.parse(fs.readFileSync(WALLET_FILE, "utf-8"));
  }
  return null;
}

export async function updateWallet(
  mutator: (wallet: StoredWallet) => void | Promise<void>
): Promise<void> {
  const wallet = await loadWallet();
  if (!wallet) throw new Error("No wallet found to update");
  const before = JSON.stringify(wallet);
  await mutator(wallet);
  if (before !== JSON.stringify(wallet)) {
    await saveWallet(wallet, true);
  }
}
```

### 2. Initialize and Start Keymaster

```typescript
// server.ts
import { Keymaster } from "@yourself_id/siwys-api-js";
import { saveWallet, loadWallet, updateWallet } from "./services/wallet.js";

async function setupKeymaster() {
  Keymaster.initialize({
    gatekeeperConfig: {
      url: process.env.GATEKEEPER_URL || "http://localhost:4422",
      waitUntilReady: true,
    },
    walletConfig: {
      id: "company-node-id",
      registry: "hyperswarm",
      mnemonic: process.env.WALLET_MNEMONIC, // optional: recovers wallet if initializing fresh
    },
    walletDb: {
      saveWallet,
      loadWallet,
      updateWallet,
    },
    passphrase: process.env.KEYMASTER_PASSPHRASE || "a-secure-passphrase",
    didPrefix: "did:test",
  });

  await Keymaster.start();
  console.log("Keymaster is ready");
}

setupKeymaster();
```

---

## Pathway 2: External Keymaster (`KeymasterExternalClient`)

Use this when you are running a standalone Keymaster container (such as the Docker image from [KeychainMDIP/kc](https://github.com/KeychainMDIP/kc)) on port 4226:

```typescript
import { KeymasterExternalClient } from "@yourself_id/siwys-api-js";

const keymasterClient = new KeymasterExternalClient({
  keymasterConfig: {
    url: process.env.KEYMASTER_URL || "http://localhost:4226",
    waitUntilReady: true,
  },
  didPrefix: "did:test",
});

await keymasterClient.start();
```

`KeymasterExternalClient` provides the same core methods (`createChallenge`, `verifyResponse`, `bindCredential`, `issueCredential`, etc.) via HTTP REST.

---

## Core Use Cases

### 1. Creating Authentication Challenges

When a user visits your sign-in page, create a challenge and return the challenge data and QR code URL to the frontend:

```typescript
import { Keymaster } from "@yourself_id/siwys-api-js";

app.post("/challenges", async (req, res) => {
  try {
    const challenge = await Keymaster.createChallenge({
      callback: `${process.env.BACKEND_URL}/login`,
      // Optional: require user to present specific credentials
      // credentials: [{ schema: "did:test:schema-id", issuers: ["did:test:issuer-did"] }]
    });

    // Returns: { challenge: "did:test:...", challengeUrl: "https://.../login?challenge=did:test:..." }
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});
```

### 2. Verifying Authentication Responses

The SELF mobile wallet signs and submits the challenge response back to your backend callback URL:

```typescript
app.post("/login", async (req, res) => {
  try {
    const { response } = req.body;
    const verify = await Keymaster.verifyResponse(response);

    if (verify.match) {
      // Authentication succeeded!
      // verify.responder contains the user's DID
      const userDid = verify.responder;

      // Issue your application's session cookie or JWT
      const sessionToken = createSessionForUser(userDid);

      res.json({ authenticated: true, token: sessionToken });
    } else {
      res.status(401).json({ error: "Challenge response verification failed" });
    }
  } catch (err) {
    res.status(500).json({ error: "Exception verifying response" });
  }
});
```

### 3. Issuing Verifiable Credentials to Users

Issue a verifiable credential to a user's DID:

```typescript
// 1. Bind credential to user's DID against a defined schema
const boundCredential = await Keymaster.bindCredential(schemaDid, userDid, {
  validFrom: new Date().toISOString(),
  validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  credential: {
    membershipTier: "Gold",
    accountNumber: "A-987654",
  },
});

// 2. Issue the credential
const credentialDid = await Keymaster.issueCredential(boundCredential);

// 3. Publish so the holder or verifiers can resolve it
await Keymaster.publishCredential(credentialDid);
```

---

## API & Configuration Reference

### `KeymasterConfig`

| Field | Type | Required | Description |
|---|---|---|---|
| `gatekeeperConfig` | `SdkConfig` | Yes (embedded) | Configuration for connecting to the Gatekeeper node. |
| `walletConfig` | `WalletConfig` | Yes | ID and registry name for the default DID, plus optional mnemonic. |
| `walletDb` | `WalletBase` | Yes (embedded) | `saveWallet`, `loadWallet`, and `updateWallet` persistence hooks. |
| `passphrase` | `string` | Yes | Secret passphrase used to encrypt and decrypt the wallet at rest. |
| `didPrefix` | `string` | Optional | DID method prefix (e.g. `did:test` or `did:mdip`). |

### `WalletConfig`

```typescript
interface WalletConfig {
  id: string; // Identifier for this node's default DID (e.g. "my-company-id")
  registry: "local" | "hyperswarm" | "TESS" | "TBTC" | "TFTC" | "Signet" | "Signet-Inscription" | "BTC-Inscription";
  mnemonic?: string; // BIP39 mnemonic seed phrase for recovery
}
```

### `SdkConfig`

```typescript
interface SdkConfig {
  url: string; // Base URL of Gatekeeper or Keymaster service
  waitUntilReady?: boolean; // Wait for upstream service readiness before completing start
  intervalSeconds?: number; // Poll interval when waiting for ready state
  chatty?: boolean; // Enable verbose logging during connection
  token?: string; // Optional bearer authorization token
}
```

---

## Related Documentation

- [Keymaster Integration Guide](../../demo/README.md#integrating-keymaster)
- [React Frontend SDK (`@yourself_id/siwys-react-js`)](../react-js/README.md)
- [React Native SDK (`@yourself_id/siwys-react-native`)](../react-native/README.md)
- [Reference Node & Docker Microservices (KeychainMDIP/kc)](https://github.com/KeychainMDIP/kc)
