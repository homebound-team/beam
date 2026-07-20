import { setViewport } from "src/tests/viewport";
import { click, render, scrollWindowWithAnchor, withRouter } from "src/utils/rtl";
import { WorkflowLayout, WorkflowLayoutProps, WorkflowLayoutStep } from "./WorkflowLayout";

describe("WorkflowLayout", () => {
  it("renders only the active step's content", async () => {
    // Given a WorkflowLayout on the first of two steps
    const r = await render(<TestWrapper currentStep="one" />, withRouter());

    // Then only the first step's content renders
    expect(r.stepOneContent).toBeInTheDocument();
    expect(r.query.stepTwoContent).not.toBeInTheDocument();
  });

  it("swaps the visible content when currentStep changes", async () => {
    // Given a WorkflowLayout on the first step
    const r = await render(<TestWrapper currentStep="one" />, withRouter());
    expect(r.stepOneContent).toBeInTheDocument();

    // When re-rendered with the second step active
    await r.rerender(<TestWrapper currentStep="two" />);

    // Then the second step's content renders instead
    expect(r.query.stepOneContent).not.toBeInTheDocument();
    expect(r.stepTwoContent).toBeInTheDocument();
  });

  it("centers content at 720px by default", async () => {
    // Given a WorkflowLayout without fullWidthContent
    const r = await render(<TestWrapper currentStep="one" />, withRouter());

    // Then the content wrapper is capped at 720px
    expect(r.workflowLayout_content).toHaveStyle({ maxWidth: "720px" });
  });

  it("renders content at full width when fullWidthContent is set", async () => {
    // Given a WorkflowLayout with fullWidthContent
    const r = await render(<TestWrapper currentStep="one" fullWidthContent />, withRouter());

    // Then the content wrapper is not capped at 720px
    expect(r.workflowLayout_content).not.toHaveStyle({ maxWidth: "720px" });
  });

  it("renders the active step's heading and description when present", async () => {
    // Given a step with a heading and description
    const r = await render(<TestWrapper currentStep="one" withHeadingAndDescription />, withRouter());

    // Then both render above the content
    expect(r.workflowLayout_stepHeading).toHaveTextContent("Step One Heading");
    expect(r.workflowLayout_stepDescription).toHaveTextContent("Step One description");
  });

  it("omits the heading/description wrapper when not provided", async () => {
    // Given a step without heading/description
    const r = await render(<TestWrapper currentStep="one" />, withRouter());

    // Then neither renders
    expect(r.query.workflowLayout_stepHeading).not.toBeInTheDocument();
    expect(r.query.workflowLayout_stepDescription).not.toBeInTheDocument();
  });

  it("renders rightSlot buttons in the header on desktop", async () => {
    // Given a desktop viewport (the test default)
    const r = await render(<TestWrapper currentStep="one" />, withRouter());

    // Then the button renders inside the header, and no footer is rendered
    expect(r.workflowLayout_header).toHaveTextContent("Continue");
    expect(r.query.workflowLayout_footer).not.toBeInTheDocument();
  });

  it("moves rightSlot buttons to a mobile footer at the sm breakpoint", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(<TestWrapper currentStep="one" />, withRouter());

    // Then the button renders in the footer instead of the header
    expect(r.workflowLayout_footer).toHaveTextContent("Continue");
    expect(r.workflowLayout_header).not.toHaveTextContent("Continue");
  });

  it("omits the mobile footer when there are no rightSlot buttons", async () => {
    // Given a mobile viewport with no rightSlot buttons configured
    setViewport("sm");
    const r = await render(<TestWrapper currentStep="one" rightSlot={[]} />, withRouter());

    // Then no footer renders
    expect(r.query.workflowLayout_footer).not.toBeInTheDocument();
  });

  it("forces the stepper tabs into their non-interactive collapsed state once scrolled down, and re-expands on scroll-up even short of the top", async () => {
    // Given a WorkflowLayout on step one, with an enabled (not disabled/active) second step
    const onChange = vi.fn();
    const r = await render(<TestWrapper currentStep="one" onChange={onChange} />, withRouter());

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

function TestWrapper(
  props: Partial<WorkflowLayoutProps> & {
    currentStep: string;
    withHeadingAndDescription?: boolean;
    rightSlot?: WorkflowLayoutProps["workflowHeader"]["rightSlot"];
  },
) {
  const {
    currentStep,
    fullWidthContent,
    withHeadingAndDescription,
    rightSlot = [{ label: "Continue", onClick: () => {} }],
    onChange = () => {},
  } = props;
  const steps: WorkflowLayoutStep[] = [
    {
      value: "one",
      label: "Step One",
      completed: false,
      ...(withHeadingAndDescription ? { heading: "Step One Heading", description: "Step One description" } : undefined),
      content: <div data-testid="stepOneContent">Step One</div>,
    },
    { value: "two", label: "Step Two", completed: false, content: <div data-testid="stepTwoContent">Step Two</div> },
  ];

  return (
    <WorkflowLayout
      steps={steps}
      currentStep={currentStep}
      onChange={onChange}
      fullWidthContent={fullWidthContent}
      workflowHeader={{ title: "Test Workflow", rightSlot }}
    />
  );
}
