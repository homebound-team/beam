#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import pixelmatch from "pixelmatch";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const helpText = `Capture and diff Storybook story screenshots.

Examples:
  yarn story:screenshot --story inputs-text-field--default --name baseline
  yarn story:screenshot --url "http://127.0.0.1:9000/?path=/story/inputs-text-field--default" --name iter-1 --compare baseline
  yarn story:screenshot --story inputs-text-field--default --selector "#storybook-root" --out .storyshots/custom/shot.png

Options:
  --story, -s        Story id (for example: inputs-text-field--default)
  --url, -u          Storybook URL (manager or iframe URL)
  --base-url         Storybook base URL when --url is omitted (default: http://127.0.0.1:9000)
  --name, -n         Screenshot name when --out is omitted (default: ISO timestamp)
  --out, -o          Output PNG path
  --shots-dir        Screenshot root directory (default: .storyshots)
  --compare, -c      Baseline PNG path, or baseline name in the story folder
  --diff, -d         Diff PNG output path
  --selector         CSS selector to screenshot instead of the full page
  --globals          Storybook globals query value (for example: backgrounds.value:white)
  --query            Additional query string parameters (for example: args=size:lg)
  --width            Viewport width (default: 1440)
  --height           Viewport height (default: 900)
  --scale            Device scale factor (default: 1)
  --delay            Wait before screenshot in milliseconds (default: 350)
  --timeout          Navigation timeout in milliseconds (default: 30000)
  --threshold        Pixel diff threshold between 0 and 1 (default: 0.1)
  --full-page        Capture a full-page screenshot (default: true unless --selector is set)
  --headed           Run chromium with a visible window
  --help, -h         Show this help text
`;

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

async function main() {
  const cliArgs = normalizeCliArgs(process.argv.slice(2));
  const { values } = parseArgs({
    args: cliArgs,
    options: {
      story: { type: "string", short: "s" },
      url: { type: "string", short: "u" },
      "base-url": { type: "string" },
      name: { type: "string", short: "n" },
      out: { type: "string", short: "o" },
      "shots-dir": { type: "string" },
      compare: { type: "string", short: "c" },
      diff: { type: "string", short: "d" },
      selector: { type: "string" },
      globals: { type: "string" },
      query: { type: "string" },
      width: { type: "string" },
      height: { type: "string" },
      scale: { type: "string" },
      delay: { type: "string" },
      timeout: { type: "string" },
      threshold: { type: "string" },
      "full-page": { type: "boolean" },
      headed: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(helpText);
    return;
  }

  const storyId = values.story ?? extractStoryId(values.url);
  if (!storyId) {
    throw new Error("Provide --story, or --url that contains ?path=/story/... or ?id=...");
  }

  const shotsDir = values["shots-dir"] ?? ".storyshots";
  const width = parsePositiveInt(values.width, 1440, "--width");
  const height = parsePositiveInt(values.height, 900, "--height");
  const delayMs = parseNonNegativeInt(values.delay, 350, "--delay");
  const timeoutMs = parsePositiveInt(values.timeout, 30000, "--timeout");
  const scale = parsePositiveNumber(values.scale, 1, "--scale");
  const threshold = parseThreshold(values.threshold, 0.1, "--threshold");

  const storyDir = path.resolve(process.cwd(), shotsDir, sanitizePathSegment(storyId));
  const outputPath = values.out
    ? path.resolve(process.cwd(), values.out)
    : path.join(storyDir, `${sanitizeFileName(values.name ?? timestampName())}.png`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const storyUrl = buildStoryUrl({
    storyId,
    storyUrl: values.url,
    baseUrl: values["base-url"] ?? "http://127.0.0.1:9000",
    globals: values.globals,
    query: values.query,
  });

  await captureScreenshot({
    storyUrl,
    outputPath,
    selector: values.selector,
    fullPage: values["full-page"] ?? !values.selector,
    width,
    height,
    scale,
    delayMs,
    timeoutMs,
    headed: values.headed ?? false,
  });

  console.log(`Saved screenshot: ${toRelativePath(outputPath)}`);

  if (!values.compare) {
    return;
  }

  const baselinePath = resolveComparePath(values.compare, storyDir);
  await ensureFileExists(baselinePath);

  const diffPath = values.diff
    ? path.resolve(process.cwd(), values.diff)
    : path.join(path.dirname(outputPath), `${path.parse(outputPath).name}.diff.png`);
  await fs.mkdir(path.dirname(diffPath), { recursive: true });

  const diffResult = await diffScreenshots({ baselinePath, updatedPath: outputPath, diffPath, threshold });
  console.log(
    `Saved diff: ${toRelativePath(diffPath)} (${diffResult.changedPixels.toLocaleString()} pixels, ${diffResult.changedPercent.toFixed(2)}%)`,
  );
}

async function captureScreenshot({
  storyUrl,
  outputPath,
  selector,
  fullPage,
  width,
  height,
  scale,
  delayMs,
  timeoutMs,
  headed,
}) {
  const browser = await chromium.launch({ headless: !headed });
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: scale,
    });
    const page = await context.newPage();
    await page.goto(storyUrl.toString(), { waitUntil: "networkidle", timeout: timeoutMs });
    await page.waitForSelector("#storybook-root", { state: "visible", timeout: timeoutMs });

    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    });

    if (delayMs > 0) {
      await page.waitForTimeout(delayMs);
    }

    if (selector) {
      const element = page.locator(selector).first();
      await element.waitFor({ state: "visible", timeout: timeoutMs });
      await element.screenshot({
        path: outputPath,
        animations: "disabled",
        scale: "css",
      });
      return;
    }

    await page.screenshot({
      path: outputPath,
      fullPage,
      animations: "disabled",
      scale: "css",
    });
  } catch (error) {
    if (isConnectionError(error)) {
      throw new Error(
        `Could not reach Storybook at ${storyUrl.origin}. Start it with \"yarn storybook\" and try again.`,
      );
    }
    throw error;
  } finally {
    await browser.close();
  }
}

