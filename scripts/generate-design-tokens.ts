/**
 * Reads `tokens/tokens.json` (DTCG 2025.10–shaped) and emits:
 * - `truss-token-vars.ts` — `Tokens` map for Truss (`--b-*` names only)
 * - `truss-palette.ts` — primitive color literals only (Truss `palette`; no semantic roles)
 * - `src/css/generated/theme-scopes.css` — `:root` semantic defaults and `[data-theme="…"]` overrides
 *
 * Palette order: `White` / `Transparent`, then remaining `beam.color.primitive.*` keys in JSON order.
 * Semantic roles use `Tokens` (`--b-*`) and baseline values on `:root` in `theme-scopes.css`.
 *
 *   yarn generate:design-tokens
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  buildPathMap,
  collectTokenLeaves,
  dtcgSrgbColorToRgbaString,
  hexToRgbaString,
  isDtcgSrgbColorValue,
  isPathReference,
  loadTokensJson,
  resolveValue,
  type TokenLeaf,
} from "./dtcg-shared";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokensDir = join(rootDir, "tokens");
const trussTokenVarsPath = join(rootDir, "truss-token-vars.ts");
const trussPalettePath = join(rootDir, "truss-palette.ts");
const themeScopesCssPath = join(rootDir, "src/css/generated/theme-scopes.css");

const BEAM_EXT = "com.homebound.beam";

type SemanticCodegenRow = {
  tokenName: string;
  cssVar: string;
  defaultRgba: string;
  /** Resolved theme axis values (e.g. contrast), excluding baseline default. */
  themeRgba: Record<string, string>;
};

function getBeamExtensionRecord(leaf: TokenLeaf): Record<string, unknown> {
  const ext = leaf.$extensions?.[BEAM_EXT];
  if (!ext || typeof ext !== "object") {
    throw new Error(`Token ${leaf.path} missing $extensions["${BEAM_EXT}"]`);
  }
  return ext as Record<string, unknown>;
}

function resolvedColorToRgbaString(resolved: unknown, pathMap: Map<string, TokenLeaf>): string {
  if (isDtcgSrgbColorValue(resolved)) {
    return dtcgSrgbColorToRgbaString(resolved);
  }
  if (typeof resolved === "string") {
    if (resolved.startsWith("#")) {
      return hexToRgbaString(resolved);
    }
    if (resolved.startsWith("rgba(")) {
      return resolved;
    }
  }
  if (isPathReference(resolved)) {
    const inner = resolveValue(resolved, pathMap);
    return resolvedColorToRgbaString(inner, pathMap);
  }
  throw new Error(`Unsupported resolved color value: ${JSON.stringify(resolved)}`);
}

function buildSemanticCodegenRow(
  tokenName: string,
  leaf: TokenLeaf,
  pathMap: Map<string, TokenLeaf>,
): SemanticCodegenRow {
  const beam = getBeamExtensionRecord(leaf);
  if (typeof beam.cssVar !== "string") {
    throw new Error(`Token ${leaf.path} missing cssVar in Beam extension`);
  }
  const resolvedDefault = resolveValue(leaf.$value, pathMap);
  const defaultRgba = resolvedColorToRgbaString(resolvedDefault, pathMap);

  const themeRgba: Record<string, string> = {};
  for (const [axisKey, rawVal] of Object.entries(beam)) {
    if (axisKey === "cssVar") continue;
    if (typeof rawVal !== "string") continue;
    const resolved = isPathReference(rawVal) ? resolveValue(rawVal, pathMap) : rawVal;
    themeRgba[axisKey] = resolvedColorToRgbaString(resolved, pathMap);
  }

  return { tokenName, cssVar: beam.cssVar, defaultRgba, themeRgba };
}

function collectSemanticRows(
  merged: Record<string, unknown>,
  semanticLeaves: Map<string, TokenLeaf>,
  pathMap: Map<string, TokenLeaf>,
): SemanticCodegenRow[] {
  const beamRoot = merged.beam as Record<string, unknown>;
  const colorRoot = beamRoot.color as Record<string, unknown>;
  const semanticObj = colorRoot.semantic as Record<string, unknown>;
  return Object.keys(semanticObj).map((name) => {
    const leaf = semanticLeaves.get(`beam.color.semantic.${name}`);
    if (!leaf) throw new Error(`Missing semantic leaf beam.color.semantic.${name}`);
    return buildSemanticCodegenRow(name, leaf, pathMap);
  });
}

/** Keys on Beam extension that are theme axes (everything except cssVar uses resolved rgba here). */
function themeAxisKeysFromRows(rows: SemanticCodegenRow[]): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row.themeRgba)) {
      keys.add(k);
    }
  }
  return [...keys].sort((a, b) => a.localeCompare(b));
}

function entriesForTheme(rows: SemanticCodegenRow[], themeKey: string): [string, string][] {
  const pairs: [string, string][] = [];
  for (const row of rows) {
    const value = row.themeRgba[themeKey];
    if (value !== undefined) {
      pairs.push([row.cssVar, value]);
    }
  }
  pairs.sort((a, b) => a[0].localeCompare(b[0]));
  return pairs;
}

