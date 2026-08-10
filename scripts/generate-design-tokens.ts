/**
 * Syncs Figma colors then emits Truss/CSS outputs:
 * 1. `figma-colors.raw.json` → `color.json`
 * 2. `color.json` + `motion.json` → `truss-token-vars.ts`, `truss-palette.ts`, `truss-motion.ts`, `theme-scopes.css`
 *
 * Palette order: `White` / `Transparent`, then remaining `beam.color.primitive.*` keys in JSON order.
 *
 *   yarn generate:design-tokens
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  buildPathMap,
  collectTokenLeaves,
  dtcgSrgbColorToRgbaString,
  hexToRgbaString,
  isDtcgCubicBezierValue,
  isDtcgDurationValue,
  isDtcgSrgbColorValue,
  isPathReference,
  loadTokensJson,
  resolveValue,
  type DtcgSrgbColorValue,
  type JsonObject,
  type TokenLeaf,
} from "./dtcg-shared";
import { semanticLeafKeyToExpectedCssVar } from "./token-naming";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokensDir = join(rootDir, "tokens");
const trussTokenVarsPath = join(rootDir, "truss-token-vars.ts");
const trussPalettePath = join(rootDir, "truss-palette.ts");
const trussMotionPath = join(rootDir, "truss-motion.ts");
const themeScopesCssPath = join(rootDir, "src/css/generated/theme-scopes.css");

const BEAM_EXT = "com.homebound.beam";

type RawColorValue = { alias: string; hex?: never; alpha?: never } | { hex: string; alpha?: number; alias?: never };

type FigmaColorsRaw = {
  source?: JsonObject;
  primitives: Record<string, RawColorValue>;
  semantics: Record<
    string,
    {
      description?: string;
      light: RawColorValue;
      contrast: RawColorValue;
    }
  >;
};

function normalizeAlpha(alpha: number | undefined): number | undefined {
  if (alpha === undefined) return undefined;
  // Collapse float32 noise from Figma (e.g. 0.20000000298023224 → 0.2).
  return Math.round(alpha * 1000) / 1000;
}

function parseHexChannels(hex: string): [number, number, number] {
  const h = hex.replace("#", "").toLowerCase();
  if (h.length !== 6 && h.length !== 8) {
    throw new Error(`Expected 6- or 8-digit hex, got ${hex}`);
  }
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function toDtcgColor(value: RawColorValue): DtcgSrgbColorValue {
  if ("alias" in value && value.alias) {
    throw new Error(`toDtcgColor expected a literal color, got alias ${value.alias}`);
  }
  if (!("hex" in value) || !value.hex) {
    throw new Error(`Literal color missing hex: ${JSON.stringify(value)}`);
  }
  const hex6 = `#${value.hex.replace("#", "").slice(0, 6).toLowerCase()}`;
  const components = parseHexChannels(hex6);
  const alpha = normalizeAlpha(value.alpha);
  const out: DtcgSrgbColorValue = {
    colorSpace: "srgb",
    components,
    hex: hex6,
  };
  if (alpha !== undefined && alpha < 1) {
    out.alpha = alpha;
  }
  return out;
}

function toTokenValue(value: RawColorValue): string | DtcgSrgbColorValue {
  if ("alias" in value && value.alias) {
    return `{beam.color.primitive.${value.alias}}`;
  }
  return toDtcgColor(value);
}

/** Contrast extension values must be strings (path ref or hex) for codegen. */
function toContrastExtensionValue(value: RawColorValue): string {
  if ("alias" in value && value.alias) {
    return `{beam.color.primitive.${value.alias}}`;
  }
  if (!("hex" in value) || !value.hex) {
    throw new Error(`Contrast literal missing hex: ${JSON.stringify(value)}`);
  }
  const hexBody = value.hex.replace("#", "").toLowerCase();
  const hex6 = `#${hexBody.slice(0, 6)}`;
  const alpha = normalizeAlpha(value.alpha);
  if (alpha !== undefined && alpha < 1) {
    const aByte = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0");
    return `${hex6}${aByte}`;
  }
  return hex6;
}

