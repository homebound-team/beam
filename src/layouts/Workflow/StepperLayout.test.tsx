import { act } from "@testing-library/react";
import { setViewport } from "src/tests/viewport";
import { click, clickAndWait, render, withRouter } from "src/utils/rtl";
import { StepperLayout, StepperLayoutProps, StepperLayoutStep } from "./StepperLayout";

describe("StepperLayout", () => {
  it("renders the header and the active step's content", async () => {
    // Given a StepperLayout on its first step
    const r = await render(<StepperLayout {...baseProps()} />, withRouter());

    // Then the header and the first step's content both render
    expect(r.stepperLayout_header).toHaveTextContent("Test Workflow");
    expect(r.stepperLayout_body).toBeInTheDocument();
  });

  it("starts on defaultStep instead of the first step", async () => {
    // Given a StepperLayout whose defaultStep is its second step
    const r = await render(<StepperLayout {...baseProps({ defaultStep: "stepTwo" })} />, withRouter());

    // Then only the second step's content renders
    expect(r.query.body).not.toBeInTheDocument();
    expect(r.stepTwoBody).toBeInTheDocument();
  });

  it("renders the CTAs in the header on desktop", async () => {
    // Given a desktop viewport (the test default)
    const r = await render(<StepperLayout {...baseProps()} />, withRouter());

    // Then the CTAs render inside the header, and no footer is rendered
    expect(r.stepperLayout_header).toHaveTextContent("Continue");
    expect(r.query.stepperLayout_footer).not.toBeInTheDocument();
  });

  it("moves the CTAs to a mobile footer at the sm breakpoint", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(<StepperLayout {...baseProps()} />, withRouter());

    // Then the CTAs render in the footer instead of the header
    expect(r.stepperLayout_footer).toHaveTextContent("Continue");
    expect(r.stepperLayout_header).not.toHaveTextContent("Continue");
  });

  it("calls onCancel when Cancel is clicked", async () => {
    // Given a StepperLayout with a spy onCancel
    const onCancel = vi.fn();
    const r = await render(<StepperLayout {...baseProps({ onCancel })} />, withRouter());

    // When Cancel is clicked
    click(r.cancel);

    // Then it's called
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel immediately when Cancel is clicked and the form is clean", async () => {
    // Given a StepperLayout that reports not dirty
    const onCancel = vi.fn();
    const r = await render(<StepperLayout {...baseProps({ onCancel, isDirty: () => false })} />, withRouter());

    // When Cancel is clicked
    click(r.cancel);

    // Then onCancel is called without a confirm modal
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(r.query.discardChanges).toBeNull();
  });

  it("confirms before calling onCancel when Cancel is clicked and the form is dirty", async () => {
    // Given a StepperLayout that reports dirty
    const onCancel = vi.fn();
    const r = await render(<StepperLayout {...baseProps({ onCancel, isDirty: () => true })} />, withRouter());

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
    // Given a dirty StepperLayout whose Cancel confirm is open
    const onCancel = vi.fn();
    const r = await render(<StepperLayout {...baseProps({ onCancel, isDirty: () => true })} />, withRouter());
    click(r.cancel);

    // When Continue Editing is clicked
    click(r.continueEditing);

    // Then onCancel is not called
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("blocks in-app navigation when dirty and proceeds after Discard Changes", async () => {
    // Given a dirty StepperLayout
    const router = withRouter("/");
    const r = await render(<StepperLayout {...baseProps({ isDirty: () => true })} />, router);

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
    // Given a dirty StepperLayout with a blocked navigation
    const router = withRouter("/");
    const r = await render(<StepperLayout {...baseProps({ isDirty: () => true })} />, router);
    await act(async () => {
      await router.navigate("/other");
    });

    // When Continue Editing is clicked
    await clickAndWait(r.continueEditing);

    // Then we remain on the current route
    expect(router.location.pathname).toBe("/");
  });

  it("calls onComplete when Save is clicked on the last step", async () => {
    // Given a StepperLayout on its last step with a spy onComplete
    const onComplete = vi.fn();
    const r = await render(<StepperLayout {...baseProps({ onComplete, defaultStep: "stepTwo" })} />, withRouter());

    // When Save is clicked
    click(r.save);

    // Then it's called
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("disables Continue when the active step is primaryDisabled, and enables it once omitted", async () => {
    // Given a StepperLayout whose first (active) step has primaryDisabled
    const r = await render(
      <StepperLayout {...baseProps({ steps: makeSteps({ onePrimaryDisabled: true }) })} />,
      withRouter(),
    );

    // Then Continue is disabled
    expect(r.continue).toBeDisabled();

    // When primaryDisabled is omitted
    r.rerender(<StepperLayout {...baseProps({ steps: makeSteps() })} />);

    // Then Continue is enabled
    expect(r.continue).not.toBeDisabled();
  });

  it("disables Save when the active (last) step is primaryDisabled, and enables it once omitted", async () => {
    // Given a StepperLayout on its last step, which is primaryDisabled
    const r = await render(
      <StepperLayout {...baseProps({ steps: makeSteps({ twoPrimaryDisabled: true }), defaultStep: "stepTwo" })} />,
      withRouter(),
    );

    // Then Save is disabled
    expect(r.save).toBeDisabled();

    // When the same step becomes valid
    r.rerender(<StepperLayout {...baseProps({ steps: makeSteps(), defaultStep: "stepTwo" })} />);

    // Then Save is enabled
    expect(r.save).not.toBeDisabled();
  });

  it("uses the ai button variant for Continue when aiMode is true", async () => {
    // Given a StepperLayout in aiMode on its first step
    const r = await render(<StepperLayout {...baseProps({ aiMode: true })} />, withRouter());
    // Then Continue uses the ai variant styling
    expect(r.continue.className).toContain("aiBoldBg");
  });

  it("navigates between steps by clicking their tab on desktop", async () => {
    // Given a StepperLayout on its first step, on a desktop viewport (the test default)
    const r = await render(<StepperLayout {...baseProps()} />, withRouter());

    // Then clicking the second step's tab navigates to it
    click(r.header_stepperTabs_tab_stepTwo);
    expect(r.stepTwoBody).toBeInTheDocument();
    click(r.header_stepperTabs_tab_stepOne);
    expect(r.body).toBeInTheDocument();
  });

  it("collapses the tabs to a non-interactive indicator bar on mobile", async () => {
    // Given a StepperLayout on a mobile viewport
    setViewport("sm");
    const r = await render(<StepperLayout {...baseProps()} />, withRouter());

    // Then the tab collapses to its 0px indicator bar
    expect(r.header_stepperTabs_tab_stepTwo).toHaveStyle({ height: "0px" });
  });

  it("advances on Continue when the step has no onContinue", async () => {
    // Given a StepperLayout whose steps don't intercept Continue
    const r = await render(<StepperLayout {...baseProps()} />, withRouter());
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
      <StepperLayout {...baseProps({ steps: [{ ...steps[0], onContinue }, steps[1]] })} />,
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
      <StepperLayout {...baseProps({ steps: [{ ...steps[0], onContinue: () => false }, steps[1]] })} />,
      withRouter(),
    );
    // When Continue is clicked
    await clickAndWait(r.continue);
    // Then we stay on the first step
    expect(r.body).toBeInTheDocument();
    expect(r.query.stepTwoBody).not.toBeInTheDocument();
  });

  it("disables Continue without a tooltip when primaryDisabled is true", async () => {
    // Given a first step with primaryDisabled true
    const r = await render(
      <StepperLayout {...baseProps({ steps: makeSteps({ onePrimaryDisabled: true }) })} />,
      withRouter(),
    );

    // Then Continue is disabled and there is no tooltip
    expect(r.continue).toBeDisabled();
    expect(r.query.tooltip).toBeNull();
  });

  it("shows a Beam tooltip on disabled Continue when primaryDisabled is a reason", async () => {
    // Given a first step with a primaryDisabled reason
    const r = await render(
      <StepperLayout
        {...baseProps({ steps: makeSteps({ onePrimaryDisabled: "Fill all required fields to continue." }) })}
      />,
      withRouter(),
    );

    // Then Continue is disabled and wrapped in Beam's tooltip
    expect(r.continue).toBeDisabled();
    expect(r.tooltip).toHaveAttribute("title", "Fill all required fields to continue.");

    // When primaryDisabled is omitted
    r.rerender(<StepperLayout {...baseProps({ steps: makeSteps() })} />);

    // Then Continue is enabled and the tooltip is gone
    expect(r.continue).not.toBeDisabled();
    expect(r.query.tooltip).toBeNull();
  });

  it("shows a Beam tooltip on disabled Complete when primaryDisabled is a reason", async () => {
    // Given a last step with a primaryDisabled reason
    const r = await render(
      <StepperLayout
        {...baseProps({
          steps: makeSteps({ twoPrimaryDisabled: "Fill all required fields to continue." }),
          defaultStep: "stepTwo",
        })}
      />,
      withRouter(),
    );

    // Then Save is disabled and wrapped in Beam's tooltip
    expect(r.save).toBeDisabled();
    expect(r.tooltip).toHaveAttribute("title", "Fill all required fields to continue.");
  });
});

function makeSteps(
  overrides: {
    onePrimaryDisabled?: StepperLayoutStep["primaryDisabled"];
    twoPrimaryDisabled?: StepperLayoutStep["primaryDisabled"];
  } = {},
): StepperLayoutStep[] {
  const { onePrimaryDisabled, twoPrimaryDisabled } = overrides;
  return [
    { label: "Step One", primaryDisabled: onePrimaryDisabled, content: <div data-testid="body">Body content</div> },
    {
      label: "Step Two",
      primaryDisabled: twoPrimaryDisabled,
      content: <div data-testid="stepTwoBody">Step two content</div>,
    },
  ];
}

function baseProps(overrides: Partial<StepperLayoutProps> = {}): StepperLayoutProps {
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
