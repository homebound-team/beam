import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { StepperTabsStep } from "src/components/StepperTabs";
import { Css } from "src/Css";
import { viewportModes, withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TestWorkflowProjectLayout } from "src/utils/sbComponents";
import { action } from "storybook/actions";
import { WorkflowLayout as WorkflowLayoutComponent } from "./WorkflowLayout";

export default {
  component: WorkflowLayoutComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

export function Default() {
  const [currentStep, setCurrentStep] = useState("trade");
  return (
    <TestWorkflowProjectLayout
      workflowHeader={{
        title: "Workflow Layout",
        onCancel: action("cancel clicked"),
        completeLabel: "Save",
        onComplete: action("complete clicked"),
        canExitEarly: true,
        onSaveAndExit: action("save and exit clicked"),
        stepperTabs: { steps: makeSteps(), currentStep, onChange: setCurrentStep },
      }}
    >
      <StepContent title={tabLabels[currentStep as keyof typeof tabLabels]} />
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
  return (
    <TestWorkflowProjectLayout
      workflowHeader={{
        title: "Workflow Layout",
        onCancel: action("cancel clicked"),
        completeLabel: "Save",
        onComplete: action("complete clicked"),
        stepperTabs: { steps: makeSteps(), currentStep, onChange: setCurrentStep },
      }}
    >
      <StepContent title={tabLabels[currentStep as keyof typeof tabLabels]} heightPx={2000} />
    </TestWorkflowProjectLayout>
  );
}

const tabValues = ["trade", "draft", "send"] as const;
const tabLabels: Record<(typeof tabValues)[number], string> = {
  trade: "Trade Partners",
  draft: "Draft Email",
  send: "Send Email",
};

function makeSteps(): StepperTabsStep[] {
  return tabValues.map((value, i) => ({ value, label: tabLabels[value], completed: false, disabled: i > 0 }));
}

function StepContent({ title, heightPx = 0 }: { title: string; heightPx?: number }) {
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
