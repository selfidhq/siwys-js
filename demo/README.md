# TODO: finish once demo working end to end

# Local Demo

## Requirements

1. Docker installed
2. `kc` and `auth-demo` cloned alongside `siwys-js` (see below)

```
|- auth-demo
|- kc
|- siwys-js
```

## Run SIWYS

Start with:

```
./start-demo
```

Stop with:

```
./stop-demo
```

View SIWYS demo at http://localhost:5173

## Verifying challenges

1. Copy challenge DID from console during QR code generation
2. Navigate to the `auth-demo` client at http://localhost:3000
3. Click "Auth" tab
4. Paste challenge DID and click "Respond"
