import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { WorkflowLayout, WorkflowLayoutStep } from "src/layouts/WorkflowLayout/WorkflowLayout";
import { viewportModes, withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TestWorkflowProjectLayout } from "src/utils/sbComponents";
import { WorkflowHeaderLayout as WorkflowHeaderLayoutComponent } from "./WorkflowHeaderLayout";

export default {
  component: WorkflowHeaderLayoutComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

const tabValues = ["trade", "draft", "send"] as const;
const tabLabels: Record<(typeof tabValues)[number], string> = {
  trade: "Trade Partners",
  draft: "Draft Email",
  send: "Send Email",
};

function makeSteps(contentHeightPx = 0): WorkflowLayoutStep[] {
  return tabValues.map((value, i) => ({
    value,
    label: tabLabels[value],
    completed: false,
    disabled: i > 0,
    content: <StepContent title={tabLabels[value]} heightPx={contentHeightPx} />,
  }));
}

function toStepperTabsSteps(steps: WorkflowLayoutStep[]) {
  return steps.map(({ value, label, completed, disabled }) => ({ value, label, completed, disabled }));
}

function StepContent({ title, heightPx }: { title: string; heightPx: number }) {
  return (
    <div css={Css.p3.$}>
      <h1 css={Css.xl2.mb2.$}>{title}</h1>
      <div css={Css.df.fdc.gap1.$}>
        {zeroTo(Math.ceil(heightPx / 60)).map((i) => (
          <div key={i} css={Css.hPx(48).br4.bgGray100.df.aic.pl2.$}>
            Row {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Default() {
  const [currentStep, setCurrentStep] = useState("trade");
  const steps = makeSteps();
  return (
    <TestWorkflowProjectLayout
      workflowHeader={{
        title: "Workflow Header Layout",
        rightSlot: [
          { variant: "tertiary", label: "Save Draft", onClick: () => {} },
          { label: "Continue", onClick: () => {} },
        ],
        stepperTabs: { steps: toStepperTabsSteps(steps), currentStep, onChange: setCurrentStep },
      }}
    >
      <WorkflowLayout steps={steps} currentStep={currentStep} />
    </TestWorkflowProjectLayout>
  );
}

/**
 * Tall step content so the page scrolls — scroll down to see the header's stepper tabs collapse to
 * their condensed look (the header itself stays pinned; it never auto-hides), then scroll back up
 * (even without reaching the top) to see them re-expand.
 */
export function ScrollCollapsesTabs() {
  const [currentStep, setCurrentStep] = useState("trade");
  const steps = makeSteps(2000);
  return (
    <TestWorkflowProjectLayout
      workflowHeader={{
        title: "Workflow Header Layout",
        rightSlot: [{ label: "Continue", onClick: () => {} }],
        stepperTabs: { steps: toStepperTabsSteps(steps), currentStep, onChange: setCurrentStep },
      }}
    >
      <WorkflowLayout steps={steps} currentStep={currentStep} />
    </TestWorkflowProjectLayout>
  );
}

/**
 * At the `sm` breakpoint, the header's rightSlot buttons move out of the header and into a sticky
 * 80px footer instead. Use the Storybook viewport toolbar (or resize the window below 600px) to see
 * it live — this story is also snapshotted at the `mobile1` Chromatic viewport by default.
 */
export function MobileFooter() {
  const [currentStep, setCurrentStep] = useState("trade");
  const steps = makeSteps(2000);
  return (
    <TestWorkflowProjectLayout
      workflowHeader={{
        title: "Workflow Header Layout",
        rightSlot: [
          { variant: "tertiary", label: "Save Draft", onClick: () => {} },
          { label: "Continue", onClick: () => {} },
        ],
        stepperTabs: { steps: toStepperTabsSteps(steps), currentStep, onChange: setCurrentStep },
      }}
    >
      <WorkflowLayout steps={steps} currentStep={currentStep} />
    </TestWorkflowProjectLayout>
  );
}
