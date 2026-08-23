import { ReactNode } from "react";
import { DnDGrid } from "src/components/DnDGrid/DnDGrid";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { HeaderAction } from "src/components/Headers/HeaderActions";
import { Css } from "src/Css";
import { stickyNavAndHeaderOffset } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { FormSectionChild, type PlainFormSectionChild, type ReorderableFormSectionChild } from "./FormSectionChild";

/** @see {@link HeaderAction} */
export type FormSectionAction = HeaderAction;

export type FormSectionProps = {
  title: string;
  description?: ReactNode;
  actions?: HeaderAction[];
  fields?: ReactNode;
  childSections?: PlainFormSectionChild[] | ReorderableFormSectionChild[];
  /**
   * When true, `FocusedFormLayout` omits this section from the JumpLinks rail. The section root `id`
   * is still `defaultTestId(title)` (keep titles unique on a page).
   */
  excludeJumpLink?: boolean;
};

export function FormSection(props: FormSectionProps) {
  const { title, description, actions, fields, childSections } = props;
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
