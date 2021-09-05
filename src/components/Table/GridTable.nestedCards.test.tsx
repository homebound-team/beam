import React from "react";
import { GridColumn, GridTable } from "src/components/Table/GridTable";
import { simpleHeader, SimpleHeaderAndDataOf } from "src/components/Table/simpleHelpers";
import { Css } from "src/Css";
import { cell, click, render } from "src/utils/rtl";

// Most of our tests use this simple Row and 2 columns
type Data = { name: string; value: number | undefined };
type Row = SimpleHeaderAndDataOf<Data>;

const nameColumn: GridColumn<Row> = { header: () => "Name", data: ({ name }) => name };
const valueColumn: GridColumn<Row> = { header: () => "Value", data: ({ value }) => value };

// Make a `NestedRow` ADT for a table with a header + 3 levels of nesting
type HeaderRow = { kind: "header" };
type ParentRow = { kind: "parent"; id: string; name: string };
type ChildRow = { kind: "child"; id: string; name: string };
type GrandChildRow = { kind: "grandChild"; id: string; name: string };
type NestedRow = HeaderRow | ParentRow | ChildRow | GrandChildRow;

// And two columns for NestedRow
const nestedColumns: GridColumn<NestedRow>[] = [
  {
    header: () => "",
    parent: () => "",
    child: () => "",
    grandChild: () => "",
    w: 0,
  },
  {
    header: () => "Name",
    parent: (row) => ({ content: <div>{row.name}</div>, value: row.name }),
    child: (row) => ({ content: <div css={Css.ml2.$}>{row.name}</div>, value: row.name }),
    grandChild: (row) => ({ content: <div css={Css.ml4.$}>{row.name}</div>, value: row.name }),
  },
];

describe("GridTable nestedCards", () => {
  it("can sort nested rows", async () => {
    // Given a table with nested rows
    const r = await render(
      <GridTable
        columns={[nameColumn, valueColumn]}
        // And there is no initial sort given
        sorting={{ on: "client" }}
        rows={[
          simpleHeader,
          // And the data is initially unsorted
          {
            ...{ kind: "data", id: "2", name: "2", value: 2 },
            children: [
              { kind: "data", id: "20", name: "1", value: 1 },
              { kind: "data", id: "21", name: "2", value: 2 },
            ],
          },
          {
            ...{ kind: "data", id: "1", name: "1", value: 1 },
            children: [
              { kind: "data", id: "10", name: "1", value: 1 },
              { kind: "data", id: "11", name: "2", value: 2 },
            ],
          },
        ]}
      />,
    );
    // Then the data is sorted by 1 (1 2) then 2 (1 2)
    expect(cell(r, 1, 0)).toHaveTextContent("1");
    expect(cell(r, 2, 0)).toHaveTextContent("1");
    expect(cell(r, 3, 0)).toHaveTextContent("2");
    expect(cell(r, 4, 0)).toHaveTextContent("2");
    expect(cell(r, 5, 0)).toHaveTextContent("1");
    expect(cell(r, 6, 0)).toHaveTextContent("2");
    // And when we reverse the sort
    click(r.sortHeader_0);
    // Then the data is sorted by 2 (2 1) then 1 (2 1)
    expect(cell(r, 1, 0)).toHaveTextContent("2");
    expect(cell(r, 2, 0)).toHaveTextContent("2");
    expect(cell(r, 3, 0)).toHaveTextContent("1");
    expect(cell(r, 4, 0)).toHaveTextContent("1");
    expect(cell(r, 5, 0)).toHaveTextContent("2");
    expect(cell(r, 6, 0)).toHaveTextContent("1");
  });
});
