import { StepperTabsProps, StepperTabsStep } from "src/components/StepperTabs";
import { setViewport } from "src/tests/viewport";
import { click, render, scrollWindowWithAnchor, withRouter } from "src/utils/rtl";
import { WorkflowHeaderConfig, WorkflowLayout, WorkflowLayoutProps } from "./WorkflowLayout";

describe("WorkflowLayout", () => {
  it("renders the header and body children", async () => {
    // Given a WorkflowLayout with body content
    const r = await render(<WorkflowLayout {...baseProps()} />, withRouter());

    // Then the header and body both render
    expect(r.workflowLayout_header).toHaveTextContent("Test Workflow");
    expect(r.body).toBeInTheDocument();
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

const steps: StepperTabsStep[] = [
  { value: "one", label: "Step One", completed: false },
  { value: "two", label: "Step Two", completed: false },
];

type BaseWorkflowLayoutOverrides = Omit<Partial<WorkflowLayoutProps>, "workflowHeader"> & {
  workflowHeader?: Omit<Partial<WorkflowHeaderConfig>, "stepperTabs"> & { stepperTabs?: Partial<StepperTabsProps> };
};

function baseProps(overrides: BaseWorkflowLayoutOverrides = {}): WorkflowLayoutProps {
  const { workflowHeader, ...rest } = overrides;
  const { stepperTabs, ...restHeader } = workflowHeader ?? {};
  return {
    children: <div data-testid="body">Body content</div>,
    ...rest,
    workflowHeader: {
      title: "Test Workflow",
      onCancel: () => {},
      completeLabel: "Save",
      onComplete: () => {},
      stepperTabs: { steps, currentStep: "one", onChange: () => {}, ...stepperTabs },
      ...restHeader,
    },
  };
}
