import type { ReactNode } from "react";
import { AutoSaveStatus, AutoSaveStatusContext } from "src/components/AutoSaveStatus/AutoSaveStatusProvider";
import { selfTopSpaced } from "src/layouts/layoutSpacing";
import {
  beamNavbarLayoutHeightVar,
  beamPageBannerHeightVar,
  beamPageHeaderLayoutHeightVar,
} from "src/layouts/layoutVars";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { usePageBanner } from "src/layouts/PageBanner/usePageBanner";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { noop } from "src/utils/helpers";
import { render, scrollWindow, scrollWindowWithAnchor } from "src/utils/rtl";
import { vi } from "vitest";

describe("PageHeaderLayout", () => {
  it("renders the page header slot and body children", async () => {
    // Given a page header and body content
    // When rendered
    const r = await render(
      <PageHeaderLayout pageHeader={{ title: "Page title" }}>
        <span>Body content</span>
      </PageHeaderLayout>,
    );

    // Then the header slot and body slot render
    expect(r.pageHeaderLayout_pageHeader).toHaveTextContent("Page title");
    expect(r.pageHeaderLayout_body).toHaveTextContent("Body content");
    expect(r.query.autoSave).toBeNull();
    expect(r.query.pageHeaderLayout_banner).toBeNull();
  });

  it("renders a stay-pinned page banner and publishes its height", async () => {
    // Given a measured banner height of 72px
    const spy = mockElementHeight(72);
    try {
      // When rendered with a banner
      const r = await render(
        <PageHeaderLayout
          pageHeader={{ title: "Page title" }}
          banner={{
            type: "update",
            title: "Calculating Updated Costs",
            description: "Costs shown may be out of date.",
          }}
        />,
      );

      // Then the banner is in-flow sticky chrome and the layout publishes its height
      expect(r.pageHeaderLayout_banner_title).toHaveTextContent("Calculating Updated Costs");
      expect(r.pageHeaderLayout_bannerSticky).toHaveStyle({ position: "sticky" });
      expect(r.pageHeaderLayout.style.getPropertyValue(beamPageBannerHeightVar)).toBe("72px");
    } finally {
      spy.mockRestore();
    }
  });

  it("publishes the header height still on screen, then drops it once the header leaves", async () => {
    // Given a header measuring 72px, rendered at the top of the page
    const spy = mockElementHeight(72);
    try {
      const r = await render(<PageHeaderLayout pageHeader={{ title: "Page title" }} />);
      const reserveEl = r.pageHeaderLayout_pageHeader.parentElement!;
      expect(r.pageHeaderLayout.style.getPropertyValue(beamPageHeaderLayoutHeightVar)).toBe("72px");

      // When the header has scrolled partway off
      scrollWindowWithAnchor(reserveEl, 20, { elementHeight: 72 });

      // Then the var is the part still below the pin line, and the header follows the reserve element
      expect(r.pageHeaderLayout.style.getPropertyValue(beamPageHeaderLayoutHeightVar)).toBe("52px");
      expect(r.pageHeaderLayout_pageHeader).toHaveStyle({ top: "-20px" });

      // When the reserve element leaves the viewport
      scrollWindowWithAnchor(reserveEl, 72, { elementHeight: 72 });

      // Then the height collapses and sticky chrome below can move up
      expect(r.pageHeaderLayout.style.getPropertyValue(beamPageHeaderLayoutHeightVar)).toBe("");
    } finally {
      spy.mockRestore();
    }
  });

  it("keeps the page header at rest while the navbar is still partly on screen", async () => {
    // Given a 48px navbar with a 72px page header under it
    let scrolled = 0;
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const id = this.getAttribute("data-testid") ?? this.firstElementChild?.getAttribute("data-testid") ?? "";
      if (id === "navbarLayout_navbar") return box(-scrolled, 48);
      if (id === "pageHeaderLayout_pageHeader") return box(48 - scrolled, 72);
      return box(0, 0);
    });
    try {
      scrollWindow(0);
      const r = await render(
        <NavbarLayout navbar={{ brand: "Brand", items: [{ label: "Dashboard", onClick: () => {}, active: true }] }}>
          <PageHeaderLayout pageHeader={{ title: "Page title" }} />
        </NavbarLayout>,
      );

      // When both have moved up 20px in one scroll
      scrolled = 20;
      scrollWindow(20);

      // Then the header still sits under the navbar, using the height the navbar wrote in this scroll
      expect(r.navbarLayout.style.getPropertyValue(beamNavbarLayoutHeightVar)).toBe("28px");
      expect(r.pageHeaderLayout.style.getPropertyValue(beamPageHeaderLayoutHeightVar)).toBe("72px");
      expect(r.pageHeaderLayout_pageHeader).toHaveStyle({
        top: "calc(var(--beam-environment-banner-height, 0px) + var(--beam-navbar-layout-height, 0px))",
      });
    } finally {
      spy.mockRestore();
    }
  });

  it("reads the navbar's revealed height on a mid-page load", async () => {
    // Given a reload where the navbar reserve is already off screen and the header reserve is still on screen
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const id = this.getAttribute("data-testid") ?? this.firstElementChild?.getAttribute("data-testid") ?? "";
      if (id === "navbarLayout_navbar") return box(-80, 48);
      if (id === "pageHeaderLayout_pageHeader") return box(10, 72);
      return box(0, 0);
    });
    try {
      scrollWindow(200, { scrollHeight: 5000, clientHeight: 800 });

      // When the layouts mount, with no further scroll
      const r = await render(
        <NavbarLayout navbar={{ brand: "Brand", items: [{ label: "Dashboard", onClick: () => {}, active: true }] }}>
          <PageHeaderLayout pageHeader={{ title: "Page title" }} />
        </NavbarLayout>,
      );

      // Then the navbar reveals, and the header follows under that height
      expect(r.navbarLayout.style.getPropertyValue(beamNavbarLayoutHeightVar)).toBe("48px");
      expect(r.pageHeaderLayout.style.getPropertyValue(beamPageHeaderLayoutHeightVar)).toBe("34px");
      expect(r.pageHeaderLayout_pageHeader).toHaveStyle({ top: "10px" });
    } finally {
      spy.mockRestore();
      scrollWindow(0);
    }
  });

  it("does not transition the header into place on mount", async () => {
    // Given the frame after mount has not yet run
    const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);

    // When the page header first renders
    const r = await render(<PageHeaderLayout pageHeader={{ title: "Page title" }} />);

    // Then the slide transition is held off, so the mount-time top correction does not animate
    expect(r.pageHeaderLayout_pageHeader).not.toHaveStyle({
      transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    });
    raf.mockRestore();
  });

  it("pads the body below the header", async () => {
    // Given a body whose first child does not pad its own top edge
    // When rendered
    const r = await render(
      <PageHeaderLayout pageHeader={{ title: "Page title" }}>
        <span>Body content</span>
      </PageHeaderLayout>,
    );

    // Then the body pads its own top, leaving the child's box untouched
    expect(r.pageHeaderLayout_body).toHaveStyle({ paddingTop: "calc(var(--t-spacing) * 3)" });
    expect(r.pageHeaderLayout_body.firstElementChild).not.toHaveStyle({ paddingTop: "calc(var(--t-spacing) * 3)" });
  });

  it("skips the body spacing for chrome that pads its own top edge", async () => {
    // Given a body that starts with self-spaced chrome
    // When rendered
    const r = await render(
      <PageHeaderLayout pageHeader={{ title: "Page title" }}>
        <span {...selfTopSpaced}>Body content</span>
      </PageHeaderLayout>,
    );

    // Then the body adds no spacing of its own
    expect(r.pageHeaderLayout_body).not.toHaveStyle({ paddingTop: "calc(var(--t-spacing) * 3)" });
  });

  describe("usePageBanner", () => {
    it("pins a descendant's banner in the layout slot", async () => {
      // Given a body that registers a page banner
      // When rendered
      const r = await render(
        <PageHeaderLayout pageHeader={{ title: "Page title" }}>
          <BodyWithBanner title="Updated Costs Ready" />
        </PageHeaderLayout>,
      );

      // Then the banner renders in the sticky slot, not in the body
      expect(r.pageHeaderLayout_banner_title).toHaveTextContent("Updated Costs Ready");
      expect(r.pageHeaderLayout_body).not.toHaveTextContent("Updated Costs Ready");
    });

    it("clears the banner when the body passes undefined or unmounts", async () => {
      // Given a body showing a page banner
      const r = await render(
        <PageHeaderLayout pageHeader={{ title: "Page title" }}>
          <BodyWithBanner title="Updated Costs Ready" />
        </PageHeaderLayout>,
      );

      // When the body's data no longer calls for a banner
      r.rerender(
        <PageHeaderLayout pageHeader={{ title: "Page title" }}>
          <BodyWithBanner />
        </PageHeaderLayout>,
      );

      // Then the slot is empty
      expect(r.query.pageHeaderLayout_banner).toBeNull();

      // And when a body with a banner mounts, then unmounts (e.g. a tab switch)
      r.rerender(
        <PageHeaderLayout pageHeader={{ title: "Page title" }}>
          <BodyWithBanner title="Tab banner" />
        </PageHeaderLayout>,
      );
      expect(r.pageHeaderLayout_banner_title).toHaveTextContent("Tab banner");
      r.rerender(
        <PageHeaderLayout pageHeader={{ title: "Page title" }}>
          <span>Other tab</span>
        </PageHeaderLayout>,
      );

      // Then the banner goes with it
      expect(r.query.pageHeaderLayout_banner).toBeNull();
    });

    it("takes precedence over the layout's banner prop", async () => {
      // Given a static layout banner and a body that registers its own
      // When rendered
      const r = await render(
        <PageHeaderLayout pageHeader={{ title: "Page title" }} banner={{ type: "info", title: "Static banner" }}>
          <BodyWithBanner title="Tab banner" />
        </PageHeaderLayout>,
      );

      // Then only the body's banner shows
      expect(r.pageHeaderLayout_banner_title).toHaveTextContent("Tab banner");
      expect(r.pageHeaderLayout).not.toHaveTextContent("Static banner");
    });

    it("updates the slot when the body passes a new banner", async () => {
      // Given a body showing a page banner
      const r = await render(
        <PageHeaderLayout pageHeader={{ title: "Page title" }}>
          <BodyWithBanner title="Updated Costs Ready" />
        </PageHeaderLayout>,
      );

      // When the body publishes a new banner
      r.rerender(
        <PageHeaderLayout pageHeader={{ title: "Page title" }}>
          <BodyWithBanner title="Costs Applied" />
        </PageHeaderLayout>,
      );

      // Then the slot shows the new banner
      expect(r.pageHeaderLayout_banner_title).toHaveTextContent("Costs Applied");
    });

    it("shows the layout banner again when usePageBanner unmounts", async () => {
      // Given a layout banner replaced by a body's banner
      const r = await render(
        <PageHeaderLayout pageHeader={{ title: "Page title" }} banner={{ type: "info", title: "Static banner" }}>
          <BodyWithBanner title="Tab banner" />
        </PageHeaderLayout>,
      );
      expect(r.pageHeaderLayout_banner_title).toHaveTextContent("Tab banner");

      // When that body unmounts
      r.rerender(
        <PageHeaderLayout pageHeader={{ title: "Page title" }} banner={{ type: "info", title: "Static banner" }}>
          <span>Other tab</span>
        </PageHeaderLayout>,
      );

      // Then the layout banner is back
      expect(r.pageHeaderLayout_banner_title).toHaveTextContent("Static banner");
    });

    it("keeps the newer usePageBanner when the earlier caller unmounts", async () => {
      // Given two mounted callers; the later one replaces the earlier one
      function Caller({ title }: { title: string }) {
        usePageBanner({ type: "update", title });
        return null;
      }
      const r = await render(
        <PageHeaderLayout pageHeader={{ title: "Page title" }}>
          <Caller key="first" title="First banner" />
          <Caller key="second" title="Second banner" />
        </PageHeaderLayout>,
      );
      expect(r.pageHeaderLayout_banner_title).toHaveTextContent("Second banner");

      // When the earlier caller unmounts
      r.rerender(
        <PageHeaderLayout pageHeader={{ title: "Page title" }}>
          <Caller key="second" title="Second banner" />
        </PageHeaderLayout>,
      );

      // Then the newer banner stays
      expect(r.pageHeaderLayout_banner_title).toHaveTextContent("Second banner");
    });
  });

  it("shows AutoSaveIndicator in the page header while saving", async () => {
    // Given a PageHeaderLayout with an in-flight auto-save
    // When rendered
    const r = await render(
      <MockAutoSaveProvider status={AutoSaveStatus.SAVING}>
        <PageHeaderLayout pageHeader={{ title: "Page title" }} />
      </MockAutoSaveProvider>,
    );
    // Then AutoSaveIndicator is in the page header
    expect(r.autoSave).toHaveTextContent("Saving");
  });
});

function MockAutoSaveProvider({
  status = AutoSaveStatus.IDLE,
  children,
}: {
  status?: AutoSaveStatus;
  children: ReactNode;
}) {
  return (
    <AutoSaveStatusContext.Provider
      value={{ status, resetStatus: noop, errors: [], resolveAutoSave: noop, triggerAutoSave: noop }}
    >
      {children}
    </AutoSaveStatusContext.Provider>
  );
}

function BodyWithBanner({ title }: { title?: string }) {
  usePageBanner(title ? { type: "update", title } : undefined);
  return <span>Body content</span>;
}

function box(top: number, height: number): DOMRect {
  return {
    top,
    bottom: top + height,
    left: 0,
    right: 0,
    width: 0,
    height,
    x: 0,
    y: top,
    toJSON() {},
  } as DOMRect;
}

function mockElementHeight(height: number) {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    height,
    width: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON() {},
  } as DOMRect);
}
