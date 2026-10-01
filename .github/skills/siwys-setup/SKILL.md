---
name: siwys-setup
description: Interactive setup and onboarding assistant for integrating Sign In With YourSelf (SIWYS) and Keymaster. Interviews the developer, configures Keymaster (embedded or standalone Docker), sets up wallet persistence, generates backend challenge/verification endpoints, and configures frontend components.
---

# SIWYS & Keymaster Setup Assistant

This skill guides a developer or partner step-by-step through configuring and integrating **Sign In With YourSelf (SIWYS)** and **Keymaster** into their application.

When this skill runs, the agent conducts an interactive interview to discover the developer's architecture, collects the necessary configuration values, and then scaffolds the code.

---

## Phase 1: Interactive Architecture Interview

Ask the user one focused question at a time using the `ask_user` tool (with multiple-choice options). Never bundle multiple questions together into a single message.

### Question 1: Integration Goal
* **Question:** "What would you like to implement with Self ID?"
* **Choices:**
  - "User login / auth replacement (SIWYS) (Recommended)"
  - "Attest or request data / credentials from users (CYS)"
  - "Issue Verifiable Credentials (VCs)"
  - "Mobile identity wallet / client (React Native)"
  - "Full partner integration (Auth + Attestations + Credentials)"

### Question 2: Keymaster Architecture
* **Question:** "How would you like to run Keymaster to manage private keys and signing operations?"
* **Choices:**
  - "Embedded in our Node.js backend (Recommended for Node/TypeScript apps)"
  - "Standalone Docker microservice (Recommended for Python, Go, Java, or microservices)"

### Question 3: Backend Framework
* **Question:** "What backend stack or framework are you using?"
* **Choices:**
  - "Express / Node.js (Recommended)"
  - "Fastify / NestJS"
  - "Next.js (App Router / Route Handlers)"
  - "Other (Python, Go, Ruby, etc.)"

### Question 4: Wallet Persistence (`walletDb`)
* **Context:** Keymaster requires persistent storage to prevent generating a new wallet and private keys on every server restart.
* **If Embedded Keymaster:**
  * **Question:** "Where should Keymaster store its encrypted wallet data?"
  * **Choices:**
    - "PostgreSQL / SQL database (Recommended for production)"
    - "Filesystem / Local volume (Recommended for local dev & single instances)"
    - "Redis"
    - "MongoDB"
* **If Standalone Docker Keymaster:**
  * **Question:** "Which database adapter should the Keymaster Docker container use?"
  * **Choices:**
    - "SQLite / Local volume (Recommended for local dev)"
    - "PostgreSQL (Recommended for production)"
    - "Redis"
    - "MongoDB"

### Question 5: Frontend Technology (if auth is involved)
* **Question:** "What frontend framework are you using?"
* **Choices:**
  - "React web application (`@yourself_id/siwys-react-js`) (Recommended)"
  - "React Native mobile app (`@yourself_id/siwys-react-native`)"
  - "Custom / API only"

### Question 6: Target Environment
* **Question:** "What environment are you targeting for this setup?"
* **Choices:**
  - "Local development (Gatekeeper at http://localhost:4422, did:test) (Recommended)"
  - "Staging / Production (Custom Gatekeeper cluster, production DID prefix)"

---

## Phase 2: Configuration & Environment Gathering

Based on the interview responses, summarize the selected options in a clear Markdown table and prompt the user for any specific secrets:
1. `GATEKEEPER_URL` (Default: `http://localhost:4422` for local, or partner cluster URL)
2. `KEYMASTER_NODE_ID` (e.g. `company-auth-node`)
3. `KEYMASTER_PASSPHRASE` (Secure passphrase used to encrypt the wallet at rest)
4. `KEYMASTER_DID_PREFIX` (Default: `did:test` for dev, or custom prefix)
5. `BACKEND_PUBLIC_URL` (Public URL where mobile wallets can send challenge responses; remind developer to use `ngrok` if testing on localhost).

---

## Phase 3: Code Scaffolding

Once configuration is confirmed, proceed with surgical code generation tailored to the chosen options.

### Pathway A: Embedded Keymaster (Node.js / Express)

1. **Install Dependencies:**
   ```bash
   yarn add @yourself_id/siwys-api-js
   # or npm install @yourself_id/siwys-api-js
   ```

2. **Generate Wallet Persistence Adapter (`src/services/wallet.ts`):**
   * Scaffold `saveWallet`, `loadWallet`, and `updateWallet` hooked into the developer's selected database or filesystem.

3. **Generate Keymaster Service Initializer (`src/services/keymaster.ts`):**
   * Scaffold `Keymaster.initialize(...)` with `gatekeeperConfig`, `walletConfig`, `walletDb`, `passphrase`, and `didPrefix`.
   * Export initialization function called on server startup.

4. **Generate HTTP Routes:**
   * `POST /challenges` — Calls `Keymaster.createChallenge({ callback })`.
   * `POST /login` — Calls `Keymaster.verifyResponse(response)` and issues session token.
   * `GET /check-auth?challenge={did}` — Returns authentication status for frontend polling.

---

### Pathway B: Standalone Docker Keymaster

1. **Scaffold Docker Compose Service:**
   Add Keymaster container definition to `docker-compose.yml`:
   ```yaml
   keymaster:
     image: keychainmdip/keymaster
     ports:
       - "4226:4226"
     environment:
       - KC_GATEKEEPER_URL=${KC_GATEKEEPER_URL:-http://gatekeeper:4224}
       - KC_KEYMASTER_PORT=4226
       - KC_KEYMASTER_DB=${KC_KEYMASTER_DB:-sqlite}
       - KC_NODE_ID=${KC_NODE_ID}
       - KC_ENCRYPTED_PASSPHRASE=${KC_ENCRYPTED_PASSPHRASE}
       - KC_DEFAULT_REGISTRY=hyperswarm
       - KC_KEYMASTER_DID_PREFIX=${KC_KEYMASTER_DID_PREFIX:-did:test}
   ```

2. **Client Wrapper:**
   Scaffold client using `KeymasterExternalClient` from `@yourself_id/siwys-api-js` pointing to `http://keymaster:4226`.

---

### Frontend Scaffolding (React)

1. **Install Dependencies:**
   ```bash
   yarn add @yourself_id/siwys-react-js styled-components
   ```

2. **Scaffold Sign-In Component:**
   Create `<SignInWithYourSelf />` component pointing `createChallengeUrl` and `pollForAuthUrl` to the backend endpoints.

---

## Phase 4: Verification Loop

1. Run backend tests or verify endpoints with `curl`:
   ```bash
   curl -X POST http://localhost:3001/challenges
   ```
2. Verify that `wallet.json` or database table has been created with the encrypted wallet state.
3. Restart the server once and verify that Keymaster loads the existing wallet (`Using existing wallet with ID ...`) rather than creating a new ID.
4. If testing with the SELF mobile app, verify that the backend callback URL is publicly reachable (via `ngrok http 3001`).
