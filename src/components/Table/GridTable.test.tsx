import React, { MutableRefObject, useContext } from "react";
import { GridRowLookup } from "src/components/Table/GridRowLookup";
import {
  calcColumnSizes,
  emptyCell,
  GridCollapseContext,
  GridColumn,
  GridDataRow,
  GridRowStyles,
  GridStyle,
  GridTable,
  matchesFilter,
  setRunningInJest,
} from "src/components/Table/GridTable";
import {
  simpleDataRows,
  simpleHeader,
  SimpleHeaderAndDataOf,
  SimpleHeaderAndDataWith,
  simpleRows,
} from "src/components/Table/simpleHelpers";
import { Css, Palette } from "src/Css";
import { cell, cellAnd, cellOf, click, render, row, rowAnd } from "src/utils/rtl";

// Most of our tests use this simple Row and 2 columns
type Data = { name: string; value: number | undefined | null };
type Row = SimpleHeaderAndDataOf<Data>;

const nameColumn: GridColumn<Row> = { header: () => "Name", data: ({ name }) => name };
const valueColumn: GridColumn<Row> = { header: () => "Value", data: ({ value }) => value };
const columns = [nameColumn, valueColumn];

const rows: GridDataRow<Row>[] = [
  { kind: "header", id: "header" },
  { kind: "data", id: "1", name: "foo", value: 1 },
  { kind: "data", id: "2", name: "bar", value: 2 },
];

// Make a `NestedRow` ADT for a table with a header + 3 levels of nesting
type HeaderRow = { kind: "header" };
type ParentRow = { kind: "parent"; id: string; name: string };
type ChildRow = { kind: "child"; id: string; name: string };
type GrandChildRow = { kind: "grandChild"; id: string; name: string };
type NestedRow = HeaderRow | ParentRow | ChildRow | GrandChildRow;

// And two columns for NestedRow
const nestedColumns: GridColumn<NestedRow>[] = [
  {
    header: (row) => <Collapse id={row.id} />,
    parent: (row) => <Collapse id={row.id} />,
    child: (row) => <Collapse id={row.id} />,
    grandChild: () => "",
  },
  {
    header: () => "Name",
    parent: (row) => ({ content: <div>{row.name}</div>, value: row.name }),
    child: (row) => ({ content: <div css={Css.ml2.$}>{row.name}</div>, value: row.name }),
    grandChild: (row) => ({ content: <div css={Css.ml4.$}>{row.name}</div>, value: row.name }),
  },
];

