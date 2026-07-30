import { ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";
import { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { WorkflowHeader } from "src/components/Headers/WorkflowHeader";
import { StepperTabsStep } from "src/components/StepperTabs";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import { pageContentPaddingX } from "../layoutSpacing";
import {
  bannerAndNavbarChromeTop,
  beamPageHeaderLayoutHeightVar,
  beamWorkflowLayoutFooterHeightVar,
  documentScrollChromeWidth,
} from "../layoutVars";
import { useAutoHideOnScroll } from "../useAutoHideOnScroll";
import { useBannerAndNavbarHeight } from "../useBannerAndNavbarHeight";
import { useMeasuredHeight } from "../useMeasuredHeight";
import { WorkflowActions, WorkflowActionsProps } from "./WorkflowActions";

/** A `WorkflowLayout` step: a `StepperTabsStep` (minus `value`, derived from `label`, and `visited`, tracked internally as the user navigates) plus the page content rendered while it's active — `completed` also gates the Continue/Complete CTA when this is the active step. */
export type WorkflowLayoutStep = Omit<StepperTabsStep, "value" | "visited"> & {
  /** Rendered as the page body while this is the active step. */
  content: ReactNode;
};

export type WorkflowLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Pick<WorkflowActionsProps, "onCancel" | "completeLabel" | "onComplete" | "onSaveAndExit"> & {
    /** The workflow's steps; the active step's `content` is the body, and it drives the header's tab strip. */
    steps: WorkflowLayoutStep[];
    /** The step shown initially (matched against `defaultTestId(step.label)`); falls back to the first step if omitted or if it doesn't match any step. Uncontrolled — the layout owns step navigation from here. */
    defaultStep?: string;
  };

/**
 * Workflow-header + body shell with sticky (always-visible) chrome. Contract: `docs/layouts.md`.
 *
 * A standalone, full-page layout for step-based workflow pages — nest it directly under
 * `EnvironmentBannerLayout`, never under `NavbarLayout`/`SideNavLayout`/`PageHeaderLayout`. Unlike
 * `PageHeaderLayout`, the header here never auto-hides; the only scroll-driven behavior is collapsing
 * the stepper tabs.
 *
 * Owns the workflow's fixed CTA set (Back/Cancel/Save & Exit/Continue-or-Complete) via `WorkflowActions`
 * so it can move them into a mobile footer at the `sm` breakpoint — `WorkflowHeader` itself is not part
 * of the public API.
 */
export function WorkflowLayout(props: WorkflowLayoutProps) {
  const { steps, defaultStep, onCancel, completeLabel, onComplete, onSaveAndExit, ...headerProps } = props;
  const tid = useTestIds(props, "workflowLayout");
  const { sm: isMobile } = useBreakpoint();

  // Step state
  const baseTabSteps = steps.map((step) => ({ ...step, value: defaultTestId(step.label) }));
  const [currentStep, setCurrentStepValue] = useState(() => getInitialStep(baseTabSteps, defaultStep));
  // Tracks every step value `currentStep` has ever equaled, seeded with the initial step.
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(() => new Set([currentStep]));
  const tabSteps = baseTabSteps.map((step) => ({ ...step, visited: visitedSteps.has(step.value) }));

  function setCurrentStep(step: string) {
    setCurrentStepValue(step);
    setVisitedSteps((prev) => (prev.has(step) ? prev : new Set(prev).add(step)));
  }

  // Ref mirrors context so the scroll handler avoids per-scroll getComputedStyle.
  const bannerAndNavbarHeight = useBannerAndNavbarHeight();
  const bannerAndNavbarHeightRef = useRef(bannerAndNavbarHeight);
  bannerAndNavbarHeightRef.current = bannerAndNavbarHeight;
  const getBannerAndNavbarHeight = useCallback(() => bannerAndNavbarHeightRef.current, []);

  const headerMetricsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMeasuredHeight(headerMetricsRef, true);

  // Header stays always-sticky (unlike PageHeaderLayout, it never hides) — `state` is only consumed to
  // collapse the stepper tabs, not to reposition the header itself.
  const { state: scrollState } = useAutoHideOnScroll(spacerRef, true, getBannerAndNavbarHeight);
  const collapsed = scrollState === "hidden";

  const headerWidth = documentScrollChromeWidth();
  const outerTop = bannerAndNavbarChromeTop();

  const cssVars: Record<string, string> | undefined =
    headerHeight > 0 ? { [beamPageHeaderLayoutHeightVar]: `${headerHeight}px` } : undefined;

  // Guards against a stale `currentStep` (e.g. `steps` changed out from under it) resolving to no tab at all.
  const currentIndex = isValidStep(tabSteps, currentStep)
    ? tabSteps.findIndex((step) => step.value === currentStep)
    : 0;
  const isFirstStep = currentIndex <= 0;
  const isLastStep = currentIndex === tabSteps.length - 1;
  const activeStep = tabSteps[currentIndex];

  const buttons = (
    <WorkflowActions
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      isMobile={isMobile}
      onBack={() => setCurrentStep(tabSteps[currentIndex - 1].value)}
      onCancel={onCancel}
      onSaveAndExit={onSaveAndExit}
      completeLabel={completeLabel}
      onComplete={onComplete}
      primaryDisabled={!activeStep?.completed}
      onContinue={() => setCurrentStep(tabSteps[currentIndex + 1].value)}
    />
  );

  // On mobile, the CTAs move out of the header and into a fixed footer instead. Cancel always renders,
  // so unlike a free-form rightSlot there's never an "empty" case to guard against.
  const showFooter = isMobile;

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.style.getPropertyValue(beamWorkflowLayoutFooterHeightVar);
    root.style.setProperty(beamWorkflowLayoutFooterHeightVar, showFooter ? `${mobileFooterHeightPx}px` : "0px");
    return () => {
      if (previous) {
        root.style.setProperty(beamWorkflowLayoutFooterHeightVar, previous);
      } else {
        root.style.removeProperty(beamWorkflowLayoutFooterHeightVar);
      }
    };
  }, [showFooter]);

  const headerEl = (
    <WorkflowHeader
      {...headerProps}
      rightSlot={isMobile ? undefined : buttons}
      stepperTabs={{ steps: tabSteps, currentStep, onChange: setCurrentStep, collapsed }}
    />
  );

  return (
    <DocumentScrollLayoutProvider>
      <div css={Css.df.fdc.w100.$} style={cssVars} {...tid}>
        {/* Spacer reserves height for the always-sticky header; also the geometry anchor for scroll-collapse. */}
        <div ref={spacerRef} css={Css.fs0.w100.$} style={{ height: headerHeight }} {...tid.spacer}>
          <div
            ref={headerMetricsRef}
            css={Css.fixed.w(headerWidth).z(zIndices.pageStickyHeader).top(outerTop).$}
            {...tid.header}
          >
            {headerEl}
          </div>
        </div>

        <div css={Css.df.fdc.fg1.mh0.w100.$} {...tid.body}>
          {activeStep?.content}
        </div>

        {/* Spacer so body content isn't hidden behind the fixed mobile footer. */}
        {showFooter && <div css={Css.fs0.w100.hPx(mobileFooterHeightPx).$} />}

        {showFooter && (
          <div
            css={{
              ...Css.fixed.bottom0
                .w(headerWidth)
                .hPx(mobileFooterHeightPx)
                .z(zIndices.pageStickyFooter)
                .df.aic.jcfe.gap1.bt.bc(Tokens.SurfaceSeparator)
                .bgColor(Tokens.Surface).$,
              ...pageContentPaddingX,
            }}
            {...tid.footer}
          >
            {buttons}
          </div>
        )}
      </div>
    </DocumentScrollLayoutProvider>
  );
}

const mobileFooterHeightPx = 80;

function isValidStep(steps: { value: string }[], value: string | undefined): boolean {
  return steps.some((step) => step.value === value);
}

function getInitialStep(steps: { value: string }[], defaultStep: string | undefined): string {
  return defaultStep !== undefined && isValidStep(steps, defaultStep) ? defaultStep : steps[0]?.value;
}
