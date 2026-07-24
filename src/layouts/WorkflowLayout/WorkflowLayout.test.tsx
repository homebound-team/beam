import { StepperTabsProps } from "src/components/StepperTabs";
import { setViewport } from "src/tests/viewport";
import { click, render, scrollWindowWithAnchor, withRouter } from "src/utils/rtl";
import { WorkflowHeaderConfig, WorkflowLayout, WorkflowLayoutProps, WorkflowLayoutStep } from "./WorkflowLayout";

describe("WorkflowLayout", () => {
  it("renders the header and the active step's content", async () => {
    // Given a WorkflowLayout on its first step
    const r = await render(<WorkflowLayout {...baseProps()} />, withRouter());

    // Then the header and the first step's content both render
    expect(r.workflowLayout_header).toHaveTextContent("Test Workflow");
    expect(r.body).toBeInTheDocument();
  });

  it("swaps the visible content when currentStep changes", async () => {
    // Given a WorkflowLayout on its second step
    const r = await render(
      <WorkflowLayout {...baseProps({ workflowHeader: { stepperTabs: { currentStep: "two" } } })} />,
      withRouter(),
    );

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
    const r = await render(<WorkflowLayout {...baseProps({ workflowHeader: { onCancel } })} />, withRouter());

    // When Cancel is clicked
    click(r.workflowLayout_cancel);

    // Then it's called
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete when Save is clicked on the last step", async () => {
    // Given a WorkflowLayout on its last step with a spy onComplete
    const onComplete = vi.fn();
    const r = await render(
      <WorkflowLayout {...baseProps({ workflowHeader: { onComplete, stepperTabs: { currentStep: "two" } } })} />,
      withRouter(),
    );

    // When Save is clicked
    click(r.workflowLayout_complete);

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
    expect(r.workflowLayout_continue).toBeDisabled();

    // When the same step becomes valid
    await r.rerender(<WorkflowLayout {...baseProps({ steps: makeSteps({ oneIsValid: true }) })} />);

    // Then Continue is enabled
    expect(r.workflowLayout_continue).not.toBeDisabled();
  });

  it("disables Save when the active (last) step is invalid, and enables it once valid", async () => {
    // Given a WorkflowLayout on its last step, which is invalid
    const r = await render(
      <WorkflowLayout
        {...baseProps({
          steps: makeSteps({ twoIsValid: false }),
          workflowHeader: { stepperTabs: { currentStep: "two" } },
        })}
      />,
      withRouter(),
    );

    // Then Save is disabled
    expect(r.workflowLayout_complete).toBeDisabled();

    // When the same step becomes valid
    await r.rerender(
      <WorkflowLayout
        {...baseProps({
          steps: makeSteps({ twoIsValid: true }),
          workflowHeader: { stepperTabs: { currentStep: "two" } },
        })}
      />,
    );

    // Then Save is enabled
    expect(r.workflowLayout_complete).not.toBeDisabled();
  });

  it("forces the stepper tabs into their non-interactive collapsed state once scrolled down, and re-expands on scroll-up even short of the top", async () => {
    // Given a WorkflowLayout with an enabled (not disabled/active) second step
    const onChange = vi.fn();
    const r = await render(
      <WorkflowLayout {...baseProps({ workflowHeader: { stepperTabs: { onChange } } })} />,
      withRouter(),
    );

    // Then, at the top of the page, clicking the second step's tab navigates to it
    click(r.header_stepperTabs_tab_two);
    expect(onChange).toHaveBeenCalledWith("two");
    onChange.mockClear();

    // When the page scrolls down past the threshold, the tabs collapse to a non-interactive indicator bar
    scrollWindowWithAnchor(r.workflowLayout_spacer, 0);
    scrollWindowWithAnchor(r.workflowLayout_spacer, 300);
    click(r.header_stepperTabs_tab_two);
    expect(onChange).not.toHaveBeenCalled();

    // When scrolling back up — even without reaching the top — the tabs re-expand
    scrollWindowWithAnchor(r.workflowLayout_spacer, 250);
    click(r.header_stepperTabs_tab_two);
    expect(onChange).toHaveBeenCalledWith("two");
    onChange.mockClear();

    // And scrolling all the way back to the top keeps them expanded
    scrollWindowWithAnchor(r.workflowLayout_spacer, 0);
    click(r.header_stepperTabs_tab_two);
    expect(onChange).toHaveBeenCalledWith("two");
  });
});

function makeSteps(overrides: { oneIsValid?: boolean; twoIsValid?: boolean } = {}): WorkflowLayoutStep[] {
  const { oneIsValid = true, twoIsValid = true } = overrides;
  return [
    { value: "one", label: "Step One", isValid: oneIsValid, content: <div data-testid="body">Body content</div> },
    {
      value: "two",
      label: "Step Two",
      isValid: twoIsValid,
      content: <div data-testid="stepTwoBody">Step two content</div>,
    },
  ];
}

type BaseWorkflowLayoutOverrides = Omit<Partial<WorkflowLayoutProps>, "workflowHeader"> & {
  workflowHeader?: Omit<Partial<WorkflowHeaderConfig>, "stepperTabs"> & {
    stepperTabs?: Partial<Omit<StepperTabsProps, "steps">>;
  };
};

function baseProps(overrides: BaseWorkflowLayoutOverrides = {}): WorkflowLayoutProps {
  const { workflowHeader, steps = makeSteps(), ...rest } = overrides;
  const { stepperTabs, ...restHeader } = workflowHeader ?? {};
  return {
    steps,
    ...rest,
    workflowHeader: {
      title: "Test Workflow",
      onCancel: () => {},
      completeLabel: "Save",
      onComplete: () => {},
      stepperTabs: { currentStep: "one", onChange: () => {}, ...stepperTabs },
      ...restHeader,
    },
  };
}
