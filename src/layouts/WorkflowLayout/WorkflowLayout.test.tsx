import { act } from "@testing-library/react";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render, scrollWindow, withRouter } from "src/utils/rtl";
import { WorkflowLayout, WorkflowLayoutProps, WorkflowLayoutStep } from "./WorkflowLayout";

describe("WorkflowLayout", () => {
  it("renders the header and the active step's content", async () => {
    // Given a WorkflowLayout on its first step
    const r = await render(<WorkflowLayout {...baseProps()} />, withRouter());

    // Then the header and the first step's content both render
    expect(r.workflowLayout_header).toHaveTextContent("Test Workflow");
    expect(r.workflowLayout_body).toBeInTheDocument();
  });

  it("starts on defaultStep instead of the first step", async () => {
    // Given a WorkflowLayout whose defaultStep is its second step
    const r = await render(<WorkflowLayout {...baseProps({ defaultStep: "stepTwo" })} />, withRouter());

    // Then only the second step's content renders
    expect(r.query.body).not.toBeInTheDocument();
    expect(r.stepTwoBody).toBeInTheDocument();
  });

  it("renders the CTAs in the header on desktop", async () => {
    // Given a desktop viewport (the test default)
    const r = await render(<WorkflowLayout {...baseProps()} />, withRouter());

    // Then the CTAs render inside the header, and no footer is rendered
    expect(r.workflowLayout_header).toHaveTextContent("Continue");
    expect(r.query.workflowLayout_footer).not.toBeInTheDocument();
  });

  it("moves the CTAs to a mobile footer at the sm breakpoint", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(<WorkflowLayout {...baseProps()} />, withRouter());

    // Then the CTAs render in the footer instead of the header
    expect(r.workflowLayout_footer).toHaveTextContent("Continue");
    expect(r.workflowLayout_header).not.toHaveTextContent("Continue");
  });

  it("calls onCancel when Cancel is clicked", async () => {
    // Given a WorkflowLayout with a spy onCancel
    const onCancel = vi.fn();
    const r = await render(<WorkflowLayout {...baseProps({ onCancel })} />, withRouter());

    // When Cancel is clicked
    click(r.cancel);

    // Then it's called
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel immediately when Cancel is clicked and the form is clean", async () => {
    // Given a WorkflowLayout that reports not dirty
    const onCancel = vi.fn();
    const r = await render(<WorkflowLayout {...baseProps({ onCancel, isDirty: () => false })} />, withRouter());

    // When Cancel is clicked
    click(r.cancel);

    // Then onCancel is called without a confirm modal
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(r.query.discardChanges).toBeNull();
  });

  it("confirms before calling onCancel when Cancel is clicked and the form is dirty", async () => {
    // Given a WorkflowLayout that reports dirty
    const onCancel = vi.fn();
    const r = await render(<WorkflowLayout {...baseProps({ onCancel, isDirty: () => true })} />, withRouter());

    // When Cancel is clicked
    click(r.cancel);

    // Then a confirm modal appears and onCancel is not called yet
    expect(r.discardChanges).toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();

    // When Discard Changes is clicked
    click(r.discardChanges);

    // Then onCancel is called
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not call onCancel when Continue Editing is chosen on Cancel confirm", async () => {
    // Given a dirty WorkflowLayout whose Cancel confirm is open
    const onCancel = vi.fn();
    const r = await render(<WorkflowLayout {...baseProps({ onCancel, isDirty: () => true })} />, withRouter());
    click(r.cancel);

    // When Continue Editing is clicked
    click(r.continueEditing);

    // Then onCancel is not called
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("blocks in-app navigation when dirty and proceeds after Discard Changes", async () => {
    // Given a dirty WorkflowLayout
    const router = withRouter("/");
    const r = await render(<WorkflowLayout {...baseProps({ isDirty: () => true })} />, router);

    // When navigating away
    await act(async () => {
      await router.navigate("/other");
    });

    // Then navigation is blocked and a confirm modal appears
    expect(router.location.pathname).toBe("/");
    expect(r.discardChanges).toBeInTheDocument();

    // When Discard Changes is clicked
    await clickAndWait(r.discardChanges);

    // Then navigation proceeds
    expect(router.location.pathname).toBe("/other");
  });

  it("stays on the page when Continue Editing is chosen after a blocked navigation", async () => {
    // Given a dirty WorkflowLayout with a blocked navigation
    const router = withRouter("/");
    const r = await render(<WorkflowLayout {...baseProps({ isDirty: () => true })} />, router);
    await act(async () => {
      await router.navigate("/other");
    });

    // When Continue Editing is clicked
    await clickAndWait(r.continueEditing);

    // Then we remain on the current route
    expect(router.location.pathname).toBe("/");
  });

  it("calls onComplete when Save is clicked on the last step", async () => {
    // Given a WorkflowLayout on its last step with a spy onComplete
    const onComplete = vi.fn();
    const r = await render(<WorkflowLayout {...baseProps({ onComplete, defaultStep: "stepTwo" })} />, withRouter());

    // When Save is clicked
    click(r.save);

    // Then it's called
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("disables Continue when the active step is invalid, and enables it once valid", async () => {
    // Given a WorkflowLayout whose first (active) step is invalid
    const r = await render(
      <WorkflowLayout {...baseProps({ steps: makeSteps({ oneIsValid: false }) })} />,
      withRouter(),
    );

    // Then Continue is disabled
    expect(r.continue).toBeDisabled();

    // When the same step becomes valid
    r.rerender(<WorkflowLayout {...baseProps({ steps: makeSteps({ oneIsValid: true }) })} />);

    // Then Continue is enabled
    expect(r.continue).not.toBeDisabled();
  });

  it("disables Save when the active (last) step is invalid, and enables it once valid", async () => {
    // Given a WorkflowLayout on its last step, which is invalid
    const r = await render(
      <WorkflowLayout {...baseProps({ steps: makeSteps({ twoIsValid: false }), defaultStep: "stepTwo" })} />,
      withRouter(),
    );

    // Then Save is disabled
    expect(r.save).toBeDisabled();

    // When the same step becomes valid
    r.rerender(<WorkflowLayout {...baseProps({ steps: makeSteps({ twoIsValid: true }), defaultStep: "stepTwo" })} />);

    // Then Save is enabled
    expect(r.save).not.toBeDisabled();
  });

  it("navigates between steps by clicking their tab on desktop", async () => {
    // Given a WorkflowLayout on its first step, on a desktop viewport (the test default)
    const r = await render(<WorkflowLayout {...baseProps()} />, withRouter());

    // Then clicking the second step's tab navigates to it
    click(r.header_stepperTabs_tab_stepTwo);
    expect(r.stepTwoBody).toBeInTheDocument();
    click(r.header_stepperTabs_tab_stepOne);
    expect(r.body).toBeInTheDocument();
  });

  it("collapses the tabs to a non-interactive indicator bar on mobile", async () => {
    // Given a WorkflowLayout on a mobile viewport
    setViewport("sm");
    const r = await render(<WorkflowLayout {...baseProps()} />, withRouter());

    // Then the tab collapses to its 0px indicator bar
    expect(r.header_stepperTabs_tab_stepTwo).toHaveStyle({ height: "0px" });
  });

  it("collapses the tabs on scroll past the resting position on desktop", async () => {
    // Given a WorkflowLayout on its first step, on a desktop viewport
    const r = await render(<WorkflowLayout {...baseProps()} />, withRouter());

    // When the page scrolls down past the header's resting position
    scrollWindow(0, { clientHeight: 800, scrollHeight: 1_000_800 });
    scrollWindow(300, { clientHeight: 800, scrollHeight: 1_000_800 });

    // Then the tab collapses to its 0px indicator bar
    // (the scroll-position state machine itself is covered by useScrollCollapse's own tests)
    expect(r.header_stepperTabs_tab_stepTwo).toHaveStyle({ height: "0px" });
  });

  it("advances on Continue when the step has no onContinue", async () => {
    // Given a WorkflowLayout whose steps don't intercept Continue
    const r = await render(<WorkflowLayout {...baseProps()} />, withRouter());
    // When Continue is clicked
    await clickAndWait(r.continue);
    // Then we advance to the next step
    expect(r.stepTwoBody).toBeInTheDocument();
  });

  it("awaits the active step's onContinue before advancing", async () => {
    // Given a first step whose onContinue resolves after a tick
    let resolveContinue: () => void = () => {};
    const onContinue = vi.fn(() => new Promise<void>((resolve) => (resolveContinue = () => resolve())));
    const steps = makeSteps();
    const r = await render(
      <WorkflowLayout {...baseProps({ steps: [{ ...steps[0], onContinue }, steps[1]] })} />,
      withRouter(),
    );
    // When Continue is clicked
    click(r.continue);
    // Then that step's onContinue is called, and we've not advanced yet
    expect(onContinue).toHaveBeenCalled();
    expect(r.body).toBeInTheDocument();
    // And once it resolves, we advance
    await act(async () => {
      resolveContinue();
    });
    expect(r.stepTwoBody).toBeInTheDocument();
  });

  it("stays on the active step when its onContinue returns false", async () => {
    // Given a first step whose onContinue vetoes synchronously
    const steps = makeSteps();
    const r = await render(
      <WorkflowLayout {...baseProps({ steps: [{ ...steps[0], onContinue: () => false }, steps[1]] })} />,
      withRouter(),
    );
    // When Continue is clicked
    await clickAndWait(r.continue);
    // Then we stay on the first step
    expect(r.body).toBeInTheDocument();
    expect(r.query.stepTwoBody).not.toBeInTheDocument();
  });
});

function makeSteps(overrides: { oneIsValid?: boolean; twoIsValid?: boolean } = {}): WorkflowLayoutStep[] {
  const { oneIsValid = true, twoIsValid = true } = overrides;
  return [
    { label: "Step One", isValid: oneIsValid, content: <div data-testid="body">Body content</div> },
    {
      label: "Step Two",
      isValid: twoIsValid,
      content: <div data-testid="stepTwoBody">Step two content</div>,
    },
  ];
}

function baseProps(overrides: Partial<WorkflowLayoutProps> = {}): WorkflowLayoutProps {
  const { steps = makeSteps(), ...rest } = overrides;
  return {
    title: "Test Workflow",
    onCancel: () => {},
    completeLabel: "Save",
    onComplete: () => {},
    steps,
    ...rest,
  };
}
