import { Meta } from "@storybook/react";
import { useState } from "react";
import { Button } from "src/components/Button";
import { Step, Stepper } from "src/components/Stepper";
import { Css } from "src/Css";
import { noop } from "src/utils";

export default {
  component: Stepper,
  title: "Workspace/Components/Stepper",
} as Meta;

export function InteractiveStepper() {
  const [steps, setSteps] = useState<Step[]>([
    { state: "incomplete", label: "Trade Partners", value: "trade" },
    { state: "incomplete", label: "Draft Email", value: "draft", disabled: true },
    { state: "incomplete", label: "Send Email", value: "send", disabled: true },
  ]);
  const [currentStep, setCurrentStep] = useState(steps[0].value);

  function setStep(stepIdx: number, stepData: Partial<Step>) {
    setSteps(steps.map((s, idx) => (idx === stepIdx ? { ...steps[stepIdx], ...stepData } : s)));
  }

  return (
    <div>
      <Stepper steps={steps} currentStep={currentStep} onChange={setCurrentStep} />

      <div css={Css.mt2.df.gap1.$}>
        {currentStep === "trade" && (
          <>
            <Button
              label="Toggle complete"
              onClick={() => setStep(0, { state: steps[0].state === "complete" ? "incomplete" : "complete" })}
            />
            <Button label="Enable Draft Email step" onClick={() => setStep(1, { disabled: false })} />
            <Button label="To Draft Email" onClick={() => setCurrentStep("draft")} disabled={steps[1].disabled} />
          </>
        )}
        {currentStep === "draft" && (
          <>
            <Button
              label="Toggle complete"
              onClick={() => setStep(1, { state: steps[1].state === "complete" ? "incomplete" : "complete" })}
            />
            <Button label="Enable Send Email step" onClick={() => setStep(2, { disabled: false })} />
            <Button label="To Send Email" onClick={() => setCurrentStep("send")} disabled={steps[2].disabled} />
          </>
        )}
        {currentStep === "send" && (
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
  const steps: Step[] = [
    { state: "complete", label: "Completed Step", value: "complete" },
    { state: "incomplete", label: "Incomplete Step", value: "incomplete" },
    { state: "error", label: "Step in error", value: "error" },
  ];

  const [currentStep, setCurrentStep] = useState(steps[0].value);

  return (
    <div css={Css.df.fdc.gap4.$}>
      <div>
        <h2>Enabled Steps</h2>
        <Stepper steps={steps} currentStep={currentStep} onChange={setCurrentStep} />
      </div>
      <div>
        <h2>Disabled Steps</h2>
        <Stepper steps={steps.map((s) => ({ ...s, disabled: true }))} currentStep={steps[0].value} onChange={noop} />
      </div>
    </div>
  );
}
