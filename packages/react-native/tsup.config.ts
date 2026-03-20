import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  target: "esnext",
  sourcemap: true,
  clean: true,
  dts: {
    entry: "src/index.ts",
    resolve: true,
  },
  outDir: "dist",
  external: [
    "react",
    "react-dom",
    // Node built-ins — must stay as external requires so Metro/RN bundlers
    // can intercept them with polyfills (e.g. crypto → react-native-quick-crypto)
    "crypto",
    "stream",
    "buffer",
    "fs",
    "path",
    "os",
    "http",
    "https",
    "net",
    "tls",
    "zlib",
    "events",
    "url",
    "util",
    "assert",
    "child_process",
    "worker_threads",
    // @noble/@scure — must be external so Metro resolves them with
    // "browser" export condition. If inlined, tsup converts
    // require("crypto") → __require("crypto") which Metro can't intercept.
    "@noble/hashes",
    "@noble/hashes/crypto",
    "@noble/hashes/hmac",
    "@noble/hashes/sha2",
    "@noble/hashes/sha256",
    "@noble/hashes/sha512",
    "@noble/hashes/utils",
    "@noble/secp256k1",
    "@noble/curves",
    "@noble/ciphers",
    "@noble/ciphers/chacha",
    "@noble/ciphers/utils",
    "@noble/ciphers/webcrypto/utils",
    "@scure/bip32",
    // Other deps that Metro should resolve independently
    "bip39",
    "canonicalize",
    "multiformats",
    "multiformats/bases/base64",
  ],
});
