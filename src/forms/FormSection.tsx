import type { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { ReactNode, useRef } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { DnDGrid } from "src/components/DnDGrid/DnDGrid";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";
import { Css, Tokens } from "src/Css";
import { isDefined, useTestIds } from "src/utils";

export type FormSectionProps = {
  title: string;
  description?: ReactNode;
  /** Rendered top-right of the title row, e.g. an "Add" button. */
  actions?: ButtonProps[];
  fields?: ReactNode;
  childSections?: Omit<FormSectionProps, "isChild" | "dragHandle">[];
  /** Nested-section styling (smaller title). Set automatically by `FormSection`'s own recursion over `childSections` — don't set this yourself. */
  isChild?: boolean;
  /**
   * Stable identifier for this section. Used as the React key for `childSections`, and — when the
   * parent section has `draggableChildSections` set — as the id returned in `onReorderChildSections`'s
   * new-order array. Falls back to `title`, then array index, when omitted; supply a stable `id`
   * whenever a section may appear in a draggable `childSections` list, since titles aren't guaranteed unique.
   */
  id?: string;
  /**
   * Opts into mouse/touch/keyboard drag-and-drop reordering of `childSections` (via `DnDGrid`), with a
   * drag handle rendered next to each child section's title. Has no effect without `childSections`,
   * and is a no-op unless `onReorderChildSections` is also provided.
   */
  draggableChildSections?: boolean;
  /**
   * Called with the new order of `childSections`' `id`s (falling back to `title`, then index) once a
   * drag-and-drop or keyboard reorder completes. Provide together with `draggableChildSections` to enable
   * reordering; omitting either leaves rendering/behavior unchanged.
   */
  onReorderChildSections?: (newOrder: string[]) => void;
  /**
   * Tracks this section's display order when it's rendered as a draggable `childSection`. When provided,
   * `FormSection` renders a `<input type="hidden">` mirroring `orderField.value` (falling back to the
   * section's position among its siblings when `value` is `null`/`undefined`), permutes it into sync via
   * `orderField.set(...)` whenever a drag/keyboard reorder commits — reassigning the *existing* set of
   * order values held by these `childSections` rather than writing fresh 0-based indices, so it stays
   * correct even when those values aren't zero-based (e.g. they share a numbering space with sections
   * outside this `childSections` list) — and sorts `childSections` by `orderField.value` on every render
   * (only takes effect when *every* childSection has one; otherwise array order is preserved). Also
   * unlocks dragging on its own, without requiring `onReorderChildSections`. Has no effect outside a
   * draggable `childSections` list.
   */
  orderField?: FieldState<number | null | undefined>;
  /** @internal Set automatically by `FormSection`'s own recursion when rendering a draggable `childSections` entry — don't set this yourself. */
  dragHandle?: ReactNode;
};

/** A titled section of form content — title/description/actions row, then `fields`, then any recursively-rendered `childSections`. */
export function FormSection(props: FormSectionProps) {
  const {
    title,
    description,
    actions,
    fields,
    childSections,
    isChild = false,
    draggableChildSections = false,
    onReorderChildSections,
    dragHandle,
  } = props;
  const tid = useTestIds(props, "formSection");
  const hasOrderFields = !!childSections?.some((c) => !!c.orderField);
  const isDraggable = draggableChildSections && (!!onReorderChildSections || hasOrderFields);

  const handleReorder = (newOrder: string[]) => {
    if (childSections && hasCompleteOrderFields(childSections)) {
      const sorted = sortByOrderField(childSections);
      const childById = new Map(sorted.map((child, i) => [getChildId(child, i), child]));
      const existingValues = sorted.map((c) => c.orderField!.value!);
      newOrder.forEach((id, i) => childById.get(id)?.orderField?.set(existingValues[i]!));
    }
    onReorderChildSections?.(newOrder);
  };

  return (
    <div css={Css.df.fdc.gap2.$} {...tid}>
      <div css={Css.df.jcsb.$}>
        <div css={Css.df.fdc.gapPx(12).$}>
          <div css={Css.df.aic.gap1.$}>
            {dragHandle}
            {getTitle(title, isChild, tid)}
          </div>
          {description && (
            <div css={Css.sm.color(Tokens.OnSurface).$} {...tid.description}>
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div css={Css.df.gap1.fs0.$} {...tid.actions}>
            {actions.map((action) => (
              <Button key={`${action.label}`} {...action} />
            ))}
          </div>
        )}
      </div>
      {fields}
      {childSections &&
        (isDraggable ? (
          <DnDGrid onReorder={handleReorder} gridStyles={Css.gtc("minmax(0, 1fr)").gap3.$}>
            {/* Observer: `sortByOrderField` reads each child's `orderField.value` — without this, the
                order here would only refresh on some unrelated re-render, not on the `.set()` calls
                `handleReorder`/consumers make directly to those FieldStates. */}
            <Observer>
              {() => (
                <>
                  {sortByOrderField(childSections).map((child, i) => (
                    <DraggableChildSection
                      key={getChildId(child, i)}
                      child={child}
                      index={i}
                      isLast={i === childSections.length - 1}
                      tid={tid}
                    />
                  ))}
                </>
              )}
            </Observer>
          </DnDGrid>
        ) : (
          <div css={Css.df.fdc.gap3.$}>
            {childSections.map((child, i) => (
              <div key={child.title || i} css={Css.bb.bc(Tokens.SurfaceSeparator).pb3.ifLastOfType.bn.$}>
                <FormSection {...child} isChild {...tid.childSection} />
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

type DraggableChildSectionProps = {
  child: Omit<FormSectionProps, "isChild" | "dragHandle">;
  index: number;
  isLast: boolean;
  tid: Record<string, object>;
};

/**
 * The ref/`dragItemProps` must go on this wrapper (not on `FormSection`'s own root) because it must
 * remain a *direct child* of `DnDGrid`'s container — `DnDGrid` reparents this exact node via
 * `insertBefore` while dragging. The border-bottom separator is computed from `index`/`isLast` rather
 * than `:last-of-type`, since `DnDGrid` briefly inserts a cloned placeholder `div` as a sibling during a
 * drag, which can otherwise transiently steal `:last-of-type` from the real last section.
 */
function DraggableChildSection({ child, index, isLast, tid }: DraggableChildSectionProps) {
  const itemRef = useRef(null);
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: getChildId(child, index), itemRef });

  return (
    <div ref={itemRef} {...dragItemProps} css={isLast ? Css.pb3.$ : Css.bb.bc(Tokens.SurfaceSeparator).pb3.$}>
      {child.orderField && (
        <Observer>
          {() => <input type="hidden" data-testid="orderInput" readOnly value={child.orderField!.value ?? index} />}
        </Observer>
      )}
      <FormSection
        {...child}
        isChild
        dragHandle={<DnDGridItemHandle dragHandleProps={dragHandleProps} icon="drag" compact />}
        {...tid.childSection}
      />
    </div>
  );
}

function getChildId(child: Omit<FormSectionProps, "isChild" | "dragHandle">, index: number): string {
  return String(child.id ?? (child.title || index));
}

/** Sorts by `orderField.value` only when *every* entry has one; otherwise preserves array order. */
function sortByOrderField(
  childSections: NonNullable<FormSectionProps["childSections"]>,
): NonNullable<FormSectionProps["childSections"]> {
  if (!hasCompleteOrderFields(childSections)) return childSections;
  return [...childSections].sort((a, b) => a.orderField!.value! - b.orderField!.value!);
}

function hasCompleteOrderFields(childSections: NonNullable<FormSectionProps["childSections"]>): boolean {
  return childSections.every((c) => c.orderField && isDefined(c.orderField.value));
}

function getTitle(title: string, isChild: boolean, tid: Record<string, object>) {
  if (isChild) {
    return (
      <h3 css={Css.mdSb.$} {...tid.title}>
        {title}
      </h3>
    );
  }
  return (
    <h2 css={Css.lg.$} {...tid.title}>
      {title}
    </h2>
  );
}
