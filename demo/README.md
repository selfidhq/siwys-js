# CYS Demo

This demo showcases the Connect YourSelf (CYS) authentication flow with both a React frontend and Express backend.

## Requirements

- Node.js (v16 or higher)
- Yarn
- ngrok (recommended for mobile testing)

## Quick Start

### 1. Install Dependencies

From the root of the monorepo:

```bash
yarn install
yarn build
```

### 2. Setup Environment Variables

Create `.env` files for both frontend and backend:

**Backend** (`demo/backend/.env`):
```bash
BACKEND_URL=http://localhost:3001
```

**Frontend** (`demo/app/.env`):
```bash
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Run Locally (Development)

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd demo/backend
yarn start
```
Backend will run on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd demo/app
yarn dev
```
Frontend will run on http://localhost:5173

Visit http://localhost:5173 to see the demo.

## Using with ngrok (Recommended for Mobile Testing)

To test authentication with the SELF mobile app, you need to expose your backend to the internet using ngrok:

### 1. Install ngrok

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### 2. Start ngrok

In a new terminal:
```bash
ngrok http 3001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3001
```

### 3. Update Environment Variables

Copy the ngrok URL and update your `.env` files:

**Backend** (`demo/backend/.env`):
```bash
BACKEND_URL=https://abc123.ngrok-free.app
```

**Frontend** (`demo/app/.env`):
```bash
VITE_BACKEND_URL=https://abc123.ngrok-free.app
```

### 4. Restart Both Servers

Stop and restart both backend and frontend to pick up the new environment variables.

### 5. Test Authentication

1. Open the frontend in your browser
2. Click on either "Sign In With YourSelf" or "Connect YourSelf" tab
3. Scan the QR code with the SELF mobile app
4. Complete authentication on your mobile device
5. The browser will automatically detect successful authentication

## Demo Features

### Sign In With YourSelf (SIWYS - Authentication Replacement)
A complete, ready-to-use drop-in authentication flow (similar to "Sign in with Google") for user login and identity verification. It handles:
- Challenge creation
- QR code display
- Polling for authentication
- Success state

### Connect YourSelf (CYS - Attestation & Data Requests)
A customizable flow for attesting and requesting data from users (e.g. verified credentials, claims, or data exchange). It handles:
- Challenge creation via API (with optional credential requirements)
- Authentication and attestation polling
- State management
- Custom UI/UX

> **Combined Workflow:** Many partners combine both flows sequentially—first authenticating the user via SIWYS, and subsequently using CYS to attest data or request verified credentials from the user's wallet.

## API Endpoints

- `POST /challenges` - Create a new authentication challenge
- `GET /check-auth?challenge={did}` - Poll for authentication status
- `POST /login` - Callback endpoint for authentication responses
- `GET /login?challenge={did}` - Browser-friendly callback page

## Integrating Keymaster

If you are partnering with Self and need to run your own Keymaster to issue credentials and create authentication challenges, there are two primary integration paths:

```
┌─────────────────────────┐          ┌───────────────────────────────────┐
│     Frontend App        │          │          SELF Mobile App          │
│ (@yourself_id/react-js) │          │            (User Wallet)          │
└────────────┬────────────┘          └─────────────────┬─────────────────┘
             │ 1. Request Challenge / Poll Auth        │ 3. Callback / Verify Response
             ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Partner Backend API                             │
│                  (POST /challenges, POST /login, etc.)                 │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
     [Path A: Embedded]                               [Path B: Standalone]
  Keymaster in-process via                      Keymaster Docker Container
  @yourself_id/siwys-api-js                     via KeychainMDIP/kc (:4226)
           │                                                   │
           └─────────────────────────┬─────────────────────────┘
                                     ▼
                          Gatekeeper Node / MDIP
