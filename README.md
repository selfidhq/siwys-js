# SIWYS-JS

## Overview

SIWYS-JS is a monorepo designed to support Self's JavaScript and TypeScript packages for **Sign In With YourSelf (SIWYS)** and the **Multi-Dimensional Identity Protocol (MDIP)**.

## Packages

| Package | Directory | Description |
|---|---|---|
| [`@yourself_id/siwys-api-js`](packages/api-js/README.md) | `packages/api-js` | Node.js backend SDK for Keymaster, Gatekeeper client, challenges, and verifiable credentials. |
| [`@yourself_id/siwys-react-js`](packages/react-js/README.md) | `packages/react-js` | React component library for web authentication (`SignInWithYourSelf`, `ConnectYourSelf`, QR code, branded buttons). |
| [`@yourself_id/siwys-react-native`](packages/react-native/README.md) | `packages/react-native` | React Native client SDK for iOS and Android identity and wallet operations. |

## Documentation for AI Coding Agents

If you or your partners are using AI coding agents (such as GitHub Copilot, Claude Code, Cursor, or Codex) to integrate Self ID or SIWYS, refer to our dedicated coding agent reference:

👉 **[AGENTS.md](AGENTS.md)** — Architectural rules, code recipes, environment requirements, and implementation guidelines for coding agents.

## Integrating Keymaster

For a detailed guide on how partners can run their own Keymaster (embedded or standalone via Docker) to create challenges, issue credentials, and integrate with frontend applications, see the [Keymaster Integration Guide in demo/README.md](demo/README.md#integrating-keymaster).

## Setup

### Install Root Deps

```bash
yarn
```

### Initialize Husky

```bash
yarn prepare
```

### Install Package Deps

```bash
lerna bootstrap
```

### Build Packages

```bash
yarn build
```

## Releases

Releases are automatically versioned and published via lerna in github actions.

## Commits

This repository requires adhering to semantic release commit formatting [Semantic Release](https://github.com/semantic-release/semantic-release). To properly setup your env please make sure you run the prepare script at the root of the project.

Each commit, and the PR title, must follow the semantic release commit formatting rules for lerna to properly version and publish the package. Here are example commits for patch, minor, and major release updates:

### Fix

`fix(sapp-1): updating text prop`
`chore(sapp-2): fixing tests for button`

### Feat

`feat(sapp-3): adding qr code component`

### Breaking Change

`BREAKING CHANGE: rewriting button component`

## Pull Requests

Due to our use of lerna's auto versioning and publishing, our pull request titles must also adhere to the commitlint rules. Any PR titles that do not adhere to the formatting rules will fail validation.

## Local Demo

Start with:

```
./start-demo
```

Stop with:

```
./stop-demo
```

View SIWYS demo at http://localhost:5173

See [demo/README.md](demo/README.md) for more information.
