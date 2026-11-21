import { Children, type ReactNode } from "react";
import { Css, type Properties } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type FieldRowProps = {
  /** The most columns the row shows at 640px and wider. Defaults to the child count, capped at 4. */
  columns?: FieldRowColumns;
  children: ReactNode;
};

/**
 * Lays out fields side by side in equal columns, based on the row's own width.
 *
 * At 640px and wider the row shows `columns`, at 520px to 639px it shows 2, and under 520px it shows 1.
 * Rows with the same `columns` line up.
 * See "Field rows" in `docs/layouts.md`.
 */
export function FieldRow(props: FieldRowProps) {
  const { children, columns = defaultColumns(children) } = props;
  const tid = useTestIds(props, "fieldRow");

  return (
    // Fields query this row's width, so the row reads its own container rather than the window.
    <div css={Css.w100.mw0.ctis.cn("fieldRow").$} {...tid}>
      <div css={gridStyles[columns]} {...tid.grid}>
        {children}
      </div>
    </div>
  );
}

export type FieldRowItemProps = {
  /** How many columns the item spans at 640px and wider. Keep this within the row's `columns`. Defaults to 1. */
  span?: FieldRowColumns;
  children: ReactNode;
};

/** Wraps a field in a `FieldRow` so it can span more than one column. The row's width reduces the span. */
export function FieldRowItem(props: FieldRowItemProps) {
  const { span = 1, children } = props;
  const tid = useTestIds(props, "fieldRowItem");

  return (
    <div css={itemStyles[span]} {...tid}>
      {children}
    </div>
  );
}

type FieldRowColumns = 1 | 2 | 3 | 4;

function defaultColumns(children: ReactNode): FieldRowColumns {
  const count = Children.toArray(children).length;
  return Math.min(Math.max(count, 1), 4) as FieldRowColumns;
}

// Each `ifContainer` bound is a literal, since Truss only accepts literals there.
// `gt` is exclusive, so `gt: 519` is 520px and up, and `gt: 639` is 640px and up.
// The count steps from 4 to 2, since `auto-fill` would stop at 3.
// Gap is 16px, and 24px from the `md` viewport up. `ifContainer` replaces the media selector, so the column templates stay on the container.
// Unnamed queries: this grid is the direct child of the `fieldRow` container. Items name it, since they can sit under another container.
const gridStyles: Record<FieldRowColumns, Properties> = {
  1: Css.dg.gap2.gtc("minmax(0, 1fr)").ifMdAndUp.gap3.$,
  2: Css.dg.gap2.gtc("minmax(0, 1fr)").ifMdAndUp.gap3.ifContainer({ gt: 519 }).gtc("repeat(2, minmax(0, 1fr))").$,
  3: Css.dg.gap2
    .gtc("minmax(0, 1fr)")
    .ifMdAndUp.gap3.ifContainer({ gt: 519 })
    .gtc("repeat(2, minmax(0, 1fr))")
    .ifContainer({ gt: 639 })
    .gtc("repeat(3, minmax(0, 1fr))").$,
  4: Css.dg.gap2
    .gtc("minmax(0, 1fr)")
    .ifMdAndUp.gap3.ifContainer({ gt: 519 })
    .gtc("repeat(2, minmax(0, 1fr))")
    .ifContainer({ gt: 639 })
    .gtc("repeat(4, minmax(0, 1fr))").$,
};

// Below 520px every item is one column. At 520px a span covers two tracks, and at 640px it uses `span`.
const itemStyles: Record<FieldRowColumns, Properties> = {
  1: Css.mw0.gc("span 1").$,
  2: Css.mw0.gc("span 1").ifContainer({ name: "fieldRow", gt: 519 }).gc("span 2").$,
  3: Css.mw0
    .gc("span 1")
    .ifContainer({ name: "fieldRow", gt: 519 })
    .gc("span 2")
    .ifContainer({
      name: "fieldRow",
      gt: 639,
    })
    .gc("span 3").$,
  4: Css.mw0
    .gc("span 1")
    .ifContainer({ name: "fieldRow", gt: 519 })
    .gc("span 2")
    .ifContainer({
      name: "fieldRow",
      gt: 639,
    })
    .gc("span 4").$,
};
