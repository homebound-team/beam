import { ReactNode } from "react";
import { setViewport } from "src/tests/viewport";
import { click, render, scrollWindowWithAnchor, withRouter } from "src/utils/rtl";
import { WorkflowHeaderLayout } from "./WorkflowHeaderLayout";

describe("WorkflowHeaderLayout", () => {
  it("renders the header and body children", async () => {
    // Given a WorkflowHeaderLayout with body content
    const r = await render(<TestWrapper>{<div data-testid="body">Body content</div>}</TestWrapper>, withRouter());

    // Then the header and body both render
    expect(r.workflowHeaderLayout_header).toHaveTextContent("Test Workflow");
    expect(r.body).toBeInTheDocument();
  });

  it("renders the CTAs in the header on desktop", async () => {
    // Given a desktop viewport (the test default)
    const r = await render(<TestWrapper />, withRouter());

    // Then the CTAs render inside the header, and no footer is rendered
    expect(r.workflowHeaderLayout_header).toHaveTextContent("Continue");
    expect(r.query.workflowHeaderLayout_footer).not.toBeInTheDocument();
  });

  it("moves the CTAs to a mobile footer at the sm breakpoint", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(<TestWrapper />, withRouter());

    // Then the CTAs render in the footer instead of the header
    expect(r.workflowHeaderLayout_footer).toHaveTextContent("Continue");
    expect(r.workflowHeaderLayout_header).not.toHaveTextContent("Continue");
  });

  it("forces the stepper tabs into their non-interactive collapsed state once scrolled down, and re-expands on scroll-up even short of the top", async () => {
    // Given a WorkflowHeaderLayout with an enabled (not disabled/active) second step
    const onChange = vi.fn();
    const r = await render(<TestWrapper onChange={onChange} />, withRouter());

    // Then, at the top of the page, clicking the second step's tab navigates to it
    click(r.header_stepperTabs_tab_two);
    expect(onChange).toHaveBeenCalledWith("two");
    onChange.mockClear();

    // When the page scrolls down past the threshold, the tabs collapse to a non-interactive indicator bar
    scrollWindowWithAnchor(r.workflowHeaderLayout_spacer, 0);
    scrollWindowWithAnchor(r.workflowHeaderLayout_spacer, 300);
    click(r.header_stepperTabs_tab_two);
    expect(onChange).not.toHaveBeenCalled();

    // When scrolling back up — even without reaching the top — the tabs re-expand
    scrollWindowWithAnchor(r.workflowHeaderLayout_spacer, 250);
    click(r.header_stepperTabs_tab_two);
    expect(onChange).toHaveBeenCalledWith("two");
    onChange.mockClear();

    // And scrolling all the way back to the top keeps them expanded
    scrollWindowWithAnchor(r.workflowHeaderLayout_spacer, 0);
    click(r.header_stepperTabs_tab_two);
    expect(onChange).toHaveBeenCalledWith("two");
  });
});

function TestWrapper(
  props: Partial<{
    children: ReactNode;
    currentStep: string;
    onChange: (stepValue: string) => void;
  }>,
) {
  const { children, currentStep = "one", onChange = () => {} } = props;
  return (
    <WorkflowHeaderLayout
      workflowHeader={{
        title: "Test Workflow",
        onCancel: () => {},
        completeLabel: "Save",
        onComplete: () => {},
        stepperTabs: {
          steps: [
            { value: "one", label: "Step One", completed: false },
            { value: "two", label: "Step Two", completed: false },
          ],
          currentStep,
          onChange,
        },
      }}
    >
      {children}
    </WorkflowHeaderLayout>
  );
}
