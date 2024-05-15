import { PropsWithChildren, ReactNode } from "react";
import { GridCellAlignment, GridColumnWithId, Kinded, RenderAs, SortHeader } from "src/components";
import { Css, Properties } from "src/Css";
import { ExpandableHeader } from "src/components/Table/components/ExpandableHeader";

type HeaderCellProps<R extends Kinded> = PropsWithChildren<{
  as: RenderAs;
  cellCss: Properties;
  classNames: string | undefined;
  colspan: number;
  tooltipEl?: ReactNode;
  content: ReactNode;
  isHeader: boolean;
  isExpandableHeader: boolean;
  isExpandable: boolean;
  column: GridColumnWithId<R>;
  tooltip: ReactNode | undefined;
  alignment: GridCellAlignment;
  canSortColumn: boolean;
  minStickyLeftOffset: number;
}>;

export function HeaderCell<R extends Kinded>(props: HeaderCellProps<R>) {
  const {
    as,
    cellCss,
    content,
    classNames,
    colspan,
    column,
    tooltip,
    isHeader,
    isExpandableHeader,
    isExpandable,
    minStickyLeftOffset,
    canSortColumn,
    alignment,
  } = props;
  const Cell = as === "table" ? "th" : "div";
  return (
    <Cell css={{ ...cellCss }} className={classNames} {...(as === "table" && { colSpan: colspan })}>
      {typeof content === "string" && isExpandableHeader && isExpandable ? (
        <ExpandableHeader
          title={content}
          column={column}
          minStickyLeftOffset={minStickyLeftOffset}
          as={as}
          tooltipEl={tooltip}
        />
      ) : typeof content === "string" && isHeader && canSortColumn ? (
        <SortHeader
          content={content}
          iconOnLeft={alignment === "right"}
          sortKey={column.serverSideSortKey ?? column.id}
          tooltipEl={tooltip}
        />
      ) : (
        <>
          <span css={Css.lineClamp2.$}>{content}</span>
          {tooltip}
        </>
      )}
    </Cell>
  );
}
