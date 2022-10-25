import React, { useCallback, useContext } from "react";
import { Icon } from "src/components/Icon";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { Css, Palette, Properties } from "src/Css";
import { useComputed, useHover } from "src/hooks";
import { useTestIds } from "src/utils/useTestIds";

interface SortHeaderProps {
  content: string;
  xss?: Properties;
  iconOnLeft?: boolean;
  sortKey: string;
}

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
export function SortHeader(props: SortHeaderProps) {
  const { content, xss, iconOnLeft = false, sortKey } = props;
  const { isHovered, hoverProps } = useHover({});
  const { tableState } = useContext(TableStateContext);
  const current = useComputed(() => tableState.sortState?.current, [tableState]);
  const sorted = sortKey === current?.columnId ? current?.direction : undefined;
  const toggleSort = useCallback(() => tableState.setSortKey(sortKey), [sortKey, tableState]);

  const tid = useTestIds(props, "sortHeader");

  const icon = (
    <span css={Css.fs0.$}>
      <Icon
        icon={sorted === "DESC" ? "sortDown" : "sortUp"}
        color={sorted !== undefined ? Palette.LightBlue700 : Palette.Gray400}
        xss={{
          ...Css.ml1.if(iconOnLeft).mr1.ml0.$,
          ...Css.visibility("hidden")
            .if(isHovered || sorted !== undefined)
            .visibility("visible").$,
        }}
        inc={2}
        {...tid.icon}
      />
    </span>
  );
  return (
    <div {...tid} css={{ ...Css.df.aic.h100.cursorPointer.selectNone.$, ...xss }} {...hoverProps} onClick={toggleSort}>
      {iconOnLeft && icon}
      {content}
      {!iconOnLeft && icon}
    </div>
  );
}
