import { Button } from "src/components/Button";
import { environmentBannerSizePx } from "src/components/EnvironmentBanner/EnvironmentBanner";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { EnvironmentBannerLayoutHeightProvider } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import {
  beamFloatingRightOffsetVar,
  beamRightPaneWidthVar,
  documentScrollRightPaneWidthCss,
} from "src/layouts/layoutVars";
import { setViewport } from "src/tests/viewport";
import { clickAndWait, render } from "src/utils/rtl";
import { vi } from "vitest";
import { DocumentScrollOverlayRightPaneLayout } from "./DocumentScrollOverlayRightPaneLayout";
import { useRightPaneActions } from "./useRightPane";

describe("DocumentScrollOverlayRightPaneLayout", () => {
  afterEach(() => {
    // Host sets this on documentElement while open; reset so other tests/files do not inherit it.
    document.documentElement.style.setProperty(beamFloatingRightOffsetVar, "0px");
  });

  it("publishes scoped pane width and a root floating right offset when open", async () => {
    // Given a document-scroll right pane layout on desktop
    const expectedWidth = documentScrollRightPaneWidthCss(320);
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollOverlayRightPaneLayout paneWidth={320}>
          <div>Main content</div>
        </DocumentScrollOverlayRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // Then overlay layout is ready while closed; spacer has zero width until open
    expect(r.documentScrollRightPaneLayout).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout_spacer).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout_spacer).toHaveStyle({ width: "0px" });
    expect(r.query.rightPaneContent).toBeNull();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the fixed overlay pane renders; scoped width and root floating offset match it
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout_spacer).toHaveStyle({ width: expectedWidth });
    // Fixed overlay — not inline clear mode, which applies a negative marginLeft.
    expect(r.rightPaneContent.style.marginLeft).toBe("");
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe(expectedWidth);
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(expectedWidth);

    // When the pane is closed (`clickAndWait` covers the exit animation / jsdom poll)
    await clickAndWait(r.closePaneBtn);

    // Then the pane clears; spacer width and width vars return to 0
    expect(r.query.rightPaneContent).toBeNull();
    expect(r.documentScrollRightPaneLayout_spacer).toHaveStyle({ width: "0px" });
    // Desktop overlay keeps the spacer node mounted; only its width resets while closed.
    expect(r.documentScrollRightPaneLayout_spacer).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe("0px");
  });

  it("on sm opens a full-bleed overlay below the env banner without a spacer", async () => {
    // Given a mobile viewport and a published environment banner height
    setViewport("sm");
    const r = await render(
      <EnvironmentBannerLayoutHeightProvider value={environmentBannerSizePx}>
        <DocumentScrollLayoutProvider>
          <DocumentScrollOverlayRightPaneLayout paneWidth={320}>
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
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
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
        <DocumentScrollOverlayRightPaneLayout paneWidth={320}>
          <DocumentScrollOverlayRightPaneLayout paneWidth={200}>
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
