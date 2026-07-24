import { Button } from "src/components/Button";
import { WorkflowHeader } from "src/components/Headers/WorkflowHeader";
import { StepperTabsStep } from "src/components/StepperTabs";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("WorkflowHeader", () => {
  it("renders rightSlot content and fires its onClick", async () => {
    // Given a WorkflowHeader with a button passed as rightSlot
    const onClick = vi.fn();
    const r = await render(
      <WorkflowHeader
        title="Test Title"
        rightSlot={<Button label="Save" onClick={onClick} />}
        stepperTabs={{ steps: makeSteps(), currentStep: "trade", onChange: vi.fn() }}
      />,
    );

    // When the button is clicked
    click(r.save);

    // Then its onClick handler fires
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders StepperTabs in the bottom slot and forwards step changes", async () => {
    // Given a WorkflowHeader with stepperTabs
    const onChange = vi.fn();
    const r = await render(
      <WorkflowHeader title="Test Title" stepperTabs={{ steps: makeSteps(), currentStep: "trade", onChange }} />,
    );

    // Then the steps are shown, nested under the header's stepperTabs test id
    expect(r.header_stepperTabs_tab_trade).toBeInTheDocument();
    expect(r.header_stepperTabs_tab_send).toBeInTheDocument();

    // When a step is clicked
    click(r.header_stepperTabs_tab_send);

    // Then onChange is invoked with that step's value
    expect(onChange).toHaveBeenCalledWith("send");
  });
});

function makeSteps(): StepperTabsStep[] {
  return [
    { label: "Trade Partners", value: "trade", completed: false },
    { label: "Send Email", value: "send", completed: false },
  ];
}
