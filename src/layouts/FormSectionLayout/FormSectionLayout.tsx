import { ReactNode } from "react";
import { AiCard } from "src/components/AiPanel";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { HeaderAction } from "src/components/Headers/HeaderActions";
import { DocumentScrollInlineRightPaneLayout } from "src/components/Layout/RightPaneLayout/DocumentScrollInlineRightPaneLayout";
import {
  resolveWithRightPaneOptions,
  toInlineRightPaneMode,
} from "src/components/Layout/RightPaneLayout/documentScrollRightPaneMode";
import { WithRightPane } from "src/components/Layout/RightPaneLayout/types";
import { Css } from "src/Css";
import { FormSection, FormSectionProps } from "src/forms/FormSection";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { CenteredLayout, centeredShellMaxPx } from "src/layouts/CenteredLayout";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { JumpLinksRail, jumpLinksRailReservation, jumpLinksRailWidthPx } from "./JumpLinksRail";
import { useActiveJumpLink } from "./useActiveJumpLink";

export type FormSectionLayoutSection = FormSectionProps & {
  /** When true, omit this section from the JumpLinks rail. */
  excludeJumpLink?: boolean;
};

export type FormSectionLayoutProps = {
  /** The form's own title — one level up from any `FormSection`'s title. */
  title: string;
  description?: ReactNode;
  /** Rendered before form sections. Useful in forms that only need the main form title, or for form fields that shape the context of a form beforehand.  */
  initialFields?: ReactNode;
  /** Rendered top-right of the title row, e.g. an "Add items" Button. */
  actions?: HeaderAction[];
  /** When true, prepends `AutoSaveIndicator` in the actions area. */
  withAutoSave?: boolean;
  sections?: FormSectionLayoutSection[];
  /** When true, wraps in {@link AiCard} and applies AI title styling. */
  aiMode?: boolean;
  /**
   * When true, show a JumpLinks rail from section titles (needs 2+ includable sections; hidden on `sm`).
   * Default false — opt in for FocusedForm / Stepper form steps that want the rail.
   */
  withJumpLinks?: boolean;
  /**
   * Opt into the document-scroll detail pane (`useRightPane`); default mode `auto`.
   * Hosts JumpLinks + form, so do not nest another right-pane layout around this form.
   */
  withRightPane?: WithRightPane;
};

/**
 * Form of `FormSection`s in a `sm` {@link CenteredLayout} — e.g. a `StepperLayout` step's `content`
 * or the body of `FocusedFormLayout`. Optional JumpLinks rail; use `aiMode` for the AI card + title.
 */
export function FormSectionLayout(props: FormSectionLayoutProps) {
  const {
    title,
    description,
    actions,
    withAutoSave,
    initialFields,
    sections,
    aiMode = false,
    withJumpLinks = false,
    withRightPane,
  } = props;
  const tid = useTestIds(props, "formSectionLayout");
  const { sm: isMobile } = useBreakpoint();
  const rightPane = resolveWithRightPaneOptions(withRightPane, "auto");

  const jumpLinks = (sections ?? [])
    .filter((section) => !section.excludeJumpLink)
    .map((section) => {
      const id = defaultTestId(section.title);
      return { id, label: section.title };
    });
  const showRail = withJumpLinks && jumpLinks.length >= 2 && !isMobile;
  const activeId = useActiveJumpLink(showRail ? jumpLinks.map((link) => link.id) : []);

  const content = (
    <div css={Css.df.fdc.gap8.if(aiMode).p3.$}>
      <div css={Css.df.fdc.gap3.$}>
        <ContentHeader
          {...tid}
          title={title}
          description={description}
          actions={actions}
          withAutoSave={withAutoSave}
          level={2}
          aiMode={aiMode}
        />
        {initialFields}
      </div>
      {sections && (
        <div css={Css.df.fdc.gap8.$}>
          {sections.map((section, i) => (
            <FormSection key={defaultTestId(section.title) || i} {...section} />
          ))}
        </div>
      )}
    </div>
  );

  const form = (
    <CenteredLayout size="sm">
      {aiMode ? (
        <AiCard size="lg" {...tid}>
          {content}
        </AiCard>
      ) : (
        content
      )}
    </CenteredLayout>
  );

  const body = showRail ? (
    <div css={Css.df.w100.mb4.$}>
      <JumpLinksRail links={jumpLinks} activeId={activeId} {...tid.jumpLinks} />
      {/* Mirror the rail's width so the form stays centered on the page, as it is without the rail. */}
      <div css={Css.fg1.mw0.mr(jumpLinksRailReservation).$} {...tid.column}>
        {form}
      </div>
    </div>
  ) : (
    <div css={Css.mb4.$}>{form}</div>
  );

  if (!rightPane) return body;

  return (
    <DocumentScrollInlineRightPaneLayout
      paneWidth={rightPane.width}
      mode={toInlineRightPaneMode(rightPane.mode)}
      shellMaxPx={centeredShellMaxPx.sm}
      jumpLinksWidthPx={showRail ? jumpLinksRailWidthPx : 0}
    >
      {body}
    </DocumentScrollInlineRightPaneLayout>
  );
}
