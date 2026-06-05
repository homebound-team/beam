import { stickyNavAndHeaderOffset } from "src/layouts/layoutVars";

describe("layoutVars", () => {
  describe("stickyNavAndHeaderOffset", () => {
    it("sums the nav + header height vars with a 0 base by default", () => {
      expect(stickyNavAndHeaderOffset()).toBe(
        "calc(0px + var(--beam-navbar-layout-height, 0px) + var(--beam-page-header-layout-height, 0px))",
      );
    });

    it("includes the base offset when provided", () => {
      expect(stickyNavAndHeaderOffset(12)).toBe(
        "calc(12px + var(--beam-navbar-layout-height, 0px) + var(--beam-page-header-layout-height, 0px))",
      );
    });
  });
});
