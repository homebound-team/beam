import { waitFor } from "@homebound/rtl-utils";
import { Button } from "src/components/Button";
import { environmentBannerSizePx } from "src/components/EnvironmentBanner/EnvironmentBanner";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { EnvironmentBannerLayoutHeightProvider } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import {
  beamFloatingRightOffsetVar,
  beamRightPaneWidthVar,
  documentScrollRightPaneWidth,
} from "src/layouts/layoutVars";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render } from "src/utils/rtl";
import { vi } from "vitest";
import { DocumentScrollRightPaneLayout } from "./DocumentScrollRightPaneLayout";
import { useRightPaneActions } from "./useRightPane";

describe("DocumentScrollRightPaneLayout", () => {
  beforeEach(() => {
    document.documentElement.style.setProperty(beamFloatingRightOffsetVar, "0px");
  });

  afterEach(() => {
    document.documentElement.style.setProperty(beamFloatingRightOffsetVar, "0px");
  });

  it("publishes scoped pane width and a root floating right offset when open", async () => {
    // Given a document-scroll right pane layout on desktop
    const expectedWidth = documentScrollRightPaneWidth(320);
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollRightPaneLayout paneWidth={320}>
          <div>Main content</div>
        </DocumentScrollRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // Then overlay layout is ready while closed; spacer has zero width until open
    expect(r.rightPaneMain_overlay).toBeInTheDocument();
    expect(r.rightPaneSpacer).toBeInTheDocument();
    expect(r.rightPaneSpacer).toHaveStyle({ width: "0px" });
    expect(r.query.rightPaneContent).toBeNull();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe("0px");

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the fixed overlay pane renders; scoped width and root floating offset match it
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.rightPaneMain_overlay).toBeInTheDocument();
    expect(r.rightPaneSpacer).toHaveStyle({ width: expectedWidth });
    expect(r.rightPaneContent.style.marginLeft).toBe("");
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe(expectedWidth);
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(expectedWidth);

    // When the pane is closed
    click(r.closePaneBtn);

    // Then the pane clears; spacer width and width vars return to 0 after the exit animation
    await waitFor(() => {
      expect(r.query.rightPaneContent).toBeNull();
    });
    await waitFor(() => {
      expect(r.rightPaneSpacer).toHaveStyle({ width: "0px" });
    });
    expect(r.rightPaneMain_overlay).toBeInTheDocument();
    expect(r.rightPaneSpacer).toBeInTheDocument();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe("0px");
  });

  it("on sm opens a full-bleed overlay below the env banner without a spacer", async () => {
    // Given a mobile viewport and a published environment banner height
    setViewport("sm");
    const r = await render(
      <EnvironmentBannerLayoutHeightProvider value={environmentBannerSizePx}>
        <DocumentScrollLayoutProvider>
          <DocumentScrollRightPaneLayout paneWidth={320}>
            <div>Main content</div>
          </DocumentScrollRightPaneLayout>
          <OpenCloseButtons />
        </DocumentScrollLayoutProvider>
      </EnvironmentBannerLayoutHeightProvider>,
    );

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the overlay renders pinned below the banner; no split column / width vars
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.rightPaneContent).toHaveStyle({ top: `${environmentBannerSizePx}px` });
    expect(r.query.rightPaneMain_overlay).toBeNull();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe("0px");
  });

  it("closes the pane on unmount", async () => {
    // Given an open document-scroll right pane layout
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollRightPaneLayout>
          <div>Main content</div>
        </DocumentScrollRightPaneLayout>
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
        <DocumentScrollRightPaneLayout>
          <div>Main content</div>
        </DocumentScrollRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );
    expect(r.query.rightPaneContent).toBeNull();
  });

  it("push mode shrinks the main column instead of widening the flex container", async () => {
    // Given a push-mode document-scroll right pane
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollRightPaneLayout paneWidth={320} mode="push">
          <div>Main content</div>
        </DocumentScrollRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the main column is the push variant; floating offset is still published
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.query.rightPaneMain_overlay).toBeNull();
    expect(r.rightPaneMain_push).toBeInTheDocument();
    expect(r.rightPaneContent.style.marginLeft).toBe("");
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(
      documentScrollRightPaneWidth(320),
    );
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
  });

  it("auto mode with a clearing shell floats the pane over the gutter", async () => {
    // Given auto mode and a shell small enough to clear the pane on typical test chrome
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollRightPaneLayout paneWidth={320} mode="auto" shellMaxPx={280}>
          <div>Main content</div>
        </DocumentScrollRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the main column keeps its width and the pane is pulled back out of the flex container
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.query.rightPaneMain_overlay).toBeNull();
    expect(r.query.rightPaneMain_push).toBeNull();
    expect(r.rightPaneContent).toHaveStyle({
      marginLeft: `calc(-1 * ${documentScrollRightPaneWidth(320)})`,
    });
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(
      documentScrollRightPaneWidth(320),
    );
  });

  it("push mode stays split on md+ when chrome is tight (narrow push)", async () => {
    // Given md+ viewport and chrome − pane < 460 (1024 − 600 on typical jsdom)
    setViewport("md");
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollRightPaneLayout paneWidth={600} mode="push">
          <div>Main content</div>
        </DocumentScrollRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the pane stays in-flow beside a narrowed main column — never portaled full-screen
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.rightPaneMain_push).toBeInTheDocument();
    expect(r.query.rightPaneMain_overlay).toBeNull();
    expect(r.rightPaneContent.style.top).toBe("");
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(
      documentScrollRightPaneWidth(600),
    );
  });

  it("ignores a nested host so only the outer pane mounts", async () => {
    // Given withRightPane composed twice (inner should pass through)
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollRightPaneLayout paneWidth={320}>
          <DocumentScrollRightPaneLayout paneWidth={200} mode="push">
            <div>Main content</div>
          </DocumentScrollRightPaneLayout>
        </DocumentScrollRightPaneLayout>
        <OpenCloseButtons />
      </DocumentScrollLayoutProvider>,
    );

    // Then we warn once; only the outer host is in the tree
    expect(warn).toHaveBeenCalledTimes(1);
    expect(r.documentScrollRightPaneLayout).toBeInTheDocument();
    expect(r.queryAllByTestId("documentScrollRightPaneLayout")).toHaveLength(1);
    warn.mockRestore();

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then a single overlay pane uses the outer width, not the inner push host
    expect(r.queryAllByTestId("rightPaneContent")).toHaveLength(1);
    expect(r.rightPaneMain_overlay).toBeInTheDocument();
    expect(r.query.rightPaneMain_push).toBeNull();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe(
      documentScrollRightPaneWidth(320),
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
