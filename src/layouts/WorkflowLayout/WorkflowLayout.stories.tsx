import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TestWorkflowProjectLayout } from "src/utils/sbComponents";
import { WorkflowLayout as WorkflowLayoutComponent, WorkflowLayoutStep } from "./WorkflowLayout";

export default {
  component: WorkflowLayoutComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export function Default() {
  const [currentStep, setCurrentStep] = useState("trade");
  const steps = makeSteps();
  return (
    <TestWorkflowProjectLayout
      workflowHeader={{
        title: "Workflow Layout",
        rightSlot: [
          { variant: "tertiary", label: "Save Draft", onClick: () => {} },
          { label: "Continue", onClick: () => {} },
        ],
        stepperTabs: { steps: toStepperTabsSteps(steps), currentStep, onChange: setCurrentStep },
      }}
    >
      <WorkflowLayoutComponent steps={steps} currentStep={currentStep} />
    </TestWorkflowProjectLayout>
  );
}

export function FullWidthContent() {
  const [currentStep, setCurrentStep] = useState("trade");
  const steps: WorkflowLayoutStep[] = tabValues.map((value, i) => ({
    value,
    label: tabLabels[value],
    completed: false,
    disabled: i > 0,
    content: (
      <div css={Css.p3.$}>
        <h1 css={Css.xl2.mb2.$}>{tabLabels[value]}</h1>
        <div css={Css.df.gap1.$}>
          {zeroTo(8).map((i) => (
            <div key={i} css={Css.fg1.hPx(200).br4.bgGray100.$} />
          ))}
        </div>
      </div>
    ),
  }));

  return (
    <TestWorkflowProjectLayout
      workflowHeader={{
        title: "Workflow Layout",
        rightSlot: [{ label: "Continue", onClick: () => {} }],
        stepperTabs: { steps: toStepperTabsSteps(steps), currentStep, onChange: setCurrentStep },
      }}
    >
      <WorkflowLayoutComponent steps={steps} currentStep={currentStep} fullWidthContent />
    </TestWorkflowProjectLayout>
  );
}

/** A step with both `heading` and `description` set, rendered above `content`. */
export function WithHeadingAndDescription() {
  const [currentStep, setCurrentStep] = useState("trade");
  const steps = makeSteps();
  steps[0] = {
    ...steps[0],
    heading: "Add trade partners",
    description: "Search for trade partners to invite, or add a new one to your directory.",
  };

  return (
    <TestWorkflowProjectLayout
      workflowHeader={{
        title: "Workflow Layout",
        rightSlot: [{ label: "Continue", onClick: () => {} }],
        stepperTabs: { steps: toStepperTabsSteps(steps), currentStep, onChange: setCurrentStep },
      }}
    >
      <WorkflowLayoutComponent steps={steps} currentStep={currentStep} />
    </TestWorkflowProjectLayout>
  );
}

const tabValues = ["trade", "draft", "send"] as const;
const tabLabels: Record<(typeof tabValues)[number], string> = {
  trade: "Trade Partners",
  draft: "Draft Email",
  send: "Send Email",
};

function makeSteps(): WorkflowLayoutStep[] {
  return tabValues.map((value, i) => ({
    value,
    label: tabLabels[value],
    completed: false,
    disabled: i > 0,
    content: (
      <div css={Css.p3.$}>
        <h1 css={Css.xl2.mb2.$}>{tabLabels[value]}</h1>
      </div>
    ),
  }));
}

/** `WorkflowHeaderLayout`'s `stepperTabs.steps` is derived from the same `steps` array via this mapping. */
function toStepperTabsSteps(steps: WorkflowLayoutStep[]) {
  return steps.map(({ value, label, completed, disabled }) => ({ value, label, completed, disabled }));
}
