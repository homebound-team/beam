import type { FieldState } from "@homebound/form-state";
import { useRef } from "react";
import { Button } from "src/components/Button";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";
import { IconButton } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import type { FormSectionProps } from "./FormSection";

type FormSectionChildBase = Omit<FormSectionProps, "childSections">;

/** A single, non-draggable entry in a `FormSection`'s `childSections` — never itself nests further children. */
export type PlainFormSectionChild = FormSectionChildBase & { id?: string; orderField?: never };

/**
 * A single, draggable entry in a `FormSection`'s `childSections`. `orderField` drives both draggability
 * and sort order; `id` is required so drag/keyboard reordering can track this entry.
 */
export type ReorderableFormSectionChild = FormSectionChildBase & {
  id: string;
  orderField: FieldState<number | null | undefined>;
};

/** A single, non-nestable child row within a `FormSection`'s `childSections`. Internal to `FormSection`. */
export function FormSectionChild(props: PlainFormSectionChild | ReorderableFormSectionChild) {
  const { title, description, actions, fields, orderField } = props;
  const tid = useTestIds(props, "formSectionChild");
  const itemRef = useRef(null);
  const isDraggable = !!orderField;
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: props.id ?? title, itemRef });

  return (
    <div
      {...(isDraggable ? { ...dragItemProps, ref: itemRef } : {})}
      css={Css.df.fdc.gap2.bgColor(Tokens.SurfaceRaised).pb3.bb.bc(Tokens.SurfaceSeparator).ifLastOfType.bn.$}
      {...tid}
    >
      <div css={Css.df.fdc.jcsb.$}>
        <div css={Css.df.jcsb.gapPx(12).$}>
          <div css={Css.df.aic.gap1.$}>
            {isDraggable && <DnDGridItemHandle dragHandleProps={dragHandleProps} icon="drag" compact />}
            <h3 css={Css.mdSb.$} {...tid.title}>
              {title}
            </h3>
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
    </div>
  );
}
