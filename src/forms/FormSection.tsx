import { ReactNode, useRef } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { DnDGrid } from "src/components/DnDGrid/DnDGrid";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

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
  const isDraggable = draggableChildSections && !!onReorderChildSections;

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
          <DnDGrid onReorder={onReorderChildSections!} gridStyles={Css.gtc("minmax(0, 1fr)").gap3.$}>
            {childSections.map((child, i) => (
              <DraggableChildSection
                key={child.id ?? (child.title || i)}
                child={child}
                index={i}
                isLast={i === childSections.length - 1}
                tid={tid}
              />
            ))}
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
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: child.id ?? (child.title || index), itemRef });

  return (
    <div ref={itemRef} {...dragItemProps} css={Css.bb.bc(Tokens.SurfaceSeparator).pb3.if(isLast).bn.$}>
      <FormSection
        {...child}
        isChild
        dragHandle={<DnDGridItemHandle dragHandleProps={dragHandleProps} icon="drag" compact />}
        {...tid.childSection}
      />
    </div>
  );
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
