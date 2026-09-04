import { waitFor } from "@homebound/rtl-utils";
import { Button } from "src/components/Button";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render } from "src/utils/rtl";
import { DocumentScrollRightPaneLayout } from "./DocumentScrollRightPaneLayout";
import { RightPanePanel } from "./RightPanePanel";
import { useRightPaneActions } from "./useRightPane";

describe("RightPanePanel", () => {
  it("renders title, body, and a close control that closes the pane", async () => {
    // Given an open desktop right pane with RightPanePanel chrome
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollRightPaneLayout>
          <div>Main</div>
        </DocumentScrollRightPaneLayout>
        <OpenPanelButton />
      </DocumentScrollLayoutProvider>,
    );
    await clickAndWait(r.openPaneBtn);

    // Then title and body render; close is present
    expect(r.rightPanePanel_header).toHaveTextContent("Comments");
    expect(r.rightPanePanel_body).toHaveTextContent("Hello");
    expect(r.rightPanePanel_close).toBeInTheDocument();

    // When closing via the built-in control
    click(r.rightPanePanel_close);

    // Then the pane content clears after exit animation
    await waitFor(() => {
      expect(r.query.rightPaneContent).toBeNull();
    });
  });

  it("puts the close control in the header on sm", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(
      <DocumentScrollLayoutProvider>
        <DocumentScrollRightPaneLayout>
          <div>Main</div>
        </DocumentScrollRightPaneLayout>
        <OpenPanelButton />
      </DocumentScrollLayoutProvider>,
    );

    // When the pane opens
    await clickAndWait(r.openPaneBtn);

    // Then close is in the header (not an edge control outside it)
    expect(r.rightPanePanel_close).toBeInTheDocument();
    expect(r.rightPanePanel_header.contains(r.rightPanePanel_close)).toBe(true);
  });
});

function OpenPanelButton() {
  const { openRightPane } = useRightPaneActions();
  return (
    <Button
      data-testid="openPaneBtn"
      label="Open"
      onClick={() =>
        openRightPane({
          content: (
            <RightPanePanel title="Comments">
              <p>Hello</p>
            </RightPanePanel>
          ),
        })
      }
    />
  );
}
