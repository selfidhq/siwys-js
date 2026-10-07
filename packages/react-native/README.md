# @yourself_id/siwys-react-native

React Native client SDK for **Self ID** and the **Multi-Dimensional Identity Protocol (MDIP)**.

This package provides a mobile-native Keymaster implementation optimized for iOS and Android environments, enabling mobile applications (such as wallets and native mobile client apps) to manage keys, Decentralized Identifiers (DIDs), and Verifiable Credentials without relying on Node.js-specific crypto runtimes.

---

## Installation

```bash
npm install @yourself_id/siwys-react-native
# or
yarn add @yourself_id/siwys-react-native
```

### Dependencies & Crypto Support

This package uses `@noble/secp256k1`, `@noble/hashes`, and `@scure/bip32` for pure JavaScript/TypeScript cryptographic operations.

If your React Native environment does not have global `crypto.getRandomValues`, install `react-native-get-random-values` and import it at the top of your app entry point (e.g., `index.js`):

```bash
npm install react-native-get-random-values
```

```javascript
// index.js (top of file)
import "react-native-get-random-values";
```

---

## Core Classes

| Class | Description |
|---|---|
| `KeymasterReactNative` | Singleton client providing wallet management, DID creation, challenge responses, and credential operations. |
| `GatekeeperReactNative` | Gatekeeper client adapter configured for mobile networking. |
| `CipherReactNative` | Mobile cryptographic provider implementing MDIP cipher interfaces. |

---

## Getting Started

### 1. Initialize `KeymasterReactNative`

Provide a custom persistence layer (`walletDb`) such as `react-native-mmkv`, `AsyncStorage`, or `react-native-keychain` to securely store the encrypted wallet on the mobile device:

```typescript
import { KeymasterReactNative, KeymasterReactNativeConfig } from "@yourself_id/siwys-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WALLET_STORAGE_KEY = "@selfid/wallet";

const walletDb = {
  saveWallet: async (wallet: any, overwrite = false) => {
    const existing = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
    if (existing && !overwrite) return true;
    await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
    return true;
  },
  loadWallet: async () => {
    const raw = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  updateWallet: async (mutator: (wallet: any) => void | Promise<void>) => {
    const raw = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
    if (!raw) throw new Error("No wallet found");
    const wallet = JSON.parse(raw);
    await mutator(wallet);
    await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  },
};

const config: KeymasterReactNativeConfig = {
  gatekeeperConfig: {
    url: "https://gatekeeper.example.com", // Gatekeeper service endpoint
    waitUntilReady: true,
  },
  walletDb,
  walletConfig: {
    id: "user-mobile-wallet",
    registry: "hyperswarm",
    // mnemonic: "twelve word seed phrase...", // optional mnemonic to restore an existing wallet
  },
  passphrase: "device-specific-secure-passphrase", // typically protected via Keychain/Keystore or user PIN
  didPrefix: "did:test",
};

KeymasterReactNative.initialize(config);
await KeymasterReactNative.start();
```

---

## Common Mobile Use Cases

### 1. Responding to an Authentication Challenge (Sign In)

When a mobile app scans a SIWYS QR code or receives a deep-link containing a challenge DID, generate a signed response and submit it to the backend callback URL:

```typescript
import { KeymasterReactNative } from "@yourself_id/siwys-react-native";

async function handleAuthentication(challengeDID: string, callbackUrl: string) {
  // 1. Generate cryptographic response signed by the active mobile identity
  const responseDID = await KeymasterReactNative.createResponse(challengeDID);

  // 2. Post the response to the partner backend callback endpoint
  const res = await fetch(callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response: responseDID }),
  });

  const data = await res.json();
  if (data.authenticated) {
    console.log("Authentication successful!");
  }
}
```

### 2. Creating and Managing DIDs

```typescript
// Create a new decentralized identifier on the configured registry
const newDid = await KeymasterReactNative.createId("my-persona", {
  registry: "hyperswarm",
});

// Set active ID
await KeymasterReactNative.setCurrentId("my-persona");

// Resolve a DID document
const doc = await KeymasterReactNative.resolveDID(newDid);
```

### 3. Accepting and Storing Verifiable Credentials

When your app receives an issued credential from an issuer:

```typescript
// Accept a credential issued to this identity
const success = await KeymasterReactNative.acceptCredential(credentialDid);

// Retrieve stored credential details
const credential = await KeymasterReactNative.getCredential(credentialId);
```

### 4. Wallet Backup & Recovery

```typescript
// Export seed phrase to allow the user to back up their wallet
const mnemonic = await KeymasterReactNative.showMnemonic();

// Create a new wallet from an existing recovery phrase
await KeymasterReactNative.newWallet(mnemonic, true);
```

---

## Related Documentation

- [Backend SDK (`@yourself_id/siwys-api-js`)](../api-js/README.md)
- [React Web SDK (`@yourself_id/siwys-react-js`)](../react-js/README.md)
- [Keymaster Integration Guide](../../demo/README.md#integrating-keymaster)
