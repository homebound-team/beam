import type { FieldState } from "@homebound/form-state";
import { useRef } from "react";
import { Button } from "src/components/Button";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";
import { IconButton } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import type { FormSectionProps } from "./FormSection";

/** A single entry in a `FormSection`'s `childSections` — never itself nests further children. */
export type FormSectionChildProps = Omit<FormSectionProps, "childSections"> & {
  id: string;
  /** Drives draggability: set on every child for a draggable, order-sorted list; omit on all for a plain list. Mixing is unsupported and not type-checked. */
  orderField?: FieldState<number | null | undefined>;
};

type FormSectionChildComponentProps = FormSectionChildProps & {
  /** @internal computed by the parent `FormSection`; not caller-supplied. */
  isLast: boolean;
};

/** A single, non-nestable child row within a `FormSection`'s `childSections`. Internal to `FormSection`. */
export function FormSectionChild(props: FormSectionChildComponentProps) {
  const { title, description, actions, fields, orderField, isLast } = props;
  const tid = useTestIds(props, "formSectionChild");
  const itemRef = useRef(null);
  const isDraggable = !!orderField;
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: props.id, itemRef });

  return (
    <div
      ref={isDraggable ? itemRef : undefined}
      {...(isDraggable ? dragItemProps : {})}
      css={
        isLast
          ? Css.df.fdc.gap2.bgColor(Tokens.SurfaceRaised).pb3.$
          : Css.df.fdc.gap2.bgColor(Tokens.SurfaceRaised).bb.bc(Tokens.SurfaceSeparator).pb3.$
      }
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
