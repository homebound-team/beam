import type { ReactNode } from "react";
import type { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { useTestIds } from "src/utils/useTestIds";
import type { RightPaneTrigger } from "./RightPaneTriggers";
import type { AllowNavigationArgs } from "./useUnsavedChangesGuard";
import type { WorkflowActionsProps } from "./WorkflowActions";
import { WorkflowPageLayout } from "./WorkflowPageLayout";

export type FocusedFormLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Pick<WorkflowActionsProps, "onCancel" | "completeLabel" | "onComplete" | "onSaveAndExit"> & {
    /** Create/Save is disabled. A ReactNode is shown in Beam's tooltip. */
    primaryDisabled?: WorkflowActionsProps["primaryDisabled"];
    /** Read on Cancel / leave — a callback so flipping dirty does not re-render. */
    isDirty?: () => boolean;
    /** Consulted only while dirty — return true to allow a route change that stays on this form. */
    allowNavigation?: (args: AllowNavigationArgs) => boolean;
    /** Full-bleed AI wash on the body and the `ai` Create/Save variant. Pair with body `aiMode` (e.g. FormSectionLayout). */
    aiMode?: boolean;
    /** Icon triggers that open the document-scroll right pane. Hosts the pane — do not also set `withRightPane` on the body. */
    rightPaneTriggers?: RightPaneTrigger[];
    /** Page body — typically {@link FormSectionLayout} (optionally with `withJumpLinks` / `withRightPane`). */
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
    completeLabel,
    onComplete,
    onSaveAndExit,
    primaryDisabled,
    isDirty,
    allowNavigation,
    aiMode,
    rightPaneTriggers,
    children,
    ...headerProps
  } = props;
  const tid = useTestIds(props, "focusedFormLayout");

  return (
    <WorkflowPageLayout
      {...tid}
      {...headerProps}
      aiMode={aiMode}
      isDirty={isDirty}
      allowNavigation={allowNavigation}
      onCancel={onCancel}
      onSaveAndExit={onSaveAndExit}
      completeLabel={completeLabel}
      onComplete={onComplete}
      primaryDisabled={primaryDisabled}
      rightPaneTriggers={rightPaneTriggers}
    >
      {children}
    </WorkflowPageLayout>
  );
}
