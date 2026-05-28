/**
 * Structural validation for `tokens/tokens.json` before codegen.
 *
 *   yarn validate:tokens
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  buildPathMap,
  collectTokenLeaves,
  isDtcgCubicBezierValue,
  isDtcgDurationValue,
  isDtcgSrgbColorValue,
  isPathReference,
  loadTokensJson,
  type TokenLeaf,
} from "./dtcg-shared";
import { semanticLeafKeyToExpectedCssVar } from "./token-naming";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokensDir = join(rootDir, "tokens");

const BEAM_EXT = "com.homebound.beam";

function isHexColor(s: string): boolean {
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s);
}

function assertSrgbColorObject(path: string, v: unknown): void {
  if (!isDtcgSrgbColorValue(v)) {
    throw new Error(`Token ${path}: $value must be a DTCG 2025.10 sRGB color object or {path} reference`);
  }
  const [r, g, b] = v.components;
  for (const n of [r, g, b]) {
    if (n < 0 || n > 1) {
      throw new Error(`Token ${path}: sRGB components must be in [0, 1]`);
    }
  }
  if (v.alpha !== undefined && (v.alpha < 0 || v.alpha > 1)) {
    throw new Error(`Token ${path}: alpha must be in [0, 1]`);
  }
}

function validatePrimitiveWhiteTransparent(merged: Record<string, unknown>): void {
  const beam = merged.beam as Record<string, unknown> | undefined;
  const color = beam?.color as Record<string, unknown> | undefined;
  const prim = color?.primitive as Record<string, unknown> | undefined;
  if (!prim || typeof prim !== "object") {
    throw new Error("beam.color.primitive is required");
  }
  if (!("White" in prim) || !("Transparent" in prim)) {
    throw new Error("beam.color.primitive must include White and Transparent tokens");
  }
}

const MOTION_DURATION_PREFIX = "beam.motion.duration.";
const MOTION_EASING_PREFIX = "beam.motion.easing.";

function validateColorLeaf(leaf: TokenLeaf): void {
  const v = leaf.$value;
  if (isPathReference(v)) {
    // Reference target validated when walking references
  } else if (isDtcgSrgbColorValue(v)) {
    assertSrgbColorObject(leaf.path, v);
  } else {
    throw new Error(`Token ${leaf.path}: $value must be a DTCG sRGB color object or {path} reference`);
  }

  if (!leaf.path.startsWith("beam.color.semantic.")) {
    return;
  }

  const beam = leaf.$extensions?.[BEAM_EXT];
  if (!beam || typeof beam !== "object") {
    throw new Error(`Token ${leaf.path}: missing $extensions["${BEAM_EXT}"]`);
  }
  const b = beam as Record<string, unknown>;
  if (typeof b.cssVar !== "string" || !b.cssVar.startsWith("--b-")) {
    throw new Error(`Token ${leaf.path}: cssVar must be a --b-* custom property name`);
  }
  const semanticLeafKey = leaf.path.slice("beam.color.semantic.".length);
  const expectedCssVar = semanticLeafKeyToExpectedCssVar(semanticLeafKey);
  if (b.cssVar !== expectedCssVar) {
    throw new Error(`Token ${leaf.path}: cssVar must be ${JSON.stringify(expectedCssVar)}, got ${JSON.stringify(b.cssVar)}`);
  }
  if (b.contrast !== undefined) {
    const c = b.contrast;
    if (typeof c !== "string" || (!isPathReference(c) && !isHexColor(c))) {
      throw new Error(`Token ${leaf.path}: contrast must be hex or {path} reference`);
    }
  }
}

function validateDurationLeaf(leaf: TokenLeaf): void {
  if (!leaf.path.startsWith(MOTION_DURATION_PREFIX)) {
    throw new Error(`Token ${leaf.path}: duration tokens must live under ${MOTION_DURATION_PREFIX}`);
  }
  const v = leaf.$value;
  if (isPathReference(v)) {
    return;
  }
  if (!isDtcgDurationValue(v)) {
    throw new Error(`Token ${leaf.path}: $value must be a DTCG duration object { value, unit: "ms"|"s" } or {path} reference`);
  }
  if (v.value < 0) {
    throw new Error(`Token ${leaf.path}: duration value must be non-negative`);
  }
}

function validateCubicBezierLeaf(leaf: TokenLeaf): void {
  if (!leaf.path.startsWith(MOTION_EASING_PREFIX)) {
    throw new Error(`Token ${leaf.path}: cubicBezier tokens must live under ${MOTION_EASING_PREFIX}`);
  }
  const v = leaf.$value;
  if (isPathReference(v)) {
    return;
  }
  if (!isDtcgCubicBezierValue(v)) {
    throw new Error(
      `Token ${leaf.path}: $value must be a DTCG cubicBezier [P1x, P1y, P2x, P2y] with P1x and P2x in [0, 1], or a {path} reference`,
    );
  }
}

function validateLeaf(leaf: TokenLeaf, _pathMap: Map<string, TokenLeaf>): void {
  switch (leaf.$type) {
    case "color":
      validateColorLeaf(leaf);
      break;
    case "duration":
      validateDurationLeaf(leaf);
      break;
    case "cubicBezier":
      validateCubicBezierLeaf(leaf);
      break;
    default:
      throw new Error(`Unsupported $type at ${leaf.path}: ${leaf.$type}`);
  }
}

function validateReferences(pathMap: Map<string, TokenLeaf>): void {
  for (const leaf of pathMap.values()) {
    const visit = (val: unknown, ctx: string): void => {
      if (typeof val !== "string") return;
      if (isPathReference(val)) {
        const p = val.slice(1, -1);
        if (!pathMap.has(p)) {
          throw new Error(`Unresolved reference in ${ctx}: ${val}`);
        }
      }
    };
    visit(leaf.$value, leaf.path);
    const beam = leaf.$extensions?.[BEAM_EXT] as Record<string, unknown> | undefined;
    if (beam?.contrast !== undefined) {
      visit(beam.contrast, `${leaf.path}.$extensions.contrast`);
    }
  }
}

function main(): void {
  const merged = loadTokensJson(tokensDir);
  validatePrimitiveWhiteTransparent(merged as Record<string, unknown>);
  const leaves: TokenLeaf[] = [];
  collectTokenLeaves(merged, [], leaves);
  const pathMap = buildPathMap(leaves);
  for (const leaf of leaves) {
    validateLeaf(leaf, pathMap);
  }
  validateReferences(pathMap);
  console.log(`Validated ${leaves.length} token leaves from ${join(tokensDir, "tokens.json")}`);
}

main();
