import type { ReactNode } from "react";
import type { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import type { PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import { useTestIds } from "src/utils/useTestIds";
import type { RightPaneTrigger } from "./RightPaneTriggers";
import type { AllowNavigationArgs } from "./useUnsavedChangesGuard";
import type { WorkflowActionsProps } from "./WorkflowActions";
import { WorkflowPageLayout } from "./WorkflowPageLayout";

export type FocusedFormLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Pick<
    WorkflowActionsProps,
    "onCancel" | "onComplete" | "onSaveAndExit" | "destructiveAction" | "completeLabel" | "nonStandardCompleteLabel"
  > & {
    /** Create/Save/Publish is disabled. A ReactNode is shown in Beam's tooltip. */
    primaryDisabled?: WorkflowActionsProps["primaryDisabled"];
    /** Read on Cancel / leave — a callback so flipping dirty does not re-render. */
    isDirty?: () => boolean;
    /** Consulted only while dirty — return true to allow a route change that stays on this form. */
    allowNavigation?: (args: AllowNavigationArgs) => boolean;
    /** Full-bleed AI wash on the body and the `ai` Create/Save/Publish variant. Pair with body `aiMode` (e.g. FormSectionLayout). */
    aiMode?: boolean;
    /** Icon triggers that open the document-scroll right pane. Hosts the pane — do not also set `withRightPane` on the body. */
    rightPaneTriggers?: RightPaneTrigger[];
    /** Stay-pinned status banner under the workflow header. */
    banner?: PageBannerProps;
    /** Page body — typically {@link FormSectionLayout} (optionally with `withJumpLinks`). */
    children: ReactNode;
  };

/**
 * Standalone workflow page without steps: workflow header + body.
 * Nest under `EnvironmentBannerLayout` only. JumpLinks live on the body; `rightPaneTriggers`
 * hosts the pane at this layout. Contract: `docs/layouts.md`.
 */
export function FocusedFormLayout(props: FocusedFormLayoutProps) {
  const {
    onCancel,
    onComplete,
    onSaveAndExit,
    destructiveAction,
    primaryDisabled,
    isDirty,
    allowNavigation,
    aiMode,
    rightPaneTriggers,
    banner,
    children,
    title,
    documentTitleSuffix,
    breadcrumbs,
    completeLabel,
    nonStandardCompleteLabel,
  } = props;
  const tid = useTestIds(props, "focusedFormLayout");

  return (
    <WorkflowPageLayout
      {...tid}
      title={title}
      documentTitleSuffix={documentTitleSuffix}
      breadcrumbs={breadcrumbs}
      banner={banner}
      aiMode={aiMode}
      isDirty={isDirty}
      allowNavigation={allowNavigation}
      onCancel={onCancel}
      onSaveAndExit={onSaveAndExit}
      destructiveAction={destructiveAction}
      completeLabel={completeLabel}
      nonStandardCompleteLabel={nonStandardCompleteLabel}
      onComplete={onComplete}
      primaryDisabled={primaryDisabled}
      rightPaneTriggers={rightPaneTriggers}
    >
      {children}
    </WorkflowPageLayout>
  );
}
