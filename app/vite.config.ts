import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }): UserConfig => {
  const isDev = mode === "development";
  return {
    // The server bundle runs as a Cloudflare Worker — there is no node_modules
    // at runtime. Vite's default SSR build leaves npm deps as bare external
    // imports, which resolve on a Node server but throw in a Worker. Bundle
    // them all in. (node: builtins stay external — nodejs_compat provides them.)
    ssr: {
      // Production bundles dependencies so the Worker has no node_modules; the
      // platform keeps `cloudflare:workers` external (the runtime provides it).
      // Dev leaves deps external/native (the alias resolves the local shim).
      noExternal: isDev ? [] : (true as const),
      external: isDev ? [] : ["cloudflare:workers"],
    },
    build: {
      rollupOptions: { external: [/^cloudflare:/] },
    },
    ...(isDev
      ? {
          resolve: {
            alias: {
              // In dev there is no Cloudflare runtime; provide a local env shim
              // so the site starts and renders on a plain machine.
              "cloudflare:workers": fileURLToPath(
                new URL("./src/lib/cloudflare-env.dev.ts", import.meta.url),
              ),
            },
          },
        }
      : {}),
    plugins: [
      svgr({
        svgrOptions: {
          icon: true,
          svgProps: { fill: "currentColor" },
        },
      }),
      // TanStack Start plugin must run before React's plugin.
      tanstackStart({
        server: { entry: "server" },
      }),
      react(),
      tailwindcss(),
      tsconfigPaths(),
    ],
  };
});