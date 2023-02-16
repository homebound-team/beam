import { clickAndWait } from "@homebound/rtl-utils";
import { waitFor } from "@storybook/testing-library";
import { click, render } from "../../../utils/rtl";
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
    click(r.closePaneBtn());

    await waitFor(() => {
      const rightPaneContent = r.queryByTestId("rightPaneContent");
      expect(rightPaneContent).toNotBeInTheDom();
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
