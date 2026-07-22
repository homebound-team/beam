import { render, withRouter } from "src/utils/rtl";
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
});

function TestWrapper(
  props: Partial<WorkflowLayoutProps> & { currentStep: string; withHeadingAndDescription?: boolean },
) {
  const { currentStep, fullWidthContent, withHeadingAndDescription } = props;
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

  return <WorkflowLayout steps={steps} currentStep={currentStep} fullWidthContent={fullWidthContent} />;
}
