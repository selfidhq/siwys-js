# SIWYS-JS

## Overview

SIWYS-JS is a monorepo designed to support Self's JS packages.

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
