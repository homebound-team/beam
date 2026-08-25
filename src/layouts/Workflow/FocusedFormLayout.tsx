import { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { DocumentScrollRightPaneLayout } from "src/components/Layout/RightPaneLayout/DocumentScrollRightPaneLayout";
import { resolveWithRightPaneOptions } from "src/components/Layout/RightPaneLayout/documentScrollRightPaneMode";
import { WithRightPane } from "src/components/Layout/RightPaneLayout/types";
import { Css } from "src/Css";
import { FormSectionProps } from "src/forms/FormSection";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { centeredShellMaxPx } from "src/layouts/CenteredLayout/CenteredLayout";
import { FormSectionLayout, FormSectionLayoutProps } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { JumpLinksRail, jumpLinksRailWidthPx } from "./JumpLinksRail";
import { useActiveJumpLink } from "./useActiveJumpLink";
import { WorkflowActionsProps } from "./WorkflowActions";
import { WorkflowPageLayout } from "./WorkflowPageLayout";

type FocusedFormSection = FormSectionProps & {
  /** When true, omit this section from the JumpLinks rail. */
  excludeJumpLink?: boolean;
};

export type FocusedFormLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Pick<WorkflowActionsProps, "onCancel" | "completeLabel" | "onComplete" | "onSaveAndExit"> & {
    /** Gates the Create/Save CTA. */
    isValid: boolean;
    /** Read on Cancel / leave — a callback so flipping dirty does not re-render. */
    isDirty?: () => boolean;
    /** When false, never show the JumpLinks rail. */
    withJumpLinks?: boolean;
    /**
     * Opt into the document-scroll detail pane (`useRightPane`). Hosts JumpLinks + form together
     * (default mode `auto`). Do not also set `withRightPane` on the nested form.
     */
    withRightPane?: WithRightPane;
    /** Page wash, `ai` CTA, and forwarded to `form`. */
    aiMode?: boolean;
    form: Omit<FormSectionLayoutProps, "sections" | "withRightPane"> & { sections?: FocusedFormSection[] };
  };

/**
 * Standalone single-form workflow page. Contract: `docs/layouts.md`.
 * Nest under `EnvironmentBannerLayout` only — no navbar/side nav, so attention stays on the form.
 */
export function FocusedFormLayout(props: FocusedFormLayoutProps) {
  const {
    onCancel,
    completeLabel,
    onComplete,
    onSaveAndExit,
    isValid,
    isDirty,
    withJumpLinks = true,
    withRightPane,
    aiMode,
    form,
    ...headerProps
  } = props;
  const tid = useTestIds(props, "focusedFormLayout");
  const { sm: isMobile } = useBreakpoint();
  const rightPane = resolveWithRightPaneOptions(withRightPane, "auto");

  const jumpLinks = (form.sections ?? [])
    .filter((section) => !section.excludeJumpLink)
    .map((section) => {
      const id = defaultTestId(section.title);
      return { id, label: section.title };
    });
  const activeId = useActiveJumpLink(jumpLinks.map((link) => link.id));
  const showRail = withJumpLinks && jumpLinks.length >= 2 && !isMobile;

  const body = (
    <div css={Css.df.w100.$}>
      {showRail && <JumpLinksRail links={jumpLinks} activeId={activeId} {...tid.jumpLinks} />}
      <div css={Css.fg1.mw0.mb4.$}>
        <FormSectionLayout {...form} aiMode={aiMode} />
      </div>
    </div>
  );

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
      primaryDisabled={!isValid}
    >
      {rightPane ? (
        <DocumentScrollRightPaneLayout
          paneWidth={rightPane.width}
          mode={rightPane.mode}
          shellMaxPx={centeredShellMaxPx.sm}
          jumpLinksWidthPx={showRail ? jumpLinksRailWidthPx : 0}
        >
          {body}
        </DocumentScrollRightPaneLayout>
      ) : (
        body
      )}
    </WorkflowPageLayout>
  );
}
