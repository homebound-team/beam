import React, { useContext } from "react";
import { Icon } from "src/components/Icon";
import { GridSortContext } from "src/components/Table/GridSortContext";
import { Css, Properties } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

/**
 * Wraps column header names with up/down sorting icons.
 *
 * GridTable will use this automatically if the header content is just a text string.
 *
 * Alternatively, callers can also:
 *
 * - Instantiate this SortHeader directly with some customizations in `xss`, or
 * - Write their own component that uses `GridSortContext` to access the column's
 *   current sort state + `toggleSort` function
 */
export function SortHeader(props: { content: string; xss?: Properties }) {
  const { content, xss } = props;
  const { sorted, toggleSort } = useContext(GridSortContext);
  const tid = useTestIds(props, "sortHeader");
  return (
    <div {...tid} css={{ ...Css.df.aic.cursorPointer.selectNone.$, ...xss }} onClick={toggleSort}>
      {content}
      {sorted === "ASC" && <Icon icon="sortUp" inc={2} {...tid.icon} xss={Css.mlPx(4).$} />}
      {sorted === "DESC" && <Icon icon="sortDown" inc={2} {...tid.icon} xss={Css.mlPx(4).$} />}
    </div>
  );
}
