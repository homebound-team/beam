import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { navLink } from "src/components/CssReset";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { RowStyle, tableRowStyles } from "src/components/Table/TableStyles";
import { GridCellAlignment, GridColumnWithId, Kinded, MaybeFn, RenderAs } from "src/components/Table/types";
import { Css, Properties, Typography } from "src/Css";

/**
 * Allows a cell to be more than just a RectNode, i.e. declare its alignment or
 * primitive value for filtering and sorting.
 */
export type GridCellContent = {
  /** The JSX content of the cell. Virtual tables that client-side sort should use a function to avoid perf overhead. */
  content: ReactNode | (() => ReactNode);
  alignment?: GridCellAlignment;
  /** Allow value to be a function in case it's a dynamic value i.e. reading from an inline-edited proxy. */
  value?: MaybeFn<number | string | Date | boolean | null | undefined>;
  /** The value to use specifically for sorting (i.e. if `value` is used for filtering); defaults to `value`. */
  sortValue?: MaybeFn<number | string | Date | boolean | null | undefined>;
  /** Whether to indent the cell. */
  indent?: 1 | 2;
  colspan?: number;
  typeScale?: Typography;
  /** Allows the cell to stay in place when the user scrolls horizontally, i.e. frozen columns. */
  sticky?: "left" | "right";
  /** If provided, content of the cell will be wrapped within a <button /> or <a /> tag depending on if the value is a function or a string. */
  onClick?: () => {} | string;
  /** Custom css to apply directly to this cell, i.e. cell-specific borders. */
  css?: Properties;
  /** Allows cell to reveal content when the user hovers over a row. Content must be wrapped in an element in order to be hidden. IE <div>{value}</div>*/
  revealOnRowHover?: true;
};

/** Allows rendering a specific cell. */
export type RenderCellFn<R extends Kinded> = (
  idx: number,
  css: Properties,
  content: ReactNode,
  row: R,
  rowStyle: RowStyle<R> | undefined,
  classNames: string | undefined,
  onClick: (() => void) | undefined,
) => ReactNode;

/** Renders our default cell element, i.e. if no row links and no custom renderCell are used. */
export const defaultRenderFn: (as: RenderAs) => RenderCellFn<any> =
  (as: RenderAs) => (key, css, content, row, rowStyle, classNames: string | undefined, onClick) => {
    const Cell = as === "table" ? "td" : "div";
    return (
      <Cell key={key} css={{ ...css, ...tableRowStyles(as) }} className={classNames} onClick={onClick}>
        {content}
      </Cell>
    );
  };

/**
 * Sets up the `GridContext` so that header cells can access the current sort settings.
 * Used for the Header, Totals, and Expanded Header row's cells.
 * */
export const headerRenderFn: (column: GridColumnWithId<any>, as: RenderAs, colSpan: number) => RenderCellFn<any> =
  (column, as, colSpan) => (key, css, content, row, rowStyle, classNames: string | undefined) => {
    const Cell = as === "table" ? "th" : "div";
    return (
      <Cell
        key={key}
        css={{ ...css, ...tableRowStyles(as, column) }}
        className={classNames}
        {...(as === "table" && { colSpan })}
      >
        {content}
      </Cell>
    );
  };

/** Renders a cell element when a row link is in play. */
export const rowLinkRenderFn: (as: RenderAs) => RenderCellFn<any> =
  (as: RenderAs) => (key, css, content, row, rowStyle, classNames: string | undefined) => {
    const to = rowStyle!.rowLink!(row);
    if (as === "table") {
      return (
        <td key={key} css={{ ...css, ...tableRowStyles(as) }} className={classNames}>
          <Link to={to} css={Css.noUnderline.color("unset").db.$} className={navLink}>
            {content}
          </Link>
        </td>
      );
    }
    return (
      <Link
        key={key}
        to={to}
        css={{ ...Css.noUnderline.color("unset").$, ...css }}
        className={`${navLink} ${classNames}`}
      >
        {content}
      </Link>
    );
  };

/** Renders a cell that will fire the RowStyle.onClick. */
export const rowClickRenderFn: (as: RenderAs, api: GridTableApi<any>) => RenderCellFn<any> =
  (as: RenderAs, api: GridTableApi<any>) =>
  (key, css, content, row, rowStyle, classNames: string | undefined, onClick) => {
    const Row = as === "table" ? "tr" : "div";
    return (
      <Row
        {...{ key }}
        css={{ ...css, ...tableRowStyles(as) }}
        className={classNames}
        onClick={(e) => {
          rowStyle!.onClick!(row, api);
          onClick && onClick();
        }}
      >
        {content}
      </Row>
    );
  };
