import type { AppEnvironment } from "src/components/EnvironmentBanner/EnvironmentBanner";

/** App-hosted favicon URLs; `default` is required for envs without a dedicated entry (e.g. `local`). */
export type EnvironmentFaviconUrls = Partial<Record<AppEnvironment, string>> & {
  default: string;
};

/** Set `document.head` favicon from app-hosted URLs. No-op when `favicons` is undefined. Call once at app bootstrap. */
export function setEnvironmentFavicon(env: AppEnvironment, favicons: EnvironmentFaviconUrls | undefined): void {
  if (favicons == null) {
    return;
  }

  const href = favicons[env] ?? favicons.default;
  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  if (link == null) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}
