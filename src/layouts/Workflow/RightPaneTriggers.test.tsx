import { waitFor } from "@homebound/rtl-utils";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render, withRouter } from "src/utils/rtl";
import { FocusedFormLayout } from "./FocusedFormLayout";
import type { RightPaneTrigger } from "./RightPaneTriggers";
import { StepperLayout } from "./StepperLayout";

describe("RightPaneTriggers", () => {
  it("floats the triggers on desktop and keeps Cancel in the header", async () => {
    // Given a focused form with right pane triggers on desktop
    const r = await render(<TriggeredFocusedForm />, withRouter());

    // Then the triggers are fixed to the page, not in the header, and Cancel stays in the header
    expect(r.rightPaneTriggers).toHaveStyle({ position: "fixed" });
    expect(r.focusedFormLayout_header.contains(r.rightPaneTriggers)).toBe(false);
    expect(r.focusedFormLayout_header).toHaveTextContent("Cancel");
    expect(r.query.rightPaneContent).toBeNull();
    expect(r.rightPaneTriggers_comment).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("puts the triggers in the header right slot on mobile", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(<TriggeredFocusedForm />, withRouter());

    // Then the triggers are in the header and Create stays in the footer
    expect(r.focusedFormLayout_header.contains(r.rightPaneTriggers)).toBe(true);
    expect(r.focusedFormLayout_footer).toContainElement(r.create);
    expect(r.rightPaneTriggers).not.toHaveStyle({ position: "fixed" });
    expect(r.rightPaneTriggers_comment).toHaveStyle({ width: "32px", height: "32px" });

    // When Comments is opened
    await clickAndWait(r.rightPaneTriggers_comment);

    // Then the pane covers the header triggers; they do not slide off-screen
    expect(r.rightPanePanel_body).toHaveTextContent("Comments body");
    expect(r.rightPaneTriggers).not.toHaveStyle({ transform: "translateX(calc(100% + 24px))" });
  });

  it("opens the pane from a trigger and slides the triggers off-screen until close", async () => {
    // Given a focused form with right pane triggers
    const r = await render(<TriggeredFocusedForm />, withRouter());

    // When Comments is opened
    await clickAndWait(r.rightPaneTriggers_comment);

    // Then the pane shows Comments and the page triggers slide off to the right
    expect(r.rightPanePanel_header).toHaveTextContent("Comments");
    expect(r.rightPanePanel_body).toHaveTextContent("Comments body");
    expect(r.rightPanePanel_header.contains(r.rightPanePanel_close)).toBe(true);
    expect(r.rightPaneTriggers).toHaveAttribute("aria-hidden", "true");
    expect(r.rightPaneTriggers).toHaveAttribute("inert");
    expect(r.rightPaneTriggers).toHaveStyle({ transform: "translateX(calc(100% + 24px))" });

    // When closing via the header X
    click(r.rightPanePanel_close);

    // Then the pane clears and the page-level triggers slide back in
    await waitFor(() => {
      expect(r.query.rightPaneContent).toBeNull();
    });
    expect(r.rightPaneTriggers).toHaveAttribute("aria-hidden", "false");
    expect(r.rightPaneTriggers).not.toHaveAttribute("inert");
    expect(r.rightPaneTriggers).toHaveStyle({ transform: "translateX(0)" });
    expect(r.focusedFormLayout_header.contains(r.rightPaneTriggers)).toBe(false);
  });

  it("keeps the open pane when changing stepper steps", async () => {
    // Given a stepper with right pane triggers
    const r = await render(
      <StepperLayout
        title="Test Workflow"
        onCancel={() => {}}
        completeLabel="Save"
        onComplete={() => {}}
        rightPaneTriggers={createTriggers()}
        steps={[
          { label: "Step One", content: <div data-testid="body">Body content</div> },
          { label: "Step Two", content: <div data-testid="stepTwoBody">Step two content</div> },
        ]}
      />,
      withRouter(),
    );

    // When Comments is opened and the second step is selected
    await clickAndWait(r.rightPaneTriggers_comment);
    click(r.header_stepperTabs_tab_stepTwo);

    // Then the step changes and the pane stays open
    expect(r.stepTwoBody).toBeInTheDocument();
    expect(r.rightPanePanel_body).toHaveTextContent("Comments body");
  });
});

function TriggeredFocusedForm() {
  return (
    <FocusedFormLayout
      title="Create Design Package"
      onCancel={() => {}}
      completeLabel="Create"
      onComplete={() => {}}
      rightPaneTriggers={createTriggers()}
    >
      <FormSectionLayout title="Link Design Package" sections={[{ title: "Setup", fields: <div /> }]} />
    </FocusedFormLayout>
  );
}

function createTriggers(): RightPaneTrigger[] {
  return [
    { icon: "comment", label: "Comments", content: <div>Comments body</div> },
    { icon: "history", label: "History", content: <div>History body</div> },
  ];
}
