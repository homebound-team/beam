import { ReactNode, useLayoutEffect, useRef } from "react";
import { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { WorkflowHeader } from "src/components/Headers/WorkflowHeader";
import { StepperTabsProps } from "src/components/StepperTabs";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import { pageContentPaddingX } from "../layoutSpacing";
import {
  bannerAndNavbarChromeTop,
  beamPageHeaderLayoutHeightVar,
  beamWorkflowLayoutFooterHeightVar,
  documentScrollBodyMinHeight,
  documentScrollChromeWidth,
} from "../layoutVars";
import { useMeasuredHeight } from "../useMeasuredHeight";
import { UnsavedChangesNavigationModal, useUnsavedChangesGuard } from "./useUnsavedChangesGuard";
import { WorkflowActions, WorkflowActionsProps } from "./WorkflowActions";

export type WorkflowPageLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Omit<WorkflowActionsProps, "aiMode"> & {
    stepperTabs?: StepperTabsProps;
    /** Full-bleed AI wash on the body, and the `ai` Continue/Complete variant. */
    aiMode?: boolean;
    /** When this returns true, Cancel / in-app route changes / tab close require confirmation. */
    isDirty?: () => boolean;
    children: ReactNode;
  };

const mobileFooterHeightPx = 80;

/** Internal sticky header + mobile footer + optional AI wash. Not part of the public API. */
export function WorkflowPageLayout(props: WorkflowPageLayoutProps) {
  const { stepperTabs, aiMode, isDirty, children, title, documentTitleSuffix, breadcrumbs, onCancel, ...actionProps } =
    props;
  const tid = useTestIds(props, "workflowPageLayout");
  const { sm: isMobile } = useBreakpoint();
  const { onCancelClick, navigationBlocker } = useUnsavedChangesGuard({ isDirty, onCancel });
  const actions = <WorkflowActions {...actionProps} aiMode={aiMode} onCancel={onCancelClick} />;

  const headerMetricsRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMeasuredHeight(headerMetricsRef, true);

  const headerWidth = documentScrollChromeWidth();
  const outerTop = bannerAndNavbarChromeTop();

  const cssVars: Record<string, string> | undefined =
    headerHeight > 0 ? { [beamPageHeaderLayoutHeightVar]: `${headerHeight}px` } : undefined;

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
      <div css={Css.df.fdc.w100.$} style={cssVars} {...tid}>
        <div
          ref={headerMetricsRef}
          css={Css.sticky.left0.w(headerWidth).z(zIndices.pageStickyHeader).top(outerTop).$}
          {...tid.header}
        >
          <WorkflowHeader
            title={title}
            documentTitleSuffix={documentTitleSuffix}
            breadcrumbs={breadcrumbs}
            rightSlot={isMobile ? undefined : actions}
            stepperTabs={stepperTabs}
          />
        </div>

        <div
          css={{
            ...Css.df.fdc.fg1.mh0.w100.pt4.ifMdAndUp.pt6.$,
            ...(aiMode && Css.aiBackground.mh(documentScrollBodyMinHeight()).$),
          }}
          {...tid.body}
        >
          {children}
        </div>

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
