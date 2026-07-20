import React, { CSSProperties, ReactNode, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { WorkflowHeader, WorkflowHeaderProps } from "src/components/Headers/WorkflowHeader";
import { StepperTabsStep } from "src/components/StepperTabs/StepperTabs";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import {
  bannerAndNavbarChromeTop,
  beamPageHeaderLayoutHeightVar,
  beamWorkflowLayoutFooterHeightVar,
  documentScrollChromeLeft,
  documentScrollChromeWidth,
} from "../layoutVars";
import { useAutoHideOnScroll } from "../useAutoHideOnScroll";
import { useBannerAndNavbarHeight } from "../useBannerAndNavbarHeight";
import { useMeasuredHeight } from "../useMeasuredHeight";

export type WorkflowLayoutStep = {
  value: string;
  label: string;
  /** Whether this step's required fields are filled out. Combined with `currentStep` to derive each tab's visual state. */
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
  onChange: (stepValue: string) => void;
  /** Props for the `WorkflowHeader` rendered as the page-level header, minus `stepperTabs` (derived from `steps`/`currentStep`/`onChange`). */
  workflowHeader: Omit<WorkflowHeaderProps, "stepperTabs">;
  /** Renders the active step's content at full width instead of the centered 720px column. */
  fullWidthContent?: boolean;
};

/**
 * Page header + step-content shell for step-based workflow pages. Contract: `docs/layouts.md`.
 *
 * A peer/replacement for `PageHeaderLayout` in the layout stack for workflow pages — nest it directly
 * under `SideNavLayout`/`NavbarLayout`, not inside `PageHeaderLayout` (which renders a different
 * header component). Unlike `PageHeaderLayout`, the header here never auto-hides; the only
 * scroll-driven behavior is collapsing the stepper tabs.
 */
function WorkflowLayoutComponent(props: WorkflowLayoutProps) {
  const { steps, currentStep, onChange, workflowHeader, fullWidthContent = false } = props;
  const tid = useTestIds(props, "workflowLayout");
  const { sm: isMobile } = useBreakpoint();

  const activeStep = useMemo(() => steps.find((s) => s.value === currentStep), [steps, currentStep]);

  const stepperTabsSteps: StepperTabsStep[] = useMemo(
    () => steps.map(({ value, label, completed, disabled }) => ({ value, label, completed, disabled })),
    [steps],
  );

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

  const headerLeft = documentScrollChromeLeft();
  const headerWidth = documentScrollChromeWidth();
  const outerTop = bannerAndNavbarChromeTop();

  const cssVars: Record<string, string> | undefined =
    headerHeight > 0 ? { [beamPageHeaderLayoutHeightVar]: `${headerHeight}px` } : undefined;

  // On mobile, rightSlot buttons move out of the header and into a fixed footer instead.
  const footerButtons = isMobile ? workflowHeader.rightSlot : undefined;
  const showFooter = !!footerButtons && footerButtons.length > 0;

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

  const headerEl = useMemo(
    () => (
      <WorkflowHeader
        {...workflowHeader}
        rightSlot={isMobile ? undefined : workflowHeader.rightSlot}
        stepperTabs={{ steps: stepperTabsSteps, currentStep, onChange, collapsed }}
      />
    ),
    [workflowHeader, isMobile, stepperTabsSteps, currentStep, onChange, collapsed],
  );

  const contentCss = fullWidthContent ? Css.w100.$ : Css.mx("auto").maxwPx(contentMaxWidthPx).w100.$;

  return (
    <DocumentScrollLayoutProvider>
      <div css={Css.df.fdc.w100.$} style={cssVars} {...tid}>
        {/* Spacer reserves height for the always-sticky header; also the geometry anchor for scroll-collapse. */}
        <div ref={spacerRef} css={Css.fs0.w100.$} style={{ height: headerHeight }} {...tid.spacer}>
          <div
            ref={headerMetricsRef}
            css={Css.sticky.left(headerLeft).w(headerWidth).z(zIndices.pageStickyHeader).$}
            style={{ top: outerTop } as CSSProperties}
            {...tid.header}
          >
            {headerEl}
          </div>
        </div>

        <div css={Css.df.fdc.fg1.mh0.w100.$} {...tid.body}>
          <div css={contentCss} {...tid.content}>
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

          {/* Spacer so body content isn't hidden behind the fixed mobile footer. */}
          {showFooter && <div css={Css.fs0.w100.hPx(mobileFooterHeightPx).$} />}
        </div>

        {showFooter && (
          <div
            css={
              Css.fixed.bottom0
                .left(headerLeft)
                .w(headerWidth)
                .hPx(mobileFooterHeightPx)
                .z(zIndices.pageStickyFooter)
                .df.aic.jcfe.gap1.px3.bt.bc(Tokens.SurfaceSeparator)
                .bgColor(Tokens.Surface).$
            }
            {...tid.footer}
          >
            {footerButtons!.map((buttonProps: ButtonProps, i: number) => (
              <Button key={typeof buttonProps.label === "string" ? buttonProps.label : i} {...buttonProps} />
            ))}
          </div>
        )}
      </div>
    </DocumentScrollLayoutProvider>
  );
}

export const WorkflowLayout = React.memo(WorkflowLayoutComponent);

const contentMaxWidthPx = 720;
const mobileFooterHeightPx = 80;