function assertRawColorValue(label: string, value: unknown): asserts value is RawColorValue {
  if (!value || typeof value !== "object") {
    throw new Error(`${label}: expected color value object`);
  }
  const v = value as Record<string, unknown>;
  if (typeof v.alias === "string") return;
  if (typeof v.hex === "string") return;
  throw new Error(`${label}: expected { alias } or { hex, alpha? }`);
}

/** Writes `tokens/color.json` from `tokens/figma-colors.raw.json`. */
function writeColorJsonFromFigmaRaw(): void {
  const rawPath = join(tokensDir, "figma-colors.raw.json");
  const colorPath = join(tokensDir, "color.json");
  const raw = JSON.parse(readFileSync(rawPath, "utf8")) as FigmaColorsRaw;
  if (!raw.primitives || !raw.semantics) {
    throw new Error(`${rawPath} must include primitives and semantics`);
  }
  if (!raw.primitives.White || !raw.primitives.Transparent) {
    throw new Error("figma-colors.raw.json primitives must include White and Transparent");
  }

  // White / Transparent first (palette contract), then remaining keys in raw order.
  const primitiveNames = [
    "White",
    "Transparent",
    ...Object.keys(raw.primitives).filter((k) => k !== "White" && k !== "Transparent"),
  ];

  const primitive: JsonObject = {};
  for (const name of primitiveNames) {
    const value = raw.primitives[name];
    assertRawColorValue(`primitives.${name}`, value);
    if ("alias" in value && value.alias) {
      throw new Error(`primitives.${name}: primitives must be literal colors, not aliases`);
    }
    primitive[name] = {
      $type: "color",
      $value: toDtcgColor(value),
    };
  }

  const semanticNames = Object.keys(raw.semantics).sort((a, b) => a.localeCompare(b));
  const semantic: JsonObject = {};
  for (const name of semanticNames) {
    const row = raw.semantics[name];
    assertRawColorValue(`semantics.${name}.light`, row.light);
    assertRawColorValue(`semantics.${name}.contrast`, row.contrast);

    const leaf: JsonObject = {
      $type: "color",
      $value: toTokenValue(row.light),
      $extensions: {
        [BEAM_EXT]: {
          cssVar: semanticLeafKeyToExpectedCssVar(name),
          contrast: toContrastExtensionValue(row.contrast),
        },
      },
    };
    if (row.description) {
      leaf.$description = row.description;
    }
    semantic[name] = leaf;
  }

  writeFileSync(
    colorPath,
    `${JSON.stringify(
      {
        $description:
          "AUTO-GENERATED from tokens/figma-colors.raw.json — do not edit by hand. Run yarn generate:design-tokens.",
        primitive,
        semantic,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(
    `Wrote ${colorPath} (${primitiveNames.length} primitives, ${semanticNames.length} semantics) from ${rawPath}`,
  );
}

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
 * [data-theme] — overrides per theme axis; values must match ContrastScope / color.json.
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

  return header + [rootBlock, ...themeBlocks].join("\n\n") + "\n";
}

type MotionLeafKind = "duration" | "cubicBezier";

function serializeMotionLeaf(leaf: TokenLeaf, pathMap: Map<string, TokenLeaf>): string {
  const resolved = resolveValue(leaf.$value, pathMap);
  if (leaf.$type === "duration") {
    if (!isDtcgDurationValue(resolved)) {
      throw new Error(`Token ${leaf.path}: invalid duration $value ${JSON.stringify(resolved)}`);
    }
    return `${resolved.value}${resolved.unit}`;
  }
  if (leaf.$type === "cubicBezier") {
    if (!isDtcgCubicBezierValue(resolved)) {
      throw new Error(`Token ${leaf.path}: invalid cubicBezier $value ${JSON.stringify(resolved)}`);
    }
    const [a, b, c, d] = resolved;
    return `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
  }
  throw new Error(`Token ${leaf.path}: unsupported motion $type ${leaf.$type}`);
}

