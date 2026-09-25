# SIWYS JS

React components for Sign in with your SELF.

## Browser Extension Bridge

`SignInWithYourSelf` and `ConnectYourSelf` automatically use the
browser-extension flow in desktop Chromium browsers. Mobile and unsupported
browsers retain the existing challenge deep-link behavior. Set
`extensionConfig` to `false` to disable the extension flow, or provide an
installation URL for browsers where the extension is not installed.

```tsx
<SignInWithYourSelf
  challengeDID={challengeDID}
  pollForAuthUrl="https://partner.example/auth/status"
  extensionConfig={{
    installUrl: "https://partner.example/install-self-extension",
  }}
/>
```

The browser extension does not import this SDK. Its content script communicates
with the partner page through `window.postMessage`. The page posts requests with
`source: "self-id-partner-web-sdk"`, `version: "1"`, a `requestId`, and one
of:

- `type: "self-id:extension:detect"`
- `type: "self-id:extension:sign-in"`, with `{ challengeDID, challengeUrl }` as `payload`

The content script responds with `source: "self-id-browser-extension"`,
`version: "1"`, and the same `requestId`:

- `type: "self-id:extension:available"` confirms the extension is present.
- `type: "self-id:extension:status"` reports `ready`, `pending`, `approved`,
  `rejected`, or `error` and may include an `error` message.

The content script must validate page messages before relaying them to the
background worker. The background worker must treat browser-provided sender
origin as authoritative and keep approval UI and wallet secrets outside the
page and content-script contexts.

# Local Development

Uses [Vite](https://vite.dev/) for testing components locally.

1. Render the component(s) you want to test inside `src/demo/demo.tsx`
2. Run `yarn dev`
3. Test at http://localhost:5173

# Importing Icons as SVGs

Uses [SVGR](https://react-svgr.com/) to transform SVGs into React components.

1. Save the SVG in the `icons/` folder
2. Run `yarn generate-icons`
3. The associated React components will be generated inside `src/icons`
