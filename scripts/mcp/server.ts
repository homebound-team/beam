import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { generateManifest, isManifestStale, readManifest, root } from "./generateManifest";
import type { BeamManifest, ExportEntry, ExportKind, Guide } from "./manifestTypes";

/**
 * Serves Beam's component docs over MCP (stdio), from a local Beam checkout.
 *
 * Run with `yarn mcp` in the checkout. The manifest is rebuilt in the background when `src` or the docs changed,
 * and tools wait for it.
 */
let manifest: Promise<BeamManifest> = loadManifest();

/** Rebuilds a stale manifest between calls, so edits in the checkout show up without restarting the server. */
async function currentManifest(): Promise<BeamManifest> {
  if (isManifestStale()) manifest = loadManifest();
  return manifest;
}

async function loadManifest(): Promise<BeamManifest> {
  return isManifestStale() ? generateManifest() : readManifest();
}

const server = new McpServer(
  { name: "beam", version: "0.1.0" },
  {
    instructions: buildInstructions(),
  },
);

/**
 * What agents get on connect: how to use the tools, plus the Rules section of the Using Beam guide.
 *
 * The rules are read from `src/intro/UsingBeam.mdx`, so the guide stays their only source.
 */
function buildInstructions(): string {
  const guide = join(root, "src/intro/UsingBeam.mdx");
  const rules = existsSync(guide)
    ? readFileSync(guide, "utf8")
        .match(/^## Rules\n([\s\S]*?)(?=^## )/m)?.[1]
        .trim()
    : undefined;
  return [
    "Docs for @homebound/beam, Homebound's React design system, read from a local Beam checkout.",
    "Look components up with `get_component` (or find them with `search_beam`) before using them.",
    "`get_guide` has page layouts (`layouts-whichlayout`, `layouts`) and the full Using Beam guide (`intro-usingbeam`); `get_tokens` has colors.",
    "The docs describe the checkout's branch, which may be newer than the Beam version a project has installed.",
    ...(rules ? ["", "Rules for writing app code with Beam:", rules] : []),
  ].join("\n");
}

const kinds = ["component", "hook", "function", "type", "enum", "class", "constant"] as const satisfies ExportKind[];

server.registerTool(
  "list_components",
  {
    title: "List Beam exports",
    description:
      "Lists Beam's public exports with a one-line description. Defaults to components, hiding deprecated ones.",
    inputSchema: {
      kind: z.enum(kinds).optional().describe("Export kind to list. Defaults to `component`."),
      includeDeprecated: z.boolean().optional().describe("Include deprecated exports. Defaults to false."),
    },
  },
  async ({ kind = "component", includeDeprecated = false }) => {
    const m = await currentManifest();
    const entries = m.exports.filter((e) => e.kind === kind && (includeDeprecated || !e.deprecated));
    const lines = entries.map((e) => `- ${e.name}${e.deprecated ? " (deprecated)" : ""}: ${firstLine(e.description)}`);
    return text(`${header(m)}\n\n${entries.length} ${kind} exports:\n${lines.join("\n")}`);
  },
);

server.registerTool(
  "get_component",
  {
    title: "Get a Beam export",
    description:
      "Full docs for one Beam export: description, props with types and defaults, its docs page, stories, Figma link, " +
      "and any deprecation. Works for components, hooks, functions and types.",
    inputSchema: { name: z.string().describe("Export name, e.g. `Button`, `useModal`, `GridTable`.") },
  },
  async ({ name }) => {
    const m = await currentManifest();
    const entry =
      m.exports.find((e) => e.name === name) ?? m.exports.find((e) => e.name.toLowerCase() === name.toLowerCase());
    if (!entry) {
      const suggestions = closestNames(m, name);
      return text(`No Beam export named \`${name}\`. Closest matches: ${suggestions.join(", ") || "none"}.`, true);
    }
    return text(formatEntry(entry, m));
  },
);

server.registerTool(
  "search_beam",
  {
    title: "Search Beam docs",
    description:
      "Searches export names, descriptions, props, docs pages and guides. Use it to find the right component for a need, " +
      "e.g. `date range`, `confirm before closing`, `table filters`.",
    inputSchema: { query: z.string().describe("Words describing what you need.") },
  },
  async ({ query }) => {
    const m = await currentManifest();
    const results = rank(m, query).slice(0, 12);
    if (results.length === 0) return text(`No matches for "${query}".`);
    const lines = results.map((r) => `- ${r.label}: ${r.snippet}`);
    return text(`Top matches for "${query}":\n${lines.join("\n")}\n\nUse get_component or get_guide for details.`);
  },
);

server.registerTool(
  "get_guide",
  {
    title: "Get a Beam guide",
    description:
      "Reads a topic guide, e.g. which layout to use, routing, page layout rules, token authoring. Call without an id to list them.",
    inputSchema: { id: z.string().optional().describe("Guide id from the list, e.g. `layouts-whichlayout`.") },
  },
  async ({ id }) => {
    const m = await currentManifest();
    const guide = id && m.guides.find((g) => g.id === id);
    if (guide) return text(`# ${guide.title}\n\nSource: ${guide.path}\n\n${guide.markdown}`);
    const list = m.guides.map((g) => `- \`${g.id}\`: ${g.title} (${g.path})`).join("\n");
    return text(`${id ? `No guide \`${id}\`. ` : ""}Available guides:\n${list}`, !!id);
  },
);

server.registerTool(
  "get_tokens",
  {
    title: "Get Beam color tokens",
    description:
      "Lists Beam's semantic color tokens (`Tokens.X`) and breakpoints, with how to use them in Truss styles.",
    inputSchema: { query: z.string().optional().describe("Filter tokens by name, e.g. `surface`, `danger`.") },
  },
  async ({ query }) => {
    const m = await currentManifest();
    const q = query?.toLowerCase();
    const tokens = m.tokens.filter((t) => !q || t.name.toLowerCase().includes(q) || t.value.includes(q));
    const usage = [
      "Use semantic tokens through Truss: `Css.bgColor(Tokens.Surface).color(Tokens.OnSurface).$`.",
      "Prefer a token over a palette color (`Palette.Gray900`) unless you're defining a new token.",
      "In `Css` template strings, interpolate the token bare (`${Tokens.X}`); don't wrap it in `var()`, which nests and drops the style.",
    ].join("\n- ");
    const breakpoints = Object.entries(m.breakpoints)
      .map(([k, v]) => `- \`${k}\`: ${v}`)
      .join("\n");
    const rows = tokens.map((t) => `- \`Tokens.${t.name}\` → \`${t.value}\``).join("\n");
    return text(
      `Usage:\n- ${usage}\n\n${tokens.length} tokens:\n${rows}\n\nBreakpoints (Css helpers):\n${breakpoints}`,
    );
  },
);

