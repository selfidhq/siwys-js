import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["./src/index.ts"], // Archivos de entrada
  format: ["esm", "cjs"], // Generar ambos formatos
  target: "esnext", // Objetivo de compilación (puedes ajustarlo a tus necesidades)
  sourcemap: true, // Generar mapas de fuente
  clean: true, // Limpiar el directorio de salida antes de la compilación
  dts: {
    entry: "src/index.ts",
    resolve: true, // Generate TypeScript declaration files
  }, // Generar archivos de declaración .d.ts
  outDir: "dist",
  external: ["react", "react-dom"], // Directorio de salida
});
