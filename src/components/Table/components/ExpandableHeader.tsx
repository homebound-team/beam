import { type ReactNode, useCallback, useContext, useState } from "react";
import { Icon } from "src/components/Icon";
import { expandableHeaderRowHeight } from "src/components/Table/TableStyles";
import type { GridColumnWithId, Kinded, RenderAs } from "src/components/Table/types";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { Css, Tokens } from "src/Css";
import { useComputed } from "src/hooks/useComputed";
import { useHover } from "src/hooks/useHover";
import { beamSideNavLayoutWidthVar } from "src/layouts/layoutVars";
import { isFunction } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";
import { Loader } from "../../Loader";

type ExpandableHeaderProps<R extends Kinded> = {
  title: string;
  column: GridColumnWithId<R>;
  minStickyLeftOffset: number;
  as: RenderAs;
  tooltipEl?: ReactNode;
};

/** Expandable column header: the whole cell toggles expansion, except the optional tooltip icon. */
export function ExpandableHeader<R extends Kinded>(props: ExpandableHeaderProps<R>) {
  const { title, column, minStickyLeftOffset, as, tooltipEl } = props;
  const { tableState } = useContext(TableStateContext);
  const expandedColumnIds = useComputed(() => tableState.expandedColumnIds, [tableState]);
  const isExpanded = expandedColumnIds.includes(column.id);
  const [isLoading, setIsLoading] = useState(false);
  // Do not apply sticky styles when rendering as table. Currently the table does not properly respect column widths, causing the sticky offsets to be incorrect
  const applyStickyStyles = isExpanded && as !== "table";
  const { hoverProps, isHovered } = useHover({});
  const tid = useTestIds(props, "expandableColumn");
  const toggle = useCallback(async () => {
    if (isFunction(column.expandColumns)) {
      setIsLoading(true);
      await tableState.loadExpandedColumns(column.id);
      setIsLoading(false);
    }
    // manually calling this as loadExpandedColumns does not toggle
    tableState.toggleExpandedColumn(column.id);
  }, [column, tableState]);

  return (
    <div
      {...hoverProps}
      css={
        Css.relative.df.xs.aic.jcsb.px1
          .hPx(expandableHeaderRowHeight)
          .mxPx(-8)
          .w("calc(100% + 16px)")
          .br4.color(Tokens.TextLinkDefault)
          .if(isHovered)
          .bgColor(Tokens.SurfaceHover).$
      }
    >
      {/* Covers the whole cell so the click target isn't limited by the sticky title and icon */}
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-label={title}
        onClick={toggle}
        css={Css.absolute.inset0.bn.bgTransparent.p0.br4.cursorPointer.outline(0).onFocusVisible.bshFocus.$}
        {...tid}
      />
      <span
        css={
          Css.df.aic.pen
            .if(applyStickyStyles)
            .sticky.left(`calc(var(${beamSideNavLayoutWidthVar}, 0px) + ${minStickyLeftOffset + 12}px)`)
            .pr2.bgColor(Tokens.Surface)
            .z(zIndices.tableExpandableTitle)
            .if(isHovered)
            .bgColor(Tokens.SurfaceHover).$
        }
      >
        {/* line-clamp's overflow:hidden would otherwise let this flex item shrink to 0 */}
        <span css={Css.tal.lineClamp2.usn.mwminc.$} aria-hidden>
          {title}
        </span>
        {tooltipEl && <span css={Css.relative.df.aic.pea.$}>{tooltipEl}</span>}
      </span>
      <span
        css={Css.df.aic.pl2.fs0.lh(0).pen.if(applyStickyStyles).sticky.rightPx(12).z(zIndices.tableExpandableIcon).$}
        aria-hidden
      >
        {isLoading ? <Loader size="xs" /> : <Icon icon={isExpanded ? "chevronLeft" : "chevronRight"} inc={2} />}
      </span>
    </div>
  );
}
