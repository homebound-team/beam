import { StepperTab, StepperTabState } from "src/components/StepperTabs/StepperTab";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("StepperTab", () => {
  it.each<StepperTabState>(["notVisited", "completed", "active", "activeCompleted"])(
    "renders the label for state %s",
    async (state) => {
      const r = await render(<StepperTab label="Step Label" value="step" state={state} onClick={vi.fn()} />);
      expect(r.stepperTab_step).toHaveTextContent("Step Label");
    },
  );

  it.each<[StepperTabState, boolean]>([
    ["completed", true],
    ["activeCompleted", true],
    ["active", false],
    ["notVisited", false],
  ])("shows the check icon only when completed (state=%s)", async (state, expectChecked) => {
    const r = await render(<StepperTab label="Step Label" value="step" state={state} onClick={vi.fn()} />);
    const hasIcon = !!r.stepperTab_step.querySelector('[data-icon="check"]');
    expect(hasIcon).toBe(expectChecked);
  });

  it("does not invoke onClick when disabled", async () => {
    const onClick = vi.fn();
    const r = await render(<StepperTab label="Step Label" value="step" state="active" onClick={onClick} disabled />);
    expect(r.stepperTab_step).toBeDisabled();
    click(r.stepperTab_step);
    expect(onClick).not.toBeCalled();
  });

  it("hides the label when collapsed", async () => {
    const r = await render(<StepperTab label="Step Label" value="step" state="active" onClick={vi.fn()} collapsed />);
    expect(r.stepperTab_step).not.toHaveTextContent("Step Label");
    expect(r.stepperTab_step).toHaveAttribute("aria-label", "Step Label");
  });

  it("invokes onClick with the tab's value", async () => {
    const onClick = vi.fn();
    const r = await render(<StepperTab label="Step Label" value="step2" state="active" onClick={onClick} />);
    click(r.stepperTab_step2);
    expect(onClick).toBeCalledWith("step2");
  });
});
