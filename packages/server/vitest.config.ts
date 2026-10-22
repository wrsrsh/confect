import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";
import sharedConfig from "../../vitest.shared";

export default mergeConfig(
  sharedConfig,
  defineConfig({
    root: import.meta.dirname,
    plugins: [tsconfigPaths()],
    resolve: {
      alias: [
        {
          find: /^@confect\/server$/,
          replacement: path.resolve(import.meta.dirname, "./src/index.ts"),
        },
        {
          find: /^@confect\/server\/(.*)$/,
          replacement: path.resolve(import.meta.dirname, "./src/$1"),
        },
      ],
    },
    test: {
      include: ["test/**/*.test.ts"],
      globalSetup: ["./test/setup.ts"],
    },
  }),
);
