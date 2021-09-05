import React from "react";
import {
  addCardPadding,
  GridColumn,
  GridTable,
  makeOpenOrCloseCard,
  NestedCardStyle,
} from "src/components/Table/GridTable";
import { simpleHeader, SimpleHeaderAndDataOf } from "src/components/Table/simpleHelpers";
import { Css, Palette } from "src/Css";
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

const parentCardStyle: NestedCardStyle = {
  bgColor: Palette.Gray100,
  brPx: 8,
  pxPx: 8,
  spacerPx: 8,
};

const childCardStyle: NestedCardStyle = {
  bgColor: Palette.Gray300,
  bColor: Palette.Gray200,
  brPx: 6,
  pxPx: 6,
  spacerPx: 6,
};

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

  it("can make open card w/one level", async () => {
    const r = await render(makeOpenOrCloseCard([parentCardStyle], "open"));
    expect(r.firstElement).toMatchInlineSnapshot(`
      .emotion-0 {
        background-color: rgba(247,245,245,1);
        padding-left: 8px;
        padding-right: 8px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        height: 8px;
      }

      <div
        data-overlay-container="true"
      >
        <div
          class="emotion-0"
        />
      </div>
    `);
  });

  it("can make open card w/two levels", async () => {
    const r = await render(makeOpenOrCloseCard([parentCardStyle, childCardStyle], "open"));
    expect(r.firstElement).toMatchInlineSnapshot(`
      .emotion-0 {
        background-color: rgba(247,245,245,1);
        padding-left: 8px;
        padding-right: 8px;
      }

      .emotion-1 {
        background-color: rgba(221,220,220,1);
        padding-left: 6px;
        padding-right: 6px;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        height: 6px;
        border-color: rgba(236,235,235,1);
        border-left-style: solid;
        border-left-width: 1px;
        border-right-style: solid;
        border-right-width: 1px;
        border-top-style: solid;
        border-top-width: 1px;
      }

      <div
        data-overlay-container="true"
      >
        <div
          class="emotion-0"
        >
          <div
            class="emotion-1"
          />
        </div>
      </div>
    `);
  });

  it("can add padding w/two levels", async () => {
    const r = await render(addCardPadding([parentCardStyle, childCardStyle], <div>content</div>, "left"));
    expect(r.firstElement).toMatchInlineSnapshot(`
      .emotion-0 {
        background-color: rgba(247,245,245,1);
        padding-left: 8px;
        padding-right: 8px;
      }

      .emotion-1 {
        background-color: rgba(221,220,220,1);
        border-color: rgba(236,235,235,1);
        border-left-style: solid;
        border-left-width: 1px;
        border-right-style: solid;
        border-right-width: 1px;
        padding-left: 6px;
        padding-right: 6px;
      }

      <div
        data-overlay-container="true"
      >
        <div
          class="emotion-0"
        >
          <div
            class="emotion-1"
          >
            <div>
              content
            </div>
          </div>
        </div>
      </div>
    `);
  });
});
