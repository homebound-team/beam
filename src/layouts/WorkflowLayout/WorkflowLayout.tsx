import { ReactNode, useLayoutEffect, useRef, useState } from "react";
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
import { useBannerAndNavbarHeight } from "../useBannerAndNavbarHeight";
import { useMeasuredHeight } from "../useMeasuredHeight";
import { WorkflowActions, WorkflowActionsProps } from "./WorkflowActions";

/** A `WorkflowLayout` step: a `StepperTabsStep` (minus `value`, which is derived from `label`) plus the page content rendered while it's active — `completed` also gates the Continue/Complete CTA when this is the active step. */
export type WorkflowLayoutStep = Omit<StepperTabsStep, "value"> & {
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
 * `PageHeaderLayout`, the header here never auto-hides. The stepper tabs always collapse to a condensed
 * indicator bar on mobile, and on larger viewports also collapse once scrolled past a threshold,
 * re-expanding on scroll-up (even before reaching the top).
 *
 * Owns the workflow's fixed CTA set (Back/Cancel/Save & Exit/Continue-or-Complete) via `WorkflowActions`
 * so it can move them into a mobile footer at the `sm` breakpoint — `WorkflowHeader` itself is not part
 * of the public API.
 */
export function WorkflowLayout(props: WorkflowLayoutProps) {
  const { steps, defaultStep, onCancel, completeLabel, onComplete, onSaveAndExit, ...headerProps } = props;
  const tabSteps = steps.map((step) => ({ ...step, value: defaultTestId(step.label) }));
  const [currentStep, setCurrentStep] = useState(() => getInitialStep(tabSteps, defaultStep));
  const tid = useTestIds(props, "workflowLayout");
  const { sm: isMobile } = useBreakpoint();

  const bannerAndNavbarHeight = useBannerAndNavbarHeight();
  // Ref mirrors so the scroll handler always reads the latest value without resubscribing — critical
  // here since `headerHeight` itself changes as a *result* of collapsing/expanding (see below).
  const bannerAndNavbarHeightRef = useRef(bannerAndNavbarHeight);
  bannerAndNavbarHeightRef.current = bannerAndNavbarHeight;

  const headerMetricsRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMeasuredHeight(headerMetricsRef, true);
  const headerHeightRef = useRef(headerHeight);
  headerHeightRef.current = headerHeight;

  // Header stays always-sticky (unlike PageHeaderLayout, it never hides) — the only scroll-driven
  // behavior is collapsing the stepper tabs. No DOM anchor/rect is needed: WorkflowLayout is only ever
  // nested directly under `EnvironmentBannerLayout` (never NavbarLayout/SideNavLayout), so the header's
  // resting position is always exactly `bannerAndNavbarHeight + headerHeight` px below the true document
  // top — pure `window.scrollY` arithmetic determines the collapse point.
  const [scrolledPastThreshold, setScrolledPastThreshold] = useState(
    () => typeof window !== "undefined" && window.scrollY > 0,
  );
  const scrolledPastThresholdRef = useRef(scrolledPastThreshold);
  scrolledPastThresholdRef.current = scrolledPastThreshold;
  // +Infinity so the first scroll check reads as "up" — a deep link / browser scroll-restore landing
  // mid-page expands the tabs rather than assuming collapsed.
  const lastScrollYRef = useRef(Number.POSITIVE_INFINITY);
  const lastScrollHeightRef = useRef(0);

  // The header is sticky (in-flow), so expanding/collapsing the tabs changes its own height, which
  // changes `document.documentElement.scrollHeight`. Resync the layout-shift baseline whenever that
  // happens — otherwise the very next scroll tick would mistake the header's own height change for an
  // unrelated layout shift (e.g. a table row expanding) and immediately re-collapse right after
  // expanding, fighting the scroll-up gesture that just expanded it.
  useLayoutEffect(() => {
    lastScrollHeightRef.current = document.documentElement.scrollHeight;
  }, [headerHeight]);

  useLayoutEffect(() => {
    // Mobile always collapses regardless of scroll (see `collapsed` below) — no need to track scroll.
    if (isMobile) return;

    const setScrolledPastThresholdIfChanged = (next: boolean) => {
      if (next !== scrolledPastThresholdRef.current) {
        scrolledPastThresholdRef.current = next;
        setScrolledPastThreshold(next);
      }
    };

    const updateScrolledPastThreshold = () => {
      const doc = document.documentElement;
      const currentY = window.scrollY;
      const threshold = bannerAndNavbarHeightRef.current + headerHeightRef.current + SCROLL_COLLAPSE_THRESHOLD_PX;

      // Top of page (or iOS rubber-band overscroll) — always expanded.
      if (currentY <= 0) {
        lastScrollYRef.current = 0;
        lastScrollHeightRef.current = doc.scrollHeight;
        setScrolledPastThresholdIfChanged(false);
        return;
      }

      const currentScrollHeight = doc.scrollHeight;
      const scrollHeightChanged =
        lastScrollHeightRef.current !== 0 && currentScrollHeight !== lastScrollHeightRef.current;
      const dy = currentY - lastScrollYRef.current;
      lastScrollYRef.current = currentY;
      lastScrollHeightRef.current = currentScrollHeight;

      if (currentY <= threshold) return; // Not past the engagement zone yet — leave state as-is.

      if (scrollHeightChanged) {
        // Content resized underneath the scroll position (e.g. a table row expanded, or rows filtered)
        // rather than a real scroll gesture — only ever collapse from this, never spuriously re-expand.
        setScrolledPastThresholdIfChanged(true);
        return;
      }

      const atBottom = currentY >= doc.scrollHeight - doc.clientHeight;
      // Only flip on vertical movement — horizontal-only scroll fires with dy === 0, leaving it unchanged.
      if (dy > 0) setScrolledPastThresholdIfChanged(true);
      else if (dy < 0 && !atBottom) setScrolledPastThresholdIfChanged(false);
    };

    updateScrolledPastThreshold();
    window.addEventListener("scroll", updateScrolledPastThreshold, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledPastThreshold);
  }, [isMobile]);

  // Mobile always shows the condensed indicator bar (screen space is tight regardless of scroll);
  // otherwise collapse once scrolled past the engagement threshold, matching the hysteresis a scroll
  // listener needs: stays collapsed until scrolled back up (even before reaching the top) or to the top.
  const collapsed = isMobile || scrolledPastThreshold;

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
        <div
          ref={headerMetricsRef}
          css={Css.sticky.left0.w(headerWidth).z(zIndices.pageStickyHeader).top(outerTop).$}
          {...tid.header}
        >
          {headerEl}
        </div>

        <div css={Css.df.fdc.fg1.mh0.w100.$} {...tid.body}>
          {activeStep?.content}
        </div>

        {/* Spacer so body content isn't hidden behind the fixed mobile footer. */}
        {showFooter && (
          <div css={Css.fs0.w100.hPx(mobileFooterHeightPx).$}>
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
          </div>
        )}
      </div>
    </DocumentScrollLayoutProvider>
  );
}

const mobileFooterHeightPx = 80;

// Distance past the header's resting position before the stepper tabs collapse.
const SCROLL_COLLAPSE_THRESHOLD_PX = 80;

function isValidStep(steps: { value: string }[], value: string | undefined): boolean {
  return steps.some((step) => step.value === value);
}

function getInitialStep(steps: { value: string }[], defaultStep: string | undefined): string {
  return defaultStep !== undefined && isValidStep(steps, defaultStep) ? defaultStep : steps[0]?.value;
}
