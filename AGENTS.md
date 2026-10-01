# AGENTS.md — Coding Agent Integration Guide for SIWYS & Self ID

This document is specifically structured for AI coding agents (such as GitHub Copilot, Claude Code, Cursor, and Codex) assisting developers and partners in implementing the **Sign In With YourSelf (SIWYS)** and **Self ID** SDKs.

> 💡 **Interactive Assistant Skill:** You can invoke the `siwys-setup` skill (`.github/skills/siwys-setup/SKILL.md` or `.agents/skills/siwys-setup/SKILL.md`) to guide the developer through an interactive architectural interview and automatically scaffold Keymaster, API endpoints, and frontend components. External partners can run this skill in their own project without cloning the entire repository by copying the skill definition file or referencing this document's raw URL.

---

## 1. System Architecture & Ecosystem Overview

Self ID is built on the **Multi-Dimensional Identity Protocol (MDIP)**, a decentralized identity layer using DIDs (Decentralized Identifiers) and Verifiable Credentials.

The ecosystem contains three key tiers:
1. **Gatekeeper:** Central core service that maintains the local DID database and interfaces with decentralized registries (e.g. Hyperswarm, Bitcoin/Satoshi testnets).
2. **Keymaster:** Client-side or service-side cryptographic manager holding private keys, signing operations, creating challenges, and issuing/verifying credentials.
3. **Application Layer:** Partner frontends (React / React Native) and backends (Express, Fastify, Next.js, etc.) interacting with users and Keymaster.

```
┌─────────────────────────────────┐           ┌───────────────────────────────────┐
│     User Web / Mobile App       │           │          SELF Mobile App          │
│ (@yourself_id/siwys-react-js)   │           │        (User Identity & Keys)     │
└────────────────┬────────────────┘           └─────────────────┬─────────────────┘
                 │ 1. Request Challenge / Poll                  │ 3. Post Response
                 ▼                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Partner Backend Application                           │
│                     (Exposes /challenges, /login, /check-auth)                  │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
               ┌─────────────────────────┴─────────────────────────┐
               ▼                                                   ▼
     [Option 1: Embedded]                                [Option 2: Standalone]
Keymaster in-process via                      Keymaster REST Microservice
@yourself_id/siwys-api-js                     via Docker container (:4226)
(Keymaster class)                             (KeymasterExternalClient class)
               │                                                   │
               └─────────────────────────┬─────────────────────────┘
                                         ▼
                             MDIP Gatekeeper Service
```

---

## 2. Monorepo Package Directory

| Package Directory | NPM Package Name | Environment | Description |
|---|---|---|---|
| `packages/api-js` | `@yourself_id/siwys-api-js` | Node.js | Backend SDK for Keymaster (embedded or client), Gatekeeper client, challenges, and credentials. |
| `packages/react-js` | `@yourself_id/siwys-react-js` | Browser (React 18+) | Turnkey authentication UI (`<SignInWithYourSelf />`, `<ConnectYourSelf />`, `<QRCode />`, branded buttons). |
| `packages/react-native` | `@yourself_id/siwys-react-native` | iOS & Android | Mobile-native Keymaster & Gatekeeper client using `@noble/*` pure JS cryptography. |
| `demo/backend` | N/A | Node.js (Express) | Reference backend showing challenge creation, response verification, and wallet persistence. |
| `demo/app` | N/A | React (Vite) | Reference web frontend using `@yourself_id/siwys-react-js`. |

---

## 3. Partner Use Cases & Implementation Recipes

> **Execution Order Note for Coding Agents:** **Recipe 1** is the foundational prerequisite. Keymaster must be initialized and running with persistent wallet storage before an application can generate challenges, verify responses (Recipe 2), or issue credentials (Recipe 3).

---

### Recipe 1: Initializing Keymaster (Prerequisite Infrastructure)

Partners need a running Keymaster instance to sign operations, create challenges, and issue credentials. Choose the path that matches the partner's architecture:

