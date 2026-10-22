# Package Release & Publishing Guide

This repository uses a manual, on-demand release workflow modeled after [KeychainMDIP/kc](https://github.com/KeychainMDIP/kc), combined with automatic canary releases on pull requests.

---

## Overview of the Release Flow

1. **Feature PRs merge to `main` without publishing:**  
   Merging code into `main` does **not** trigger an npm publish. This allows developers to merge multiple features, fixes, and docs into `main` without worrying about branch protection conflicts or accidental production releases.
2. **Canary releases run on Pull Requests:**  
   Every feature pull request automatically builds and publishes a canary version tagged with the PR branch name so partners and developers can test changes immediately.
3. **Official releases run on-demand from a release branch:**  
   When ready to publish to npm, an authorized team member runs the GitHub Actions workflow from a dedicated `release-*` branch. Once published, a PR is opened to merge the updated versions and changelogs back into `main`.

---

## How to Cut an Official Release

### Step 1: Create a Release Branch
Ensure your local `main` branch is up to date, then branch off and push:

```bash
git checkout main
git pull origin main
git checkout -b release-0.37.0
git push -u origin release-0.37.0
```

> **Note:** Branch names starting with `release-`, `release/*`, `beta-*`, `*-release`, or `hotfix/*` are permitted by `lerna.json` for versioning.

---

### Step 2: Trigger the Workflow in GitHub Actions

1. Navigate to **Actions** → [**Publish Packages**](https://github.com/selfidhq/siwys-js/actions/workflows/publish.yml).
2. Click **Run workflow**.
3. Select **Use workflow from**: Choose your release branch (e.g., `release-0.37.0`).
4. Configure the release options:

| Input | Options | Description |
|---|---|---|
| **Package to publish** | `all`, `@yourself_id/siwys-api-js`, `@yourself_id/siwys-react-js`, `@yourself_id/siwys-react-native` | Select `all` or target an individual package. |
| **Version bump type** | `patch`, `minor`, `major`, `graduate`, `prerelease`, `prepatch`, `preminor`, `premajor`, `none` | See [Version Bump Breakdown](#version-bump-breakdown) below. |
| **Pre-release identifier** | `beta` (default), `alpha`, `rc`, `none` | Identifier used for pre-releases and npm dist-tags. |

5. Click **Run workflow**.

---

### Step 3: What the Workflow Does

1. **Build & Test:** Runs unit tests and builds the packages.
2. **Version:** Runs `lerna version` to bump package versions, generate `CHANGELOG.md` updates from conventional commits, and commit & tag the release on your `release-*` branch.
3. **Publish:** Publishes the packages to the npm registry using **npm OIDC Trusted Publishing** (provenance enabled).

---

### Step 4: Merge the Release Branch into `main`

Once the workflow finishes successfully:
1. Open a pull request from `release-0.37.0` into `main`.
2. Title it `chore(release): publish packages` (or similar conventional commit title).
3. Merge the PR. This syncs the bumped `package.json` files and updated `CHANGELOG.md` notes back into `main`.

---

## Version Bump Breakdown

### Stable Releases
* **`patch`:** Bug fixes (e.g. `0.36.0` → `0.36.1`)
* **`minor`:** New features, backwards-compatible (e.g. `0.36.0` → `0.37.0`)
* **`major`:** Breaking changes or graduating past 0.x (e.g. `0.36.0` → `1.0.0`)

### Pre-Releases & Graduation
* **`prepatch` / `preminor` / `premajor`:** Starts a pre-release cycle (e.g. `0.37.0-beta.0`).
* **`prerelease`:** Increments existing pre-release (e.g. `0.37.0-beta.0` → `0.37.0-beta.1`).
* **`graduate`:** Promotes a pre-release to stable by stripping the pre-release tag (e.g. `0.37.0-beta.1` → `0.37.0`).

### Retrying Failed Publishes
* **`none`:** Skips versioning and tags; publishes already-tagged versions directly to npm. Use this if a previous publish job failed after the versioning step.

---

## Canary Releases (Pull Requests)

Every pull request opened against `main` automatically runs the canary step:
* Package versions are tagged with `<safe-branch-name>.<run-number>` (e.g., `0.36.1-my-feature.42`).
* Published to npm with the npm dist-tag set to the branch name (`@yourself_id/siwys-api-js@my-feature`).
* Canary releases never modify git tags or push commits to the branch.

---

## NPM Authentication (OIDC)

Releases authenticate with npm using **OIDC Trusted Publishing** (`id-token: write` and `npm_config_provenance: true`). No static access tokens (`NPM_ACCESS_TOKEN` / `NODE_AUTH_TOKEN`) are required. npm verifies the GitHub Actions provenance and cryptographic token generated directly by GitHub.
