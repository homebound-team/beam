/**
 * Scans `src/` for `Tokens.*` references and maps each token to Storybook stories
 * that cover those call sites. Output: `src/foundations/generated/tokenUsages.json`.
 *
 *   yarn generate:token-usages
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { basename, dirname, extname, join, relative } from "path";
import { fileURLToPath } from "url";
import { capitalCase } from "change-case";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(rootDir, "src");
const outPath = join(srcDir, "foundations/generated/tokenUsages.json");

const TOKEN_RE = /\bTokens\.([A-Za-z][A-Za-z0-9]*)\b/g;
/**
 * Storybook meta titles look like `Foundations/Colors` (slash, no spaces).
 * Fixture fields such as `title: "… 1/2 HP …"` are ignored.
 */
const META_TITLE_RE = /title:\s*["']([^"'\s]+\/[^"'\s]+)["']/;
const STORY_EXPORT_RE = /^export\s+(?:function|const)\s+([A-Z][A-Za-z0-9]*)/gm;

type StoryRef = {
  /** Display label in the catalog (usually the story title leaf). */
  label: string;
  /** Storybook component title (LinkTo `title`). */
  title: string;
  /** Storybook story name (LinkTo `name`). */
  name: string;
};

type TokenUsagesFile = {
  generatedAt: string;
  usages: Record<string, StoryRef[]>;
};

function main(): void {
  const storyFiles = listFiles(srcDir, (p) => p.endsWith(".stories.tsx") && !p.includes(".qa.stories."));
  const storyByPath = new Map(storyFiles.map((abs) => [toPosix(relative(rootDir, abs)), analyzeStoryFile(abs)]));

  const sourceFiles = listFiles(
    srcDir,
    (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !p.endsWith(".stories.tsx") &&
      !p.includes(".test.") &&
      !p.endsWith("Css.ts") &&
      !p.includes("/foundations/generated/") &&
      !p.endsWith("Tokens.stories.tsx") &&
      !p.endsWith("sbComponents.tsx"),
  );

  const usages = new Map<string, Map<string, StoryRef>>();

  for (const abs of sourceFiles) {
    const sourceRel = toPosix(relative(rootDir, abs));
    const text = readFileSync(abs, "utf8");
    const tokenNames = new Set<string>();
    for (const match of text.matchAll(TOKEN_RE)) {
      tokenNames.add(match[1]!);
    }
    if (tokenNames.size === 0) continue;

    const storyRel = resolveStoryPath(sourceRel, storyByPath);
    const story = storyRel ? storyByPath.get(storyRel) : undefined;
    if (!story) continue;

    for (const tokenName of tokenNames) {
      let byTitle = usages.get(tokenName);
      if (!byTitle) {
        byTitle = new Map();
        usages.set(tokenName, byTitle);
      }
      byTitle.set(story.title, story);
    }
  }

  const output: TokenUsagesFile = {
    generatedAt: new Date().toISOString(),
    usages: Object.fromEntries(
      [...usages.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([token, byTitle]) => [
          token,
          [...byTitle.values()].sort((a, b) => a.label.localeCompare(b.label) || a.title.localeCompare(b.title)),
        ]),
    ),
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${outPath} (${Object.keys(output.usages).length} tokens, ${[...usages.values()].reduce((n, m) => n + m.size, 0)} story links)`,
  );
}

function analyzeStoryFile(absPath: string): StoryRef {
  const rel = toPosix(relative(rootDir, absPath));
  const text = readFileSync(absPath, "utf8");
  const title = text.match(META_TITLE_RE)?.[1] ?? titleFromStoryPath(rel);
  const exportName = firstStoryExport(text) ?? "Default";
  const name = capitalCase(exportName);
  const label = title.includes("/") ? title.slice(title.lastIndexOf("/") + 1) : title;
  return { label, title, name };
}

/**
 * Mirrors Storybook’s default title from story file paths under src/.
 * When the file name matches its parent folder (`Avatar/Avatar.stories.tsx`),
 * Storybook collapses the duplicate leaf (`components/Avatar`).
 */
function titleFromStoryPath(relFromRoot: string): string {
  const withoutExt = relFromRoot.replace(/^src\//, "").replace(/\.stories\.tsx$/, "");
  const parts = withoutExt.split("/");
  if (parts.length >= 2 && parts[parts.length - 1] === parts[parts.length - 2]) {
    return parts.slice(0, -1).join("/");
  }
  return withoutExt;
}

function firstStoryExport(text: string): string | undefined {
  STORY_EXPORT_RE.lastIndex = 0;
  const match = STORY_EXPORT_RE.exec(text);
  return match?.[1];
}

function resolveStoryPath(sourceRel: string, storyByPath: Map<string, StoryRef>): string | undefined {
  const preferred = preferredStoryForSource(sourceRel);
  if (preferred && storyByPath.has(preferred)) return preferred;

  const sourceAbs = join(rootDir, sourceRel);
  const base = basename(sourceRel, extname(sourceRel));
  let dir = dirname(sourceAbs);

  // Co-located Foo.tsx → Foo.stories.tsx
  const colocated = toPosix(relative(rootDir, join(dir, `${base}.stories.tsx`)));
  if (storyByPath.has(colocated)) return colocated;

  // Walk up from the file’s directory toward src/
  while (isInsideSrc(dir)) {
    const storiesHere = readdirSync(dir)
      .filter((f) => f.endsWith(".stories.tsx") && !f.includes(".qa.stories."))
      .map((f) => toPosix(relative(rootDir, join(dir, f))));

    if (storiesHere.length === 1) return storiesHere[0];
    if (storiesHere.length > 1) {
      const folder = basename(dir);
      const folderMatch = storiesHere.find((p) => basename(p, ".stories.tsx") === folder);
      if (folderMatch) return folderMatch;
      // Prefer a primary “index-like” story over deeply nested demos
      const sorted = [...storiesHere].sort((a, b) => a.length - b.length || a.localeCompare(b));
      return sorted[0];
    }

    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return undefined;
}

/** Hand-tuned destinations when walk-up would pick the wrong story. */
function preferredStoryForSource(sourceRel: string): string | undefined {
  if (sourceRel.startsWith("src/components/Table/")) {
    return "src/components/Table/GridTable.stories.tsx";
  }
  if (sourceRel.startsWith("src/components/internal/DatePicker/")) {
    return "src/components/internal/DatePicker/DatePicker.stories.tsx";
  }
  if (sourceRel.startsWith("src/inputs/internal/")) {
    return "src/inputs/SelectField.stories.tsx";
  }
  if (sourceRel.startsWith("src/inputs/TreeSelectField/")) {
    return "src/inputs/TreeSelectField/TreeSelectField.stories.tsx";
  }
  if (sourceRel.startsWith("src/forms/")) {
    return "src/forms/BoundForm.stories.tsx";
  }
  return undefined;
}

function isInsideSrc(absDir: string): boolean {
  const rel = relative(srcDir, absDir);
  return rel === "" || (!rel.startsWith("..") && !rel.split("/").includes(".."));
}

function listFiles(dir: string, pred: (absPath: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) out.push(...listFiles(abs, pred));
    else if (pred(abs)) out.push(abs);
  }
  return out;
}

function toPosix(p: string): string {
  return p.replaceAll("\\", "/");
}

// Ensure preferred story targets exist when referenced (dev-time sanity).
function assertPreferredTargetsExist(): void {
  const samples = [
    "src/components/Table/GridTable.stories.tsx",
    "src/components/internal/DatePicker/DatePicker.stories.tsx",
    "src/inputs/SelectField.stories.tsx",
  ];
  for (const rel of samples) {
    if (!existsSync(join(rootDir, rel))) {
      console.warn(`generate-token-usages: preferred story missing: ${rel}`);
    }
  }
}

assertPreferredTargetsExist();
main();
