import { StepperTab } from "src/components/StepperTabs/StepperTab";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("StepperTab", () => {
  it("renders the label", async () => {
    // Given a tab
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={false} onClick={vi.fn()} />,
    );
    // Then the label is displayed
    expect(r.stepperTab_step).toHaveTextContent("Step Label");
  });

  it("shows the check icon when completed", async () => {
    // Given a completed tab
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={true} onClick={vi.fn()} />,
    );
    // Then the check icon is shown
    expect(r.query.stepperTab_check).toBeInTheDocument();
  });

  it("does not show the check icon when not completed", async () => {
    // Given a non-completed tab
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={false} completed={false} onClick={vi.fn()} />,
    );
    // Then the check icon is not shown
    expect(r.query.stepperTab_check).not.toBeInTheDocument();
  });

  it("invokes onClick with the tab's value", async () => {
    // Given a tab with a given value
    const onClick = vi.fn();
    const r = await render(<StepperTab label="Step Label" value="step2" active completed={false} onClick={onClick} />);
    // When clicked
    click(r.stepperTab_step2);
    // Then onClick is invoked with that value
    expect(onClick).toHaveBeenCalledWith("step2");
  });
});
