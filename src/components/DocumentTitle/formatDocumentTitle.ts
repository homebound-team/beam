import type { AppEnvironment } from "src/components/EnvironmentBanner/EnvironmentBanner";

type FormatDocumentTitleInput = {
  env: AppEnvironment;
  pageTitle?: string;
  suffix?: string;
};

/** Builds `document.title` from env prefix, optional page title, and optional app suffix. */
export function formatDocumentTitle(input: FormatDocumentTitleInput): string {
  const prefix = getDocumentTitleEnvPrefix(input.env);

  if (input.pageTitle) {
    return input.suffix ? `${prefix}${input.pageTitle} | ${input.suffix}` : `${prefix}${input.pageTitle}`;
  }

  if (input.suffix) {
    return `${prefix}${input.suffix}`;
  }

  return prefix.trimEnd();
}

/** Joins page-level title segments for {@link useDocumentTitle}. */
export function joinDocumentTitleSegments(...segments: (string | undefined)[]): string | undefined {
  const parts = segments.filter((segment): segment is string => segment != null && segment.length > 0);
  return parts.length > 0 ? parts.join(" | ") : undefined;
}

function getDocumentTitleEnvPrefix(env: AppEnvironment): string {
  return env === "prod" ? "" : `[${env.toUpperCase()}] `;
}
