import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));

function rewrite(specifier) {
  if (!specifier.startsWith("@/")) return null;
  return pathToFileURL(join(srcRoot, `${specifier.slice(2)}.ts`)).href;
}

export async function resolve(specifier, context, nextResolve) {
  const aliased = rewrite(specifier);
  if (aliased) return { url: aliased, shortCircuit: true };
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!url.endsWith(".ts") && !url.endsWith(".mts")) return nextLoad(url, context);
  const source = readFileSync(fileURLToPath(url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      sourceMap: false,
    },
    fileName: url,
  });
  return {
    format: "module",
    source: output.outputText,
    shortCircuit: true,
  };
}