function emitTrussMotion(pathMap: Map<string, TokenLeaf>): string {
  const groups: Record<MotionLeafKind, { jsKey: string; prefix: string }> = {
    duration: { jsKey: "duration", prefix: "beam.motion.duration." },
    cubicBezier: { jsKey: "easing", prefix: "beam.motion.easing." },
  };

  // Collect leaves by group, preserving JSON order via pathMap insertion order.
  const collected: Record<string, [string, string][]> = { duration: [], easing: [] };
  for (const [path, leaf] of pathMap.entries()) {
    for (const [kind, { jsKey, prefix }] of Object.entries(groups) as [MotionLeafKind, { jsKey: string; prefix: string }][]) {
      if (leaf.$type === kind && path.startsWith(prefix)) {
        const name = path.slice(prefix.length);
        collected[jsKey].push([name, serializeMotionLeaf(leaf, pathMap)]);
      }
    }
  }

  const renderGroup = (entries: [string, string][]): string =>
    entries.map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");

  const header = `/**
 * AUTO-GENERATED — do not edit by hand. Source: tokens/motion.json (DTCG 2025.10 — duration + cubicBezier types).
 * Run yarn generate:design-tokens, yarn build, or yarn build:truss.
 *
 * Motion tokens are JS-only literals (not CSS variables) because Beam's animation behavior
 * is static — Truss bakes these strings into class declarations at build time.
 */

`;

  return (
    header +
    `export const motion = {\n` +
    `  duration: {\n${renderGroup(collected.duration)}\n  },\n` +
    `  easing: {\n${renderGroup(collected.easing)}\n  },\n` +
    `} as const;\n`
  );
}

function main(): void {
  writeColorJsonFromFigmaRaw();
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
 * AUTO-GENERATED — do not edit by hand. Source: \`tokens/color.json\` (from Figma via generate:design-tokens).
 * Run \`yarn generate:design-tokens\`, \`yarn build\`, or \`yarn build:truss\`.
 */

`;

  const tokenNameLines = semanticRows.map((r) => `  ${r.tokenName}: ${JSON.stringify(r.cssVar)},`);
  const trussTokenVarsContent = sharedHeader + `export const Tokens = {\n${tokenNameLines.join("\n")}\n} as const;\n`;

  const trussPaletteContent =
    `/**\n` +
    ` * AUTO-GENERATED — do not edit by hand. Source: tokens/color.json (from Figma via generate:design-tokens).\n` +
    ` * Run yarn generate:design-tokens, yarn build, or yarn build:truss.\n` +
    ` */\n\n` +
    `// Use rgba() for colors as Beam may attempt to modify opacity values in some components (e.g. ScrollShadows)\n` +
    `export const palette = {\n` +
    baseLines.join("\n") +
    (baseLines.length > 0 && primitiveLines.length > 0 ? "\n" : "") +
    primitiveLines.join("\n") +
    `\n};\n`;

  const themeScopesCss = emitThemeScopesCss(semanticRows);
  const trussMotionContent = emitTrussMotion(pathMap);

  writeFileSync(trussTokenVarsPath, trussTokenVarsContent, "utf8");
  writeFileSync(trussPalettePath, trussPaletteContent, "utf8");
  writeFileSync(trussMotionPath, trussMotionContent, "utf8");
  mkdirSync(dirname(themeScopesCssPath), { recursive: true });
  writeFileSync(themeScopesCssPath, themeScopesCss, "utf8");

  console.log(`Wrote ${trussTokenVarsPath}, ${trussPalettePath}, ${trussMotionPath}, ${themeScopesCssPath}`);
}

main();
