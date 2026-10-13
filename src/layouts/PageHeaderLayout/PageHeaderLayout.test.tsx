import type { ReactNode } from "react";
import { AutoSaveStatus, AutoSaveStatusContext } from "src/components/AutoSaveStatus/AutoSaveStatusProvider";
import { selfTopSpaced } from "src/layouts/layoutSpacing";
import { beamPageBannerHeightVar, beamPageHeaderLayoutHeightVar } from "src/layouts/layoutVars";
import { usePageBanner } from "src/layouts/PageBanner/usePageBanner";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { THRESHOLD } from "src/layouts/useAutoHideOnScroll";
import { noop } from "src/utils/helpers";
import { render, scrollWindowWithAnchor } from "src/utils/rtl";
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

  it("keeps publishing the header height until the header actually hides", async () => {
    // Given a header measuring 72px, rendered at the top of the page
    const spy = mockElementHeight(72);
    try {
      const r = await render(<PageHeaderLayout pageHeader={{ title: "Page title" }} />);
      const spacer = r.pageHeaderLayout_pageHeader.parentElement!;
      expect(r.pageHeaderLayout.style.getPropertyValue(beamPageHeaderLayoutHeightVar)).toBe("72px");

      // When scrolling less than the auto-hide threshold, so the header is still parked at the viewport top
      scrollWindowWithAnchor(spacer, 20);

      // Then it still reports its height, so sticky chrome below it (page banner, table headers) stays clear
      expect(r.pageHeaderLayout.style.getPropertyValue(beamPageHeaderLayoutHeightVar)).toBe("72px");

      // And when scrolling past the threshold, so the header slides away
      scrollWindowWithAnchor(spacer, THRESHOLD + 200);

      // Then the height collapses and that chrome moves up
      expect(r.pageHeaderLayout.style.getPropertyValue(beamPageHeaderLayoutHeightVar)).toBe("");
    } finally {
      spy.mockRestore();
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
