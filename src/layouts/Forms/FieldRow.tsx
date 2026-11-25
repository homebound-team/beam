import { Children, type ReactNode } from "react";
import { Css, type Properties } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type FieldRowColumns = 1 | 2 | 3 | 4;

export type FieldRowProps = {
  /** The most columns the row shows at 640px and wider. Defaults to the child count, capped at 4. */
  columns?: FieldRowColumns;
  children: ReactNode;
};

/**
 * Lays out fields side by side in equal columns, based on the row's own width.
 *
 * At 640px and wider the row shows `columns`, at 376px to 639px it shows 2, and under 376px it shows 1.
 * See "Field layouts" in `docs/layouts.md`.
 */
export function FieldRow(props: FieldRowProps) {
  const { children, columns = defaultColumns(children) } = props;
  const tid = useTestIds(props, "fieldRow");

  return (
    // Fields query this row's width, so the row reads its own container rather than the window.
    <div css={Css.w100.mw0.ctis.$} {...tid}>
      <div css={gridStyles[columns]} {...tid.grid}>
        {children}
      </div>
    </div>
  );
}

export type FieldRowItemProps = {
  /** How many columns the item spans at 640px and wider. Keep it within the row's `columns`. Defaults to 1. */
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

function defaultColumns(children: ReactNode): FieldRowColumns {
  const count = Children.toArray(children).length;
  return Math.min(Math.max(count, 1), 4) as FieldRowColumns;
}

// Each `ifContainer` bound is a literal, since Truss only accepts literals there.
// `gt` is exclusive, so `gt: 375` is 376px and up, and `gt: 639` is 640px and up.
// Unnamed queries resolve to the nearest container: the row for the grid, and for an item, which is a direct child of the grid.
const gridStyles: Record<FieldRowColumns, Properties> = {
  1: Css.dg.gap2.gtc("minmax(0, 1fr)").$,
  2: Css.dg.gap2.gtc("minmax(0, 1fr)").ifContainer({ gt: 375 }).gtc("repeat(2, minmax(0, 1fr))").$,
  3: Css.dg.gap2
    .gtc("minmax(0, 1fr)")
    .ifContainer({ gt: 375 })
    .gtc("repeat(2, minmax(0, 1fr))")
    .ifContainer({ gt: 639 })
    .gtc("repeat(3, minmax(0, 1fr))").$,
  4: Css.dg.gap2
    .gtc("minmax(0, 1fr)")
    .ifContainer({ gt: 375 })
    .gtc("repeat(2, minmax(0, 1fr))")
    .ifContainer({ gt: 639 })
    .gtc("repeat(4, minmax(0, 1fr))").$,
};

const itemStyles: Record<FieldRowColumns, Properties> = {
  1: Css.mw0.$,
  2: Css.mw0.ifContainer({ gt: 375 }).gc("span 2").$,
  3: Css.mw0.ifContainer({ gt: 375 }).gc("span 2").ifContainer({ gt: 639 }).gc("span 3").$,
  4: Css.mw0.ifContainer({ gt: 375 }).gc("span 2").ifContainer({ gt: 639 }).gc("span 4").$,
};
