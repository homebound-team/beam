import { StepperTab, StepperTabState } from "src/components/StepperTabs/StepperTab";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("StepperTab", () => {
  it.each<StepperTabState>(["notVisited", "completed", "active", "activeCompleted"])(
    "renders the label for state %s",
    async (state) => {
      // Given a tab in the given state
      // When rendered
      const r = await render(<StepperTab label="Step Label" value="step" state={state} onClick={vi.fn()} />);
      // Then the label is displayed
      expect(r.stepperTab_step).toHaveTextContent("Step Label");
    },
  );

  it.each<[StepperTabState, boolean]>([
    ["completed", true],
    ["activeCompleted", true],
    ["active", false],
    ["notVisited", false],
  ])("shows the check icon only when completed (state=%s)", async (state, expectChecked) => {
    // Given a tab in the given state
    // When rendered
    const r = await render(<StepperTab label="Step Label" value="step" state={state} onClick={vi.fn()} />);
    // Then the check icon is only shown for the completed states
    const hasIcon = !!r.query.stepperTab_check;
    expect(hasIcon).toBe(expectChecked);
  });

  it("invokes onClick with the tab's value", async () => {
    // Given a tab with a given value
    const onClick = vi.fn();
    const r = await render(<StepperTab label="Step Label" value="step2" state="active" onClick={onClick} />);
    // When clicked
    click(r.stepperTab_step2);
    // Then onClick is invoked with that value
    expect(onClick).toHaveBeenCalledWith("step2");
  });
});