#### Path A: Embedded Keymaster (Node.js Process)
Use the `Keymaster` singleton from `@yourself_id/siwys-api-js`.

**Agent Requirement:** Always provide a durable `walletDb` (`saveWallet`, `loadWallet`, `updateWallet`). If omitted or transient, Keymaster generates a brand new wallet and DID on every server restart, causing authentication failures and data loss.

```typescript
import { Keymaster } from "@yourself_id/siwys-api-js";
import { saveWallet, loadWallet, updateWallet } from "./services/walletStore";

Keymaster.initialize({
  gatekeeperConfig: {
    url: process.env.GATEKEEPER_URL || "https://gatekeeper.example.com",
    waitUntilReady: true,
  },
  walletConfig: {
    id: process.env.KEYMASTER_NODE_ID || "partner-org-wallet",
    registry: "hyperswarm",
    mnemonic: process.env.WALLET_MNEMONIC, // optional seed phrase for initial recovery
  },
  walletDb: { saveWallet, loadWallet, updateWallet },
  passphrase: process.env.KEYMASTER_PASSPHRASE!, // Encrypts wallet at rest
  didPrefix: process.env.KEYMASTER_DID_PREFIX || "did:test",
});

await Keymaster.start();
console.log("Keymaster initialized and ready.");
```

