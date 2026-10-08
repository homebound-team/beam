import type { FieldState } from "@homebound/form-state";
import { useRef } from "react";
import { mergeProps, useFocusRing, useHover, useRadio } from "react-aria";
import type { RadioGroupState } from "react-stately";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { Tag, type TagProps } from "src/components/Tag";
import { Css, Tokens } from "src/Css";
import { BoundCheckboxField } from "src/forms/BoundCheckboxField";
import { getRadioStateStyles, radioDefault, radioFocus, radioHover, radioReset } from "src/inputs/internal/radioStyles";
import { useTestIds } from "src/utils/useTestIds";
import type { FormSectionBaseProps } from "./FormSection";

type FormSectionChildBase = FormSectionBaseProps & {
  /** Renders a `Tag` top-right of the header. */
  tag?: TagProps<any>;
  /** Renders a checkbox before the title, bound to this field. */
  selectedField?: FieldState<boolean | null | undefined>;
};

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

type FormSectionChildProps = (PlainFormSectionChild | ReorderableFormSectionChild) & {
  /** Set by `FormSection` when its `selectedChildField` is set; renders a radio before the title. */
  radioGroupState?: RadioGroupState;
};

/** A single, non-nestable child row within a `FormSection`'s `childSections`. Internal to `FormSection`. */
export function FormSectionChild(props: FormSectionChildProps) {
  const { title, description, actions, fields, orderField, tag, selectedField, radioGroupState } = props;
  const tid = useTestIds(props, "formSectionChild");
  const itemRef = useRef(null);
  const isDraggable = !!orderField;
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: props.id ?? title, itemRef });

  const control = radioGroupState ? (
    <FormSectionChildRadio state={radioGroupState} value={props.id ?? title} label={title} {...tid.radio} />
  ) : selectedField ? (
    <BoundCheckboxField field={selectedField} label={title} checkboxOnly {...tid.checkbox} />
  ) : undefined;

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
        rightSlotLead={tag && <Tag {...tag} {...tid.tag} />}
        startAdornment={
          isDraggable || control ? (
            <>
              {isDraggable && <DnDGridItemHandle dragHandleProps={dragHandleProps} icon="drag" compact />}
              {control}
            </>
          ) : undefined
        }
      />
      {fields}
    </div>
  );
}

type FormSectionChildRadioProps = { state: RadioGroupState; value: string; label: string };

/** A label-less radio, one per child, sharing the parent `FormSection`'s radio group state. */
function FormSectionChildRadio(props: FormSectionChildRadioProps) {
  const { state, value, label } = props;
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps, isDisabled, isSelected } = useRadio({ value, "aria-label": label }, state, ref);
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const tid = useTestIds(props);

  return (
    <input
      ref={ref}
      css={{
        ...radioReset,
        ...radioDefault,
        ...getRadioStateStyles({ isDisabled, isSelected }),
        ...(isHovered && !isDisabled ? radioHover : {}),
        ...(isFocusVisible ? radioFocus : {}),
      }}
      {...mergeProps(inputProps, focusProps, hoverProps)}
      {...tid}
    />
  );
}
