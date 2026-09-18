import { type ReactNode, useState } from "react";
import type { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import type { StepperTabsStep } from "src/components/StepperTabs/StepperTabs";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";
import type { RightPaneTrigger } from "./RightPaneTriggers";
import type { AllowNavigationArgs } from "./useUnsavedChangesGuard";
import type { WorkflowActionsProps } from "./WorkflowActions";
import { WorkflowPageLayout } from "./WorkflowPageLayout";

/**
 * A `StepperLayout` step: `StepperTabsStep` (minus `value`) plus page content.
 */
export type StepperLayoutStep = Omit<StepperTabsStep, "value" | "disabled"> & {
  /** Rendered as the page body while this is the active step. */
  content: ReactNode;
  /** Tab isn't clickable. */
  disabled?: boolean;
  /** Continue/Complete is disabled. A ReactNode is shown in Beam's tooltip. */
  primaryDisabled?: boolean | ReactNode;
  /** Icon triggers for this step. Chrome is rendered by the workflow; the pane closes on step change. */
  rightPaneTriggers?: RightPaneTrigger[];
};

export type StepperLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Pick<WorkflowActionsProps, "onCancel" | "completeLabel" | "onComplete" | "onSaveAndExit"> & {
    /** The workflow's steps; the active step's `content` is the body, and it drives the header's tab strip. */
    steps: StepperLayoutStep[];
    /** The step shown initially (matched against `defaultTestId(step.label)`); falls back to the first step if omitted or if it doesn't match any step. Uncontrolled — the layout owns step navigation from here. */
    defaultStep?: string;
    /** Read on Cancel / leave — a callback so flipping dirty does not re-render. */
    isDirty?: () => boolean;
    /** Consulted only while dirty — return true to allow a route change that stays on this form. */
    allowNavigation?: (args: AllowNavigationArgs) => boolean;
    /** Full-bleed AI wash on the body. Pair with `aiMode` on a step's `FormSectionLayout`. */
    aiMode?: boolean;
  };

/**
 * Standalone step-based workflow page. Contract: `docs/layouts.md`.
 * Nest under `EnvironmentBannerLayout` only — no navbar/side nav, so attention stays on the workflow.
 * Header does not auto-hide; stepper tabs collapse on mobile; body is the active step's `content`.
 */
export function StepperLayout(props: StepperLayoutProps) {
  const {
    steps,
    defaultStep,
    onCancel,
    completeLabel,
    onComplete,
    onSaveAndExit,
    isDirty,
    allowNavigation,
    aiMode,
    ...headerProps
  } = props;
  const stepTabs = steps.map((step) => ({ ...step, value: defaultTestId(step.label) }));
  const [currentStep, setCurrentStep] = useState(() => getInitialStep(stepTabs, defaultStep));
  const tid = useTestIds(props, "stepperLayout");
  const { closeRightPane } = useRightPaneActions();

  const currentIndex = hasStep(stepTabs, currentStep) ? stepTabs.findIndex((step) => step.value === currentStep) : 0;
  const isFirstStep = currentIndex <= 0;
  const isLastStep = currentIndex >= stepTabs.length - 1;
  const activeStep = stepTabs[currentIndex];

  function goToStep(value: string) {
    if (value === currentStep) return;
    closeRightPane();
    setCurrentStep(value);
  }

  return (
    <WorkflowPageLayout
      {...tid}
      {...headerProps}
      aiMode={aiMode}
      stepperTabs={{ steps: stepTabs, currentStep, onChange: goToStep }}
      isDirty={isDirty}
      allowNavigation={allowNavigation}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      onBack={() => {
        const prev = stepTabs[currentIndex - 1];
        if (prev) goToStep(prev.value);
      }}
      onCancel={onCancel}
      onSaveAndExit={onSaveAndExit}
      completeLabel={completeLabel}
      onComplete={onComplete}
      primaryDisabled={activeStep?.primaryDisabled}
      rightPaneTriggers={activeStep?.rightPaneTriggers}
      onContinue={async () => {
        const onContinue = activeStep?.onContinue;
        if (onContinue) {
          const allowed = await onContinue();
          if (allowed === false) return;
        }
        const next = stepTabs[currentIndex + 1];
        if (next) goToStep(next.value);
      }}
    >
      {activeStep?.content}
    </WorkflowPageLayout>
  );
}

function hasStep(steps: { value: string }[], value: string | undefined): boolean {
  return steps.some((step) => step.value === value);
}

function getInitialStep(steps: { value: string }[], defaultStep: string | undefined): string {
  return defaultStep !== undefined && hasStep(steps, defaultStep) ? defaultStep : (steps[0]?.value ?? "");
}
