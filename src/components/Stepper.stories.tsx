import { Meta } from "@storybook/react";
import { useState } from "react";
import { Button } from "src/components/Button";
import { Step, Stepper } from "src/components/Stepper";
import { Css } from "src/Css";
import { noop } from "src/utils";

export default {
  component: Stepper,
  title: "Components/Stepper",
} as Meta;

export function InteractiveStepper() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  function setStep(stepIdx: number, stepData: Partial<Step>) {
    setSteps(steps.map((s, idx) => (idx === stepIdx ? { ...steps[stepIdx], ...stepData } : s)));
  }

  const [steps, setSteps] = useState<Step[]>([
    { state: "incomplete", label: "Trade Partners" },
    { state: "incomplete", label: "Draft Email", disabled: true },
    { state: "incomplete", label: "Send Email", disabled: true },
  ]);

  return (
    <div>
      <Stepper steps={steps} activeStepIndex={activeStepIndex} onChange={setActiveStepIndex} />

      <div css={Css.mt2.df.childGap1.$}>
        {activeStepIndex === 0 && (
          <>
            <Button
              label="Toggle complete"
              onClick={() => setStep(0, { state: steps[0].state === "complete" ? "incomplete" : "complete" })}
            />
            <Button label="Enable Draft Email step" onClick={() => setStep(1, { disabled: false })} />
            <Button label="To Draft Email" onClick={() => setActiveStepIndex(1)} disabled={steps[1].disabled} />
          </>
        )}
        {activeStepIndex === 1 && (
          <>
            <Button
              label="Toggle complete"
              onClick={() => setStep(1, { state: steps[1].state === "complete" ? "incomplete" : "complete" })}
            />
            <Button label="Enable Send Email step" onClick={() => setStep(2, { disabled: false })} />
            <Button label="To Send Email" onClick={() => setActiveStepIndex(2)} disabled={steps[2].disabled} />
          </>
        )}
        {activeStepIndex === 2 && (
          <Button
            label="Toggle complete"
            onClick={() => setStep(2, { state: steps[2].state === "complete" ? "incomplete" : "complete" })}
          />
        )}
      </div>
    </div>
  );
}

export function StepperStates() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps: Step[] = [
    {
      state: "complete",
      label: "Completed Step",
    },
    {
      state: "incomplete",
      label: "Incomplete Step",
    },
    {
      state: "error",
      label: "Step in error",
    },
  ];

  return (
    <div css={Css.df.flexColumn.childGap4.$}>
      <div>
        <h2>Enabled Steps</h2>
        <Stepper steps={steps} activeStepIndex={activeStepIndex} onChange={setActiveStepIndex} />
      </div>
      <div>
        <h2>Disabled Steps</h2>
        <Stepper steps={steps.map((s) => ({ ...s, disabled: true }))} activeStepIndex={0} onChange={noop} />
      </div>
    </div>
  );
}
