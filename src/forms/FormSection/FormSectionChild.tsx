import type { FieldState } from "@homebound/form-state";
import { useRef } from "react";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";
import { ContentHeader } from "src/components/Headers/ContentHeader";
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
      <ContentHeader
        {...tid.header}
        title={title}
        description={description}
        actions={actions}
        level={4}
        startAdornment={
          isDraggable ? <DnDGridItemHandle dragHandleProps={dragHandleProps} icon="drag" compact /> : undefined
        }
      />
      {fields}
    </div>
  );
}
