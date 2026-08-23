import { BaseHeaderProps } from "src/components/Headers/BaseHeader";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { FormSectionLayout, FormSectionLayoutProps } from "src/layouts/FormSectionLayout";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { JumpLinksRail } from "./JumpLinksRail";
import { useActiveJumpLink } from "./useActiveJumpLink";
import { WorkflowActionsProps } from "./WorkflowActions";
import { WorkflowPageLayout } from "./WorkflowPageLayout";

export type FocusedFormLayoutProps = Pick<BaseHeaderProps, "title" | "documentTitleSuffix" | "breadcrumbs"> &
  Pick<WorkflowActionsProps, "onCancel" | "completeLabel" | "onComplete" | "onSaveAndExit"> & {
    /** Gates the Create/Save CTA. */
    isValid: boolean;
    /** When this returns true, Cancel / in-app route changes / tab close require confirmation. */
    isDirty?: () => boolean;
    /**
     * When false, never show the JumpLinks rail. Defaults to true — the rail still hides when there
     * are fewer than two includable sections.
     */
    withJumpLinks?: boolean;
    /**
     * Page wash, `ai` Continue/Complete variant, and forwarded onto `form`'s `FormSectionLayout`.
     * Do not also set `form.aiMode`.
     */
    aiMode?: boolean;
    /** Always rendered as the body. Page `aiMode` is forwarded; do not set `form.aiMode`. */
    form: FormSectionLayoutProps;
  };

/**
 * Standalone single-form workflow page. Contract: `docs/layouts.md`.
 *
 * Nest directly under `EnvironmentBannerLayout`. No stepper — optional JumpLinks come from
 * `form.sections` titles. Use this (not a stepless `StepperLayout`) when the page has no steps.
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
        <div css={Css.fg1.mw0.$}>
          <FormSectionLayout {...form} aiMode={aiMode} />
        </div>
      </div>
    </WorkflowPageLayout>
  );
}
