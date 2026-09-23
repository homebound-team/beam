import type { ReactNode } from "react";
import { AutoSaveStatus, AutoSaveStatusContext } from "src/components/AutoSaveStatus/AutoSaveStatusProvider";
import { selfTopSpaced } from "src/layouts/layoutSpacing";
import { beamPageBannerHeightVar, beamPageHeaderLayoutHeightVar } from "src/layouts/layoutVars";
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
            type: "warning",
            message: "Calculating Updated Costs — Costs shown may be out of date.",
          }}
        />,
      );

      // Then the banner is in-flow sticky chrome and the layout publishes its height
      expect(r.pageHeaderLayout_banner_message).toHaveTextContent("Calculating Updated Costs");
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
