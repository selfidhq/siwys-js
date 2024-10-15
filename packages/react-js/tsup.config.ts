import { defineConfig } from "tsup";
import path from "path";
import fsPromises from "fs/promises";
import postcss from "postcss";
import postcssModules from "postcss-modules";

export default defineConfig({
  entry: ["src/index.ts"], // Entry point of the library
  format: ["esm", "cjs"], // Output both ESM and CJS formats
  dts: true, // Generate TypeScript declaration files
  sourcemap: true, // Generate sourcemaps for debugging
  clean: true, // Clean the dist folder before building
  external: ["react", "react-dom"], // Mark peer dependencies as external
  esbuildPlugins: [
    // see: https://github.com/egoist/tsup/issues/536#issuecomment-1302012400
    {
      name: "css-module",
      setup(build): void {
        build.onResolve(
          { filter: /\.module\.css$/, namespace: "file" },
          (args) => ({
            path: `${args.path}#css-module`,
            namespace: "css-module",
            pluginData: {
              pathDir: path.join(args.resolveDir, args.path),
            },
          })
        );
        build.onLoad(
          { filter: /#css-module$/, namespace: "css-module" },
          async (args) => {
            const { pluginData } = args as {
              pluginData: { pathDir: string };
            };

            const source = await fsPromises.readFile(
              pluginData.pathDir,
              "utf8"
            );

            let cssModule = {};
            const result = await postcss([
              postcssModules({
                getJSON(_, json) {
                  cssModule = json;
                },
              }),
            ]).process(source, { from: pluginData.pathDir });

            return {
              pluginData: { css: result.css },
              contents: `import "${
                pluginData.pathDir
              }"; export default ${JSON.stringify(cssModule)}`,
            };
          }
        );
        build.onResolve(
          { filter: /\.module\.css$/, namespace: "css-module" },
          (args) => ({
            path: path.join(args.resolveDir, args.path, "#css-module-data"),
            namespace: "css-module",
            pluginData: args.pluginData as { css: string },
          })
        );
        build.onLoad(
          { filter: /#css-module-data$/, namespace: "css-module" },
          (args) => ({
            contents: (args.pluginData as { css: string }).css,
            loader: "css",
          })
        );
      },
    },
  ],
});
