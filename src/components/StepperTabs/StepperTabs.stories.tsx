import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { viewportModes } from "src/utils/sb";
import { StepperTabs, StepperTabsStep } from "./StepperTabs";

export default {
  component: StepperTabs,
  parameters: {
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} as Meta;

export function InteractiveStepperTabs() {
  const [steps, setSteps] = useState<StepperTabsStep[]>([
    { label: "Trade Partners", value: "trade" },
    { label: "Draft Email", value: "draft", disabled: true },
    { label: "Send Email", value: "send", disabled: true },
  ]);
  const [currentStep, setCurrentStep] = useState(steps[0].value);

  function setStep(stepIdx: number, stepData: Partial<StepperTabsStep>) {
    setSteps(steps.map((s, idx) => (idx === stepIdx ? { ...steps[stepIdx], ...stepData } : s)));
  }

  return (
    <div>
      <StepperTabs steps={steps} currentStep={currentStep} onChange={setCurrentStep} />

      <div css={Css.mt2.df.gap1.$}>
        {currentStep === "trade" && (
          <>
            <Button label="Enable Draft Email step" onClick={() => setStep(1, { disabled: false })} />
            <Button label="To Draft Email" onClick={() => setCurrentStep("draft")} disabled={steps[1].disabled} />
          </>
        )}
        {currentStep === "draft" && (
          <>
            <Button label="Enable Send Email step" onClick={() => setStep(2, { disabled: false })} />
            <Button label="To Send Email" onClick={() => setCurrentStep("send")} disabled={steps[2].disabled} />
          </>
        )}
        {currentStep === "send" && <Button label="Back to Trade Partners" onClick={() => setCurrentStep("trade")} />}
      </div>
    </div>
  );
}

const twoSteps: StepperTabsStep[] = [
  { label: "Trade Partners", value: "trade" },
  { label: "Send Email", value: "send" },
];

const threeSteps: StepperTabsStep[] = [
  { label: "Trade Partners", value: "trade" },
  { label: "Draft Email", value: "draft" },
  { label: "Send Email", value: "send" },
];

const fiveSteps: StepperTabsStep[] = [
  { label: "Trade Partners", value: "trade" },
  { label: "Plan Package", value: "plan" },
  { label: "Design Packages", value: "design" },
  { label: "Options", value: "options", disabled: true },
  { label: "Review", value: "review", disabled: true },
];

export function StepWidths() {
  return (
    <div css={Css.df.fdc.gap4.$}>
      <div>
        <h2>2 steps (each capped at 280px)</h2>
        <StepperTabs steps={twoSteps} currentStep="send" onChange={noop} />
      </div>
      <div>
        <h2>3 steps (each capped at 280px)</h2>
        <StepperTabs steps={threeSteps} currentStep="draft" onChange={noop} />
      </div>
      <div>
        <h2>5 steps (fills available width)</h2>
        <StepperTabs steps={fiveSteps} currentStep="design" onChange={noop} />
      </div>
    </div>
  );
}
