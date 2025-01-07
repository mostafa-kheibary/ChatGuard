import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import alias from "@rollup/plugin-alias";
import path from "path";
import { babel } from "@rollup/plugin-babel";
import { sveltePreprocess } from "svelte-preprocess";
import image from "@rollup/plugin-image";
import { defineConfig } from "rollup";

const isProduction = process.env.NODE_ENV === "production";
const platform = process.env.PLATFORM;

const treeshakeConfig = {
  moduleSideEffects: [
    "@material/web/switch/switch",
    "@material/web/button/filled-button",
    "@material/web/button/elevated-button",
  ],
};

export default async function () {
  const terser = isProduction ? (await import("@rollup/plugin-terser")).default : null;

  return defineConfig([
    {
      input: "src/view/popup.ts",
      treeshake: treeshakeConfig,
      output: {
        format: "iife",
        file: "dist/popup.js",
      },
      plugins: [
        alias({
          entries: [
            {
              find: "src",
              replacement: path.resolve(path.resolve(__dirname), "src"),
            },
          ],
        }),
        image(),
        svelte({
          preprocess: sveltePreprocess(),
          onwarn() {},
        }),
        postcss({
          inject: true,
          minimize: isProduction,
        }),
        resolve({
          browser: true,
          exportConditions: ["svelte"],
          extensions: [".svelte", ".js", ".mjs"],
        }),
        commonjs(),
        typescript({
          tsconfig: "svelte.tsconfig.json",
        }),
      ],
    },
    {
      input: "src/content/index.ts",
      output: {
        format: "iife",
        file: "dist/content.js",
      },
      treeshake: treeshakeConfig,
      plugins: [
        terser && terser(),
        alias({
          entries: [
            {
              find: "src",
              replacement: path.resolve(path.resolve(__dirname), "src"),
            },
          ],
        }),
        image(),
        svelte({
          preprocess: sveltePreprocess(),
          onwarn() {},
        }),
        postcss({
          inject: true,
          minimize: isProduction,
        }),
        resolve({
          browser: true,
          exportConditions: ["svelte"],
          extensions: [".svelte", ".js", ".mjs"],
        }),
        commonjs(),
        typescript({
          tsconfig: "svelte.tsconfig.json",
        }),
        babel({
          babelHelpers: "bundled",
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "defaults",
              },
            ],
          ],
          extensions: [".js", ".ts"],
        }),
        copy({
          targets: [
            { src: "src/view/popup.html", dest: "dist" },
            { src: "src/assets", dest: "dist" },
            {
              src: "manifest.json",
              dest: "dist",
              transform: (contents) => {
                const manifest = JSON.parse(contents.toString());
                if (platform === "firefox") {
                  manifest["browser_specific_settings"] = {
                    gecko: {
                      id: "mostafa.kheibary@gmail.com",
                    },
                  };
                }
                return JSON.stringify(manifest);
              },
            },
          ],
        }),
      ],
    },
  ]);
}
