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
  external: ["react", "react-dom"],
});
