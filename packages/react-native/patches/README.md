# Patches

This directory contains patches applied to node_modules dependencies using [patch-package](https://github.com/ds300/patch-package).

## @mdip/keymaster@1.3.2

**Added method:** `createIdOperation(name, options)`

This patch adds a new `createIdOperation` method to the Keymaster class that creates a signed ID creation transaction without actually submitting it to the blockchain or mutating the wallet.

### Purpose
The `createIdOperation` method allows you to:
- Generate a signed DID creation operation
- Inspect the transaction before submission
- Batch multiple transactions
- Manually control when DIDs are created on-chain

### Differences from `createId`
- Returns the **signed operation object** instead of the created DID string
- Does **NOT** mutate the wallet (doesn't add the ID to wallet.ids)
- Does **NOT** call `gatekeeper.createDID()` - just prepares the transaction
- Loads wallet in read-only mode

### Usage
```typescript
const operation = await keymaster.createIdOperation('myNewId', { 
  registry: 'hyperswarm' 
});

// operation contains the signed transaction that can be submitted later
// You can then manually call gatekeeper.createDID(operation) when ready
```

### Files Modified
- `dist/esm/keymaster.js` - ESM implementation
- `dist/cjs/keymaster.cjs` - CommonJS implementation  
- `dist/types/keymaster.d.ts` - TypeScript type definitions

### Maintenance
This patch will be automatically applied after `yarn install` via the `postinstall` script in package.json.

If the @mdip/keymaster package is updated, this patch may need to be regenerated:
1. Update the package version
2. Manually re-apply the changes
3. Run `yarn patch-package @mdip/keymaster` to create a new patch
