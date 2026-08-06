import { Observer } from "mobx-react";
import { ReactNode } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { DnDGrid } from "src/components/DnDGrid/DnDGrid";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import { FormSectionChild, FormSectionChildProps } from "./FormSectionChild";

/**
 * An action in a `FormSection`/`FormSectionLayout` title row — a `Button`, or an icon-only `IconButton` via `kind: "icon"`.
 * Uses `kind` rather than `type` since `ButtonProps` already has its own `type` (button/submit/reset).
 */
export type FormSectionAction =
  | ({ kind?: "default" } & ButtonProps)
  | ({ kind: "icon" } & Omit<IconButtonProps, "variant">);

export type FormSectionProps = {
  title: string;
  description?: ReactNode;
  actions?: FormSectionAction[];
  fields?: ReactNode;
  childSections?: FormSectionChildProps[];
};

export function FormSection(props: FormSectionProps) {
  const { title, description, actions, fields, childSections } = props;
  const tid = useTestIds(props, "formSection");
  const isDraggableParent = !!childSections?.length && childSections.every((c) => !!c.orderField);

  const handleReorder = (newOrder: string[]) => {
    const sorted = sortByOrderField(childSections!);
    const existingValues = sorted.map((c) => c.orderField!.value ?? 0);
    const childById = new Map(sorted.map((c) => [c.id, c]));
    newOrder.forEach((id, i) => childById.get(id)?.orderField!.set(existingValues[i]!));
  };

  return (
    <div css={Css.df.fdc.gap2.$} {...tid}>
      <div css={Css.df.fdc.jcsb.$}>
        <div css={Css.df.jcsb.gapPx(12).$}>
          <div css={Css.df.aic.gap1.$}>
            <h2 css={Css.lg.$} {...tid.title}>
              {title}
            </h2>
          </div>
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
      {fields}
      {childSections &&
        (isDraggableParent ? (
          <DnDGrid onReorder={handleReorder} gridStyles={Css.gtc("minmax(0, 1fr)").gap3.$}>
            <Observer>
              {() => {
                const sorted = sortByOrderField(childSections);
                return (
                  <>
                    {sorted.map((child, i) => (
                      <FormSectionChild
                        key={child.id}
                        {...child}
                        isLast={i === sorted.length - 1}
                        {...tid.childSection}
                      />
                    ))}
                  </>
                );
              }}
            </Observer>
          </DnDGrid>
        ) : (
          <div css={Css.df.fdc.gap3.$}>
            {childSections.map((child, i) => (
              <FormSectionChild
                key={child.id}
                {...child}
                isLast={i === childSections.length - 1}
                {...tid.childSection}
              />
            ))}
          </div>
        ))}
    </div>
  );
}

function sortByOrderField(childSections: FormSectionChildProps[]): FormSectionChildProps[] {
  return [...childSections].sort((a, b) => (a.orderField?.value ?? 0) - (b.orderField?.value ?? 0));
}
