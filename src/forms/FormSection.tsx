import { ReactNode } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type FormSectionProps = {
  title: string;
  description?: ReactNode;
  /** Rendered top-right of the title row, e.g. an "Add" button. */
  actions?: ButtonProps[];
  fields?: ReactNode;
  childSections?: FormSectionProps[];
  /** Nested-section styling (smaller title). Set automatically by `FormSection`'s own recursion over `childSections` — don't set this yourself. */
  isChild?: boolean;
};

/** A titled section of form content — title/description/actions row, then `fields`, then any recursively-rendered `childSections`. */
export function FormSection(props: FormSectionProps) {
  const { title, description, actions, fields, childSections, isChild = false } = props;
  const tid = useTestIds(props, "formSection");

  return (
    <div css={Css.df.fdc.gap2.$} {...tid}>
      <div css={Css.df.jcsb.aifs.$}>
        <div css={Css.df.fdc.gapPx(12).$}>
          <h2 css={isChild ? Css.mdSb.$ : Css.lg.$} {...tid.title}>
            {title}
          </h2>
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
      {fields}
      {childSections && (
        <div css={Css.df.fdc.gap3.$}>
          {childSections.map((child, i) => (
            <div key={defaultTestId(child.title) || i} css={Css.bb.bc(Tokens.SurfaceSeparator).pb3.ifLastOfType.bn.$}>
              <FormSection {...child} isChild {...tid[`childSection${i}`]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
