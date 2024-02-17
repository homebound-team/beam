import { waitFor } from "@homebound/rtl-utils";
import { Button } from "src/components/Button";
import { click, clickAndWait, render } from "src/utils/rtl";
import { RightPaneLayout, RightPaneProvider, useRightPane } from "./index";

describe("useRightPane", () => {
  it("should show right pane when calling openRightPane hook", async () => {
    const r = await render(<TestRightPaneLayoutContent />);
    await clickAndWait(r.openPaneBtn);
    expect(r.rightPaneContent).toBeInTheDocument();
  });

  it("should close right pane when calling closeRightPane hook", async () => {
    const r = await render(<TestRightPaneLayoutContent />);
    await clickAndWait(r.openPaneBtn);
    expect(r.closePaneBtn).toBeTruthy();

    // click and wait for right pane content to be removed from DOM
    click(r.closePaneBtn);

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
    <RightPaneProvider>
      <RightPaneLayout>
        <TestPageContent />
      </RightPaneLayout>
    </RightPaneProvider>
  );
}
