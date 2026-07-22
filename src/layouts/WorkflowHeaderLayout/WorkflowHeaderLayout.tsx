import { CSSProperties, ReactNode, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { WorkflowHeader, WorkflowHeaderProps } from "src/components/Headers/WorkflowHeader";
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

export type WorkflowHeaderLayoutProps = {
  /** Props for the `WorkflowHeader` rendered as the page-level header. */
  workflowHeader: WorkflowHeaderProps;
  /** Slot: main page body (e.g. `WorkflowLayout`). */
  children?: ReactNode;
};

/**
 * Workflow-header + body shell with sticky (always-visible) chrome. Contract: `docs/layouts.md`.
 *
 * A peer/replacement for `PageHeaderLayout` in the layout stack for workflow pages — nest it directly
 * under `SideNavLayout`/`NavbarLayout`, not inside `PageHeaderLayout` (which renders a different header
 * component). Unlike `PageHeaderLayout`, the header here never auto-hides; the only scroll-driven
 * behavior is collapsing the stepper tabs.
 */
export function WorkflowHeaderLayout(props: WorkflowHeaderLayoutProps) {
  const { workflowHeader, children } = props;
  const tid = useTestIds(props, "workflowHeaderLayout");
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
        stepperTabs={{ ...workflowHeader.stepperTabs, collapsed }}
      />
    ),
    [workflowHeader, isMobile, collapsed],
  );

  return (
    <DocumentScrollLayoutProvider>
      <div css={Css.df.fdc.w100.$} style={cssVars} {...tid}>
        {/* Spacer reserves height for the always-sticky header; also the geometry anchor for scroll-collapse. */}
        <div ref={spacerRef} css={Css.fs0.w100.$} style={{ height: headerHeight }} {...tid.spacer}>
          <div
            ref={headerMetricsRef}
            css={Css.fixed.left(headerLeft).w(headerWidth).z(zIndices.pageStickyHeader).$}
            style={{ top: outerTop } as CSSProperties}
            {...tid.header}
          >
            {headerEl}
          </div>
        </div>

        <div css={Css.df.fdc.fg1.mh0.w100.$} {...tid.body}>
          {children}

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

const mobileFooterHeightPx = 80;
