import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Breadcrumb } from "src/components/Breadcrumbs";
import { WorkflowHeader } from "src/components/Headers/WorkflowHeader";
import { StepperTabsStep } from "src/components/StepperTabs";
import { withBeamDecorator, withRouter } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  component: WorkflowHeader,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withRouter(), withBeamDecorator],
} as Meta;

const steps: StepperTabsStep[] = [
  { label: "Trade Partners", value: "trade", completed: true },
  { label: "Draft Email", value: "draft", completed: false },
  { label: "Send Email", value: "send", completed: false },
];

function useSteps() {
  const [currentStep, setCurrentStep] = useState(steps[0].value);
  return { steps, currentStep, onChange: setCurrentStep };
}

export function Default() {
  const stepperTabs = useSteps();
  return <WorkflowHeader title="Test Title" stepperTabs={stepperTabs} />;
}

export function WithRightSlotButtons() {
  const stepperTabs = useSteps();
  return (
    <WorkflowHeader
      title="Test Title"
      rightSlot={[
        { label: "Save Draft", variant: "secondary", onClick: action("save clicked") },
        { label: "Continue", variant: "primary", onClick: action("continue clicked") },
      ]}
      stepperTabs={stepperTabs}
    />
  );
}

export function WithBreadcrumbs() {
  const stepperTabs = useSteps();
  const breadcrumbs: Breadcrumb[] = [
    { label: "Test 1", href: "" },
    { label: "Test 2", href: "" },
  ];
  return <WorkflowHeader title="Test Title" breadcrumbs={{ breadcrumbs }} stepperTabs={stepperTabs} />;
}

export function WithBreadcrumbsAndButtons() {
  const stepperTabs = useSteps();
  const breadcrumbs: Breadcrumb[] = [
    { label: "Test 1", href: "" },
    { label: "Test 2", href: "" },
  ];
  return (
    <WorkflowHeader
      title="Test Title"
      breadcrumbs={{ breadcrumbs }}
      rightSlot={[{ label: "Continue", variant: "primary", onClick: action("continue clicked") }]}
      stepperTabs={stepperTabs}
    />
  );
}
