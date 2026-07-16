import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { StepperTabsStep } from "src/components/StepperTabs/StepperTabs";
import { Css } from "src/Css";
import { withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TestProjectLayout } from "src/utils/sbComponents";
import { StepperLayout as StepperLayoutComponent, StepperLayoutStep } from "./StepperLayout";

export default {
  component: StepperLayoutComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

const tabValues = ["trade", "draft", "send"] as const;
const tabLabels: Record<(typeof tabValues)[number], string> = {
  trade: "Trade Partners",
  draft: "Draft Email",
  send: "Send Email",
};

function makeTabSteps(): StepperTabsStep[] {
  return tabValues.map((value, i) => ({ label: tabLabels[value], value, completed: false, disabled: i > 0 }));
}

function makeContentSteps(contentHeightPx = 0): StepperLayoutStep[] {
  return tabValues.map((value) => ({
    value,
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

export function Default() {
  const [currentStep, setCurrentStep] = useState("trade");
  return (
    <TestProjectLayout
      pageTitle="Stepper Layout"
      stepperTabs={{ steps: makeTabSteps(), currentStep, onChange: setCurrentStep }}
    >
      <StepperLayoutComponent steps={makeContentSteps()} currentStep={currentStep} />
    </TestProjectLayout>
  );
}

export function FullWidthContent() {
  const [currentStep, setCurrentStep] = useState("trade");
  const steps: StepperLayoutStep[] = tabValues.map((value) => ({
    value,
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
    <TestProjectLayout
      pageTitle="Stepper Layout"
      stepperTabs={{ steps: makeTabSteps(), currentStep, onChange: setCurrentStep }}
    >
      <StepperLayoutComponent steps={steps} currentStep={currentStep} fullWidthContent />
    </TestProjectLayout>
  );
}
