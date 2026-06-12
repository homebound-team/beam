import { stickyNavAndHeaderOffset } from "src/layouts/layoutVars";

describe("layoutVars", () => {
  describe("stickyNavAndHeaderOffset", () => {
    it("sums the nav + header height vars with a 0 base by default", () => {
      // Given the default base offset
      // When computing the sticky offset
      const result = stickyNavAndHeaderOffset();

      // Then the nav and header height vars are summed with a 0px base
      expect(result).toBe(
        "calc(0px + var(--beam-navbar-layout-height, 0px) + var(--beam-page-header-layout-height, 0px))",
      );
    });

    it("includes the base offset when provided", () => {
      // Given a 12px base offset
      // When computing the sticky offset
      const result = stickyNavAndHeaderOffset(12);

      // Then the base is included in the calc expression
      expect(result).toBe(
        "calc(12px + var(--beam-navbar-layout-height, 0px) + var(--beam-page-header-layout-height, 0px))",
      );
    });
  });
});
