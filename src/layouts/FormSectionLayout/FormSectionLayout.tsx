import { ReactNode } from "react";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { FormSection, FormSectionBase, FormSectionAction } from "src/forms/FormSection";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type FormSectionLayoutProps = {
  /** The form's own title — one level up from any `FormSection`'s title. */
  title: string;
  description?: ReactNode;
  /** Rendered before form sections. Useful in forms that only need the main form title, or for form fields that shape the context of a form beforehand.  */
  initialFields?: ReactNode;
  /** Rendered top-right of the title row, e.g. an "Add items" Button. */
  actions?: FormSectionAction[];
  sections: FormSectionBase[];
};

/** Centered (720px) width/column shell for a form built out of `FormSection`s — e.g. as a `WorkflowLayoutStep`'s `content`. */
export function FormSectionLayout(props: FormSectionLayoutProps) {
  const { title, description, actions, initialFields, sections } = props;
  const tid = useTestIds(props, "formSectionLayout");

  return (
    <div css={Css.df.fdc.gap8.w100.pt4.maxwPx(720).mxa.ifSm.px2.$} {...tid}>
      <div css={Css.df.fdc.gap3.$}>
        <div css={Css.df.fdc.jcsb.gapPx(12).$}>
          <div css={Css.df.jcsb.aic.$}>
            <h1 css={Css.xl.$} {...tid.title}>
              {title}
            </h1>
            {actions && (
              <div css={Css.df.gap1.fs0.$} {...tid.actions}>
                {actions.map((action) =>
                  action.kind === "icon" ? (
                    <IconButton key={action.icon} {...action} variant="outline" />
                  ) : (
                    <Button key={`${action.label}`} {...action} />
                  ),
                )}
              </div>
            )}
          </div>
          {description && (
            <div css={Css.sm.color(Tokens.OnSurface).$} {...tid.description}>
              {description}
            </div>
          )}
        </div>
        {initialFields}
      </div>
      <div css={Css.df.fdc.gap8.$}>
        {sections.map((section, i) => (
          <FormSection key={defaultTestId(section.title) || i} {...section} />
        ))}
      </div>
    </div>
  );
}
