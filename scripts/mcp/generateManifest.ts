import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join, relative, resolve } from "path";
import { withCompilerOptions, type ComponentDoc, type PropItemType } from "react-docgen-typescript";
import ts from "typescript";
import { fileURLToPath } from "url";
import type { BeamManifest, ExportEntry, ExportKind, Guide, PropEntry, TokenEntry } from "./manifestTypes";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const manifestPath = join(root, ".cache/mcp-manifest.json");

/** Inputs whose changes make a cached manifest stale. */
const watchedPaths = ["src", "docs", "tokens/README.md", "package.json"];

/** Builds the manifest from the checkout and writes it to `.cache/mcp-manifest.json`. */
export function generateManifest(): BeamManifest {
  const program = createProgram();
  const checker = program.getTypeChecker();
  const indexFile = program.getSourceFile(join(root, "src/index.ts"))!;
  const exportSymbols = checker.getExportsOfModule(checker.getSymbolAtLocation(indexFile)!);

  const docPages = readDocPages();
  const componentFiles = new Set<string>();
  const entries = exportSymbols.map((symbol) => {
    const entry = describeExport(symbol, checker);
    if (entry.kind === "component") componentFiles.add(join(root, entry.source));
    return entry;
  });

  const docgen = parseComponentDocs(program, [...componentFiles]);
  for (const entry of entries) {
    if (entry.kind === "component") {
      const doc = docgen.get(`${entry.source}#${entry.name}`) ?? docgen.get(`${entry.source}#_${entry.name}`);
      if (doc) entry.props = toProps(doc);
    }
    attachDocsAndStories(entry, docPages);
  }

  const manifest: BeamManifest = {
    beamVersion: JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version,
    git: readGitInfo(),
    exports: entries.sort((a, b) => a.name.localeCompare(b.name)),
    guides: readGuides(docPages),
    tokens: readTokens(program),
    breakpoints: JSON.parse(readFileSync(join(root, "src/Css.json"), "utf8")).breakpoints,
  };
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

/** Whether `.cache/mcp-manifest.json` is missing or older than any watched source file. */
export function isManifestStale(): boolean {
  if (!existsSync(manifestPath)) return true;
  const builtAt = statSync(manifestPath).mtimeMs;
  return watchedPaths.some((p) => newestMtime(join(root, p)) > builtAt);
}

export function readManifest(): BeamManifest {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function createProgram(): ts.Program {
  const configPath = join(root, "tsconfig.json");
  const config = ts.parseJsonConfigFileContent(ts.readConfigFile(configPath, ts.sys.readFile).config, ts.sys, root);
  return ts.createProgram([join(root, "src/index.ts")], config.options);
}

function describeExport(symbol: ts.Symbol, checker: ts.TypeChecker): ExportEntry {
  const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const decl = target.valueDeclaration ?? target.declarations?.[0];
  const name = symbol.getName();
  const source = decl ? relative(root, decl.getSourceFile().fileName) : "";
  const description = cleanJsDoc(ts.displayPartsToString(target.getDocumentationComment(checker)));
  const deprecated = cleanJsDoc(findDeprecated(target, checker));
  const kind = decl ? classify(name, target, decl, checker) : "constant";
  const entry: ExportEntry = { name, kind, source, description, deprecated };
  if (decl && (kind === "hook" || kind === "function")) {
    const signature = checker.getTypeOfSymbolAtLocation(target, decl).getCallSignatures()[0];
    if (signature) entry.signature = `${name}${checker.signatureToString(signature)}`;
  } else if (decl && (kind === "type" || kind === "enum")) {
    entry.signature = truncate(decl.getText(), 3000);
  }
  return entry;
}

function classify(name: string, symbol: ts.Symbol, decl: ts.Declaration, checker: ts.TypeChecker): ExportKind {
  if (symbol.flags & ts.SymbolFlags.Enum) return "enum";
  if (symbol.flags & ts.SymbolFlags.Class) return "class";
  if (!(symbol.flags & ts.SymbolFlags.Value)) return "type";
  const signatures = checker.getTypeOfSymbolAtLocation(symbol, decl).getCallSignatures();
  if (signatures.length === 0) return "constant";
  if (/^use[A-Z]/.test(name)) return "hook";
  const returnType = checker.typeToString(signatures[0].getReturnType());
  const returnsJsx = /Element|ReactNode|ReactElement/.test(returnType);
  return /^[A-Z]/.test(name) && returnsJsx ? "component" : "function";
}

/** The `@deprecated` text from any declaration, since overloads each carry their own tag. */
function findDeprecated(symbol: ts.Symbol, checker: ts.TypeChecker): string | undefined {
  const tag = symbol.getJsDocTags(checker).find((t) => t.name === "deprecated");
  if (tag) return ts.displayPartsToString(tag.text).trim() || "Deprecated.";
  for (const decl of symbol.declarations ?? []) {
    const jsdocTag = ts.getJSDocDeprecatedTag(decl);
    if (jsdocTag) return (ts.getTextOfJSDocComment(jsdocTag.comment) ?? "Deprecated.").trim();
  }
  return undefined;
}

/** Component props keyed by `source#displayName`, resolved through inherited types like the Storybook tables. */
function parseComponentDocs(program: ts.Program, files: string[]): Map<string, ComponentDoc> {
  const parser = withCompilerOptions(program.getCompilerOptions(), {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    savePropValueAsString: true,
    propFilter: (prop) => !prop.parent || !prop.parent.fileName.includes("node_modules"),
  });
  const docs = new Map<string, ComponentDoc>();
  for (const doc of parser.parseWithProgramProvider(files, () => program)) {
    docs.set(`${relative(root, doc.filePath)}#${doc.displayName}`, doc);
  }
  return docs;
}

function toProps(doc: ComponentDoc): PropEntry[] {
  return Object.values(doc.props)
    .map((p) => {
      const tags = (p.tags ?? {}) as Record<string, string>;
      const prop: PropEntry = { name: p.name, type: propType(p.type), required: p.required };
      const description = cleanJsDoc(p.description);
      if (description) prop.description = description;
      if (p.defaultValue?.value !== undefined) prop.defaultValue = String(p.defaultValue.value);
      if ("deprecated" in tags) prop.deprecated = cleanJsDoc(tags.deprecated) || "Deprecated.";
      return prop;
    })
    .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
}

/** Spells out literal unions (e.g. `ButtonVariant`) so agents see the allowed values, not just the alias. */
function propType(type: PropItemType): string {
  if (type.name === "enum" && Array.isArray(type.value)) {
    const values = (type.value as { value: string }[]).map((v) => v.value);
    const union = values.join(" | ");
    return type.raw && type.raw !== union && union.length < 400 ? `${type.raw} (${union})` : union;
  }
  return type.raw ?? type.name;
}

/** Turns `{@link X}` into `X` and trims, so docs read as plain markdown. */
function cleanJsDoc(text: string | undefined): string | undefined {
  const cleaned = text?.replace(/\{@link\s+([^}\s|]+)\s*(?:\|[^}]*)?\}/g, "`$1`").trim();
  return cleaned || undefined;
}

