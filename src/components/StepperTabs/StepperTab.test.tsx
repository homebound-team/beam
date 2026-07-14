import { StepperTab } from "src/components/StepperTabs/StepperTab";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("StepperTab", () => {
  it.each<[boolean, boolean]>([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])("renders the label (active=%s, completed=%s)", async (active, completed) => {
    // Given a tab with the given active/completed combination
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={active} completed={completed} onClick={vi.fn()} />,
    );
    // Then the label is displayed
    expect(r.stepperTab_step).toHaveTextContent("Step Label");
  });

  it.each<[boolean, boolean]>([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])("shows the check icon only when completed (active=%s, completed=%s)", async (active, completed) => {
    // Given a tab with the given active/completed combination
    // When rendered
    const r = await render(
      <StepperTab label="Step Label" value="step" active={active} completed={completed} onClick={vi.fn()} />,
    );
    // Then the check icon is only shown when completed, regardless of active-ness
    const hasIcon = !!r.query.stepperTab_check;
    expect(hasIcon).toBe(completed);
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
