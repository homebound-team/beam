import React, { ReactNode, useMemo } from "react";
import { ScrollableContent } from "src/components/Layout/ScrollableContent";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import { useDocumentScrollLayout } from "../DocumentScrollLayoutContext";

export type WorkflowLayoutStep = {
  value: string;
  /**
   * Tab-strip fields, kept here even though `WorkflowLayout` itself only reads `value`/`heading`/
   * `description`/`content` — consumers define one canonical steps array and derive `StepperTabsStep[]`
   * for `WorkflowHeaderLayout`'s `workflowHeader.stepperTabs` via a small `.map()`, instead of
   * maintaining two independently-authored step lists.
   */
  label: string;
  completed: boolean;
  disabled?: boolean;
  /** Rendered above `description`/`content`, inside the same width-capped column. */
  heading?: ReactNode;
  /** Rendered above `content`, below `heading`, inside the same width-capped column. */
  description?: ReactNode;
  /** Rendered only while this step is `currentStep`. Opaque to WorkflowLayout — may use form-state internally. */
  content: ReactNode;
};

export type WorkflowLayoutProps = {
  steps: WorkflowLayoutStep[];
  currentStep: WorkflowLayoutStep["value"];
  /** Renders the active step's content at full width instead of the centered 720px column. */
  fullWidthContent?: boolean;
};

/**
 * A layout component that renders the active step's content for a step-based workflow.
 *
 * Expects to be wrapped by other layouts (e.g. `WorkflowHeaderLayout`) the same way `GridTableLayout`
 * does — it fills its container rather than assuming the full viewport, and adapts its scroll behavior
 * based on whether it's nested inside a Beam document-scroll layout. The stepper's own tab strip and
 * CTAs are expected to live in the wrapping `WorkflowHeaderLayout`'s `WorkflowHeader`
 * (`stepperTabs`/`rightSlot`), not in `WorkflowLayout` itself.
 */
function WorkflowLayoutComponent(props: WorkflowLayoutProps) {
  const { steps, currentStep, fullWidthContent = false } = props;
  const tid = useTestIds(props, "workflowLayout");

  const activeStep = useMemo(() => steps.find((s) => s.value === currentStep), [steps, currentStep]);

  const inDocumentScrollLayout = useDocumentScrollLayout();

  const content = (
    <div css={fullWidthContent ? Css.w100.$ : Css.mx("auto").maxwPx(contentMaxWidthPx).w100.$} {...tid.content}>
      {activeStep?.heading && (
        <h2 css={Css.lg.fw6.mb1.$} {...tid.stepHeading}>
          {activeStep.heading}
        </h2>
      )}
      {activeStep?.description && (
        <p css={Css.gray700.mb3.$} {...tid.stepDescription}>
          {activeStep.description}
        </p>
      )}
      {activeStep?.content}
    </div>
  );

  return inDocumentScrollLayout ? content : <ScrollableContent>{content}</ScrollableContent>;
}

export const WorkflowLayout = React.memo(WorkflowLayoutComponent);

const contentMaxWidthPx = 720;