interface DocPage {
  path: string;
  /** The `<Meta title>` for topic pages; undefined for pages tied to a story file. */
  title?: string;
  storyFile?: string;
  /** Components named by `<ArgTypes of={X} />`, for pages whose story meta isn't the public component. */
  argTypesOf: string[];
  /** The export the page is about: its `<ArgTypes of>` component, else its story meta's `component`. */
  primary?: string;
  figma?: string;
  markdown: string;
}

function readDocPages(): DocPage[] {
  return listFiles(join(root, "src"), ".mdx").map((file) => {
    const source = readFileSync(file, "utf8");
    const storyImport = source.match(/import \* as \w+ from "(\.[^"]+\.stories)"/);
    const storyFile = storyImport ? relative(root, resolve(dirname(file), `${storyImport[1]}.tsx`)) : undefined;
    const argTypesOf = [...source.matchAll(/<ArgTypes of=\{(\w+)\}/g)].map((m) => m[1]);
    return {
      path: relative(root, file),
      title: source
        .match(/<Meta title="([^"]+)"(?:\s+name="([^"]+)")?/)
        ?.slice(1)
        .filter(Boolean)
        .join(" / "),
      storyFile,
      argTypesOf,
      primary: argTypesOf[0] ?? (storyFile ? storyMetaComponent(storyFile) : undefined),
      figma: source.match(/className="sbdocs-figma">\s*<a href="([^"]+)"/)?.[1],
      markdown: toMarkdown(source),
    };
  });
}

