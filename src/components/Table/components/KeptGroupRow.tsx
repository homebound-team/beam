import { useContext } from "react";
import { Icon } from "src/components";
import { CollapseToggle, GridDataRow, GridStyle, RenderAs, TableStateContext } from "src/components/Table";
import { Css } from "src/Css";
import { useComputed } from "src/hooks";
import { pluralize } from "src/utils";

interface KeptGroupRowProps {
  as: RenderAs;
  columnSizes: string[];
  style: GridStyle;
  row: GridDataRow<any>;
  colSpan: number;
  isLastBodyRow: boolean;
}

/**
 * Renders the synthetic group row for kept rows.
 *
 * Kept rows are user-selected leaf rows that are not currently visible in the
 * table results because a client-side search or server-side filter removed
 * them from the active dataset. We keep these rows selected and grouped so
 * users can still review or unselect them before taking bulk actions.
 */
export function KeptGroupRow(props: KeptGroupRowProps) {
  const { as, columnSizes, style, row, colSpan, isLastBodyRow } = props;
  const CellTag = as === "table" ? "td" : "div";
  const { tableState } = useContext(TableStateContext);
  const numHiddenSelectedRows: number = useComputed(() => tableState.keptRows.length, [tableState]);

  return (
    <CellTag
      css={{
        ...style.cellCss,
        ...style.betweenRowsCss,
        ...(isLastBodyRow && style.lastRowCellCss),
        ...(isLastBodyRow && style.lastRowFirstCellCss),
        ...(isLastBodyRow && style.lastRowLastCellCss),
        ...style.keptGroupRowCss,
        ...Css.pl0.w(`calc(${columnSizes.join(" + ")})`).$,
      }}
      {...(as === "table" ? { colSpan } : {})}
    >
      <div css={Css.df.aic.gapPx(12).$}>
        {/* Mimic the collapse column styles to make sure it lines up as expected */}
        <div css={Css.wPx(38).df.jcc.$}>
          <CollapseToggle row={row} compact />
        </div>

        <div css={Css.df.aic.gap1.$}>
          <Icon icon="infoCircle" inc={2} />
          {`${numHiddenSelectedRows} selected ${pluralize(numHiddenSelectedRows, "row")} hidden due to filters`}
        </div>
      </div>
    </CellTag>
  );
}
