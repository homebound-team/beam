import { StepperTabs, StepperTabsStep } from "src/components/StepperTabs/StepperTabs";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("StepperTabs", () => {
  it("derives active/completed chrome from the current step index", async () => {
    // Given three steps with the second as current (so the first is prior / completed)
    // When rendered
    const r = await render(<StepperTabs steps={makeSteps()} currentStep="draft" onChange={vi.fn()} />);

    // Then the first step is not current and shows a completed check
    expect(r.stepperTabs_tab_trade).toHaveTextContent("Trade Partners");
    expect(r.stepperTabs_step_0).toHaveAttribute("aria-current", "false");
    const tradeCheck = r.stepperTabs_tab_trade.querySelector("[data-icon='check']");
    expect(tradeCheck).toBeInTheDocument();
    expect(tradeCheck?.parentElement).toHaveStyle({ opacity: "1" });

    // And the current step has a mounted but hidden check
    expect(r.stepperTabs_step_1).toHaveTextContent("Draft Email");
    expect(r.stepperTabs_step_1).toHaveAttribute("aria-current", "true");
    const draftCheck = r.stepperTabs_tab_draft.querySelector("[data-icon='check']");
    expect(draftCheck).toBeInTheDocument();
    expect(draftCheck?.parentElement).toHaveStyle({ opacity: "0" });

    // And a future step also keeps the check hidden
    expect(r.stepperTabs_tab_send).toHaveTextContent("Send Email");
    expect(r.stepperTabs_step_2).toHaveAttribute("aria-current", "false");
    const sendCheck = r.stepperTabs_tab_send.querySelector("[data-icon='check']");
    expect(sendCheck).toBeInTheDocument();
    expect(sendCheck?.parentElement).toHaveStyle({ opacity: "0" });
  });

  it("keeps the check hidden on the active step", async () => {
    // Given the first step is current (so nothing is index-completed yet)
    const r = await render(<StepperTabs steps={makeSteps()} currentStep="trade" onChange={vi.fn()} />);
    // Then it's marked current and its check stays at zero opacity
    expect(r.stepperTabs_step_0).toHaveAttribute("aria-current", "true");
    const tradeCheck = r.stepperTabs_tab_trade.querySelector("[data-icon='check']");
    expect(tradeCheck).toBeInTheDocument();
    expect(tradeCheck?.parentElement).toHaveStyle({ opacity: "0" });
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
    { label: "Trade Partners", value: "trade" },
    { label: "Draft Email", value: "draft" },
    { label: "Send Email", value: "send" },
  ];
}