#### Path B: Standalone Docker Service (Microservice)
When the partner backend is written in Python, Go, Java, or runs in a microservice container architecture:
1. Run the Keymaster Docker container from [KeychainMDIP/kc](https://github.com/KeychainMDIP/kc):
   ```yaml
   keymaster:
     image: keychainmdip/keymaster
     environment:
       - KC_GATEKEEPER_URL=http://gatekeeper:4224
       - KC_KEYMASTER_PORT=4226
       - KC_KEYMASTER_DB=postgres # or sqlite, redis, mongodb, json
       - KC_NODE_ID=partner-node
       - KC_ENCRYPTED_PASSPHRASE=secure-passphrase-here
       - KC_DEFAULT_REGISTRY=hyperswarm
       - KC_KEYMASTER_DID_PREFIX=did:test
     ports:
       - "4226:4226"
   ```
2. In Node.js services, connect via `KeymasterExternalClient`:
   ```typescript
   import { KeymasterExternalClient } from "@yourself_id/siwys-api-js";

   const keymaster = new KeymasterExternalClient({
     keymasterConfig: { url: "http://keymaster:4226" },
     didPrefix: "did:test",
   });

   await keymaster.start();
   ```

---

### Recipe 2: Web Authentication Flow (Express Backend + React Frontend)

Once Keymaster is running (via Recipe 1), implement the end-to-end login flow:

#### Step 2.1: Backend Challenge and Verification Endpoints
Use `@yourself_id/siwys-api-js` to handle challenges and callbacks:

```typescript
import express from "express";
import { Keymaster } from "@yourself_id/siwys-api-js";

const app = express();
app.use(express.json());

// In-memory or database session store
const AUTH_SESSIONS: Record<string, { authenticated: boolean; userDid?: string }> = {};

// 1. Endpoint to generate a challenge
app.post("/api/challenges", async (req, res) => {
  try {
    const challenge = await Keymaster.createChallenge({
      callback: `${process.env.BACKEND_PUBLIC_URL}/api/login`,
    });
    // Returns: { challenge: "did:test:...", challengeUrl: "https://.../api/login?challenge=did:test:..." }
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

// 2. Callback endpoint called by the user's SELF mobile app
app.post("/api/login", async (req, res) => {
  try {
    const { response } = req.body;
    const verify = await Keymaster.verifyResponse(response);

    if (verify.match) {
      AUTH_SESSIONS[verify.challenge] = {
        authenticated: true,
        userDid: verify.responder,
      };
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ error: "Invalid challenge response" });
    }
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// 3. Polling endpoint queried by the frontend
app.get("/api/check-auth", (req, res) => {
  const challenge = req.query.challenge as string;
  const session = AUTH_SESSIONS[challenge];
  if (session && session.authenticated) {
    res.json(session);
  } else {
    res.status(404).json({ error: "Pending authentication" });
  }
});
```

#### Step 2.2: Frontend Sign-In Component
Install `@yourself_id/siwys-react-js` and `styled-components` in the React app:

```tsx
import React from "react";
import { SignInWithYourSelf } from "@yourself_id/siwys-react-js";

export function LoginPage() {
  const handleSuccess = (userSession: any) => {
    console.log("Logged in!", userSession);
    // Proceed to app dashboard
  };

  return (
    <SignInWithYourSelf
      createChallengeUrl="/api/challenges"
      pollForAuthUrl="/api/check-auth"
      theme="dark"
      showLogo
      showInstructions
      onSuccess={handleSuccess}
    />
  );
}
```

---

### Recipe 3: Issuing Verifiable Credentials (VCs)

Partners issuing credentials to users (e.g. membership cards, certifications, employee badges):

```typescript
import { Keymaster } from "@yourself_id/siwys-api-js";

async function issueMembershipCredential(userDid: string, memberData: Record<string, unknown>) {
  // 1. Bind credential to user's DID against schema
  const bound = await Keymaster.bindCredential(
    "did:test:schema-membership-v1",
    userDid,
    {
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      credential: memberData,
    }
  );

  // 2. Cryptographically issue and sign
  const credentialDid = await Keymaster.issueCredential(bound);

  // 3. Publish to registry so verifiers and user can resolve it
  await Keymaster.publishCredential(credentialDid);

  return credentialDid;
}
```

---

### Recipe 4: React Native Client Flow

In mobile applications (wallet apps or native apps responding to challenges):

```typescript
import { KeymasterReactNative } from "@yourself_id/siwys-react-native";

// Initialize mobile Keymaster (using AsyncStorage, MMKV, or SecureStore for walletDb)
KeymasterReactNative.initialize({
  gatekeeperConfig: { url: "https://gatekeeper.example.com" },
  walletDb: mobileWalletDbAdapter,
  walletConfig: { id: "mobile-user-id", registry: "hyperswarm" },
  passphrase: "secure-device-passphrase",
  didPrefix: "did:test",
});
await KeymasterReactNative.start();

// Solve challenge when QR code is scanned or deep link opened
async function authenticateOnMobile(challengeDID: string, callbackUrl: string) {
  const responseDID = await KeymasterReactNative.createResponse(challengeDID);

  await fetch(callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response: responseDID }),
  });
}
```

---

## 4. Coding Agent Rules & Critical Conventions

When generating or modifying code in projects utilizing these SDKs, coding agents MUST follow these rules:

1. **Never Expose Keymaster Directly to the Internet:**
   Keymaster manages private keys and signing authority. It must remain on a private VPC or internal network. All external communication from users flows through the partner's application backend.

2. **Always Provide Persistent `walletDb` for Embedded Keymaster:**
   In embedded mode, `Keymaster.initialize()` will create a new wallet on startup if `walletDb.loadWallet()` returns `null`. Agents must wire up a durable database or filesystem storage.

3. **Public Callback URLs for Challenges:**
   The `callback` property passed to `createChallenge({ callback })` must be a URL accessible by the user's mobile device. For local development, agents should configure `ngrok` or tunneling so mobile devices can reach the backend.

4. **Peer Dependencies:**
   `@yourself_id/siwys-react-js` requires `styled-components` (v6+) and `react` (v18+).

5. **Commit Message Conventions:**
   This monorepo enforces conventional commits (`type(scope): description`). When creating commits or PRs:
   - `docs(api-js): update readme`
   - `feat(react-js): add qr code prop`
   - `fix(demo): handle callback error`

---

## 5. Verification & Testing Commands

Agents running commands in this monorepo should use:

- Root bootstrap: `yarn && lerna bootstrap`
- Build all packages: `yarn build`
- Run test suites: `lerna run test`
- Run single package tests:
  - `cd packages/api-js && yarn test`
  - `cd packages/react-js && yarn test`
  - `cd packages/react-native && yarn test`
