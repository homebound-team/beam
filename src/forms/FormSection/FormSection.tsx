import { ReactNode } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { DnDGrid } from "src/components/DnDGrid/DnDGrid";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import { FormSectionChild, type PlainFormSectionChild, type ReorderableFormSectionChild } from "./FormSectionChild";

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
  childSections?: PlainFormSectionChild[] | ReorderableFormSectionChild[];
};

export function FormSection(props: FormSectionProps) {
  const { title, description, actions, fields, childSections } = props;
  const tid = useTestIds(props, "formSection");

  return (
    <div css={Css.df.fdc.gap2.$} {...tid}>
      <div css={Css.df.fdc.gapPx(12).$}>
        <div css={Css.df.jcsb.$}>
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
        (isReorderable(childSections) ? (
          <DraggableChildren childSections={childSections} {...tid.childSection} />
        ) : (
          <div css={Css.df.fdc.gap3.$}>
            {childSections.map((child) => (
              <FormSectionChild key={child.id ?? child.title} {...child} {...tid.childSection} />
            ))}
          </div>
        ))}
    </div>
  );
}

/** True only when every childSection sets `orderField` -- narrows `childSections` to the reorderable variant. */
function isReorderable(
  childSections: PlainFormSectionChild[] | ReorderableFormSectionChild[],
): childSections is ReorderableFormSectionChild[] {
  return childSections.length > 0 && childSections.every((c) => !!c.orderField);
}

type DraggableChildrenProps = { childSections: ReorderableFormSectionChild[] };

/** Renders reorderable childSections, sorted by `orderField.value`, in a `DnDGrid`. */
function DraggableChildren(props: DraggableChildrenProps) {
  const { childSections, ...tid } = props;
  const sorted = sortByOrderField(childSections);

  /**
   * Permutes `sorted`'s existing orderField values across the new positions -- e.g. moving item 0 to
   * position 1 swaps its value with whichever item lands in position 0.
   */
  const handleReorder = (newOrder: string[]) => {
    const existingValues = sorted.map((c) => c.orderField.value ?? 0);
    const childById = new Map(sorted.map((c) => [c.id, c]));
    newOrder.forEach((id, i) => {
      const value = existingValues[i];
      if (value !== undefined) {
        childById.get(id)?.orderField.set(value);
      }
    });
  };

  return (
    <DnDGrid onReorder={handleReorder} gridStyles={Css.gtc("minmax(0, 1fr)").gap3.$}>
      {sorted.map((child) => (
        <FormSectionChild key={child.id} {...child} {...tid} />
      ))}
    </DnDGrid>
  );
}

function sortByOrderField(childSections: ReorderableFormSectionChild[]): ReorderableFormSectionChild[] {
  return [...childSections].sort((a, b) => (a.orderField.value ?? 0) - (b.orderField.value ?? 0));
}
