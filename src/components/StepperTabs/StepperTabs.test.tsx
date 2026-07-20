import { StepperTabs, StepperTabsStep } from "src/components/StepperTabs/StepperTabs";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("StepperTabs", () => {
  it("passes active/completed state through to each tab", async () => {
    // Given three steps, the first completed, the second (current) not completed, and the third not visited
    // When rendered with the second step as current
    const r = await render(<StepperTabs steps={makeSteps()} currentStep="draft" onChange={vi.fn()} />);

    // Then the first step shows the correct tab, is not the current tab, and is completed
    expect(r.stepperTabs_tab_trade).toHaveTextContent("Trade Partners");
    expect(r.stepperTabs_step_0).toHaveAttribute("aria-current", "false");
    expect(r.stepperTabs_tab_trade.querySelector("[data-icon='check']")).toBeInTheDocument();

    // And the second step shows as the active, not-yet-completed step
    expect(r.stepperTabs_step_1).toHaveTextContent("Draft Email");
    expect(r.stepperTabs_step_1).toHaveAttribute("aria-current", "true");
    expect(r.stepperTabs_tab_draft.querySelector("[data-icon='check']")).not.toBeInTheDocument();

    // And the third step shows the third tab, not current, not completed
    expect(r.stepperTabs_tab_send).toHaveTextContent("Send Email");
    expect(r.stepperTabs_step_2).toHaveAttribute("aria-current", "false");
    expect(r.stepperTabs_tab_send.querySelector("[data-icon='check']")).not.toBeInTheDocument();
  });

  it("shows the check icon for a step that is both active and completed", async () => {
    // Given the first step is both completed and current
    const r = await render(<StepperTabs steps={makeSteps()} currentStep="trade" onChange={vi.fn()} />);
    // Then it's marked current and still shows its check icon
    expect(r.stepperTabs_step_0).toHaveAttribute("aria-current", "true");
    expect(r.stepperTabs_tab_trade.querySelector("[data-icon='check']")).toBeInTheDocument();
  });

  it("invokes onChange with the clicked step's value", async () => {
    // Given a rendered stepper
    const onChange = vi.fn();
    const r = await render(<StepperTabs steps={makeSteps()} currentStep="trade" onChange={onChange} />);
    // When a tab is clicked
    click(r.stepperTabs_tab_send);
    // Then onChange is invoked with that step's value
    expect(onChange).toHaveBeenCalledWith("send");
  });
});

function makeSteps(): StepperTabsStep[] {
  return [
    { label: "Trade Partners", value: "trade", completed: true },
    { label: "Draft Email", value: "draft", completed: false },
    { label: "Send Email", value: "send", completed: false },
  ];
}
