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
}

export function KeptGroupRow(props: KeptGroupRowProps) {
  const { as, columnSizes, style, row, colSpan } = props;
  const CellTag = as === "table" ? "td" : "div";
  const { tableState } = useContext(TableStateContext);
  const numHiddenSelectedRows: number = useComputed(() => tableState.keptSelectedRows.length, [tableState]);

  return (
    <CellTag
      css={{
        ...style.cellCss,
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
