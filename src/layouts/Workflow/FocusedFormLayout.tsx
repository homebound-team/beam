import { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { Css } from "src/Css";
import { FormSectionProps } from "src/forms/FormSection";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { FormSectionLayout, FormSectionLayoutProps } from "src/layouts/FormSectionLayout";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { JumpLinksRail } from "./JumpLinksRail";
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
    /** Page wash, `ai` CTA, and forwarded to `form`. */
    aiMode?: boolean;
    form: Omit<FormSectionLayoutProps, "sections"> & { sections?: FocusedFormSection[] };
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
    aiMode,
    form,
    ...headerProps
  } = props;
  const tid = useTestIds(props, "focusedFormLayout");
  const { sm: isMobile } = useBreakpoint();

  const jumpLinks = (form.sections ?? [])
    .filter((section) => !section.excludeJumpLink)
    .map((section) => {
      const id = defaultTestId(section.title);
      return { id, label: section.title };
    });
  const activeId = useActiveJumpLink(jumpLinks.map((link) => link.id));
  const showRail = withJumpLinks && jumpLinks.length >= 2 && !isMobile;

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
      <div css={Css.df.w100.$}>
        {showRail && <JumpLinksRail links={jumpLinks} activeId={activeId} {...tid.jumpLinks} />}
        <div css={Css.fg1.mw0.mb4.$}>
          <FormSectionLayout {...form} aiMode={aiMode} />
        </div>
      </div>
    </WorkflowPageLayout>
  );
}
