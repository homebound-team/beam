import { waitFor } from "@homebound/rtl-utils";
import { Button } from "src/components/Button";
import { RightPaneLayout } from "src/components/Layout/RightPaneLayout/RightPaneLayout";
import { useRightPane } from "src/components/Layout/RightPaneLayout/useRightPane";
import { click, clickAndWait, render } from "src/utils/rtl";

describe("useRightPane", () => {
  it("should show right pane when calling openRightPane hook", async () => {
    // Given a page that can open the right pane
    const r = await render(<TestRightPaneLayoutContent />);

    // When the pane is opened
    await clickAndWait(r.openPaneBtn);

    // Then the pane content is visible
    expect(r.rightPaneContent).toBeInTheDocument();
  });

  it("should close right pane when calling closeRightPane hook", async () => {
    // Given an open right pane
    const r = await render(<TestRightPaneLayoutContent />);
    await clickAndWait(r.openPaneBtn);
    expect(r.closePaneBtn).toBeTruthy();

    // When the pane is closed
    click(r.closePaneBtn);

    // Then the pane content is removed from the DOM
    await waitFor(() => {
      expect(r.query.rightPaneContent).not.toBeInTheDocument();
    });
  });
});

function TestPageContent() {
  const { openRightPane } = useRightPane();
  return (
    <Button
      data-testid="openPaneBtn"
      label={"Open Pane"}
      onClick={() => openRightPane({ content: <TestDetailPane /> })}
    />
  );
}

function TestDetailPane() {
  const { closeRightPane } = useRightPane();
  return <Button data-testid="closePaneBtn" label={"Close Pane"} onClick={() => closeRightPane()} />;
}

function TestRightPaneLayoutContent() {
  return (
    <RightPaneLayout>
      <TestPageContent />
    </RightPaneLayout>
  );
}
