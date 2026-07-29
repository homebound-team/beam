import { ReactNode } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type FormSectionProps = {
  title: string;
  description?: ReactNode;
  /** Rendered top-right of the title row, e.g. an "Add" button. */
  actions?: ButtonProps[];
  fields?: ReactNode;
  childSections?: Omit<FormSectionProps, "isChild">[];
  /** Nested-section styling (smaller title). Set automatically by `FormSection`'s own recursion over `childSections` — don't set this yourself. */
  isChild?: boolean;
};

/** A titled section of form content — title/description/actions row, then `fields`, then any recursively-rendered `childSections`. */
export function FormSection(props: FormSectionProps) {
  const { title, description, actions, fields, childSections, isChild = false } = props;
  const tid = useTestIds(props, "formSection");

  return (
    <div css={Css.df.fdc.gap2.$} {...tid}>
      <div css={Css.df.jcsb.$}>
        <div css={Css.df.fdc.gapPx(12).$}>
          {getTitle(title, isChild, tid)}
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
            <div key={child.title || i} css={Css.bb.bc(Tokens.SurfaceSeparator).pb3.ifLastOfType.bn.$}>
              <FormSection {...child} isChild {...tid.childSection} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getTitle(title: string, isChild: boolean, tid: Record<string, object>) {
  if (isChild) {
    return (
      <h3 css={Css.mdSb.$} {...tid.title}>
        {title}
      </h3>
    );
  }
  return (
    <h2 css={Css.lg.$} {...tid.title}>
      {title}
    </h2>
  );
}