function entriesForRoot(rows: SemanticCodegenRow[]): [string, string][] {
  const pairs = rows.map((row) => [row.cssVar, row.defaultRgba] as [string, string]);
  pairs.sort((a, b) => a[0].localeCompare(b[0]));
  return pairs;
}

function emitThemeScopesCss(rows: SemanticCodegenRow[]): string {
  const header = `/*
 * AUTO-GENERATED — do not edit. Run \`yarn generate:design-tokens\`, \`yarn build\`, or \`yarn build:truss\`.
 *
 * :root — baseline semantic custom properties from beam.color.semantic.* $value.
 * [data-theme] — overrides per theme axis; values must match ContrastScope / tokens.json.
 */

`;

  const rootPairs = entriesForRoot(rows);
  const rootDecls = rootPairs.map(([k, v]) => `  ${k}: ${v};`).join("\n");
  const rootBlock = `:root {\n${rootDecls}\n}`;

  const themeKeys = themeAxisKeysFromRows(rows);
  const themeBlocks = themeKeys
    .map((key) => {
      const pairs = entriesForTheme(rows, key);
      if (pairs.length === 0) return null;
      const decls = pairs.map(([k, v]) => `  ${k}: ${v};`).join("\n");
      return `[data-theme="${key}"] {\n${decls}\n}`;
    })
    .filter((block): block is string => block !== null);

  const blocks = [rootBlock, ...themeBlocks];
  return header + blocks.join("\n\n") + "\n";
}

function main(): void {
  const merged = loadTokensJson(tokensDir) as Record<string, unknown>;
  const leaves: TokenLeaf[] = [];
  collectTokenLeaves(merged, [], leaves);
  const pathMap = buildPathMap(leaves);

  const semanticLeaves = new Map<string, TokenLeaf>();
  for (const leaf of leaves) {
    if (leaf.path.startsWith("beam.color.semantic.")) {
      semanticLeaves.set(leaf.path, leaf);
    }
  }

  const semanticRows = collectSemanticRows(merged, semanticLeaves, pathMap);

  const beamRoot = merged.beam as Record<string, unknown>;
  const colorRoot = beamRoot.color as Record<string, unknown>;
  const primitiveObj = colorRoot.primitive as Record<string, unknown>;

  const baseLiteralNames = ["White", "Transparent"] as const;
  const baseLines: string[] = [];
  for (const name of baseLiteralNames) {
    const path = `beam.color.primitive.${name}`;
    const leaf = pathMap.get(path);
    if (!leaf || leaf.$type !== "color") {
      throw new Error(`Missing primitive token ${path}`);
    }
    const resolved = resolveValue(leaf.$value, pathMap);
    const rgba = resolvedColorToRgbaString(resolved, pathMap);
    const q = JSON.stringify(rgba).replaceAll('"', "'");
    baseLines.push(`  ${name}:  ${q},`);
  }

  const primitiveSkip = new Set<string>(["White", "Transparent"]);
  const primitiveLines: string[] = [];
  for (const name of Object.keys(primitiveObj)) {
    if (primitiveSkip.has(name)) continue;
    const path = `beam.color.primitive.${name}`;
    const leaf = pathMap.get(path);
    if (!leaf || leaf.$type !== "color") {
      throw new Error(`Missing primitive token ${path}`);
    }
    const resolved = resolveValue(leaf.$value, pathMap);
    const rgba = resolvedColorToRgbaString(resolved, pathMap);
    const q = JSON.stringify(rgba).replaceAll('"', "'");
    primitiveLines.push(`  ${name}:  ${q},`);
  }

  const sharedHeader = `/**
 * AUTO-GENERATED — do not edit by hand. Source: \`tokens/tokens.json\` (DTCG 2025.10–shaped).
 * Run \`yarn generate:design-tokens\`, \`yarn build\`, or \`yarn build:truss\`.
 */

`;

  const tokenNameLines = semanticRows.map((r) => `  ${r.tokenName}: ${JSON.stringify(r.cssVar)},`);
  const trussTokenVarsContent = sharedHeader + `export const Tokens = {\n${tokenNameLines.join("\n")}\n} as const;\n`;

  const trussPaletteContent =
    `/**\n` +
    ` * AUTO-GENERATED — do not edit by hand. Source: tokens/tokens.json.\n` +
    ` * Run yarn generate:design-tokens, yarn build, or yarn build:truss.\n` +
    ` */\n\n` +
    `// Use rgba() for colors as Beam may attempt to modify opacity values in some components (e.g. ScrollShadows)\n` +
    `export const palette = {\n` +
    baseLines.join("\n") +
    (baseLines.length > 0 && primitiveLines.length > 0 ? "\n" : "") +
    primitiveLines.join("\n") +
    `\n};\n`;

  const themeScopesCss = emitThemeScopesCss(semanticRows);

  writeFileSync(trussTokenVarsPath, trussTokenVarsContent, "utf8");
  writeFileSync(trussPalettePath, trussPaletteContent, "utf8");
  mkdirSync(dirname(themeScopesCssPath), { recursive: true });
  writeFileSync(themeScopesCssPath, themeScopesCss, "utf8");

  console.log(`Wrote ${trussTokenVarsPath}, ${trussPalettePath}, ${themeScopesCssPath}`);
}

main();
