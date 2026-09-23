import type { ReactNode } from "react";
import { AiCard } from "src/components/AiPanel";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import type { HeaderAction } from "src/components/Headers/HeaderActions";
import { DocumentScrollOverlayRightPaneLayout } from "src/components/Layout/RightPaneLayout/DocumentScrollOverlayRightPaneLayout";
import { resolveWithRightPaneOptions, type WithRightPane } from "src/components/Layout/RightPaneLayout/withRightPane";
import { Css } from "src/Css";
import { FormSection, type FormSectionProps } from "src/forms/FormSection/FormSection";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { CenteredLayout } from "src/layouts/CenteredLayout/CenteredLayout";
import { stickyNavAndHeaderOffset } from "src/layouts/layoutVars";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";
import { JumpLinksRail, jumpLinksRailReservation } from "./JumpLinksRail";
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
   * When true, show a JumpLinks rail from section titles (needs 2+ includable links; hidden on `sm`).
   * Default false — opt in for FocusedForm / Stepper form steps that want the rail.
   */
  withJumpLinks?: boolean;
  /** When true with `withJumpLinks`, prepend the form `title` as the first rail link. */
  includeTitleJumpLink?: boolean;
  /**
   * Opt into the document-scroll detail pane (`useRightPane`).
   * Hosts JumpLinks + form — do not also set `withRightPane` on the inner `CenteredLayout`.
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
    includeTitleJumpLink = false,
    withRightPane,
  } = props;
  const tid = useTestIds(props, "formSectionLayout");
  const { sm: isMobile } = useBreakpoint();
  const rightPane = resolveWithRightPaneOptions(withRightPane);
  /** Anchor for the form title when `includeTitleJumpLink` is on — avoids colliding with section ids. */
  const formSectionLayoutTitleId = "formSectionLayoutTitle";

  const sectionLinks = (sections ?? [])
    .filter((section) => !section.excludeJumpLink)
    .map((section) => {
      const id = defaultTestId(section.title);
      return { id, label: section.title };
    });
  const titleAnchor = withJumpLinks && includeTitleJumpLink;
  const jumpLinks = [...(titleAnchor ? [{ id: formSectionLayoutTitleId, label: title }] : []), ...sectionLinks];
  const showRail = withJumpLinks && jumpLinks.length >= 2 && !isMobile;
  const activeId = useActiveJumpLink(showRail ? jumpLinks.map((link) => link.id) : []);

  const content = (
    <div css={Css.df.fdc.gap8.if(aiMode).p3.$}>
      <div
        id={titleAnchor ? formSectionLayoutTitleId : undefined}
        css={Css.df.fdc.gap3.if(titleAnchor).add("scrollMarginTop", stickyNavAndHeaderOffset()).$}
      >
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
      <div css={Css.fg1.mr(jumpLinksRailReservation).$} {...tid.column}>
        {form}
      </div>
    </div>
  ) : (
    <div css={Css.mb4.$}>{form}</div>
  );

  if (!rightPane) return body;

  return (
    <DocumentScrollOverlayRightPaneLayout paneWidth={rightPane.width}>{body}</DocumentScrollOverlayRightPaneLayout>
  );
}
