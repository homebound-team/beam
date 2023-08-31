import { Step, Stepper } from "src/components/Stepper";
import { click, render } from "src/utils/rtl";
import { zeroTo } from "src/utils/sb";

describe(Stepper, () => {
  it("renders and invokes onChange", async () => {
    const onChange = jest.fn();
    // Given the stepper with 3 steps. The first disabled and complete, the second incomplete, and the third in error state.
    const steps: Step[] = zeroTo(3).map((idx) => ({
      label: `Step ${idx === 0 ? "A" : idx === 1 ? "B" : "C"}`,
      value: `step${idx + 1}`,
      state: "incomplete",
      disabled: idx === 0,
    }));
    // When rendered
    const r = await render(<Stepper steps={steps} currentStep={steps[1].value} onChange={onChange} />);

    // Then all three steps are displayed and have the proper `aria-current` attribute
    expect(r.stepper_step_0).toHaveAttribute("aria-current", "false");
    expect(r.stepper_step_1).toHaveAttribute("aria-current", "true");
    expect(r.stepper_step_2).toHaveAttribute("aria-current", "false");

    // And the button elements for each step have the expected states
    expect(r.stepper_stepButton_stepA).toBeDisabled().toHaveTextContent("Step A");
    expect(r.stepper_stepButton_stepB).not.toBeDisabled().toHaveTextContent("Step B");
    expect(r.stepper_stepButton_stepC).not.toBeDisabled().toHaveTextContent("Step C");
    expect(r.stepper_stepButton_stepC).not.toBeDisabled().toHaveTextContent("Step C");

    // And when clicking Step 3
    click(r.stepper_stepButton_stepC);
    // Then the `onChange` callback is invoked
    expect(onChange).toBeCalledWith("step3");
  });
});