async function diffScreenshots({ baselinePath, updatedPath, diffPath, threshold }) {
  const [baselineBuffer, updatedBuffer] = await Promise.all([fs.readFile(baselinePath), fs.readFile(updatedPath)]);

  const baseline = PNG.sync.read(baselineBuffer);
  const updated = PNG.sync.read(updatedBuffer);

  if (baseline.width !== updated.width || baseline.height !== updated.height) {
    throw new Error(
      `Cannot diff images with different dimensions: ${baseline.width}x${baseline.height} vs ${updated.width}x${updated.height}`,
    );
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });

  const changedPixels = pixelmatch(baseline.data, updated.data, diff.data, baseline.width, baseline.height, {
    threshold,
  });

  await fs.writeFile(diffPath, PNG.sync.write(diff));

  const totalPixels = baseline.width * baseline.height;
  return {
    changedPixels,
    changedPercent: (changedPixels / totalPixels) * 100,
  };
}

function buildStoryUrl({ storyId, storyUrl, baseUrl, globals, query }) {
  const rawBase = storyUrl ? new URL(storyUrl) : new URL(baseUrl);
  let basePath = rawBase.pathname;

  if (basePath.endsWith("iframe.html")) {
    basePath = basePath.slice(0, -"iframe.html".length);
  } else if (basePath.endsWith("index.html")) {
    basePath = basePath.slice(0, -"index.html".length);
  }

  if (!basePath.endsWith("/")) {
    basePath = `${basePath}/`;
  }

  const url = new URL(`${rawBase.origin}${basePath}iframe.html`);

  if (storyUrl) {
    for (const [key, value] of rawBase.searchParams.entries()) {
      if (key !== "id" && key !== "path") {
        url.searchParams.set(key, value);
      }
    }
  }

  url.searchParams.set("id", storyId);
  url.searchParams.set("viewMode", "story");

  if (globals) {
    url.searchParams.set("globals", globals);
  }

  if (query) {
    const extraParams = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
    for (const [key, value] of extraParams.entries()) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

function extractStoryId(rawUrl) {
  if (!rawUrl) {
    return undefined;
  }

  const parsedUrl = new URL(rawUrl);
  const directId = parsedUrl.searchParams.get("id");
  if (directId) {
    return directId;
  }

  const pathParam = parsedUrl.searchParams.get("path");
  if (pathParam?.startsWith("/story/")) {
    return pathParam.slice("/story/".length);
  }

  return undefined;
}

function resolveComparePath(compareValue, storyDir) {
  const usesPathSyntax =
    compareValue.startsWith(".") ||
    compareValue.startsWith("/") ||
    compareValue.includes("/") ||
    compareValue.includes("\\");

  if (usesPathSyntax) {
    return path.resolve(process.cwd(), compareValue);
  }

  return path.join(storyDir, `${sanitizeFileName(compareValue)}.png`);
}

async function ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`File not found: ${toRelativePath(filePath)}`);
  }
}

function sanitizePathSegment(value) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

function sanitizeFileName(value) {
  const base = value.endsWith(".png") ? value.slice(0, -4) : value;
  return base.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function timestampName() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function parsePositiveInt(value, fallback, optionName) {
  const parsedValue = parseInt(value ?? `${fallback}`, 10);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${optionName} must be a positive integer`);
  }
  return parsedValue;
}

function parseNonNegativeInt(value, fallback, optionName) {
  const parsedValue = parseInt(value ?? `${fallback}`, 10);
  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(`${optionName} must be a non-negative integer`);
  }
  return parsedValue;
}

function parsePositiveNumber(value, fallback, optionName) {
  const parsedValue = Number.parseFloat(value ?? `${fallback}`);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error(`${optionName} must be a positive number`);
  }
  return parsedValue;
}

function parseThreshold(value, fallback, optionName) {
  const parsedValue = Number.parseFloat(value ?? `${fallback}`);
  if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > 1) {
    throw new Error(`${optionName} must be between 0 and 1`);
  }
  return parsedValue;
}

function toRelativePath(filePath) {
  return path.relative(process.cwd(), filePath) || ".";
}

function isConnectionError(error) {
  return error instanceof Error && /ERR_CONNECTION_REFUSED|ECONNREFUSED/.test(error.message);
}

function normalizeCliArgs(args) {
  return args[0] === "--" ? args.slice(1) : args;
}