/** Strips Storybook-only markup (imports, `<Meta>`, the Figma link, `<ArgTypes>`) so the page reads as markdown. */
function toMarkdown(mdx: string): string {
  return mdx
    .replace(/^import .*$/gm, "")
    .replace(/<Meta[^>]*\/>/g, "")
    .replace(/<p className="sbdocs-figma">[\s\S]*?<\/p>/g, "")
    .replace(/<ArgTypes[^>]*\/>/g, "")
    .replace(/<span className="sbdocs-status[\s\S]*?<\/span>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function attachDocsAndStories(entry: ExportEntry, pages: DocPage[]): void {
  const storyFile = findStoryFile(entry);
  const page = pages.find((p) => p.primary === entry.name) ?? findFamilyPage(entry, pages);
  if (page) entry.docs = { path: page.path, markdown: page.markdown };
  if (storyFile) {
    const source = readFileSync(join(root, storyFile), "utf8");
    entry.stories = {
      path: storyFile,
      title:
        source.match(/^\s*title: "([^"]+)"/m)?.[1] ?? storyFile.replace(/^src\//, "").replace(/\.stories\.tsx$/, ""),
      names: [...source.matchAll(/^export (?:function|const) ([A-Z]\w*)/gm)].map((m) => m[1]),
    };
  }
  entry.figma = page?.figma ?? (storyFile ? storyFigma(storyFile) : undefined);
}

/**
 * A page that documents this export as part of a family: the export lives beside the page's story file and the
 * page names it in backticks (e.g. `ModalHeader`, `useModal`), or it's a `Bound*` field wrapper the page names.
 */
function findFamilyPage(entry: ExportEntry, pages: DocPage[]): DocPage | undefined {
  // Deprecated exports point at their replacement instead of borrowing a family page.
  if (entry.kind === "type" || entry.deprecated) return undefined;
  // Matches `Name`, `Name()` and `Name().member`.
  const mention = new RegExp(`\`${entry.name}(\\(|\`)`);
  const mentioned = (p: DocPage) => mention.test(p.markdown);
  return (
    pages.find((p) => p.primary && [`Bound${p.primary}`, `Bound${p.primary}Field`].includes(entry.name)) ??
    pages.find((p) => p.storyFile && dirname(p.storyFile) === dirname(entry.source) && mentioned(p)) ??
    pages.find((p) => entry.name.startsWith("Bound") && mentioned(p))
  );
}

/** The story file whose meta `component` is this export, falling back to a sibling `X.stories.tsx`. */
function findStoryFile(entry: ExportEntry): string | undefined {
  const sibling = entry.source.replace(/\.tsx$/, ".stories.tsx");
  if (existsSync(join(root, sibling)) && storyMetaComponent(sibling) === entry.name) return sibling;
  const dir = dirname(join(root, entry.source));
  return listFiles(dir, ".stories.tsx", false)
    .map((f) => relative(root, f))
    .find((f) => storyMetaComponent(f) === entry.name);
}

const metaComponentCache = new Map<string, string | undefined>();
function storyMetaComponent(storyFile: string): string | undefined {
  if (!metaComponentCache.has(storyFile)) {
    const source = readFileSync(join(root, storyFile), "utf8");
    const local = source.match(/^\s*component: (\w+),/m)?.[1];
    // Stories often import the component under an alias, e.g. `import { Icon as IconComponent }`.
    const aliased = local && source.match(new RegExp(`\\b(\\w+) as ${local}\\b`))?.[1];
    metaComponentCache.set(storyFile, aliased || local);
  }
  return metaComponentCache.get(storyFile);
}

function storyFigma(storyFile: string): string | undefined {
  const source = readFileSync(join(root, storyFile), "utf8");
  return source.match(/design:\s*\{[^}]*url:\s*"([^"]+)"/)?.[1];
}

