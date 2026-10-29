import { act } from "@testing-library/react";
import { Button } from "src/components/Button";
import { environmentBannerSizePx } from "src/components/EnvironmentBanner/EnvironmentBanner";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { EnvironmentBannerLayoutHeightProvider } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import {
  beamFloatingRightOffsetVar,
  beamLayoutViewportWidthVar,
  beamPageHeaderLayoutHeightVar,
  beamRightPaneContentMinVar,
  beamRightPaneWidthVar,
  beamSideNavLayoutWidthVar,
  documentScrollRightPaneWidthCss,
} from "src/layouts/layoutVars";
import { setViewport } from "src/tests/viewport";
import { clickAndWait, render } from "src/utils/rtl";
import { vi } from "vitest";
import { DocumentScrollOverlayRightPaneLayout } from "./DocumentScrollOverlayRightPaneLayout";
import { useRightPaneActions } from "./useRightPane";
import { defaultDocumentScrollRightPaneWidth, minDocumentScrollContentWidthPx } from "./withRightPane";

describe("DocumentScrollOverlayRightPaneLayout", () => {
  afterEach(() => {
    // Host sets this on documentElement while open; reset so other tests/files do not inherit it.
    document.documentElement.style.setProperty(beamFloatingRightOffsetVar, "0px");
  });

  it("publishes scoped pane width and a root floating right offset when open", async () => {
    // Given a document-scroll right pane layout on desktop
    const expectedWidth = documentScrollRightPaneWidthCss(defaultDocumentScrollRightPaneWidth);
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout>
          <div>Main content</div>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // Then overlay layout is ready while closed; spacer is 0 and the content floor is unset
    expect(r.documentScrollRightPaneLayout).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout_spacer).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout_spacer).toHaveStyle({
      width: "0px",
      transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    });
    expect(r.documentScrollRightPaneLayout_main).toHaveStyle({ minWidth: "fit-content" });
    expect(r.query.rightPaneContent).toBeNull();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneContentMinVar)).toBe("0px");

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the fixed overlay pane renders, its top border continuing the table's; spacer matches the pane; content
    // floor is published (main stays fit-content)
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout_spacer).toHaveStyle({ width: expectedWidth });
    expect(r.documentScrollRightPaneLayout_main).toHaveStyle({ minWidth: "fit-content" });
    expect(r.rightPaneContent).toHaveStyle({ position: "fixed", borderTopStyle: "solid", borderTopWidth: "1px" });
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe(expectedWidth);
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneContentMinVar)).toBe(
      `${minDocumentScrollContentWidthPx}px`,
    );
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(expectedWidth);

    // When the pane is closed (`clickAndWait` covers the exit animation / jsdom poll)
    await clickAndWait(r.closePaneBtn);

    // Then the pane clears; spacer and width vars return to 0; main min-width is fit-content again
    expect(r.query.rightPaneContent).toBeNull();
    expect(r.documentScrollRightPaneLayout_spacer).toHaveStyle({ width: "0px" });
    expect(r.documentScrollRightPaneLayout_main).toHaveStyle({ minWidth: "fit-content" });
    // Desktop overlay keeps the spacer node mounted; only its width resets while closed.
    expect(r.documentScrollRightPaneLayout_spacer).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneContentMinVar)).toBe("0px");
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe("0px");
  });

  it("eases the pane offset while pinned so it moves with the chrome above it", async () => {
    // Given a document-scroll right pane layout whose anchor is already under the sticky chrome
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout>
          <div>Main content</div>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then top eases, so hiding or revealing the page header does not jump the pane
    expect(r.rightPaneContent).toHaveStyle({ transition: "top 200ms cubic-bezier(0.4, 0, 0.2, 1)" });
  });

  it("re-pins when the chrome above writes its height after the scroll that hid it", async () => {
    // Given a pane pinned under a 72px page header. jsdom doesn't inherit custom properties, so the var goes on the
    // layout root the pane reads it from, rather than on `PageHeaderLayout` above it
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout>
          <div>Main content</div>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );
    r.documentScrollRightPaneLayout.style.setProperty(beamPageHeaderLayoutHeightVar, "72px");
    await clickAndWait(r.openPaneBtn);
    expect(r.rightPaneContent).toHaveStyle({ top: "72px" });

    // When the header hides, which clears its height var on the render after that scroll, so no scroll event follows
    await act(async () => r.documentScrollRightPaneLayout.style.removeProperty(beamPageHeaderLayoutHeightVar));

    // Then the pane moves up with it, rather than leaving a gap until the next scroll
    expect(r.rightPaneContent).toHaveStyle({ top: "0px" });
  });

  it("does not ease the pane offset while it still follows the anchor", async () => {
    // Given an anchor that has not yet scrolled up under the sticky chrome
    const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 200,
      bottom: 400,
      height: 200,
      width: 800,
      left: 0,
      right: 800,
      x: 0,
      y: 200,
    } as DOMRect);

    try {
      const r = await render(
        <DocumentScrollLayoutProvider>
          <DocumentScrollOverlayRightPaneLayout>
            <div>Main content</div>
          </DocumentScrollOverlayRightPaneLayout>
          <OpenCloseButtons />
        </DocumentScrollLayoutProvider>,
      );

      // When the pane is opened
      await clickAndWait(r.openPaneBtn);

      // Then it sits at the anchor with no transition, so it cannot lag behind the scroll
      expect(r.rightPaneContent).toHaveStyle({ top: "200px" });
      expect(r.rightPaneContent).not.toHaveStyle({ transition: "top 200ms cubic-bezier(0.4, 0, 0.2, 1)" });
    } finally {
      rectSpy.mockRestore();
    }
  });

  it("on sm opens a full-bleed overlay below the env banner without a spacer", async () => {
    // Given a mobile viewport and a published environment banner height
    setViewport("sm");
    const r = await render(
      <EnvironmentBannerLayoutHeightProvider value={environmentBannerSizePx}>
        <DocumentScrollLayoutProvider>
          <DocumentScrollOverlayRightPaneLayout>
            <div>Main content</div>
          </DocumentScrollOverlayRightPaneLayout>
          <OpenCloseButtons />
        </DocumentScrollLayoutProvider>
      </EnvironmentBannerLayoutHeightProvider>,
    );

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the overlay renders pinned below the banner; no split column / width vars
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.rightPaneContent).toHaveStyle({ top: `${environmentBannerSizePx}px` });
    expect(r.query.documentScrollRightPaneLayout_spacer).toBeNull();
    expect(r.query.documentScrollRightPaneLayout_main).toBeNull();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneContentMinVar)).toBe("0px");
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe("0px");
  });

  it("closes the pane on unmount", async () => {
    // Given an open document-scroll right pane layout
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout>
          <div>Main content</div>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );
    await clickAndWait(r.openPaneBtn);
    expect(r.rightPaneContent).toBeInTheDocument();

    // When the layout unmounts
    r.rerender(
      <DocumentScrollLayoutProvider>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // Then remounting a closed layout does not show stale pane content
    r.rerender(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout>
          <div>Main content</div>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );
    expect(r.query.rightPaneContent).toBeNull();
  });

  it("ignores a nested host so only the outer pane mounts", async () => {
    // Given withRightPane composed twice (inner should pass through)
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout>
          <DocumentScrollOverlayRightPaneLayout>
            <div>Main content</div>
          </DocumentScrollOverlayRightPaneLayout>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // Then we warn once; only the outer host is in the tree
    expect(warn).toHaveBeenCalledTimes(1);
    expect(r.documentScrollRightPaneLayout).toBeInTheDocument();
    expect(r.queryAllByTestId("documentScrollRightPaneLayout")).toHaveLength(1);
    warn.mockRestore();
  });

  it("still inserts a pane-width spacer when the remaining viewport is under 480px", async () => {
    // Given a tight chrome (viewport − side nav leaves less than the content floor beside the pane)
    const expectedWidth = documentScrollRightPaneWidthCss(defaultDocumentScrollRightPaneWidth);
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout>
          <div>Main content</div>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );
    r.documentScrollRightPaneLayout.style.setProperty(beamLayoutViewportWidthVar, "768px");
    r.documentScrollRightPaneLayout.style.setProperty(beamSideNavLayoutWidthVar, "260px");

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the spacer is still the pane width so content under it stays reachable
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout_spacer).toHaveStyle({ width: expectedWidth });
    expect(r.documentScrollRightPaneLayout_main).toHaveStyle({ minWidth: "fit-content" });
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe(expectedWidth);
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneContentMinVar)).toBe(
      `${minDocumentScrollContentWidthPx}px`,
    );
  });
});

function OpenCloseButtons() {
  const { openRightPane, closeRightPane } = useRightPaneActions();
  return (
    <Button
      data-testid="openPaneBtn"
      label="Open"
      onClick={() =>
        openRightPane({ content: <Button data-testid="closePaneBtn" label="Close" onClick={closeRightPane} /> })
      }
    />
  );
}
