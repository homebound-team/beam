import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { BannerProps } from "src/components/Banner";
import type { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { WorkflowHeader } from "src/components/Headers/WorkflowHeader";
import { DocumentScrollOverlayRightPaneLayout } from "src/components/Layout/RightPaneLayout/DocumentScrollOverlayRightPaneLayout";
import type { StepperTabsProps } from "src/components/StepperTabs/StepperTabs";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { PageBannerSlot } from "src/layouts/PageBannerSlot";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import { pageContentPaddingX } from "../layoutSpacing";
import {
  bannerAndNavbarChromeTop,
  beamPageBannerHeightVar,
  beamPageHeaderLayoutHeightVar,
  beamWorkflowLayoutFooterHeightVar,
  documentScrollBodyMinHeight,
  documentScrollChromeWidth,
} from "../layoutVars";
import { useMeasuredHeight } from "../useMeasuredHeight";
import { WorkflowPageRightPaneTriggers, type RightPaneTrigger } from "./RightPaneTriggers";
import {
  UnsavedChangesNavigationModal,
  useUnsavedChangesGuard,
  type AllowNavigationArgs,
} from "./useUnsavedChangesGuard";
import { WorkflowActions, type WorkflowActionsProps } from "./WorkflowActions";

export type WorkflowPageLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Omit<WorkflowActionsProps, "aiMode"> & {
    stepperTabs?: StepperTabsProps;
    /** Stay-pinned status banner under the header. */
    banner?: BannerProps;
    /** Full-bleed AI wash on the body, and the `ai` Continue/Complete variant. */
    aiMode?: boolean;
    /** Read on Cancel / leave — a callback so flipping dirty does not re-render. */
    isDirty?: () => boolean;
    /** Consulted only while dirty — return true to allow a route change that stays on this form. */
    allowNavigation?: (args: AllowNavigationArgs) => boolean;
    /** Floating / header icon triggers that open the document-scroll right pane. Hosts the pane. */
    rightPaneTriggers?: RightPaneTrigger[];
    children: ReactNode;
  };

const mobileFooterHeightPx = 80;

/** Internal fixed header + mobile footer + optional AI wash. Not part of the public API. */
export function WorkflowPageLayout(props: WorkflowPageLayoutProps) {
  const {
    stepperTabs,
    aiMode,
    isDirty,
    allowNavigation,
    children,
    title,
    documentTitleSuffix,
    breadcrumbs,
    onCancel,
    rightPaneTriggers,
    banner,
    ...actionProps
  } = props;
  const tid = useTestIds(props, "workflowPageLayout");
  const { sm: isMobile } = useBreakpoint();
  const { onCancelClick, navigationBlocker } = useUnsavedChangesGuard({ isDirty, allowNavigation, onCancel });
  const actions = <WorkflowActions {...actionProps} aiMode={aiMode} onCancel={onCancelClick} />;
  const triggers = rightPaneTriggers ?? [];
  const pageTriggers = triggers.length > 0 ? <WorkflowPageRightPaneTriggers triggers={triggers} /> : undefined;

  const headerMetricsRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMeasuredHeight(headerMetricsRef, true);
  const bannerMetricsRef = useRef<HTMLDivElement>(null);
  const bannerHeight = useMeasuredHeight(bannerMetricsRef, banner != null);

  const headerWidth = documentScrollChromeWidth();
  const outerTop = bannerAndNavbarChromeTop();

  const cssVars: Record<string, string> = {};
  if (headerHeight > 0) {
    cssVars[beamPageHeaderLayoutHeightVar] = `${headerHeight}px`;
  }
  if (banner != null && bannerHeight > 0) {
    cssVars[beamPageBannerHeightVar] = `${bannerHeight}px`;
  }
  const style = Object.keys(cssVars).length > 0 ? cssVars : undefined;

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

  return (
    <DocumentScrollLayoutProvider>
      <div css={Css.df.fdc.w100.$} style={style} {...tid}>
        {/* In-flow spacer: the header is `fixed` so horizontal document scroll cannot move it. */}
        <div css={Css.fs0.w100.$} style={{ height: headerHeight }}>
          <div
            ref={headerMetricsRef}
            css={Css.fixed.left0.w(headerWidth).z(zIndices.pageStickyHeader).top(outerTop).transitionAll.$}
            {...tid.header}
          >
            <WorkflowHeader
              title={title}
              documentTitleSuffix={documentTitleSuffix}
              breadcrumbs={breadcrumbs}
              rightSlot={isMobile ? pageTriggers : actions}
              stepperTabs={stepperTabs}
            />
          </div>
        </div>
        {banner && <PageBannerSlot {...tid} banner={banner} metricsRef={bannerMetricsRef} />}

        <div
          css={{
            ...Css.df.fdc.fg1.mh0.w100.pt4.ifMdAndUp.pt6.$,
            ...(aiMode && Css.aiBackground.mh(documentScrollBodyMinHeight()).$),
          }}
          {...tid.body}
        >
          {triggers.length > 0 ? (
            <DocumentScrollOverlayRightPaneLayout>{children}</DocumentScrollOverlayRightPaneLayout>
          ) : (
            children
          )}
        </div>
        {!isMobile && pageTriggers}

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
              {actions}
            </div>
          </div>
        )}
      </div>
      {navigationBlocker && <UnsavedChangesNavigationModal {...navigationBlocker} />}
    </DocumentScrollLayoutProvider>
  );
}