describe("GridTable", () => {
  it("can align things", async () => {
    // Given a column that aligns center
    const valueColumn: GridColumn<Row> = {
      header: () => ({ content: "Value", alignment: "center" }),
      data: (row) => ({ content: row.value, alignment: "center" }),
    };
    const r = await render(<GridTable columns={[nameColumn, valueColumn]} rows={rows} />);
    // Then we add the center class
    expect(cell(r, 0, 1)).toHaveStyleRule("justify-content", "center");
    expect(cell(r, 1, 1)).toHaveStyleRule("justify-content", "center");
  });

  it("can align a column", async () => {
    // Given a column
    const valueColumn: GridColumn<Row> = {
      // And we have a default alignment
      align: "right",
      header: () => "Value",
      // But we can also override it if needed
      data: (row) => ({ content: row.value, alignment: "center" }),
    };
    const r = await render(<GridTable columns={[nameColumn, valueColumn]} rows={rows} />);
    // Then we applied the default of right aligned
    expect(cell(r, 0, 1)).toHaveStyleRule("justify-content", "flex-end");
    // And also the override of center aligned
    expect(cell(r, 1, 1)).toHaveStyleRule("justify-content", "center");
  });

  it("unwraps rows with a data key", async () => {
    // Given a column using the `With` type
    type Row = SimpleHeaderAndDataWith<Data>;
    const valueColumn: GridColumn<Row> = {
      header: "Value",
      // Then we can destructure directly against data
      data: ({ value }) => value,
    };
    const rows: GridDataRow<Row>[] = [
      { kind: "header", id: "header" },
      { kind: "data", id: "1", data: { name: "foo", value: 1 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
    ];
    // And it's rendered correctly
    const r = await render(<GridTable columns={[valueColumn]} rows={rows} />);
    expect(cell(r, 1, 0)).toHaveTextContent("1");
    expect(cell(r, 2, 0)).toHaveTextContent("2");
  });

  it("can have per-row styles", async () => {
    // Given the data row has specific row and cell styling
    const rowStyles: GridRowStyles<Row> = {
      header: {},
      data: { cellCss: Css.red500.$, rowCss: Css.bgRed500.$ },
    };
    const r = await render(<GridTable {...{ columns, rows, rowStyles }} />);
    // Then the data row has the style added
    expect(row(r, 1)).toHaveStyleRule("background-color", Palette.Red500);
    // TODO Ideally assert against the maybeDarken'd but the target isn't working on our fancy hover + child selector
    // expect(row(r, 1)).toHaveStyleRule("background-color", Palette.Primary, { target: ":hover>*" });
    // And the cell style is added to both cells
    expect(cell(r, 1, 0)).toHaveStyleRule("color", Palette.Red500);
    expect(cell(r, 1, 1)).toHaveStyleRule("color", Palette.Red500);
    // But the header row does not have any of these
    expect(row(r, 0)).not.toHaveStyleRule("background-color", Palette.Red500);
    expect(cell(r, 0, 0)).not.toHaveStyleRule("color", Palette.Red500);
    expect(cell(r, 0, 1)).not.toHaveStyleRule("color", Palette.Red500);
  });

  it("can have dynamic per-row styles", async () => {
    // Given the data row css changes based on the row's value
    const rowStyles: GridRowStyles<Row> = {
      header: {},
      data: {
        rowCss: (row) => (row.value === 1 ? Css.bgRed500.$ : Css.bgGreen500.$),
        cellCss: (row) => (row.value === 1 ? Css.green500.$ : Css.red500.$),
      },
    };
    const r = await render(<GridTable {...{ columns, rows, rowStyles }} />);
    // Then the rowCss styles the 1st row and 2nd are differently
    expect(row(r, 1)).toHaveStyleRule("background-color", Palette.Red500);
    expect(row(r, 2)).toHaveStyleRule("background-color", Palette.Green500);
    // And the cellCss also styles the 1st row and 2nd are differently
    expect(cell(r, 1, 0)).toHaveStyleRule("color", Palette.Green500);
    expect(cell(r, 2, 0)).toHaveStyleRule("color", Palette.Red500);
  });

  it("can indent rows", async () => {
    // Given the data row is indented
    const rowStyles: GridRowStyles<Row> = {
      header: {},
      data: { indent: 1 },
    };
    const r = await render(<GridTable columns={[nameColumn, valueColumn]} rows={rows} rowStyles={rowStyles} />);
    // Then the data row has the style added
    expect(cell(r, 1, 0)).toHaveStyleRule("padding-left", "32px");
    // But the header row does not
    expect(cell(r, 0, 0)).toHaveStyleRule("padding-left", "8px");
  });

  describe("client-side sorting", () => {
    it("can sort", async () => {
      // Given the table is using client-side sorting
      const r = await render(
        <GridTable
          columns={[nameColumn, valueColumn]}
          sorting={{ on: "client" }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // Then the data is initially render sorted by 1st column
      expect(cell(r, 1, 0)).toHaveTextContent("a");

      // And when sorted by column 1
      const { sortHeader_0, sortHeader_1 } = r;
      click(sortHeader_0);
      // Then 'name: c' row is first
      expect(cell(r, 1, 0)).toHaveTextContent("c");

      // And when sorted by column 2
      click(sortHeader_1);
      // Then the `value: 1` row is first
      expect(cell(r, 1, 0)).toHaveTextContent("c");
    });

    it("can sort by other value", async () => {
      // Given the table is using client-side sorting
      const r = await render(
        <GridTable<Row>
          // And the value column returns a JSX.Element and a value
          columns={[
            nameColumn,
            { header: () => "Value", data: ({ value }) => ({ value, content: <div>{value}</div> }) },
          ]}
          sorting={{ on: "client" }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // Then when sorted by the 2nd column
      const { sortHeader_1 } = r;
      click(sortHeader_1);
      // Then the `value: 1` row is first
      expect(cell(r, 1, 0)).toHaveTextContent("c");
    });

    it("can sort by value functions", async () => {
      // Given the table is using client-side sorting
      const r = await render(
        <GridTable<Row>
          // And the value column returns a JSX.Element and a value function (i.e. from a proxy)
          columns={[
            nameColumn,
            {
              header: () => "Value",
              data: ({ value }) => ({
                value: () => value,
                content: <div>{value}</div>,
              }),
            },
          ]}
          sorting={{ on: "client" }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // Then when sorted by the 2nd column
      const { sortHeader_1 } = r;
      click(sortHeader_1);
      // Then the `value: 1` row is first
      expect(cell(r, 1, 0)).toHaveTextContent("c");
    });

    it("can sort by dedicated sort values", async () => {
      // Given the table is using client-side sorting
      const r = await render(
        <GridTable<Row>
          columns={[
            nameColumn,
            {
              header: () => "Value",
              data: (row) => ({
                // And the value is the name, for filtering
                value: row.name,
                // But the sort value is set to the numeric value
                sortValue: row.value,
                content: <div>{row.name}</div>,
              }),
            },
          ]}
          sorting={{ on: "client", initial: [1, "ASC"] }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // Then the `value: 1` row is first
      expect(cell(r, 1, 0)).toHaveTextContent("c");
    });

    it("can sort undefined values", async () => {
      // Given the table is using client-side sorting
      const r = await render(
        <GridTable<Row>
          columns={[
            nameColumn,
            { header: () => "Value", data: ({ value }) => ({ value, content: <div>{value}</div> }) },
          ]}
          sorting={{ on: "client" }}
          rows={[
            simpleHeader,
            // And the 2nd row's value is undefined
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: undefined },
            { kind: "data", id: "3", name: "c", value: 1 },
            { kind: "data", id: "4", name: "d", value: undefined },
          ]}
        />,
      );
      // Then when sorted by the 2nd column
      click(r.sortHeader_1);
      // Then the `value: undefined` row is first
      expect(cell(r, 1, 0)).toHaveTextContent("a");
      expect(cell(r, 2, 0)).toHaveTextContent("d");
      expect(cell(r, 3, 0)).toHaveTextContent("c");
      expect(cell(r, 4, 0)).toHaveTextContent("b");
    });

    it("can have only a single column sortable", async () => {
      // Given the table is using client-side sorting
      const r = await render(
        <GridTable
          // And the 2nd column has sorting disabled
          columns={[nameColumn, { ...valueColumn, clientSideSort: false }]}
          sorting={{ on: "client" }}
          rows={[simpleHeader, { kind: "data", id: "2", name: "b", value: 2 }]}
        />,
      );
      const { sortHeader_0, sortHeader_1 } = r;
      // Then we have only a single sort header in the dom
      expect(sortHeader_0()).toBeDefined();
      expect(sortHeader_1()).toBeUndefined();
    });

    it("can be initially sorted by a column index", async () => {
      // Given a table
      const r = await render(
        <GridTable
          columns={[nameColumn, valueColumn]}
          // And it wants to be initially sorted by column 1/asc
          sorting={{ on: "client", initial: [1, "ASC"] }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // Then the data is sorted by value
      expect(cell(r, 1, 0)).toHaveTextContent("c");
      expect(cell(r, 2, 0)).toHaveTextContent("b");
    });

    it("can be initially sorted by a column reference", async () => {
      // Given a table
      const r = await render(
        <GridTable
          columns={[nameColumn, valueColumn]}
          // And it wants to be initially sorted by value column/asc
          sorting={{ on: "client", initial: [valueColumn, "ASC"] }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // Then the data is sorted by value
      expect(cell(r, 1, 0)).toHaveTextContent("c");
      expect(cell(r, 2, 0)).toHaveTextContent("b");
    });

    it("initially sorts by the 1st column is not specified", async () => {
      // Given a table
      const r = await render(
        <GridTable
          columns={[nameColumn, valueColumn]}
          // And there is no initial sort given
          sorting={{ on: "client" }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // Then the data is sorted by name
      expect(cell(r, 1, 0)).toHaveTextContent("a");
      expect(cell(r, 2, 0)).toHaveTextContent("b");
    });

    it("reverts to initial sorted column", async () => {
      // Given a table
      const r = await render(
        <GridTable
          columns={[nameColumn, valueColumn]}
          // And there is an initial sort defined
          sorting={{ on: "client", initial: [nameColumn, "ASC"] }}
          rows={[
            simpleHeader,
            { kind: "data", id: "1", name: "a", value: 2 },
            { kind: "data", id: "2", name: "b", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // When initializing sort on the "value" column
      click(r.sortHeader_1);
      // Then expect ASC order
      expect(cell(r, 1, 1)).toHaveTextContent("1");
      // And when clicking a 2nd time
      click(r.sortHeader_1);
      // Then expect DESC order
      expect(cell(r, 1, 1)).toHaveTextContent("3");
      // And when clicking a 3rd time
      click(r.sortHeader_1);
      // Then expect the order to have been reset
      expect(cell(r, 1, 1)).toHaveTextContent("2");
    });

    it("initializes with undefined sort", async () => {
      // Given a table
      const r = await render(
        <GridTable
          columns={[nameColumn, valueColumn]}
          // And the initial sort is explicitly set to `undefined`
          sorting={{ on: "client", initial: undefined }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // Then the data remains unsorted
      expect(cell(r, 1, 0)).toHaveTextContent("b");
      expect(cell(r, 2, 0)).toHaveTextContent("a");
      expect(cell(r, 3, 0)).toHaveTextContent("c");
    });

    it("reverts to initially undefined sort", async () => {
      // Given a table
      const r = await render(
        <GridTable
          columns={[nameColumn, valueColumn]}
          // And the initial sort is explicitly set to `undefined`
          sorting={{ on: "client", initial: undefined }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", name: "b", value: 2 },
            { kind: "data", id: "1", name: "a", value: 3 },
            { kind: "data", id: "3", name: "c", value: 1 },
          ]}
        />,
      );
      // When initializing sort on the "name" column
      click(r.sortHeader_0);
      // Then expect ASC order
      expect(cell(r, 1, 0)).toHaveTextContent("a");
      // And when clicking a 2nd time
      click(r.sortHeader_0);
      // Then expect DESC order
      expect(cell(r, 1, 0)).toHaveTextContent("c");
      // And when clicking a 3rd time
      click(r.sortHeader_0);
      // Then expect the order to have been reset
      expect(cell(r, 1, 0)).toHaveTextContent("b");
    });

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

    it("throws an error if a column value is not sortable", async () => {
      // Given the table is using client-side sorting
      const nameColumn: GridColumn<Row> = {
        header: () => "Name",
        // And we have a column that returns a react component w/o GridCellContent
        data: ({ name }) => <div>{name}</div>,
      };
      // Then the render will fail
      await expect(
        render(
          <GridTable
            columns={[nameColumn, valueColumn]}
            sorting={{ on: "client" }}
            rows={[simpleHeader, { kind: "data", id: "1", name: "a", value: 3 }]}
          />,
        ),
      ).rejects.toThrow("Column 0 passed an unsortable value, use GridCellContent or clientSideSort=false");
    });
  });

  describe("server-side sorting", () => {
    it("works", async () => {
      // Given the table is using server-side sorting
      const onSort = jest.fn();
      const r = await render(
        <GridTable
          // And the 1st column has a sortValue callback
          columns={[{ ...nameColumn, serverSideSortKey: "name" }, valueColumn]}
          sorting={{ on: "server", value: undefined, onSort }}
          rows={rows}
        />,
      );
      const { sortHeader_0, sortHeader_icon_0 } = r;
      // It is initially not sorted
      expect(sortHeader_icon_0()).not.toBeVisible();

      // Then when sorted by the 1st column
      click(sortHeader_0);
      // Then the callback was called
      expect(onSort).toHaveBeenCalledWith("name", "ASC");
      // And we show the sort toggle
      expect(sortHeader_icon_0()).toHaveAttribute("data-icon", "sortUp").toBeVisible();
      // And the data was not reordered (we defer to the server-side)
      expect(cell(r, 1, 0)).toHaveTextContent("foo");

      // And when we sort again
      click(sortHeader_0);
      // Then it was called again but desc
      expect(onSort).toHaveBeenCalledWith("name", "DESC");
      // And we flip the sort toggle
      expect(sortHeader_icon_0()).toHaveAttribute("data-icon", "sortDown").toBeVisible();

      // And when we sort again
      click(sortHeader_0);
      // Then it was called again with undefined
      expect(onSort).toHaveBeenCalledWith(undefined, undefined);
      // And we hide the sort toggle (back to the initial sort)
      expect(sortHeader_icon_0()).not.toBeVisible();
    });

    it("doesn't sort columns w/o onSort", async () => {
      // Given the table is using server-side sorting
      const onSort = jest.fn();
      const r = await render(
        <GridTable
          columns={[
            { ...nameColumn, serverSideSortKey: "name" },
            // And the 2nd column does not have a sortValue
            valueColumn,
          ]}
          sorting={{ on: "server", value: undefined, onSort }}
          rows={rows}
        />,
      );
      // Then there is only a single sort header
      const { sortHeader_0, sortHeader_1 } = r;
      expect(sortHeader_0).toBeDefined();
      expect(sortHeader_1()).toBeUndefined();
    });

    it("initializes with asc sorting", async () => {
      // Given the table is using server-side sorting
      const onSort = jest.fn();
      const { sortHeader_icon_0 } = await render(
        <GridTable
          // And the 1st column has a sort key
          columns={[{ ...nameColumn, serverSideSortKey: "name" }, valueColumn]}
          sorting={{
            on: "server",
            // And the dataset already came back as sorted by [name, asc]
            value: ["name", "ASC"],
            onSort,
          }}
          rows={rows}
        />,
      );
      // Then it is shown as initially sorted asc
      expect(sortHeader_icon_0()).toHaveAttribute("data-icon", "sortUp").toBeVisible();
    });

    it("initializes with desc sorting", async () => {
      // Given the table is using server-side sorting
      const onSort = jest.fn();
      const { sortHeader_icon_0 } = await render(
        <GridTable
          // And the 1st column has a sort key
          columns={[{ ...nameColumn, serverSideSortKey: "name" }, valueColumn]}
          sorting={{
            on: "server",
            // And the dataset already came back as sorted by [name, desc]
            value: ["name", "DESC"],
            onSort,
          }}
          rows={rows}
        />,
      );
      // Then it is shown as initially sorted desc
      expect(sortHeader_icon_0()).toHaveAttribute("data-icon", "sortDown").toBeVisible();
    });

    it("can pin rows first", async () => {
      // Given the table is using client-side sorting
      const r = await render(
        <GridTable<Row>
          columns={[nameColumn, valueColumn]}
          sorting={{ on: "client", initial: [1, "ASC"] }}
          rows={[
            simpleHeader,
            // And the 1st row is pinned first
            { kind: "data", id: "1", name: "a", value: 11, pin: "first" },
            { kind: "data", id: "2", name: "b", value: 10, pin: "first" },
            // And the middle rows need sorted
            { kind: "data", id: "3", name: "c", value: 3 },
            { kind: "data", id: "4", name: "d", value: 1 },
            // And the last rows are pinned last
            { kind: "data", id: "5", name: "e", value: 20, pin: "last" },
            { kind: "data", id: "6", name: "f", value: 21, pin: "last" },
          ]}
        />,
      );
      // Then the a/b rows stayed first
      expect(cell(r, 1, 0)).toHaveTextContent("a");
      expect(cell(r, 2, 0)).toHaveTextContent("b");
      // And the middle rows swapped
      expect(cell(r, 3, 0)).toHaveTextContent("d");
      expect(cell(r, 4, 0)).toHaveTextContent("c");
      // And the last rows stayed last
      expect(cell(r, 5, 0)).toHaveTextContent("e");
      expect(cell(r, 6, 0)).toHaveTextContent("f");
    });

    it("can pin rows last", async () => {
      // Given the table is using client-side sorting
      const r = await render(
        <GridTable<Row>
          columns={[nameColumn]}
          sorting={{ on: "client" }}
          rows={[
            simpleHeader,
            { kind: "data", id: "3", name: "c", value: 3 },
            { kind: "data", id: "2", name: "b", value: 2 },
            // And the last row is pinned first
            { kind: "data", id: "1", name: "a", value: 1, pin: "last" },
          ]}
        />,
      );
      // Then the `value: 1` row stayed last
      expect(cell(r, 1, 0)).toHaveTextContent("b");
      expect(cell(r, 2, 0)).toHaveTextContent("c");
      expect(cell(r, 3, 0)).toHaveTextContent("a");
    });
  });

  describe("column sizes", () => {
    it("as=virtual defaults to fr widths", () => {
      expect(calcColumnSizes([{}, {}], undefined).join(" ")).toEqual(
        "((100% - 0% - 0px) * (1 / 2)) ((100% - 0% - 0px) * (1 / 2))",
      );
    });

    it("as=virtual treats numbers as fr", () => {
      expect(calcColumnSizes([{ w: 1 }, { w: 2 }] as any, undefined).join(" ")).toEqual(
        "((100% - 0% - 0px) * (1 / 3)) ((100% - 0% - 0px) * (2 / 3))",
      );
    });

    it("as=virtual accepts percentages ", () => {
      expect(calcColumnSizes([{ w: "10%" }, { w: 2 }] as any, undefined).join(" ")).toEqual(
        "10% ((100% - 10% - 0px) * (2 / 2))",
      );
    });

    it("as=virtual rejects relative units", () => {
      expect(() => calcColumnSizes([{ w: "auto" }] as any, undefined).join(" ")).toThrow(
        "Beam Table column width definition only supports px, percentage, or fr units",
      );
    });

    it("as=virtual with both px and default", () => {
      expect(
        calcColumnSizes(
          [{ w: "200px" }, { w: "100px" }, { w: "10%" }, { w: "20%" }, { w: 2 }, {}] as any,
          undefined,
        ).join(" "),
      ).toEqual("200px 100px 10% 20% ((100% - 30% - 300px) * (2 / 3)) ((100% - 30% - 300px) * (1 / 3))");
    });
  });

  it("can handle onClick for rows", async () => {
    const onClick = jest.fn();
    const rowStyles: GridRowStyles<Row> = { header: {}, data: { onClick } };
    const r = await render(<GridTable {...{ columns, rows, rowStyles }} />);
    click(cell(r, 1, 0));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0].name).toEqual("foo");
  });

  it("displays a custom fallback if only a header", async () => {
    const fallbackMessage = "No special rows found";
    const r = await render(<GridTable {...{ columns, rows: [simpleHeader], fallbackMessage }} />);
    expect(r.firstElement).toHaveTextContent(fallbackMessage);
  });

  it("displays a default fallback if only a header", async () => {
    const r = await render(<GridTable {...{ columns, rows: [simpleHeader] }} />);
    expect(r.firstElement).toHaveTextContent("No rows found.");
  });

  it("displays an info message", async () => {
    const infoMessage = "Too many rows";
    const r = await render(<GridTable {...{ columns, rows, infoMessage }} />);
    expect(r.firstElement).toHaveTextContent(infoMessage);
  });

  it("can filter by string values", async () => {
    const rows: GridDataRow<Row>[] = [
      { kind: "header", id: "header" },
      { kind: "data", id: "1", name: "foo", value: 1 },
      { kind: "data", id: "2", name: "bar", value: 2 },
    ];
    const r = await render(<GridTable filter={"bar"} {...{ columns, rows }} />);
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("bar");
    expect(row(r, 2)).toBeUndefined();
  });

  it("can filter by string content values", async () => {
    const rows: GridDataRow<Row>[] = [
      { kind: "header", id: "header" },
      { kind: "data", id: "1", name: "foo", value: 1 },
      { kind: "data", id: "2", name: "bar", value: 2 },
    ];
    const nameColumn: GridColumn<Row> = {
      header: () => "Name",
      data: ({ name }) => ({ content: name }),
    };
    const r = await render(<GridTable filter={"bar"} columns={[nameColumn]} rows={rows} />);
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("bar");
    expect(row(r, 2)).toBeUndefined();
  });

  it("can filter by numeric values", async () => {
    const rows: GridDataRow<Row>[] = [
      { kind: "header", id: "header" },
      { kind: "data", id: "1", name: "foo", value: 1 },
      { kind: "data", id: "2", name: "bar", value: 2 },
    ];
    const r = await render(<GridTable filter={"2"} {...{ columns, rows }} />);
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("bar");
    expect(row(r, 2)).toBeUndefined();
  });

  it("can filter and treat space as 'and'", async () => {
    const rows: GridDataRow<Row>[] = [
      { kind: "header", id: "header" },
      { kind: "data", id: "1", name: "foo", value: 2 },
      { kind: "data", id: "2", name: "bar", value: 2 },
    ];
    const r = await render(<GridTable filter={"bar 2"} {...{ columns, rows }} />);
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("bar");
    expect(row(r, 2)).toBeUndefined();
  });

  it("treats filtering by empty string as no filter", async () => {
    const rows: GridDataRow<Row>[] = [
      { kind: "header", id: "header" },
      { kind: "data", id: "1", name: "foo", value: 1 },
      { kind: "data", id: "2", name: "bar", value: 2 },
    ];
    const r = await render(<GridTable filter={""} {...{ columns, rows }} />);
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("foo");
    expect(cell(r, 2, 0)).toHaveTextContent("bar");
  });

  it("can filter by GridCellContent values", async () => {
    const rows: GridDataRow<Row>[] = [
      { kind: "header", id: "header" },
      { kind: "data", id: "1", name: "foo", value: 1 },
      { kind: "data", id: "2", name: "bar", value: 2 },
    ];
    const r = await render(
      <GridTable<Row>
        filter={"bar"}
        {...{
          columns: [
            {
              header: "Name",
              data: ({ name }) => ({ content: <div>{name}</div>, value: name }),
            },
          ],
          rows,
        }}
      />,
    );
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("bar");
    expect(row(r, 2)).toBeUndefined();
  });

  it("can filter child rows", async () => {
    // Given a parent that won't match the filter
    const rows: GridDataRow<NestedRow>[] = [
      { kind: "header", id: "header" },
      {
        kind: "parent",
        id: "1",
        name: "p1",
        children: [
          // And one child does match the filter
          { kind: "child", id: "p1c1", name: "child foo" },
          // And the other does not
          { kind: "child", id: "p1c2", name: "child bar" },
        ],
      },
    ];
    // When we filter by 'foo'
    const r = await render(<GridTable filter="foo" columns={nestedColumns} rows={rows} />);
    // Then we show the header
    expect(cell(r, 0, 1)).toHaveTextContent("Name");
    // And the child that matched
    expect(cell(r, 1, 1)).toHaveTextContent("foo");
    // And that's it
    expect(row(r, 2)).toBeUndefined();
  });

  it("can collapse parent rows", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      {
        ...{ kind: "parent", id: "p1", name: "parent 1" },
        children: [
          {
            ...{ kind: "child", id: "p1c1", name: "child p1c1" },
            children: [{ kind: "grandChild", id: "p1c1g1", name: "grandchild p1c1g1" }],
          },
        ],
      },
    ];
    const r = await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);
    // And all three rows are initially rendered
    expect(cell(r, 0, 1)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 1)).toHaveTextContent("child p1c1");
    expect(cell(r, 2, 1)).toHaveTextContent("grandchild p1c1g1");
    // When the parent is collapsed
    click(cell(r, 0, 0).children[0] as any);
    // Then only the parent row is still shown
    expect(cell(r, 0, 1)).toHaveTextContent("parent 1");
    expect(row(r, 1)).toBeUndefined();
  });

  it("can collapse child rows", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      {
        ...{ kind: "parent", id: "p1", name: "parent 1" },
        children: [
          {
            ...{ kind: "child", id: "p1c1", name: "child p1c1" },
            children: [{ kind: "grandChild", id: "p1c1g1", name: "grandchild p1c1g1" }],
          },
        ],
      },
    ];
    const r = await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);
    // And all three rows are initially rendered
    expect(cell(r, 0, 1)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 1)).toHaveTextContent("child p1c1");
    expect(cell(r, 2, 1)).toHaveTextContent("grandchild p1c1g1");
    // When the child is collapsed
    click(cell(r, 1, 0).children[0] as any);
    // Then the parent and child rows are still shown
    expect(cell(r, 0, 1)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 1)).toHaveTextContent("child p1c1");
    // But not the grandchild
    expect(row(r, 2)).toBeUndefined();
  });

  it("can collapse all", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      { kind: "header", id: "header" },
      {
        ...{ kind: "parent", id: "p1", name: "parent 1" },
        children: [
          {
            ...{ kind: "child", id: "p1c1", name: "child p1c1" },
            children: [{ kind: "grandChild", id: "p1c1g1", name: "grandchild p1c1g1" }],
          },
        ],
      },
    ];
    const r = await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);
    // And all three rows are initially rendered
    expect(cell(r, 1, 1)).toHaveTextContent("parent 1");
    expect(cell(r, 2, 1)).toHaveTextContent("child p1c1");
    expect(cell(r, 3, 1)).toHaveTextContent("grandchild p1c1g1");

    // When we collapse all
    click(cell(r, 0, 0).children[0] as any);
    // Then the parent is shown as collapsed
    expect(row(r, 1)).toBeDefined();
    // And children/grandchildren are not shown
    expect(row(r, 2)).toBeUndefined();

    // And when we re-open all
    click(cell(r, 0, 0).children[0] as any);
    // Then all rows are shown
    expect(cell(r, 1, 1)).toHaveTextContent("parent 1");
    expect(cell(r, 2, 1)).toHaveTextContent("child p1c1");
    expect(cell(r, 3, 1)).toHaveTextContent("grandchild p1c1g1");
  });

  it("persists collapse", async () => {
    const tableIdentifier = "gridTableTest";
    // Given that parent 2 is set to collapsed in local storage
    localStorage.setItem(tableIdentifier, JSON.stringify(["p2", "p2c1"]));
    // And two parents with a child each
    const rows: GridDataRow<NestedRow>[] = [
      { kind: "header", id: "header" },
      { kind: "parent", id: "p1", name: "parent 1", children: [{ kind: "child", id: "p1c1", name: "child p1c1" }] },
      { kind: "parent", id: "p2", name: "parent 2", children: [{ kind: "child", id: "p2c1", name: "child p2c1" }] },
    ];

    // When we render the table with the persistCollapse prop set
    const r = await render(
      <GridTable<NestedRow> columns={nestedColumns} rows={rows} persistCollapse={tableIdentifier} />,
    );
    // Expect that the header is shown
    expect(row(r, 0)).toBeDefined();
    // And Child of parent 1 is shown
    expect(row(r, 2)).toBeDefined();
    // And Parent 2 is collapesed
    expect(row(r, 4)).toBeUndefined();

    // Unset local storage
    localStorage.setItem(tableIdentifier, "");
  });

  describe("matchesFilter", () => {
    it("is case insensitive", () => {
      expect(matchesFilter("Foo", "foO")).toBeTruthy();
    });

    it("matches on substring", () => {
      expect(matchesFilter("Some Foo Bar", "foO")).toBeTruthy();
    });
  });

  describe("as 'table'", () => {
    it("renders as <table>", async () => {
      const { baseElement } = await render(<GridTable as="table" columns={[nameColumn, valueColumn]} rows={rows} />);
      expect(baseElement.querySelector("table")).toBeTruthy();
      expect(baseElement.querySelector("thead")).toBeTruthy();
      expect(baseElement.querySelector("th")).toBeTruthy();
      expect(baseElement.querySelector("tbody")).toBeTruthy();
      expect(baseElement.querySelector("tr")).toBeTruthy();
      expect(baseElement.querySelector("td")).toBeTruthy();
    });
  });

  it("can look up row locations", async () => {
    // Given three rows
    const r1 = { kind: "data", id: "r:1", name: "one", value: 1 } as const;
    const r2 = { kind: "data", id: "r:2", name: "two", value: 2 } as const;
    const r3 = { kind: "data", id: "r:3", name: "thr", value: 3 } as const;
    const rows: GridDataRow<Row>[] = [r1, r2, r3];
    // A pretend MutableRefObject
    const rowLookup: MutableRefObject<GridRowLookup<Row> | undefined> = { current: undefined };
    await render(<GridTable<Row> columns={columns} rows={rows} rowLookup={rowLookup} />);
    expect(rowLookup.current!.lookup(r1)).toMatchObject({ next: r2, data: { next: r2 } });
    expect(rowLookup.current!.lookup(r2)).toMatchObject({ prev: r1, next: r3, data: { prev: r1, next: r3 } });
    expect(rowLookup.current!.lookup(r3)).toMatchObject({ prev: r2, data: { prev: r2 } });
  });

  it("can look up filtered row locations", async () => {
    // Given rows that have the same kind, but have some-big/some-small values
    const r1 = { kind: "data", id: "r:1", name: "one", value: 1 } as const;
    const r2 = { kind: "data", id: "r:2", name: "two", value: 2_000 } as const;
    const r3 = { kind: "data", id: "r:3", name: "thr", value: 3 } as const;
    const r4 = { kind: "data", id: "r:4", name: "fur", value: 4_000 } as const;
    const r5 = { kind: "data", id: "r:5", name: "fiv", value: 5 } as const;
    const rows: GridDataRow<Row>[] = [r1, r2, r3, r4, r5];
    // A pretend MutableRefObject
    const rowLookup: MutableRefObject<GridRowLookup<Row> | undefined> = { current: undefined };
    await render(<GridTable<Row> columns={columns} rows={rows} rowLookup={rowLookup} />);
    // When the page does a lookup for only "small value" rows
    const result = rowLookup.current!.lookup(r3, (r) => r.kind === "data" && !!r.value && r.value < 10);
    // Then we ignored r2 and r4
    expect(result).toMatchObject({ prev: r1, next: r5, data: { prev: r1, next: r5 } });
  });

  it("can look up row locations and be kind-aware", async () => {
    const header = { kind: "header" as const, id: "header" };
    const p1 = { kind: "parent" as const, id: "p1", name: "parent 1" };
    const p1c1 = { kind: "child" as const, id: "p1c1", parentIds: ["p1"], name: "child p1c1" };
    const p2 = { kind: "parent" as const, id: "p2", name: "parent 2" };
    const p2c1 = { kind: "child" as const, id: "p2c1", parentIds: ["p2"], name: "child p2c1" };
    const rows: GridDataRow<NestedRow>[] = [header, p1, p1c1, p2, p2c1];

    // A pretend MutableRefObject
    const rowLookup: MutableRefObject<GridRowLookup<NestedRow> | undefined> = { current: undefined };
    await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} rowLookup={rowLookup} />);
    expect(rowLookup.current!.lookup(p1)).toMatchObject({
      next: p1c1,
      child: { next: p1c1 },
      parent: { next: p2 },
    });
    expect(rowLookup.current!.lookup(p1c1)).toMatchObject({
      next: p2,
      prev: p1,
      child: { next: p2c1 },
      parent: { prev: p1, next: p2 },
    });
    expect(rowLookup.current!.lookup(p2)).toMatchObject({
      next: p2c1,
      child: { prev: p1c1 },
      parent: { prev: p1 },
    });
    expect(rowLookup.current!.lookup(p2c1)).toMatchObject({
      prev: p2,
      child: { prev: p1c1 },
      parent: { prev: p2 },
    });
  });

  it("can look up row locations when only one row", async () => {
    // Given just one row
    const r1 = { kind: "data", id: "r:1", name: "one", value: 1 } as const;
    const rows: GridDataRow<Row>[] = [r1];
    // When we look it up
    const rowLookup: MutableRefObject<GridRowLookup<Row> | undefined> = { current: undefined };
    await render(<GridTable<Row> columns={columns} rows={rows} rowLookup={rowLookup} />);
    // Then we get nothing back
    expect(rowLookup.current!.lookup(r1)).toMatchObject({ data: {} });
  });

  it("supports as=virtual in tests", async () => {
    // Given an application would call this in their setupTests/beforeEach
    setRunningInJest();
    // When the GridTable is rendered as=virtual
    const r = await render(<GridTable columns={[nameColumn, valueColumn]} rows={rows} as="virtual" />);
    // Then we can still assert against the content
    expect(cell(r, 1, 0)).toHaveTextContent("foo");
    expect(cell(r, 2, 0)).toHaveTextContent("bar");
  });

  it("as=virtual cannot use JSX directly content", async () => {
    // Given an application would call this in their setupTests/beforeEach
    setRunningInJest();
    // When the GridTable is rendered as=virtual
    const r = render(
      <GridTable<Row>
        columns={[
          {
            header: () => "Name",
            // And a column returns GridCellContent.content as directly JSX
            data: ({ name }) => ({ content: <div>{name}</div> }),
          },
        ]}
        // And the table is using client-side sorting
        sorting={{ on: "client" }}
        rows={rows}
        as="virtual"
      />,
    );
    // Then it fails b/c it would be too expensive
    await expect(r).rejects.toThrow(
      "GridTables with as=virtual & sortable columns should use functions that return JSX, instead of JSX",
    );
  });

  it("as=virtual can use JSX functions as content", async () => {
    // Given an application would call this in their setupTests/beforeEach
    setRunningInJest();
    // When the GridTable is rendered as=virtual
    const r = await render(
      <GridTable<Row>
        columns={[
          {
            header: () => "Name",
            // And a column returns GridCellContent.content a JSX function
            data: ({ name }) => ({ content: () => <div>{name}</div>, value: 1 }),
          },
        ]}
        // And the table is using client-side sorting
        sorting={{ on: "client" }}
        rows={rows}
        as="virtual"
      />,
    );
    // Then it rendered
    expect(cell(r, 1, 0)).toHaveTextContent("foo");
  });

  it("provides simpleDataRows", async () => {
    // Given a row that uses SimpleHeaderAndDataWith
    type Row = SimpleHeaderAndDataWith<{ value: number }>;
    // And also uses the simpleDataRows factory method
    const rows: GridDataRow<Row>[] = simpleDataRows([
      { id: "a:1", value: 1 },
      { id: "a:2", value: 2 },
    ]);
    const valueColumn: GridColumn<Row> = {
      header: "",
      // Then the column can accept both the value (not the GriDataRow) directly and the row id
      data: (v, id) => `id=${id} value=${v.value}`,
    };
    const r = await render(<GridTable columns={[valueColumn]} rows={rows} />);
    expect(cell(r, 1, 0)).toHaveTextContent("id=a:1 value=1");
    expect(cell(r, 2, 0)).toHaveTextContent("id=a:2 value=2");
  });

  it("simpleRows can accept undefined", async () => {
    // Given a row that uses SimpleHeaderAndDataOf
    type Row = SimpleHeaderAndDataOf<{ value: number }>;
    // And we don't have any data defined yet
    const rows: GridDataRow<Row>[] = simpleRows(undefined);
    // Then we still get back the header row
    expect(rows).toEqual([simpleHeader]);
  });

  it("simpleDataRows can accept undefined", async () => {
    // Given a row that uses SimpleHeaderAndDataWith
    type Row = SimpleHeaderAndDataWith<{ value: number }>;
    // And we don't have any data defined yet
    const rows: GridDataRow<Row>[] = simpleDataRows(undefined);
    // Then we still get back the header row
    expect(rows).toEqual([simpleHeader]);
  });

  it("can apply emptyCell to missing content", async () => {
    // Given the table with a specified emptyCell
    const r = await render(
      <GridTable<Row>
        columns={[nameColumn, valueColumn]}
        style={{ emptyCell: <>empty</> }}
        rows={[
          simpleHeader,
          // And some content is null, undefined, and empty strings
          { kind: "data", id: "1", name: "", value: null },
          { kind: "data", id: "2", name: "a", value: undefined },
          { kind: "data", id: "3", name: "c", value: 1 },
        ]}
      />,
    );
    // Then the cells with missing content have the `emptyCell` node applied.
    expect(cell(r, 1, 0).textContent).toBe("empty");
    expect(cell(r, 1, 1).textContent).toBe("empty");
    expect(cell(r, 2, 0).textContent).toBe("a");
    expect(cell(r, 2, 1).textContent).toBe("empty");
    expect(cell(r, 3, 0).textContent).toBe("c");
    expect(cell(r, 3, 1).textContent).toBe("1");
  });

  it("can show an actually empty cell using 'emptyCell' const", async () => {
    // Given the table with a column that defines the `kind: data` as an empty cell
    const nameColumn: GridColumn<Row> = { header: () => "Name", data: () => emptyCell };
    // And a table where the there is an `emptyCell` style specified
    const r = await render(
      <GridTable<Row>
        columns={[nameColumn, valueColumn]}
        style={{ emptyCell: <>empty</> }}
        rows={[simpleHeader, { kind: "data", id: "1", name: "a", value: 1 }]}
      />,
    );
    // Then the cell in this column should actually be empty
    expect(cell(r, 1, 0)).toBeEmptyDOMElement();
    expect(cell(r, 1, 1).textContent).toBe("1");
  });

  it("ignores chrome and cardpadding elements in nestedCardStyle when using GridTable test helpers", async () => {
    // Given a table with nested card styles
    const kindStyle = { bgColor: Palette.Gray100, brPx: 4, pxPx: 4 };
    const nestedStyle: GridStyle = {
      nestedCards: {
        firstLastColumnWidth: 24,
        spacerPx: 8,
        kinds: {
          header: kindStyle,
          parent: kindStyle,
          child: kindStyle,
          grandChild: kindStyle,
        },
      },
    };
    const rows: GridDataRow<NestedRow>[] = [
      { kind: "header", id: "header" },
      {
        ...{ kind: "parent", id: "p1", name: "parent 1" },
        children: [
          {
            ...{ kind: "child", id: "p1c1", name: "child p1c1" },
            children: [{ kind: "grandChild", id: "p1c1g1", name: "grandchild p1c1g1" }],
          },
        ],
      },
    ];

    const r = await render(<GridTable<NestedRow> columns={nestedColumns} style={nestedStyle} rows={rows} />);
    // When using the various gridtable test helpers (cell, cellAnd, cellOf, row, rowAnd)
    // Then chrome rows, and padding columns are ignored
    expect(cellAnd(r, 0, 0, "collapse")).toBeTruthy();
    expect(cell(r, 0, 1).textContent).toBe("Name");
    expect(cellAnd(r, 1, 0, "collapse")).toBeTruthy();
    expect(cell(r, 1, 1).textContent).toBe("parent 1");
    expect(rowAnd(r, 2, "collapse")).toBeTruthy();
    expect(cellOf(r, "grid-table", 2, 1).textContent).toBe("child p1c1");
    expect(row(r, 3).querySelector("[data-testid='collapse']")).toBeFalsy();
    expect(cell(r, 3, 1).textContent).toBe("grandchild p1c1g1");
  });

  it("can use custom table test ids on cell helpers that support it", async () => {
    const r = await render(<GridTable id="customTestId" rows={rows} columns={columns} />);
    expect(cellOf(r, "customTestId", 0, 0).textContent).toBe("Name");
    expect(row(r, 0, "customTestId").textContent).toBe("NameValue");
  });
});

function Collapse({ id }: { id: string }) {
  const { isCollapsed, toggleCollapsed } = useContext(GridCollapseContext);
  const icon = isCollapsed(id) ? "+" : "-";
  return (
    <div onClick={() => toggleCollapsed(id)} data-testid="collapse">
      {icon}
    </div>
  );
}
