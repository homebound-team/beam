import { beamNavbarLayoutHeightVar, beamStickyTopTransitionVar } from "src/layouts/layoutVars";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { render, scrollWindowWithAnchor } from "src/utils/rtl";
import { vi } from "vitest";

describe("NavbarLayout", () => {
  it("renders the navbar slot and body children", async () => {
    // Given a navbar and body content
    // When rendered
    const r = await render(
      <NavbarLayout
        navbar={{
          brand: "Brand",
          items: [
            { label: "Dashboard", onClick: () => {}, active: true },
            { label: "Projects", onClick: () => {} },
          ],
        }}
      >
        <span>Page content</span>
      </NavbarLayout>,
    );

    // Then the navbar slot and body slot render
    expect(r.navbarLayout_navbar).toHaveTextContent("Dashboard");
    expect(r.navbarLayout_body).toHaveTextContent("Page content");
  });

  it("follows the page until the navbar leaves, then drops its height", async () => {
    // Given a navbar measuring 48px at the top of the page
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      height: 48,
      width: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON() {},
    });
    try {
      const r = await render(
        <NavbarLayout navbar={{ brand: "Brand", items: [{ label: "Dashboard", onClick: () => {}, active: true }] }}>
          <span>Page content</span>
        </NavbarLayout>,
      );
      const reserveEl = r.navbarLayout_navbar.parentElement!;
      expect(r.navbarLayout.style.getPropertyValue(beamNavbarLayoutHeightVar)).toBe("48px");

      // When the navbar has scrolled partway off
      scrollWindowWithAnchor(reserveEl, 20, { elementHeight: 48 });

      // Then the var is the part still on screen, and the navbar follows the reserve element
      expect(r.navbarLayout.style.getPropertyValue(beamNavbarLayoutHeightVar)).toBe("28px");
      expect(r.navbarLayout_navbar).toHaveStyle({ top: "-20px" });
      // And sticky top does not ease while the navbar is still on screen
      expect(document.documentElement.style.getPropertyValue(beamStickyTopTransitionVar)).toBe("none");

      // When the reserve element leaves the viewport
      scrollWindowWithAnchor(reserveEl, 48, { elementHeight: 48 });

      // Then the height collapses, and the sticky top ease is back for the slide (being unset/`""` means it'll use the default transition)
      expect(r.navbarLayout.style.getPropertyValue(beamNavbarLayoutHeightVar)).toBe("");
      expect(document.documentElement.style.getPropertyValue(beamStickyTopTransitionVar)).toBe("");
    } finally {
      spy.mockRestore();
    }
  });
});
