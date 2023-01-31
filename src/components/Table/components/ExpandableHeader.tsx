import { useContext, useState } from "react";
import { Icon } from "src/components/Icon";
import { GridColumnWithId, Kinded, RenderAs } from "src/components/Table/types";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { zIndices } from "src/components/Table/utils/utils";
import { Css } from "src/Css";
import { useComputed, useHover } from "src/hooks";
import { isFunction } from "src/utils";
import { Loader } from "../../Loader";

interface ExpandableHeaderProps<R extends Kinded> {
  title: string;
  column: GridColumnWithId<R>;
  minStickyLeftOffset: number;
  as: RenderAs;
}

export function ExpandableHeader<R extends Kinded>(props: ExpandableHeaderProps<R>) {
  const { title, column, minStickyLeftOffset, as } = props;
  const { tableState } = useContext(TableStateContext);
  const expandedColumnIds = useComputed(() => tableState.expandedColumnIds, [tableState]);
  const isExpanded = expandedColumnIds.includes(column.id);
  const [isLoading, setIsLoading] = useState(false);
  // Do not apply sticky styles when rendering as table. Currently the table does not properly respect column widths, causing the sticky offsets to be incorrect
  const applyStickyStyles = isExpanded && as !== "table";
  const { hoverProps, isHovered } = useHover({});

  return (
    <button
      {...hoverProps}
      css={
        Css.df.xsMd.aic.jcsb.gap2.px1.hPx(32).mxPx(-8).w("calc(100% + 16px)").br4.lightBlue700.if(isHovered).bgGray100.$
      }
      onClick={async () => {
        if (isFunction(column.expandColumns)) {
          setIsLoading(true);
          await tableState.loadExpandedColumns(column);
          // manually calling this as loadExpandedColumns does not toggle
          tableState.toggleExpandedColumn(column.id);
          setIsLoading(false);
        } else {
          tableState.toggleExpandedColumn(column.id);
        }
      }}
      data-testid="expandableColumn"
    >
      <span
        css={
          Css.tl.lineClamp2
            .if(applyStickyStyles)
            .sticky.leftPx(minStickyLeftOffset + 12)
            .pr2.mr2.bgWhite.z(zIndices.expandableHeaderTitle)
            .if(isHovered).bgGray100.$
        }
      >
        {title}
      </span>
      <span css={Css.if(applyStickyStyles).sticky.rightPx(12).z(zIndices.expandableHeaderIcon).$}>
        {isLoading ? <Loader size="xs" /> : <Icon icon={isExpanded ? "chevronLeft" : "chevronRight"} inc={2} />}
      </span>
    </button>
  );
}
