import { Meta } from "@storybook/react";
import { useCallback, useMemo, useState } from "react";
import { Button, collapseColumn, column, GridColumn, GridDataRow, GridTable, simpleHeader } from "src/components";
import { Css } from "src/Css";
import { withRouter, zeroTo } from "src/utils/sb";
import { SelectField } from "../SelectField";

export default {
  parameters: { layout: "fullscreen", backgrounds: { default: "white" } },
  decorators: [withRouter()],
} as Meta;

export function InVirtualizedTable() {
  const [extraColumn, setExtraColumn] = useState(true);
  const loadRows = useCallback((offset: number) => {
    return zeroTo(50).map((i) => ({
      kind: "data" as const,
      id: String(i + offset),
      data: { name: `row ${i + offset}`, value: i + offset },
    }));
  }, []);

  const options = useMemo(() => {
    return zeroTo(50).map((i) => ({ id: i, name: `option ${i}` }));
  }, []);

  const [data, setData] = useState<GridDataRow<Row>[]>(() => loadRows(0));
  const rows: GridDataRow<Row>[] = useMemo(() => [simpleHeader, ...data], [data]);
  const columns: GridColumn<Row>[] = useMemo(
    () => [
      ...(extraColumn ? [collapseColumn<Row>()] : []),
      column<Row>({ header: "Name", data: ({ name }) => name, w: "100px" }),
      column<Row>({
        header: "Value",
        data: ({ value }) => (
          <SelectField
            label="test"
            options={options}
            value={value}
            onSelect={() => {}}
            getOptionLabel={(o) => o.name}
            getOptionValue={(o) => o.id}
          />
        ),
        w: "200px",
      }),
    ],
    [extraColumn, options],
  );
  return (
    <div css={Css.df.fdc.vh100.$}>
      <Button onClick={() => setExtraColumn(!extraColumn)} label="Toggle Extra Column" />
      <div css={Css.fg1.$}>
        <GridTable
          as="virtual"
          columns={columns}
          rows={rows}
          infiniteScroll={{
            onEndReached(index) {
              setData([...data, ...loadRows(index)]);
            },
          }}
        />
      </div>
    </div>
  );
}

InVirtualizedTable.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const button = canvasElement.querySelector("button");
  // When we toggle the extra column, the table will re-render
  button?.click();
};

type HeaderRow = { kind: "header"; data: undefined };
type ChildRow = { kind: "data"; id: string; data: { name: string; value: number } };

type Row = HeaderRow | ChildRow;
