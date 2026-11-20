/** Everything the Beam MCP server knows, generated from `src`, `docs/` and the MDX pages by `generateManifest.ts`. */
export interface BeamManifest {
  beamVersion: string;
  /** The checkout the manifest was built from, so a consumer can tell when it differs from their installed Beam. */
  git: { branch?: string; sha?: string };
  exports: ExportEntry[];
  /** Topic pages that aren't about one component, e.g. layouts, routing, tokens. */
  guides: Guide[];
  tokens: TokenEntry[];
  breakpoints: Record<string, string>;
}

export type ExportKind = "component" | "hook" | "function" | "type" | "enum" | "class" | "constant";

export interface ExportEntry {
  name: string;
  kind: ExportKind;
  /** Repo-relative path of the declaring file. */
  source: string;
  description?: string;
  /** The `@deprecated` text, which usually names the replacement. */
  deprecated?: string;
  /** Call signature for hooks and functions, or the declaration text for types. */
  signature?: string;
  props?: PropEntry[];
  /** The MDX page that documents this export, with Storybook-only markup removed. */
  docs?: { path: string; markdown: string };
  figma?: string;
  stories?: { path: string; title: string; names: string[] };
}

export interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
  deprecated?: string;
}

export interface Guide {
  id: string;
  title: string;
  path: string;
  markdown: string;
}

export interface TokenEntry {
  name: string;
  /** The CSS custom property the token resolves to. */
  value: string;
}
