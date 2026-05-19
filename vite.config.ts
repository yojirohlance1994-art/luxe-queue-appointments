import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { defineConfig as defineViteConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const isVercel = Boolean(process.env.VERCEL);

export default isVercel
  ? defineViteConfig({
      resolve: {
        alias: {
          "@": `${process.cwd()}/src`,
        },
        dedupe: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "@tanstack/react-query",
          "@tanstack/query-core",
        ],
      },
      plugins: [tailwindcss(), tsConfigPaths(), tanstackStart(), nitro(), viteReact()],
    })
  : defineLovableConfig();
