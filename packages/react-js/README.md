# @yourself_id/siwys-react-js

React component library for **Sign In With YourSelf (SIWYS)** and **Connect YourSelf (CYS)**.

This package provides pre-built, accessible, and customizable React components to authenticate users via the SELF mobile wallet.

---

## SIWYS vs. CYS: When to Use Which?

* **SIWYS (`<SignInWithYourSelf />` / `<SiwysButton />`)**: **Authentication Replacement**  
  Use for user login and identity verification. It serves as a decentralized, drop-in replacement for federated login providers like "Sign in with Google" or "Sign in with Apple".
* **CYS (`<ConnectYourSelf />` / `<CysButton />`)**: **Attestation & Data Requests**  
  Use when requesting specific data, credentials, or claims from users (e.g. proof of age, memberships, KYC attestations) or establishing a persistent data-sharing connection.

---

## Installation

```bash
npm install @yourself_id/siwys-react-js styled-components
# or
yarn add @yourself_id/siwys-react-js styled-components
```

> **Note:** `styled-components` (v6+) and `react` (v18+) are required peer dependencies.

---

## Available Components

| Component | Description |
|---|---|
| `<SignInWithYourSelf />` | All-in-one authentication component. Handles challenge creation, QR code display, polling, and success states. |
| `<ConnectYourSelf />` | Streamlined component for Connect YourSelf flows. |
| `<SiwysButton />` | Official "Sign in with your SELF" branded button with themes and loading states. |
| `<CysButton />` | Official "Connect your SELF" branded button. |
| `<QRCode />` | Standalone QR code renderer for challenge URLs. |

---

## Usage Examples

### 1. Fully Managed Authentication (`SignInWithYourSelf`)

This is the recommended approach for most web apps. It automatically calls your backend to create a challenge, displays the QR code, polls your authentication verification endpoint, and displays a success view once verified.

```tsx
import React from "react";
import { SignInWithYourSelf } from "@yourself_id/siwys-react-js";

export function LoginCard() {
  return (
    <SignInWithYourSelf
      createChallengeUrl="https://api.yourcompany.com/challenges"
      pollForAuthUrl="https://api.yourcompany.com/check-auth"
      theme="dark" // "light" | "dark"
      showLogo={true}
      showInstructions={true}
      successComponent={
        <div style={{ textAlign: "center", color: "#fff" }}>
          <h2>Authentication Successful!</h2>
          <p>Redirecting to dashboard...</p>
        </div>
      }
      onSiwysPress={() => console.log("Sign-in initiated")}
    />
  );
}
```

### 2. Manual / Custom Flow (`ConnectYourSelf` & `QRCode`)

If you want complete control over challenge fetching, polling lifecycle, or custom animations:

```tsx
import React, { useState, useEffect } from "react";
import { QRCode, CysButton } from "@yourself_id/siwys-react-js";

export function CustomAuth() {
  const [challengeData, setChallengeData] = useState<{ challenge: string; challengeUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const requestChallenge = async () => {
    setLoading(true);
    const res = await fetch("https://api.yourcompany.com/challenges", { method: "POST" });
    const data = await res.json();
    setChallengeData(data);
    setLoading(false);
  };

  return (
    <div>
      {!challengeData ? (
        <CysButton onClick={requestChallenge} disabled={loading} colorTheme="dark" />
      ) : (
        <QRCode challengeUrl={challengeData.challengeUrl} size={256} />
      )}
    </div>
  );
}
```

### 3. Standalone Branded Buttons

You can use the standalone buttons to trigger custom modal dialogs or authentication drawers:

```tsx
import React from "react";
import { SiwysButton, CysButton } from "@yourself_id/siwys-react-js";

export function AuthButtons() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Sign In button with dark theme */}
      <SiwysButton
        onClick={() => alert("Open Sign In Modal")}
        colorTheme="dark" // "light" | "dark" | "blue"
      />

      {/* Connect button with light theme */}
      <CysButton
        onClick={() => alert("Open Connect Modal")}
        colorTheme="light"
      />
    </div>
  );
}
```

---

## Component Props Reference

### `<SignInWithYourSelf />` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `createChallengeUrl` | `string` | Optional | Backend URL that returns `{ challenge, challengeUrl }`. |
| `pollForAuthUrl` | `string` | Optional | Backend URL to poll for auth status with `?challenge={did}`. |
| `challengeDID` | `string` | `""` | Existing challenge DID if already created manually. |
| `challengeBaseUrl` | `string` | Optional | Override callback base URL. |
| `theme` | `"light" \| "dark"` | `"light"` | Color theme for container and typography. |
| `showLogo` | `boolean` | `true` | Show the official SELF logo alongside the QR code. |
| `showInstructions` | `boolean` | `true` | Show step-by-step instructions and app store download badges. |
| `successComponent` | `React.ReactNode` | Optional | Custom component to render upon successful authentication. |
| `onSiwysPress` | `() => void` | Optional | Callback fired when the user initiates authentication. |
| `isCYS` | `boolean` | `false` | Switch copy from "Sign in" to "Connect your SELF". |

### `<SiwysButton />` & `<CysButton />` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `onClick` | `() => void` | Required | Click handler. |
| `colorTheme` | `"light" \| "dark" \| "blue"` | Auto (system preference) | Visual theme of the button. |
| `disabled` | `boolean` | `false` | Disables the button. |

---

## Local Development

Uses [Vite](https://vite.dev/) for testing components locally.

1. Render the component(s) you want to test inside `src/demo/demo.tsx`
2. Run `yarn dev`
3. Test at http://localhost:5173

## Importing Icons as SVGs

Uses [SVGR](https://react-svgr.com/) to transform SVGs into React components.

1. Save the SVG in the `icons/` folder
2. Run `yarn generate-icons`
3. The associated React components will be generated inside `src/icons`

---

## Related Documentation

- [Backend SDK (`@yourself_id/siwys-api-js`)](../api-js/README.md)
- [React Native SDK (`@yourself_id/siwys-react-native`)](../react-native/README.md)
- [Full Keymaster Integration Guide](../../demo/README.md#integrating-keymaster)
