import { ReactNode } from "react";
import { AiCard } from "src/components/AiPanel";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { HeaderAction } from "src/components/Headers/HeaderActions";
import { WithRightPane } from "src/components/Layout/RightPaneLayout/types";
import { Css } from "src/Css";
import { FormSection, FormSectionProps } from "src/forms/FormSection";
import { CenteredLayout } from "src/layouts/CenteredLayout/CenteredLayout";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

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
  sections?: FormSectionProps[];
  /** When true, wraps in {@link AiCard} and applies AI title styling. */
  aiMode?: boolean;
  /**
   * Forwarded to `CenteredLayout` (default mode `auto`). For Stepper form steps.
   * Do not set when a parent (e.g. `FocusedFormLayout`) already hosts the right pane.
   */
  withRightPane?: WithRightPane;
};

/** Form of `FormSection`s in a `sm` {@link CenteredLayout} — e.g. a `StepperLayout` step's `content`. Use `aiMode` for the AI card + title treatment. */
export function FormSectionLayout(props: FormSectionLayoutProps) {
  const { title, description, actions, withAutoSave, initialFields, sections, aiMode = false, withRightPane } = props;
  const tid = useTestIds(props, "formSectionLayout");

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

  return (
    <CenteredLayout size="sm" withRightPane={withRightPane}>
      {aiMode ? (
        <AiCard size="lg" {...tid}>
          {content}
        </AiCard>
      ) : (
        content
      )}
    </CenteredLayout>
  );
}
