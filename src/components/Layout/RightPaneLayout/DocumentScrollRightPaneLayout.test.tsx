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
import { DocumentScrollRightPaneLayout } from "./DocumentScrollRightPaneLayout";
import { useRightPane } from "./useRightPane";

describe("DocumentScrollRightPaneLayout", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty(beamFloatingRightOffsetVar);
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

    // Then there is no spacer while closed; width vars are 0
    expect(r.query.rightPaneSpacer).toBeNull();
    expect(r.query.rightPaneContent).toBeNull();
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe("0px");
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe("0px");

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the pane/spacer render; scoped width and root floating offset match the effective pane width
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.rightPaneSpacer).toBeInTheDocument();
    expect(r.rightPaneSpacer).toHaveStyle({ width: expectedWidth });
    expect(r.documentScrollRightPaneLayout.style.getPropertyValue(beamRightPaneWidthVar)).toBe(expectedWidth);
    expect(document.documentElement.style.getPropertyValue(beamFloatingRightOffsetVar)).toBe(expectedWidth);

    // When the pane is closed
    click(r.closePaneBtn);

    // Then the spacer and pane clear; width vars return to 0
    await waitFor(() => {
      expect(r.query.rightPaneContent).toBeNull();
    });
    expect(r.query.rightPaneSpacer).toBeNull();
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

    // Then the overlay renders pinned below the banner; no split spacer / width vars
    expect(r.rightPaneContent).toBeInTheDocument();
    expect(r.rightPaneContent).toHaveStyle({ top: `${environmentBannerSizePx}px` });
    expect(r.query.rightPaneSpacer).toBeNull();
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
});

function OpenCloseButtons() {
  const { openRightPane, closeRightPane } = useRightPane();
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
