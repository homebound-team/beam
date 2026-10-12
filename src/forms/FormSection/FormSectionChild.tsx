import type { FieldState } from "@homebound/form-state";
import { useRef } from "react";
import { mergeProps, useCheckboxGroupItem, useFocusRing, useHover, useRadio } from "react-aria";
import type { CheckboxGroupState, RadioGroupState } from "react-stately";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { Tag, type TagProps } from "src/components/Tag";
import { Css, Tokens } from "src/Css";
import { BoundCheckboxField } from "src/forms/BoundCheckboxField";
import { CheckboxBase } from "src/inputs/CheckboxBase";
import { getRadioStateStyles, radioDefault, radioFocus, radioHover, radioReset } from "src/inputs/internal/radioStyles";
import { useTestIds } from "src/utils/useTestIds";
import type { FormSectionBaseProps } from "./FormSection";

/** An independent checkbox on one child. Its boolean field lives on that child. */
export type FormSectionChildSelection = { mode: "toggle"; field: FieldState<boolean | null | undefined> };

type FormSectionChildBase = FormSectionBaseProps & {
  /** Renders a `Tag` top-right of the header. */
  tag?: TagProps<any>;
  /** Stored in the parent field when this child belongs to a `single` or `multiple` group. */
  value?: string;
  /** Independent checkbox. Only set when the parent section has no group `selection`. */
  selection?: FormSectionChildSelection;
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

/** Set by `FormSection` when its `selection` is a group, so every child renders that group's control. */
export type FormSectionChildGroup =
  { mode: "single"; state: RadioGroupState } | { mode: "multiple"; state: CheckboxGroupState };

type FormSectionChildProps = (PlainFormSectionChild | ReorderableFormSectionChild) & { group?: FormSectionChildGroup };

/** A single, non-nestable child row within a `FormSection`'s `childSections`. Internal to `FormSection`. */
export function FormSectionChild(props: FormSectionChildProps) {
  const { title, description, actions, fields, orderField, tag, value = title, selection, group } = props;
  const tid = useTestIds(props, "formSectionChild");
  const itemRef = useRef(null);
  const isDraggable = !!orderField;
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: props.id ?? title, itemRef });

  const control =
    group?.mode === "single" ? (
      <FormSectionChildRadio state={group.state} value={value} label={title} {...tid.radio} />
    ) : group?.mode === "multiple" ? (
      <FormSectionChildCheckbox state={group.state} value={value} label={title} {...tid.checkbox} />
    ) : selection ? (
      <BoundCheckboxField field={selection.field} label={title} checkboxOnly {...tid.checkbox} />
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

type FormSectionChildControlProps<S> = { state: S; value: string; label: string };

/** A label-less radio, one per child, sharing the parent `FormSection`'s radio group state. */
function FormSectionChildRadio(props: FormSectionChildControlProps<RadioGroupState>) {
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

/** A label-less checkbox, one per child, sharing the parent `FormSection`'s checkbox group state. */
function FormSectionChildCheckbox(props: FormSectionChildControlProps<CheckboxGroupState>) {
  const { state, value, label } = props;
  const ref = useRef(null);
  const ariaProps = { isSelected: state.isSelected(value), isDisabled: state.isDisabled, isIndeterminate: false };
  const { inputProps } = useCheckboxGroupItem({ value, "aria-label": label, ...ariaProps }, state, ref);
  const tid = useTestIds(props);

  return (
    <CheckboxBase
      ariaProps={ariaProps}
      inputProps={inputProps}
      isSelected={ariaProps.isSelected}
      isDisabled={ariaProps.isDisabled}
      label={label}
      checkboxOnly
      {...tid}
    />
  );
}
