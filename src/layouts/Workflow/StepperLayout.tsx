import { ReactNode, useState } from "react";
import { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { StepperTabsStep } from "src/components/StepperTabs";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { WorkflowActionsProps } from "./WorkflowActions";
import { WorkflowPageLayout } from "./WorkflowPageLayout";

/**
 * A `StepperLayout` step: a `StepperTabsStep` (minus `value`, which is derived from `label`) plus
 * page content. Stepper chrome marks prior steps complete via current-step index; `isValid` only
 * gates the Continue/Complete CTA for the active step.
 */
export type StepperLayoutStep = Omit<StepperTabsStep, "value"> & {
  /** Rendered as the page body while this is the active step. */
  content: ReactNode;
  /** Gates Continue/Complete for the active step (form validity) */
  isValid: boolean;
};

export type StepperLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Pick<WorkflowActionsProps, "onCancel" | "completeLabel" | "onComplete" | "onSaveAndExit"> & {
    /** The workflow's steps; the active step's `content` is the body, and it drives the header's tab strip. */
    steps: StepperLayoutStep[];
    /** The step shown initially (matched against `defaultTestId(step.label)`); falls back to the first step if omitted or if it doesn't match any step. Uncontrolled — the layout owns step navigation from here. */
    defaultStep?: string;
    /** Read on Cancel / leave — a callback so flipping dirty does not re-render. */
    isDirty?: () => boolean;
    /** Full-bleed AI wash on the body. Pair with `aiMode` on a step's `FormSectionLayout`. */
    aiMode?: boolean;
  };

/**
 * Standalone step-based workflow page. Contract: `docs/layouts.md`.
 * Nest under `EnvironmentBannerLayout` only — no navbar/side nav, so attention stays on the workflow.
 * Header does not auto-hide; stepper tabs collapse on mobile; body is the active step's `content`.
 */
export function StepperLayout(props: StepperLayoutProps) {
  const { steps, defaultStep, onCancel, completeLabel, onComplete, onSaveAndExit, isDirty, aiMode, ...headerProps } =
    props;
  const stepTabs = steps.map((step) => ({ ...step, value: defaultTestId(step.label) }));
  const [currentStep, setCurrentStep] = useState(() => getInitialStep(stepTabs, defaultStep));
  const tid = useTestIds(props, "stepperLayout");

  const currentIndex = hasStep(stepTabs, currentStep) ? stepTabs.findIndex((step) => step.value === currentStep) : 0;
  const isFirstStep = currentIndex <= 0;
  const isLastStep = currentIndex >= stepTabs.length - 1;
  const activeStep = stepTabs[currentIndex];

  return (
    <WorkflowPageLayout
      {...tid}
      {...headerProps}
      aiMode={aiMode}
      stepperTabs={{ steps: stepTabs, currentStep, onChange: setCurrentStep }}
      isDirty={isDirty}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      onBack={() => {
        const prev = stepTabs[currentIndex - 1];
        if (prev) setCurrentStep(prev.value);
      }}
      onCancel={onCancel}
      onSaveAndExit={onSaveAndExit}
      completeLabel={completeLabel}
      onComplete={onComplete}
      primaryDisabled={!activeStep?.isValid}
      onContinue={async () => {
        const onContinue = activeStep?.onContinue;
        if (onContinue) {
          const allowed = await onContinue();
          if (allowed === false) return;
        }
        const next = stepTabs[currentIndex + 1];
        if (next) setCurrentStep(next.value);
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
