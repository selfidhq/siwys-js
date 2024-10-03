# SIWYS-JS

## Overview

SIWYS-JS is a monorepo designed to support Self's JS packages.

## Setup

### Install Root Deps

```bash
npm i
```

### Initialize Husky

```bash
npm run prepare
```

### Install Package Deps

```bash
lerna bootstrap
```

### Build Packages

```bash
npm run build
```

## Releases

Releases are automatically versioned and published via lerna in github actions.

## Commits

This repository requires commitlint formatting. To properly setup your env please make sure you run the prepare script at the root of the project.
