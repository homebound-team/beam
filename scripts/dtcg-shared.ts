import { readFileSync } from "fs";
import { join } from "path";

/** DTCG-style path reference, e.g. `{beam.color.primitive.Gray900}` */
export function isPathReference(v: unknown): v is string {
  return typeof v === "string" && /^\{[a-zA-Z0-9_.-]+\}$/.test(v);
}

export function stripReferenceBraces(ref: string): string {
  return ref.slice(1, -1);
}

/** Parse rgba(r, g, b, a) with flexible whitespace; returns normalized rgba string for comparison. */
export function parseRgba(s: string): [number, number, number, number] | null {
  const m = s.match(/^rgba\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)$/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
}

export function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const ri = Math.round(r);
  const gi = Math.round(g);
  const bi = Math.round(b);
  if (a >= 1) {
    return `#${ri.toString(16).padStart(2, "0")}${gi.toString(16).padStart(2, "0")}${bi.toString(16).padStart(2, "0")}`;
  }
  const ai = Math.round(a * 255);
  return `#${ri.toString(16).padStart(2, "0")}${gi.toString(16).padStart(2, "0")}${bi.toString(16).padStart(2, "0")}${ai.toString(16).padStart(2, "0")}`;
}

export function hexToRgbaString(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length === 8) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = parseInt(h.slice(6, 8), 16) / 255;
    if (a === 0 && r === 0 && g === 0 && b === 0) {
      return "rgba(0,0,0,0)";
    }
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }
  throw new Error(`Invalid hex color: ${hex}`);
}

/** DTCG Color Module 2025.10 — `colorSpace: "srgb"` with components in [0, 1]. */
export type DtcgSrgbColorValue = {
  colorSpace: "srgb";
  components: [number, number, number];
  alpha?: number;
  /** Optional 6-digit CSS hex fallback (no alpha in hex per spec). */
  hex?: string;
};

export function isDtcgSrgbColorValue(v: unknown): v is DtcgSrgbColorValue {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  if (o.colorSpace !== "srgb") return false;
  if (!Array.isArray(o.components) || o.components.length !== 3) return false;
  for (const c of o.components) {
    if (typeof c !== "number" || Number.isNaN(c)) return false;
  }
  if (o.alpha !== undefined && (typeof o.alpha !== "number" || Number.isNaN(o.alpha))) return false;
  if (o.hex !== undefined && (typeof o.hex !== "string" || !/^#[0-9a-fA-F]{6}$/.test(o.hex))) return false;
  return true;
}

/** Emit `rgba(r, g, b, a)` for Truss palette / theme codegen (8-bit channels, alpha 0–1). */
export function dtcgSrgbColorToRgbaString(v: DtcgSrgbColorValue): string {
  const [r0, g0, b0] = v.components;
  const a = v.alpha !== undefined ? v.alpha : 1;
  const r = Math.round(r0 * 255);
  const g = Math.round(g0 * 255);
  const b = Math.round(b0 * 255);
  if (a === 0 && r === 0 && g === 0 && b === 0) {
    return "rgba(0,0,0,0)";
  }
  if (a === 1) {
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export type JsonObject = { [k: string]: unknown };

/** Single source of truth: `tokens/tokens.json` under the tokens directory. */
export function loadTokensJson(tokensDir: string): JsonObject {
  const path = join(tokensDir, "tokens.json");
  return JSON.parse(readFileSync(path, "utf8")) as JsonObject;
}

export type TokenLeaf = {
  path: string;
  $type: string;
  $value: unknown;
  $extensions?: JsonObject;
};

/** Collect leaves that have $type (token nodes). */
export function collectTokenLeaves(node: unknown, pathParts: string[], out: TokenLeaf[]): void {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return;
  const obj = node as JsonObject;
  if (typeof obj.$type === "string" && "$value" in obj) {
    out.push({
      path: pathParts.join("."),
      $type: obj.$type,
      $value: obj.$value,
      $extensions: obj.$extensions as JsonObject | undefined,
    });
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$")) continue;
    collectTokenLeaves(v, [...pathParts, k], out);
  }
}

export function buildPathMap(leaves: TokenLeaf[]): Map<string, TokenLeaf> {
  const m = new Map<string, TokenLeaf>();
  for (const leaf of leaves) {
    m.set(leaf.path, leaf);
  }
  return m;
}

export function resolveValue(value: unknown, pathMap: Map<string, TokenLeaf>, seen: Set<string> = new Set()): unknown {
  if (!isPathReference(value)) return value;
  const path = stripReferenceBraces(value);
  if (seen.has(path)) {
    throw new Error(`Circular token reference: ${path}`);
  }
  seen.add(path);
  const leaf = pathMap.get(path);
  if (!leaf) {
    throw new Error(`Unresolved token reference: {${path}}`);
  }
  return resolveValue(leaf.$value, pathMap, seen);
}
