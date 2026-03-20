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
  ],
});
