import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { viewportModes, withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TestWorkflowProjectLayout } from "src/utils/sbComponents";
import { action } from "storybook/actions";
import { WorkflowLayout as WorkflowLayoutComponent, WorkflowLayoutStep } from "./WorkflowLayout";

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
        stepperTabs: { currentStep, onChange: setCurrentStep },
      }}
      steps={makeSteps()}
    />
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
        stepperTabs: { currentStep, onChange: setCurrentStep },
      }}
      steps={makeSteps(50)}
    />
  );
}

/**
 * At the `sm` breakpoint, the header's CTAs move out of the header and into a sticky 80px footer
 * instead. Use the Storybook viewport toolbar (or resize the window below 600px) to see it live —
 * this story is also snapshotted at the `mobile1` Chromatic viewport by default.
 */
export function MobileFooter() {
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
        stepperTabs: { currentStep, onChange: setCurrentStep },
      }}
      steps={makeSteps(50)}
    />
  );
}

const tabValues = ["trade", "draft", "send"] as const;
const tabLabels: Record<(typeof tabValues)[number], string> = {
  trade: "Trade Partners",
  draft: "Draft Email",
  send: "Send Email",
};

function makeSteps(contentRows = 0): WorkflowLayoutStep[] {
  return tabValues.map((value, i) => ({
    value,
    label: tabLabels[value],
    isValid: true,
    disabled: i > 0,
    content: <StepContent title={tabLabels[value]} numRows={contentRows} />,
  }));
}

function StepContent({ title, numRows = 0 }: { title: string; numRows?: number }) {
  return (
    <div css={Css.p3.$}>
      <h1 css={Css.xl2.mb2.$}>{title}</h1>
      <div css={Css.df.fdc.gap1.$}>
        {zeroTo(numRows).map((i) => (
          <div key={i} css={Css.hPx(48).br4.bgGray100.df.aic.pl2.$}>
            Row {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
