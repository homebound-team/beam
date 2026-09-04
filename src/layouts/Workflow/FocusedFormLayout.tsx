import { ReactNode } from "react";
import { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { useTestIds } from "src/utils";
import { WorkflowActionsProps } from "./WorkflowActions";
import { WorkflowPageLayout } from "./WorkflowPageLayout";

export type FocusedFormLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Pick<WorkflowActionsProps, "onCancel" | "completeLabel" | "onComplete" | "onSaveAndExit"> & {
    /** Create/Save is disabled. A ReactNode is shown in Beam's tooltip. */
    primaryDisabled?: WorkflowActionsProps["primaryDisabled"];
    /** Read on Cancel / leave — a callback so flipping dirty does not re-render. */
    isDirty?: () => boolean;
    /** Full-bleed AI wash on the body and the `ai` Create/Save variant. Pair with body `aiMode` (e.g. FormSectionLayout). */
    aiMode?: boolean;
    /** Page body — typically {@link FormSectionLayout} (optionally with `withJumpLinks` / `withRightPane`). */
    children: ReactNode;
  };

/**
 * Standalone workflow page without steps: workflow header + body.
 * Nest under `EnvironmentBannerLayout` only. JumpLinks and the right pane live on the body
 * (e.g. `FormSectionLayout withJumpLinks withRightPane`). Contract: `docs/layouts.md`.
 */
export function FocusedFormLayout(props: FocusedFormLayoutProps) {
  const {
    onCancel,
    completeLabel,
    onComplete,
    onSaveAndExit,
    primaryDisabled,
    isDirty,
    aiMode,
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
      onCancel={onCancel}
      onSaveAndExit={onSaveAndExit}
      completeLabel={completeLabel}
      onComplete={onComplete}
      primaryDisabled={primaryDisabled}
    >
      {children}
    </WorkflowPageLayout>
  );
}
