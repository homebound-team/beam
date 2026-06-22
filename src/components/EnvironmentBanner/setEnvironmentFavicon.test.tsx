import {
  setEnvironmentFavicon,
  type EnvironmentFaviconUrls,
} from "src/components/EnvironmentBanner/setEnvironmentFavicon";

describe("setEnvironmentFavicon", () => {
  afterEach(() => {
    document.head.querySelectorAll('link[rel~="icon"]').forEach((link) => link.remove());
  });

  it("updates the document favicon for the current env", () => {
    // Given an existing favicon link and dev env
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "/favicons/original.png";
    document.head.appendChild(link);

    // When favicons are applied for dev
    setEnvironmentFavicon("dev", {
      default: "/favicons/favicon.png",
      dev: "/favicons/favicon-dev.png",
    });

    // Then the link href matches the dev favicon
    expect(link.getAttribute("href")).toBe("/favicons/favicon-dev.png");
  });

  it("falls back to default for envs without a dedicated entry", () => {
    // Given an existing favicon link
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "/favicons/original.png";
    document.head.appendChild(link);

    // When favicons are applied for local with no local entry
    setEnvironmentFavicon("local", {
      default: "/favicons/favicon.png",
      dev: "/favicons/favicon-dev.png",
    });

    // Then the default favicon is used
    expect(link.getAttribute("href")).toBe("/favicons/favicon.png");
  });

  it("creates a favicon link when none exists", () => {
    // When favicons are applied without an existing favicon link
    setEnvironmentFavicon("qa", {
      default: "/favicons/favicon.png",
      qa: "/favicons/favicon-qa.png",
    });

    // Then a new icon link is added to the document head
    const link = document.head.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    expect(link).not.toBeNull();
    expect(link?.rel).toBe("icon");
    expect(link?.getAttribute("href")).toBe("/favicons/favicon-qa.png");
  });

  it("updates the favicon when called again with a different env", () => {
    // Given an existing favicon link
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "/favicons/original.png";
    document.head.appendChild(link);
    const favicons: EnvironmentFaviconUrls = {
      default: "/favicons/favicon.png",
      dev: "/favicons/favicon-dev.png",
      qa: "/favicons/favicon-qa.png",
    };

    // When favicons are applied for dev then qa
    setEnvironmentFavicon("dev", favicons);
    expect(link.getAttribute("href")).toBe("/favicons/favicon-dev.png");

    setEnvironmentFavicon("qa", favicons);

    // Then the link href switches to the qa favicon
    expect(link.getAttribute("href")).toBe("/favicons/favicon-qa.png");
  });

  it("does not mutate the document when favicons is undefined", () => {
    // Given an existing favicon link
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "/favicons/original.png";
    document.head.appendChild(link);

    // When favicons are omitted
    setEnvironmentFavicon("dev", undefined);

    // Then the link href is unchanged
    expect(link.getAttribute("href")).toBe("/favicons/original.png");
  });
});
