import type { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { ReactNode, useRef } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { DnDGrid } from "src/components/DnDGrid/DnDGrid";
import { DnDGridItemHandle } from "src/components/DnDGrid/DnDGridItemHandle";
import { useDnDGridItem } from "src/components/DnDGrid/useDnDGridItem";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

type FormSectionCommon = {
  title: string;
  description?: ReactNode;
  /** Rendered top-right of the title row. */
  actions?: ButtonProps[];
  fields?: ReactNode;
  /** @internal smaller title styling for nested sections. */
  isChild?: boolean;
  /** @internal omits the bottom separator for the last of a set of reorderable siblings. */
  isLast?: boolean;
};

/** Either `childSections` is absent/plain, or `onReorderChildSections` is set and every entry is reorderable. */
type ChildSectionsUnion =
  | { onReorderChildSections?: undefined; childSections?: FormSectionBase[] }
  | { onReorderChildSections: (newOrder: string[]) => void; childSections?: ReorderableFormSection[] };

/** Any form section — title/description/actions row, then `fields`, then any recursive `childSections`. */
export type FormSectionBase = FormSectionCommon & { id?: string } & ChildSectionsUnion;

/** A `childSections` entry usable in a reorderable list — requires `id` and `orderField`. */
export type ReorderableFormSection = FormSectionCommon & {
  id: string;
  orderField: FieldState<number | null | undefined>;
} & ChildSectionsUnion;

/** @deprecated use `FormSectionBase` */
export type FormSectionProps = FormSectionBase;

export function FormSection(props: FormSectionBase | ReorderableFormSection) {
  const {
    title,
    description,
    actions,
    fields,
    childSections,
    isChild = false,
    isLast = false,
    onReorderChildSections,
  } = props;
  const tid = useTestIds(props, "formSection");
  const itemRef = useRef(null);
  const orderField = "orderField" in props ? props.orderField : undefined;
  const dragId = ("id" in props ? props.id : undefined) ?? title;
  const { dragItemProps, dragHandleProps } = useDnDGridItem({ id: dragId, itemRef });
  const isReorderableEntry = !!orderField;
  const isDraggableParent = !!onReorderChildSections;

  // Safe: `onReorderChildSections` being set means `childSections` (if any) is `ReorderableFormSection[]`,
  // per the discriminated union above — TS can't track that correlation through the destructure above,
  // so assert it once here instead of fighting the type checker at every use site below.
  const reorderableChildSections = childSections as ReorderableFormSection[] | undefined;

  const handleReorder = (newOrder: string[]) => {
    if (reorderableChildSections) {
      const sorted = [...reorderableChildSections].sort(
        (a, b) => (a.orderField.value ?? 0) - (b.orderField.value ?? 0),
      );
      const existingValues = sorted.map((c) => c.orderField.value ?? 0);
      const childById = new Map(sorted.map((c) => [c.id, c]));
      newOrder.forEach((id, i) => childById.get(id)?.orderField.set(existingValues[i]!));
    }
    onReorderChildSections?.(newOrder);
  };

  return (
    <div
      ref={isReorderableEntry ? itemRef : undefined}
      {...(isReorderableEntry ? dragItemProps : {})}
      css={
        !isReorderableEntry
          ? Css.df.fdc.gap2.$
          : isLast
            ? Css.df.fdc.gap2.bgColor(Tokens.Surface).pb3.$
            : Css.df.fdc.gap2.bgColor(Tokens.Surface).bb.bc(Tokens.SurfaceSeparator).pb3.$
      }
      {...tid}
    >
      {isReorderableEntry && (
        <Observer>
          {() => <input type="hidden" data-testid="orderInput" readOnly value={orderField!.value ?? 0} />}
        </Observer>
      )}
      <div css={Css.df.jcsb.$}>
        <div css={Css.df.fdc.gapPx(12).$}>
          <div css={Css.df.aic.gap1.$}>
            {isReorderableEntry && <DnDGridItemHandle dragHandleProps={dragHandleProps} icon="drag" compact />}
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
        (isDraggableParent ? (
          <DnDGrid onReorder={handleReorder} gridStyles={Css.gtc("minmax(0, 1fr)").gap3.$}>
            <Observer>
              {() => {
                const sorted = [...reorderableChildSections!].sort(
                  (a, b) => (a.orderField.value ?? 0) - (b.orderField.value ?? 0),
                );
                return (
                  <>
                    {sorted.map((child, i) => (
                      <FormSection
                        key={child.id}
                        {...child}
                        isChild
                        isLast={i === sorted.length - 1}
                        {...tid.childSection}
                      />
                    ))}
                  </>
                );
              }}
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
