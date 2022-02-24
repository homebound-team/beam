import React, { useContext } from "react";
import { Icon } from "src/components/Icon";
import { GridSortContext } from "src/components/Table/GridSortContext";
import { GridCellAlignment } from "src/components/Table/types";
import { alignmentToJustify } from "src/components/Table/utils";
import { Css, Palette, Properties } from "src/Css";
import { useHover } from "src/hooks";
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
export function SortHeader(props: { content: string; xss?: Properties; alignment: GridCellAlignment }) {
  const { content, xss, alignment } = props;
  const iconOnLeft = alignment === "right";
  const { isHovered, hoverProps } = useHover({});
  const { sorted, toggleSort } = useContext(GridSortContext);
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
    <div
      {...tid}
      css={{ ...Css.df.aic.h100.cursorPointer.jc(alignmentToJustify[alignment]).selectNone.$, ...xss }}
      {...hoverProps}
      onClick={toggleSort}
    >
      {iconOnLeft && icon}
      {content}
      {!iconOnLeft && icon}
    </div>
  );
}
