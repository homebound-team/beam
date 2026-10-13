import type { FieldState } from "@homebound/form-state";
import type { ReactNode } from "react";
import { useCheckboxGroup, useRadioGroup } from "react-aria";
import { useCheckboxGroupState, useRadioGroupState } from "react-stately";
import { DnDGrid } from "src/components/DnDGrid/DnDGrid";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import type { HeaderAction } from "src/components/Headers/HeaderActions";
import { Css } from "src/Css";
import { useComputed } from "src/hooks/useComputed";
import { stickyNavAndHeaderOffset } from "src/layouts/layoutVars";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";
import {
  FormSectionChild,
  type FormSectionChildGroup,
  type PlainFormSectionChild,
  type ReorderableFormSectionChild,
} from "./FormSectionChild";

/** @see {@link HeaderAction} */
export type FormSectionAction = HeaderAction;

/** Props shared by a `FormSection` and each of its `childSections`. */
export type FormSectionBaseProps = {
  title: string;
  description?: ReactNode;
  actions?: HeaderAction[];
  fields?: ReactNode;
};

/**
 * A group shared by every child in the section.
 * `single` stores one child `value`. `multiple` stores the selected child `value`s.
 */
export type FormSectionSelection =
  | { mode: "single"; field: FieldState<string | null | undefined> }
  | { mode: "multiple"; field: FieldState<string[] | null | undefined> };

/** A child inside a `single`/`multiple` section: `value` is the option the group field stores, and it can't also be a `toggle`. */
type SelectableFormSectionChild = (PlainFormSectionChild | ReorderableFormSectionChild) & {
  value: string;
  selection?: never;
};

export type FormSectionProps = FormSectionBaseProps &
  (
    | { selection?: never; childSections?: PlainFormSectionChild[] | ReorderableFormSectionChild[] }
    | { selection: FormSectionSelection; childSections: SelectableFormSectionChild[] }
  );

export function FormSection(props: FormSectionProps) {
  const { title, description, actions, fields, childSections, selection } = props;
  const tid = useTestIds(props, "formSection");

  return (
    <div
      id={defaultTestId(title)}
      css={Css.df.fdc.gap2.add("scrollMarginTop", stickyNavAndHeaderOffset()).$}
      {...tid.section}
    >
      <ContentHeader {...tid} title={title} description={description} actions={actions} level={3} />
      {fields}
      {childSections &&
        (selection?.mode === "single" ? (
          <FormSectionRadioGroup field={selection.field} label={title} childSections={childSections} {...tid} />
        ) : selection?.mode === "multiple" ? (
          <FormSectionCheckboxGroup field={selection.field} label={title} childSections={childSections} {...tid} />
        ) : (
          <ChildSectionList childSections={childSections} {...tid.childSection} />
        ))}
    </div>
  );
}

type ChildSections = readonly (PlainFormSectionChild | ReorderableFormSectionChild)[];

type FormSectionGroupProps<V> = { field: FieldState<V>; label: string; childSections: ChildSections };

/** Binds a `single` selection to one radio group shared by every child. */
function FormSectionRadioGroup(props: FormSectionGroupProps<string | null | undefined>) {
  const { field, label, childSections } = props;
  const tid = useTestIds(props);
  const { value, readOnly } = useComputed(() => ({ value: field.value ?? null, readOnly: field.readOnly }), [field]);
  const state = useRadioGroupState({
    value,
    onChange: (value) => {
      field.set(value);
      field.maybeAutoSave();
    },
    isDisabled: readOnly,
  });
  const { radioGroupProps } = useRadioGroup(
    { "aria-label": label, isDisabled: readOnly, onFocus: () => field.focus(), onBlur: () => field.blur() },
    state,
  );

  return (
    <div {...radioGroupProps} {...tid.childGroup}>
      <ChildSectionList childSections={childSections} group={{ mode: "single", state }} {...tid.childSection} />
    </div>
  );
}

/** Binds a `multiple` selection to one checkbox group shared by every child. */
function FormSectionCheckboxGroup(props: FormSectionGroupProps<string[] | null | undefined>) {
  const { field, label, childSections } = props;
  const tid = useTestIds(props);
  const { value, readOnly } = useComputed(() => ({ value: field.value ?? [], readOnly: field.readOnly }), [field]);
  const state = useCheckboxGroupState({
    value,
    onChange: (values) => {
      field.set(values);
      field.maybeAutoSave();
    },
    isDisabled: readOnly,
  });
  const { groupProps } = useCheckboxGroup(
    { "aria-label": label, isDisabled: readOnly, onFocus: () => field.focus(), onBlur: () => field.blur() },
    state,
  );

  return (
    <div {...groupProps} {...tid.childGroup}>
      <ChildSectionList childSections={childSections} group={{ mode: "multiple", state }} {...tid.childSection} />
    </div>
  );
}

type ChildSectionListProps = { childSections: ChildSections; group?: FormSectionChildGroup };

/** Renders childSections as a plain list, or in a `DnDGrid` when every child is reorderable. */
function ChildSectionList(props: ChildSectionListProps) {
  const { childSections, group, ...tid } = props;
  return isReorderable(childSections) ? (
    <DraggableChildren childSections={childSections} group={group} {...tid} />
  ) : (
    <div css={Css.df.fdc.gap3.$}>
      {childSections.map((child) => (
        <FormSectionChild key={child.id ?? child.title} {...child} group={group} {...tid} />
      ))}
    </div>
  );
}

/** True only when every childSection sets `orderField` -- narrows `childSections` to the reorderable variant. */
function isReorderable(childSections: ChildSections): childSections is ReorderableFormSectionChild[] {
  return childSections.length > 0 && childSections.every((c) => !!c.orderField);
}

type DraggableChildrenProps = { childSections: ReorderableFormSectionChild[]; group?: FormSectionChildGroup };

/** Renders reorderable childSections, sorted by `orderField.value`, in a `DnDGrid`. */
function DraggableChildren(props: DraggableChildrenProps) {
  const { childSections, group, ...tid } = props;
  const sorted = sortByOrderField(childSections);

  /**
   * Permutes the childSections' existing orderField values across the new positions -- e.g. moving item 0
   * to position 1 swaps its value with whichever item lands in position 0.
   */
  const handleReorder = (newOrder: string[]) => {
    // Re-sort here, rather than reusing the outer `sorted`, so back-to-back reorders (no re-render in between) each permute off the current order, not the order as of the last render.
    const currentSorted = sortByOrderField(childSections);
    const existingValues = currentSorted.map((c) => c.orderField.value ?? 0);
    const childById = new Map(currentSorted.map((c) => [c.id, c]));
    newOrder.forEach((id, i) => {
      const value = existingValues[i];
      if (value !== undefined) {
        childById.get(id)?.orderField.set(value);
      }
    });
  };

  return (
    <DnDGrid onReorder={handleReorder} lockAxis="y" gridStyles={Css.gtc("minmax(0, 1fr)").gap3.$}>
      {sorted.map((child) => (
        <FormSectionChild key={child.id} {...child} group={group} {...tid} />
      ))}
    </DnDGrid>
  );
}

function sortByOrderField(childSections: ReorderableFormSectionChild[]): ReorderableFormSectionChild[] {
  return [...childSections].sort((a, b) => (a.orderField.value ?? 0) - (b.orderField.value ?? 0));
}
