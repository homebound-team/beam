import type { PressEvent } from "@react-types/shared";
import { ReactNode, useCallback, useLayoutEffect, useRef } from "react";
import { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { WorkflowHeader } from "src/components/Headers/WorkflowHeader";
import { StepperTabsProps } from "src/components/StepperTabs";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import {
  bannerAndNavbarChromeTop,
  beamPageHeaderLayoutHeightVar,
  beamWorkflowLayoutFooterHeightVar,
  documentScrollChromeWidth,
} from "../layoutVars";
import { useAutoHideOnScroll } from "../useAutoHideOnScroll";
import { useBannerAndNavbarHeight } from "../useBannerAndNavbarHeight";
import { useMeasuredHeight } from "../useMeasuredHeight";
import { WorkflowActions } from "./WorkflowActions";

export type WorkflowHeaderConfig = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> & {
  stepperTabs: StepperTabsProps;
  /** Disables the Continue button, e.g. while the current step is invalid. ReactNode is shown as a tooltip. */
  continueDisabled?: boolean | ReactNode;
  /** Leaves the workflow without saving. Always shown. */
  onCancel: (e: PressEvent) => void;
  /** Label for the completion button shown on the last step. */
  completeLabel: "Create" | "Save";
  /** Called when the completion button is clicked. Only shown on the last step. */
  onComplete: (e: PressEvent) => void | Promise<void>;
  /** Disables the completion button. ReactNode is shown as a tooltip. */
  completeDisabled?: boolean | ReactNode;
  /** Whether Save & Exit is available on the current step. Default false. */
  canExitEarly?: boolean;
  /** Saves partial progress and exits. Used whenever canExitEarly is true. */
  onSaveAndExit?: (e: PressEvent) => void | Promise<void>;
};

export type WorkflowLayoutProps = {
  /** Config for the `WorkflowHeader` rendered as the page-level header, and its CTAs (Back/Cancel/Save & Exit/Continue/Complete). */
  workflowHeader: WorkflowHeaderConfig;
  /** Slot: main page body. */
  children?: ReactNode;
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
  const { children } = props;
  const {
    stepperTabs,
    continueDisabled,
    onCancel,
    completeLabel,
    onComplete,
    completeDisabled,
    canExitEarly = false,
    onSaveAndExit,
    ...headerProps
  } = props.workflowHeader;
  const tid = useTestIds(props, "workflowLayout");
  const { sm: isMobile } = useBreakpoint();

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

  const { steps, currentStep, onChange } = stepperTabs;
  const currentIndex = steps.findIndex((step) => step.value === currentStep);
  const isFirstStep = currentIndex <= 0;
  const isLastStep = currentIndex === steps.length - 1;

  const buttons = (
    <WorkflowActions
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      isMobile={isMobile}
      onBack={() => onChange(steps[currentIndex - 1].value)}
      onCancel={onCancel}
      canExitEarly={canExitEarly}
      onSaveAndExit={onSaveAndExit}
      completeLabel={completeLabel}
      onComplete={onComplete}
      completeDisabled={completeDisabled}
      onContinue={() => onChange(steps[currentIndex + 1].value)}
      continueDisabled={continueDisabled}
      tid={tid}
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
      stepperTabs={{ ...stepperTabs, collapsed }}
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
          {children}
        </div>

        {/* Spacer so body content isn't hidden behind the fixed mobile footer. */}
        {showFooter && <div css={Css.fs0.w100.hPx(mobileFooterHeightPx).$} />}

        {showFooter && (
          <div
            css={
              Css.fixed.bottom0
                .w(headerWidth)
                .hPx(mobileFooterHeightPx)
                .z(zIndices.pageStickyFooter)
                .df.aic.jcfe.gap1.px3.bt.bc(Tokens.SurfaceSeparator)
                .bgColor(Tokens.Surface).$
            }
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