function formatEntry(e: ExportEntry, m: BeamManifest): string {
  const out = [`# ${e.name}`, `${e.kind} · \`import { ${e.name} } from "@homebound/beam"\` · ${e.source}`];
  if (e.deprecated) out.push(`**Deprecated.** ${e.deprecated}`);
  if (e.description) out.push(e.description);
  if (e.signature) out.push("```ts\n" + e.signature + "\n```");
  if (e.props?.length) {
    const rows = e.props.map((p) => {
      const flags = [
        p.required ? "required" : "",
        p.defaultValue ? `default \`${p.defaultValue}\`` : "",
        p.deprecated ? `deprecated: ${p.deprecated}` : "",
      ]
        .filter(Boolean)
        .join("; ");
      return `- \`${p.name}\`: \`${oneLine(p.type)}\`${flags ? ` (${flags})` : ""}${p.description ? `. ${oneLine(p.description)}` : ""}`;
    });
    out.push(`## Props\n${rows.join("\n")}`);
  }
  if (e.docs) out.push(`## Docs page (${e.docs.path})\n\n${e.docs.markdown}`);
  else {
    const guides = m.guides.filter((g) => g.markdown.includes(`\`${e.name}\``));
    if (guides.length) out.push(`## Mentioned in guides\n${guides.map((g) => `- \`${g.id}\`: ${g.title}`).join("\n")}`);
  }
  if (e.stories) out.push(`## Stories\n${e.stories.title} (${e.stories.path}): ${e.stories.names.join(", ")}`);
  if (e.figma) out.push(`Figma: ${e.figma}`);
  return out.join("\n\n");
}

interface SearchResult {
  name: string;
  label: string;
  snippet: string;
  score: number;
}

/** Scores exports and guides by how many query words they contain, weighting names over prose. */
function rank(m: BeamManifest, query: string): SearchResult[] {
  const words = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 1);
  if (words.length === 0) return [];
  const score = (fields: [string | undefined, number][]) =>
    words.reduce(
      (total, w) => total + fields.reduce((s, [f, weight]) => s + (f?.toLowerCase().includes(w) ? weight : 0), 0),
      0,
    );
  const exportResults = m.exports.map((e) => ({
    name: e.name,
    label: `${e.name} (${e.kind}${e.deprecated ? ", deprecated" : ""})`,
    snippet: firstLine(e.description),
    // Deprecated exports rank below their replacements.
    score:
      score([
        [e.name, 10],
        [e.description, 3],
        [e.props?.map((p) => `${p.name} ${p.description ?? ""}`).join(" "), 1],
        [e.docs?.markdown, 1],
      ]) *
      (e.deprecated ? 0.3 : 1) *
      (e.kind === "type" ? 0.5 : 1),
  }));
  const guideResults = m.guides.map((g: Guide) => ({
    name: g.id,
    label: `guide \`${g.id}\``,
    snippet: g.title,
    score: score([
      [g.title, 6],
      [g.markdown, 1],
    ]),
  }));
  return [...exportResults, ...guideResults].filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
}

/** Export names within two edits of `name`, or containing it, for "did you mean" on a miss. */
function closestNames(m: BeamManifest, name: string): string[] {
  const target = name.toLowerCase();
  return m.exports
    .map((e) => ({
      name: e.name,
      distance: e.name.toLowerCase().includes(target) ? 0 : editDistance(e.name.toLowerCase(), target),
    }))
    .filter((r) => r.distance <= 2)
    .sort((a, b) => a.distance - b.distance || a.name.length - b.name.length)
    .slice(0, 8)
    .map((r) => r.name);
}

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

function header(m: BeamManifest): string {
  return `Beam ${m.beamVersion} (checkout ${m.git.branch ?? "?"}@${m.git.sha ?? "?"})`;
}

function firstLine(text: string | undefined): string {
  return text?.split("\n")[0] ?? "(no description)";
}

function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function text(body: string, isError = false) {
  return { content: [{ type: "text" as const, text: body }], isError };
}

await server.connect(new StdioServerTransport());
console.error("Beam MCP server running on stdio");
