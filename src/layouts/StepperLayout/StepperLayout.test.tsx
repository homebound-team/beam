import { render, withRouter } from "src/utils/rtl";
import { StepperLayout, StepperLayoutProps, StepperLayoutStep } from "./StepperLayout";

describe("StepperLayout", () => {
  it("renders only the active step's content", async () => {
    // Given a StepperLayout on the first of two steps
    const r = await render(<TestWrapper currentStep="one" />, withRouter());

    // Then only the first step's content renders
    expect(r.stepOneContent).toBeInTheDocument();
    expect(r.query.stepTwoContent).not.toBeInTheDocument();
  });

  it("swaps the visible content when currentStep changes", async () => {
    // Given a StepperLayout on the first step
    const r = await render(<TestWrapper currentStep="one" />, withRouter());
    expect(r.stepOneContent).toBeInTheDocument();

    // When re-rendered with the second step active
    await r.rerender(<TestWrapper currentStep="two" />);

    // Then the second step's content renders instead
    expect(r.query.stepOneContent).not.toBeInTheDocument();
    expect(r.stepTwoContent).toBeInTheDocument();
  });

  it("centers content at 720px by default", async () => {
    // Given a StepperLayout without fullWidthContent
    const r = await render(<TestWrapper currentStep="one" />, withRouter());

    // Then the content wrapper is capped at 720px
    expect(r.stepperLayout_content).toHaveStyle({ maxWidth: "720px" });
  });

  it("renders content at full width when fullWidthContent is set", async () => {
    // Given a StepperLayout with fullWidthContent
    const r = await render(<TestWrapper currentStep="one" fullWidthContent />, withRouter());

    // Then the content wrapper is not capped at 720px
    expect(r.stepperLayout_content).not.toHaveStyle({ maxWidth: "720px" });
  });
});

function TestWrapper(props: Partial<StepperLayoutProps> & { currentStep: string }) {
  const { currentStep, fullWidthContent } = props;
  const steps: StepperLayoutStep[] = [
    { value: "one", content: <div data-testid="stepOneContent">Step One</div> },
    { value: "two", content: <div data-testid="stepTwoContent">Step Two</div> },
  ];

  return <StepperLayout steps={steps} currentStep={currentStep} fullWidthContent={fullWidthContent} />;
}
