/**
 * Fails if generated design token outputs differ from the working tree (CI guard).
 *
 *   yarn check:token-drift
 */
import { execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const GENERATED_PATHS = ["truss-token-vars.ts", "truss-palette.ts", "src/css/generated/theme-scopes.css"] as const;

function main(): void {
  execSync("yarn generate:design-tokens", { cwd: rootDir, stdio: "inherit" });
  const pathsArg = GENERATED_PATHS.join(" ");
  const out = execSync(`git diff --name-only ${pathsArg}`, {
    cwd: rootDir,
    encoding: "utf8",
  }).trim();
  if (out.length > 0) {
    const pathsList = GENERATED_PATHS.join("\n  - ");
    console.error(`
Design token drift: committed generated files do not match tokens/tokens.json after codegen.

CI (or this check) ran yarn generate:design-tokens; git still shows changes in:
  - ${pathsList}

Fix locally:
  1. Run: yarn generate:design-tokens
  2. Commit the updated files above (and push)

Changed paths from git:
${out}
`);
    execSync(`git diff ${pathsArg}`, { cwd: rootDir, stdio: "inherit" });
    process.exit(1);
  }
  console.log(`No drift in ${GENERATED_PATHS.join(", ")}`);
}

main();
