import {
  bannerAndNavbarChromeTop,
  documentScrollChromeWidth,
  stickyNavAndHeaderOffset,
  stickyTableHeaderOffset,
} from "src/layouts/layoutVars";

describe("layoutVars", () => {
  describe("documentScrollChromeWidth", () => {
    it("spans the viewport width beside the side nav rail", () => {
      // Given the document scroll chrome width helper
      // When computing the width expression
      const result = documentScrollChromeWidth();

      // Then it subtracts the side nav rail from the layout viewport width
      expect(result).toBe("calc(var(--beam-layout-viewport-width, 100vw) - var(--beam-side-nav-layout-width, 0px))");
    });
  });

  describe("bannerAndNavbarChromeTop", () => {
    it("sums the environment banner + navbar height vars", () => {
      // Given the banner + navbar chrome top helper
      // When computing the top offset
      const result = bannerAndNavbarChromeTop();

      // Then the environment banner and navbar height vars are summed
      expect(result).toBe("calc(var(--beam-environment-banner-height, 0px) + var(--beam-navbar-layout-height, 0px))");
    });
  });

  describe("stickyNavAndHeaderOffset", () => {
    it("sums the banner + nav + header height vars with a 0 base by default", () => {
      // Given the default base offset
      // When computing the sticky offset
      const result = stickyNavAndHeaderOffset();

      // Then the banner, nav, and header height vars are summed with a 0px base
      expect(result).toBe(
        "calc(0px + var(--beam-environment-banner-height, 0px) + var(--beam-navbar-layout-height, 0px) + var(--beam-page-header-layout-height, 0px))",
      );
    });

    it("includes the base offset when provided", () => {
      // Given a 12px base offset
      // When computing the sticky offset
      const result = stickyNavAndHeaderOffset(12);

      // Then the base is included in the calc expression
      expect(result).toBe(
        "calc(12px + var(--beam-environment-banner-height, 0px) + var(--beam-navbar-layout-height, 0px) + var(--beam-page-header-layout-height, 0px))",
      );
    });
  });

  describe("stickyTableHeaderOffset", () => {
    it("sums the nav + header + table actions height vars with a 0 base by default", () => {
      // Given the default base offset
      // When computing the sticky offset
      const result = stickyTableHeaderOffset();

      // Then the nav, header, and table actions height vars are summed with a 0px base
      expect(result).toBe(
        "calc(0px + var(--beam-environment-banner-height, 0px) + var(--beam-navbar-layout-height, 0px) + var(--beam-page-header-layout-height, 0px) + var(--beam-table-actions-height, 0px))",
      );
    });
  });
});
