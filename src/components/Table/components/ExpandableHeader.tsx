import { type ReactNode, useCallback, useContext, useState } from "react";
import { Icon } from "src/components/Icon";
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

/** Expandable column header: label, optional tooltip, and expand icon as sibling controls. */
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
        Css.df.xs.aic.jcsb.px1
          .hPx(40)
          .mxPx(-8)
          .w("calc(100% + 16px)")
          .br4.color(Tokens.TextLinkDefault)
          .if(isHovered)
          .bgColor(Tokens.SurfaceHover).$
      }
    >
      <span
        css={
          Css.df.aic.mw0
            .if(applyStickyStyles)
            .sticky.left(`calc(var(${beamSideNavLayoutWidthVar}, 0px) + ${minStickyLeftOffset + 12}px)`)
            .pr2.bgColor(Tokens.Surface)
            .z(zIndices.tableExpandableTitle)
            .if(isHovered)
            .bgColor(Tokens.SurfaceHover).$
        }
      >
        <button
          type="button"
          aria-expanded={isExpanded}
          {...tid}
          onClick={toggle}
          css={Css.bn.bgTransparent.p0.mw0.cursorPointer.ta("inherit").color("inherit").usn.onFocusVisible.bshFocus.$}
        >
          <span css={Css.tal.lineClamp2.$}>{title}</span>
        </button>
        {tooltipEl}
      </span>

      <button
        type="button"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
        onClick={toggle}
        css={{
          ...Css.fg1.jcfe.bn.bgTransparent.pl2.fs0.df.aic.lh(0).cursorPointer.color("inherit").onFocusVisible.bshFocus
            .$,
          ...Css.if(applyStickyStyles).sticky.rightPx(12).z(zIndices.tableExpandableIcon).$,
        }}
        {...tid.icon}
      >
        {isLoading ? <Loader size="xs" /> : <Icon icon={isExpanded ? "chevronLeft" : "chevronRight"} inc={2} />}
      </button>
    </div>
  );
}
