import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { viewportModes, withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TestWorkflowProjectLayout } from "src/utils/sbComponents";
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
    <TestWorkflowProjectLayout>
      <WorkflowLayoutComponent
        steps={makeSteps()}
        currentStep={currentStep}
        onChange={setCurrentStep}
        workflowHeader={{
          title: "Workflow Layout",
          rightSlot: [
            { variant: "tertiary", label: "Save Draft", onClick: () => {} },
            { label: "Continue", onClick: () => {} },
          ],
        }}
      />
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
    <TestWorkflowProjectLayout>
      <WorkflowLayoutComponent
        steps={steps}
        currentStep={currentStep}
        onChange={setCurrentStep}
        fullWidthContent
        workflowHeader={{ title: "Workflow Layout", rightSlot: [{ label: "Continue", onClick: () => {} }] }}
      />
    </TestWorkflowProjectLayout>
  );
}

/** A step with both `heading` and `description` set, rendered above `content`. */
export function WithHeadingAndDescription() {
  const [currentStep, setCurrentStep] = useState("trade");
  const steps: WorkflowLayoutStep[] = makeSteps();
  steps[0] = {
    ...steps[0],
    heading: "Add trade partners",
    description: "Search for trade partners to invite, or add a new one to your directory.",
  };

  return (
    <TestWorkflowProjectLayout>
      <WorkflowLayoutComponent
        steps={steps}
        currentStep={currentStep}
        onChange={setCurrentStep}
        workflowHeader={{ title: "Workflow Layout", rightSlot: [{ label: "Continue", onClick: () => {} }] }}
      />
    </TestWorkflowProjectLayout>
  );
}

/**
 * Tall step content so the page scrolls — scroll down to see the header's stepper tabs collapse
 * to their condensed look (the header itself stays pinned; it never auto-hides).
 */
export function ScrollCollapsesTabs() {
  const [currentStep, setCurrentStep] = useState("trade");
  return (
    <TestWorkflowProjectLayout>
      <WorkflowLayoutComponent
        steps={makeSteps(2000)}
        currentStep={currentStep}
        onChange={setCurrentStep}
        workflowHeader={{ title: "Workflow Layout", rightSlot: [{ label: "Continue", onClick: () => {} }] }}
      />
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
  return (
    <TestWorkflowProjectLayout>
      <WorkflowLayoutComponent
        steps={makeSteps(2000)}
        currentStep={currentStep}
        onChange={setCurrentStep}
        workflowHeader={{
          title: "Workflow Layout",
          rightSlot: [
            { variant: "tertiary", label: "Save Draft", onClick: () => {} },
            { label: "Continue", onClick: () => {} },
          ],
        }}
      />
    </TestWorkflowProjectLayout>
  );
}

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