```

---

### Implementation Paths

#### Path A: Embedded In-Process (`Keymaster`)
Best for Node.js / TypeScript backends that prefer running Keymaster inside the existing application process without maintaining an extra container service.

* **How it works:** Keymaster runs directly inside your Node.js process using `@yourself_id/siwys-api-js`.
* **Initialization:**
  ```typescript
  import { Keymaster } from "@yourself_id/siwys-api-js";
  import { saveWallet, loadWallet, updateWallet } from "./services/wallet.js";

  Keymaster.initialize({
    gatekeeperConfig: {
      url: process.env.GATEKEEPER_URL || "http://localhost:4422",
    },
    walletConfig: {
      id: "company-wallet-id",
      registry: "hyperswarm",
      mnemonic: process.env.WALLET_MNEMONIC, // optional: recovers existing seed on first boot
    },
    walletDb: {
      saveWallet,   // custom persistence (file, PostgreSQL, Redis, etc.)
      loadWallet,
      updateWallet,
    },
    passphrase: process.env.KEYMASTER_PASSPHRASE,
    didPrefix: "did:test", // or production DID method
  });

  await Keymaster.start();
  ```
* **Relevant Code References:**
  * Backend initialization: [`demo/backend/src/index.ts`](backend/src/index.ts)
  * Wallet persistence implementation: [`demo/backend/src/services/wallet.ts`](backend/src/services/wallet.ts)
  * Class source: [`packages/api-js/src/keymaster.ts`](../packages/api-js/src/keymaster.ts)

---

#### Path B: Standalone Docker Service (`KeymasterExternalClient`)
Best for polyglot backends (Go, Python, Java, etc.) or microservice environments.

* **How it works:** Run the Keymaster microservice container from the [`KeychainMDIP/kc`](https://github.com/KeychainMDIP/kc) repository. Your backend connects to it over HTTP REST.
* **Docker Compose & Configuration:**
  * Docker definition: [`KeychainMDIP/kc docker-compose.yml`](https://github.com/KeychainMDIP/kc/blob/main/docker-compose.yml)
  * Environment variables template: [`KeychainMDIP/kc sample.env`](https://github.com/KeychainMDIP/kc/blob/main/sample.env)
* **Required environment variables for the Keymaster container:**
  ```env
  KC_GATEKEEPER_URL=http://gatekeeper:4224       # Upstream Gatekeeper URL
  KC_KEYMASTER_PORT=4226                         # Service port
  KC_KEYMASTER_DB=sqlite                         # json | sqlite | postgres | redis | mongodb
  KC_NODE_ID=company-keymaster                   # Unique Node ID
  KC_ENCRYPTED_PASSPHRASE=your-strong-passphrase # Required: Encrypts wallet at rest
  KC_DEFAULT_REGISTRY=hyperswarm                 # hyperswarm | TBTC | etc.
  KC_KEYMASTER_DID_PREFIX=did:test               # DID prefix (e.g. did:test)
  ```
* **Connecting from your application:**
  ```typescript
  import { KeymasterExternalClient } from "@yourself_id/siwys-api-js";

  const keymaster = new KeymasterExternalClient({
    keymasterConfig: {
      url: "http://keymaster:4226",
    },
    didPrefix: "did:test",
  });

  await keymaster.start();
  ```
  * Client source: [`packages/api-js/src/keymasterClient.ts`](../packages/api-js/src/keymasterClient.ts)

---

### Backend Endpoints (Exposing to the Frontend)

Your backend keeps Keymaster private and exposes application-level routes:

1. **`POST /challenges`**: Generates a challenge for the user to solve:
   ```typescript
   const challenge = await Keymaster.createChallenge({
     callback: `${BACKEND_URL}/login`,
   });
   res.json(challenge); // { challenge: "did:...", challengeUrl: "https://.../login?challenge=did:..." }
   ```
2. **`POST /login`**: Receives and verifies the response posted by the SELF mobile wallet:
   ```typescript
   const { response } = req.body;
   const verify = await Keymaster.verifyResponse(response);
   if (verify.match) {
     // Save authenticated user / issue session token
     res.json({ authenticated: true });
   }
   ```
3. **`GET /check-auth?challenge={did}`**: Polled by your frontend until authentication succeeds.
4. **Credential Issuance**:
   ```typescript
   const bound = await Keymaster.bindCredential(schemaId, subjectDid, {
     credential: { role: "member", tier: "gold" },
   });
   const credDid = await Keymaster.issueCredential(bound);
   ```

* Complete example: [`demo/backend/src/index.ts`](backend/src/index.ts)

---

### Frontend Integration

Install the `@yourself_id/react-js` package:

```bash
npm install @yourself_id/react-js
```

#### Option 1: Drop-in Managed Component (`SignInWithYourSelf`)
Handles challenge creation, QR code rendering, and polling automatically:

```tsx
import { SignInWithYourSelf } from "@yourself_id/react-js";

export function Login() {
  return (
    <SignInWithYourSelf
      createChallengeUrl="https://api.yourcompany.com/challenges"
      pollForAuthUrl="https://api.yourcompany.com/check-auth"
      onSuccess={() => console.log("Logged in!")}
      showLogo
      showInstructions
    />
  );
}
```

#### Option 2: Custom / Manual Flow (`ConnectYourSelf`)
Gives full control over polling and state transitions while rendering the QR code:

* Example source: [`demo/app/src/app.tsx`](app/src/app.tsx)

## Troubleshooting

### ngrok Warning Page

If you see an ngrok warning page, the demo already includes the `ngrok-skip-browser-warning` header in all API requests.

### Backend Connection Issues

Make sure:
1. Backend is running on port 3001
2. Environment variables are set correctly
3. You've restarted services after changing `.env` files

### Build Issues

If you see import errors, rebuild the packages:
```bash
cd ../..  # back to monorepo root
yarn build
```
