import { ReactNode } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { Css, Tokens } from "src/Css";
import { FormSection, FormSectionProps } from "src/forms/FormSection";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type FormSectionLayoutProps = {
  /** The form's own title — one level up from any `FormSection`'s title. */
  title: string;
  description?: ReactNode;
  /** Rendered top-right of the title row, e.g. a "Save draft" button. */
  actions?: ButtonProps[];
  sections: FormSectionProps[];
};

/** Centered (720px) width/column shell for a form built out of `FormSection`s — e.g. as a `WorkflowLayoutStep`'s `content`. */
export function FormSectionLayout(props: FormSectionLayoutProps) {
  const { title, description, actions, sections } = props;
  const tid = useTestIds(props, "formSectionLayout");

  return (
    <div css={Css.df.fdc.gap3.w100.pt4.maxwPx(720).mxa.$} {...tid}>
      <div css={Css.df.jcsb.aifs.$}>
        <div css={Css.df.fdc.gapPx(12).$}>
          <h1 css={Css.xl.$} {...tid.title}>
            {title}
          </h1>
          {description && (
            <div css={Css.sm.color(Tokens.OnSurface).$} {...tid.description}>
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div css={Css.df.gap1.fs0.$} {...tid.actions}>
            {actions.map((action) => (
              <Button key={`${action.label}`} {...action} />
            ))}
          </div>
        )}
      </div>
      <div css={Css.df.fdc.gap6.$}>
        {sections.map((section, i) => (
          <FormSection key={defaultTestId(section.title) || i} {...section} {...tid[`section${i}`]} />
        ))}
      </div>
    </div>
  );
}