/** Topic pages: MDX with a `<Meta title>`, plus the repo's markdown docs. */
function readGuides(pages: DocPage[]): Guide[] {
  const fromMdx = pages
    .filter((p) => p.title)
    .map((p) => ({ id: guideId(p.path), title: p.title!, path: p.path, markdown: p.markdown }));
  const fromMarkdown = ["docs/layouts.md", "docs/components.md", "tokens/README.md"]
    .filter((p) => existsSync(join(root, p)))
    .map((p) => {
      const markdown = readFileSync(join(root, p), "utf8");
      return { id: guideId(p), title: markdown.match(/^# (.+)$/m)?.[1] ?? p, path: p, markdown };
    });
  return [...fromMdx, ...fromMarkdown];
}

function guideId(path: string): string {
  return path
    .replace(/^(src|docs)\//, "")
    .replace(/\.(mdx|md)$/, "")
    .replace(/[^\w]+/g, "-")
    .toLowerCase();
}

function readTokens(program: ts.Program): TokenEntry[] {
  const css = program.getSourceFile(join(root, "src/Css.ts"))!;
  const tokens: TokenEntry[] = [];
  css.forEachChild((node) => {
    if (ts.isEnumDeclaration(node) && node.name.text === "Tokens") {
      for (const member of node.members) {
        if (member.initializer && ts.isStringLiteral(member.initializer)) {
          tokens.push({ name: member.name.getText(css), value: member.initializer.text });
        }
      }
    }
  });
  return tokens;
}

function readGitInfo(): BeamManifest["git"] {
  const run = (cmd: string) => {
    try {
      return execSync(cmd, { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim();
    } catch {
      return undefined;
    }
  };
  return { branch: run("git rev-parse --abbrev-ref HEAD"), sha: run("git rev-parse --short HEAD") };
}

function listFiles(dir: string, suffix: string, recursive = true): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return recursive ? listFiles(path, suffix) : [];
    return e.name.endsWith(suffix) ? [path] : [];
  });
}

function newestMtime(path: string): number {
  if (!existsSync(path)) return 0;
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;
  return Math.max(stat.mtimeMs, ...readdirSync(path).map((f) => newestMtime(join(path, f))));
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}\n// … truncated` : text;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const started = Date.now();
  if (process.argv.includes("--if-stale") && !isManifestStale()) {
    console.error(`Manifest is current: ${relative(root, manifestPath)}`);
  } else {
    const manifest = generateManifest();
    const components = manifest.exports.filter((e) => e.kind === "component");
    console.error(
      `Wrote ${relative(root, manifestPath)} in ${Date.now() - started}ms: ${manifest.exports.length} exports, ` +
        `${components.length} components, ${manifest.guides.length} guides, ${manifest.tokens.length} tokens.`,
    );
    if (process.argv.includes("--coverage")) printCoverage(manifest);
  }
}

/** Lists public components missing a description or a docs page, and overall prop coverage. */
function printCoverage(manifest: BeamManifest): void {
  const components = manifest.exports.filter((e) => e.kind === "component" && !e.deprecated);
  const props = components.flatMap((c) => c.props ?? []);
  const pct = (n: number, d: number) => `${n}/${d} (${Math.round((100 * n) / Math.max(d, 1))}%)`;
  console.log(
    `Components with a description: ${pct(components.filter((c) => c.description).length, components.length)}`,
  );
  console.log(`Components with a docs page: ${pct(components.filter((c) => c.docs).length, components.length)}`);
  console.log(`Props with a description: ${pct(props.filter((p) => p.description).length, props.length)}`);
  console.log(
    `\nNo description: ${
      components
        .filter((c) => !c.description)
        .map((c) => c.name)
        .join(", ") || "none"
    }`,
  );
  console.log(
    `\nNo docs page: ${
      components
        .filter((c) => !c.docs)
        .map((c) => c.name)
        .join(", ") || "none"
    }`,
  );
  console.log(
    `\nNo Figma link: ${
      components
        .filter((c) => !c.figma)
        .map((c) => c.name)
        .join(", ") || "none"
    }`,
  );
}
