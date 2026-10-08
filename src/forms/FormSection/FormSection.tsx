import type { FieldState } from "@homebound/form-state";
import type { ReactNode } from "react";
import { useRadioGroup } from "react-aria";
import { type RadioGroupState, useRadioGroupState } from "react-stately";
import { DnDGrid } from "src/components/DnDGrid/DnDGrid";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import type { HeaderAction } from "src/components/Headers/HeaderActions";
import { Css } from "src/Css";
import { useComputed } from "src/hooks/useComputed";
import { stickyNavAndHeaderOffset } from "src/layouts/layoutVars";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";
import { FormSectionChild, type PlainFormSectionChild, type ReorderableFormSectionChild } from "./FormSectionChild";

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
 * `selectedChildField` renders a radio on every child and holds the selected child's `id`.
 * When it's set, each childSection must have an `id` and cannot declare `selectedField`.
 */
export type FormSectionProps = FormSectionBaseProps &
  (
    | { childSections?: PlainFormSectionChild[] | ReorderableFormSectionChild[]; selectedChildField?: never }
    | {
        childSections:
          | (PlainFormSectionChild & { id: string; selectedField?: never })[]
          | (ReorderableFormSectionChild & { selectedField?: never })[];
        selectedChildField: FieldState<string | null | undefined>;
      }
  );

export function FormSection(props: FormSectionProps) {
  const { title, description, actions, fields, childSections, selectedChildField } = props;
  const tid = useTestIds(props, "formSection");
  const { state, props: radioGroupProps } = useChildRadioGroup(selectedChildField, title);
  const maybeRadioProps = radioGroupProps ? { ...radioGroupProps, ...tid.childRadioGroup } : {};

  return (
    <div
      id={defaultTestId(title)}
      css={Css.df.fdc.gap2.add("scrollMarginTop", stickyNavAndHeaderOffset()).$}
      {...tid.section}
    >
      <ContentHeader {...tid} title={title} description={description} actions={actions} level={3} />
      {fields}
      {childSections && (
        <div {...maybeRadioProps}>
          {isReorderable(childSections) ? (
            <DraggableChildren childSections={childSections} radioGroupState={state} {...tid.childSection} />
          ) : (
            <div css={Css.df.fdc.gap3.$}>
              {childSections.map((child) => (
                <FormSectionChild
                  key={child.id ?? child.title}
                  {...child}
                  radioGroupState={state}
                  {...tid.childSection}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Binds `selectedChildField` to a single radio group shared by every child; both values are `undefined` when not set. */
function useChildRadioGroup(field: FieldState<string | null | undefined> | undefined, label: string) {
  const { value, readOnly } = useComputed(
    () => ({ value: field?.value ?? null, readOnly: !!field?.readOnly }),
    [field],
  );
  const state = useRadioGroupState({
    value,
    onChange: (value) => {
      field?.set(value);
      field?.maybeAutoSave();
    },
    isDisabled: readOnly,
  });
  const { radioGroupProps } = useRadioGroup(
    { "aria-label": label, isDisabled: readOnly, onFocus: () => field?.focus(), onBlur: () => field?.blur() },
    state,
  );
  return field ? { state, props: radioGroupProps } : { state: undefined, props: undefined };
}

/** True only when every childSection sets `orderField` -- narrows `childSections` to the reorderable variant. */
function isReorderable(
  childSections: PlainFormSectionChild[] | ReorderableFormSectionChild[],
): childSections is ReorderableFormSectionChild[] {
  return childSections.length > 0 && childSections.every((c) => !!c.orderField);
}

type DraggableChildrenProps = { childSections: ReorderableFormSectionChild[]; radioGroupState?: RadioGroupState };

/** Renders reorderable childSections, sorted by `orderField.value`, in a `DnDGrid`. */
function DraggableChildren(props: DraggableChildrenProps) {
  const { childSections, radioGroupState, ...tid } = props;
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
        <FormSectionChild key={child.id} {...child} radioGroupState={radioGroupState} {...tid} />
      ))}
    </DnDGrid>
  );
}

function sortByOrderField(childSections: ReorderableFormSectionChild[]): ReorderableFormSectionChild[] {
  return [...childSections].sort((a, b) => (a.orderField.value ?? 0) - (b.orderField.value ?? 0));
}
