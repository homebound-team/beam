import { clickAndWait } from "@homebound/rtl-utils";
import { waitFor } from "@testing-library/react";
import { render } from "../../../utils/rtl";
import { Button } from "../../Button";
import { RightPaneLayout, RightPaneProvider, useRightPane } from "./index";

describe("useRightPane", () => {
  it("should show right pane when calling openRightPane hook", async () => {
    const r = await render(<TestRightPaneLayoutContent />);
    await clickAndWait(r.openPaneBtn);
    expect(r.rightPaneContent()).toBeTruthy();
  });

  it("should close right pane when calling closeRightPane hook", async () => {
    const r = await render(<TestRightPaneLayoutContent />);
    await clickAndWait(r.openPaneBtn());
    expect(r.closePaneBtn()).toBeTruthy();

    // click and wait for right pane content to be removed from DOM
    await clickAndWait(r.closePaneBtn());
    await waitFor(() => expect(r.queryByTestId("rightPaneContent")).toBeNull());
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
