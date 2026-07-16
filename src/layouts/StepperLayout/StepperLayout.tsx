import React, { ReactNode, useMemo } from "react";
import { ScrollableContent } from "src/components/Layout/ScrollableContent";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import { useDocumentScrollLayout } from "../DocumentScrollLayoutContext";

export type StepperLayoutStep = {
  value: string;
  /** Rendered only while this step is `currentStep`. Opaque to StepperLayout — may use form-state internally. */
  content: ReactNode;
};

export type StepperLayoutProps = {
  steps: StepperLayoutStep[];
  currentStep: StepperLayoutStep["value"];
  /** Renders the active step's content at full width instead of the centered 720px column. */
  fullWidthContent?: boolean;
};

const contentMaxWidthPx = 720;

/**
 * A layout component that renders the active step's content for a step-based workflow.
 *
 * Expects to be wrapped by other layouts (e.g. `PageHeaderLayout`) the same way `GridTableLayout`
 * does — it fills its container rather than assuming the full viewport, and adapts its scroll
 * behavior based on whether it's nested inside a Beam document-scroll layout. The stepper's own
 * tab strip and CTAs are expected to live in the wrapping `PageHeaderLayout`'s `PageHeader`
 * (`stepperTabs`/`rightSlot`), not in `StepperLayout` itself.
 */
function StepperLayoutComponent(props: StepperLayoutProps) {
  const { steps, currentStep, fullWidthContent = false } = props;
  const tid = useTestIds(props, "stepperLayout");

  const activeStep = useMemo(() => steps.find((s) => s.value === currentStep), [steps, currentStep]);

  const inDocumentScrollLayout = useDocumentScrollLayout();

  const content = (
    <div css={fullWidthContent ? Css.w100.$ : Css.mx("auto").maxwPx(contentMaxWidthPx).w100.$} {...tid.content}>
      {activeStep?.content}
    </div>
  );

  return inDocumentScrollLayout ? content : <ScrollableContent>{content}</ScrollableContent>;
}

export const StepperLayout = React.memo(StepperLayoutComponent);
