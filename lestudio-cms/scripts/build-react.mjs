import esbuild from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const outDir = "src/assets/react";
mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: ["client/mount.tsx"],
  bundle: true,
  minify: true,
  sourcemap: false,
  format: "iife",
  target: "es2018",
  outfile: `${outDir}/react-islands.bundle.js`,
  jsx: "automatic",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  define: { "process.env.NODE_ENV": '"production"' },
});

execSync(
  `npx tailwindcss -i client/index.css -o ${outDir}/react-islands.css --minify`,
  { stdio: "inherit" },
);

console.log("React island built:", outDir);
