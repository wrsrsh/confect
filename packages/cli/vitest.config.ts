import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";
import sharedConfig from "../../vitest.shared";

export default mergeConfig(
  sharedConfig,
  defineConfig({
    root: import.meta.dirname,
    plugins: [tsconfigPaths()],
    test: {
    },
  }),
);
