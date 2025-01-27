import { act } from "@testing-library/react";
import { MutableRefObject, useContext, useMemo, useState } from "react";
import { GridDataRow } from "src/components/Table/components/Row";
import { GridTable, OnRowSelect, setRunningInJest } from "src/components/Table/GridTable";
import { GridTableApi, GridTableApiImpl, useGridTableApi } from "src/components/Table/GridTableApi";
import { RowStyles } from "src/components/Table/TableStyles";
import { GridColumn } from "src/components/Table/types";
import { calcColumnSizes, column, generateColumnId, selectColumn } from "src/components/Table/utils/columns";
import { GridRowLookup } from "src/components/Table/utils/GridRowLookup";
import { simpleDataRows, simpleHeader, SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { emptyCell, matchesFilter } from "src/components/Table/utils/utils";
import { Css, Palette } from "src/Css";
import { useComputed } from "src/hooks";
import { SelectField, TextField } from "src/inputs";
import { isDefined, noop } from "src/utils";
import {
  cell,
  cellAnd,
  cellOf,
  click,
  render,
  row,
  tableSnapshot,
  type,
  typeAndWait,
  wait,
  withRouter,
} from "src/utils/rtl";
import { GridCellContent } from "./components/cell";

// Most of our tests use this simple Row and 2 columns
type Data = { name: string; value: number | undefined | null };
type Row = SimpleHeaderAndData<Data>;

const idColumn: GridColumn<Row> = { id: "id", header: () => "Id", data: (data, { row }) => row.id };
const nameColumn: GridColumn<Row> = { id: "name", header: () => "Name", data: ({ name }) => name };
const valueColumn: GridColumn<Row> = { id: "value", header: () => "Value", data: ({ value }) => value };
const columns = [nameColumn, valueColumn];

const rows: GridDataRow<Row>[] = [
  simpleHeader,
  { kind: "data", id: "1", data: { name: "foo", value: 1 } },
  { kind: "data", id: "2", data: { name: "bar", value: 2 } },
];
const draggableRows: GridDataRow<Row>[] = [
  simpleHeader,
  { kind: "data", id: "1", data: { name: "foo", value: 1 }, draggable: true },
  { kind: "data", id: "2", data: { name: "bar", value: 2 }, draggable: true },
];

// Make a `NestedRow` ADT for a table with a header + 3 levels of nesting
type TotalsRow = { kind: "totals"; id: string; data: undefined };
type HeaderRow = { kind: "header"; id: string; data: undefined };
type ParentRow = { kind: "parent"; id: string; data: { name: string } };
type ChildRow = { kind: "child"; id: string; data: { name: string } };
type GrandChildRow = { kind: "grandChild"; id: string; data: { name: string } };
type NestedRow = TotalsRow | HeaderRow | ParentRow | ChildRow | GrandChildRow;

// I tried https://github.com/keiya01/react-performance-testing#count-renders but
// it didn't work with our fake timers, so this is easier for now.
let renderedNameColumn: string[] = [];
beforeEach(() => {
  renderedNameColumn = [];
  sessionStorage.clear();
});
afterAll(() => sessionStorage.clear());

// And two columns for NestedRow
// TODO Move this to the bottom of the file in it's own PR
const nestedColumns: GridColumn<NestedRow>[] = [
  {
    totals: emptyCell,
    header: (data, { row }) => <Collapse id={row.id} />,
    parent: (data, { row }) => <Collapse id={row.id} />,
    child: (data, { row }) => (row.children?.length > 0 ? <Collapse id={row.id} /> : ""),
    grandChild: () => "",
  },
  selectColumn<NestedRow>({
    totals: emptyCell,
  }),
  {
    totals: emptyCell,
    header: () => "Name",
    parent: (data, { row }) => ({
      content() {
        renderedNameColumn.push(row.id);
        return <div>{data.name}</div>;
      },
      value: data.name,
    }),
    child: (data, { row }) => ({
      content() {
        renderedNameColumn.push(row.id);
        return <div css={Css.ml2.$}>{data.name}</div>;
      },
      value: data.name,
    }),
    grandChild: (data, { row }) => ({
      content() {
        renderedNameColumn.push(row.id);
        return <div css={Css.ml4.$}>{data.name}</div>;
      },
      value: data.name,
    }),
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
    expect(cell(r, 0, 1)).toHaveStyle({ justifyContent: "center" });
    expect(cell(r, 1, 1)).toHaveStyle({ justifyContent: "center" });
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
    expect(cell(r, 0, 1)).toHaveStyle({ justifyContent: "flex-end" });
    // And also the override of center aligned
    expect(cell(r, 1, 1)).toHaveStyle({ justifyContent: "center" });
  });

  it("unwraps rows with a data key", async () => {
    // Given a column using the `With` type
    type Row = SimpleHeaderAndData<Data>;
    const valueColumn: GridColumn<Row> = {
      header: "Value",
      // Then we can destructure directly against data
      data: ({ value }) => value,
    };
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "foo", value: 1 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
    ];
    // And it's rendered correctly
    const r = await render(<GridTable columns={[valueColumn]} rows={rows} />);
    expect(cell(r, 1, 0)).toHaveTextContent("1");
    expect(cell(r, 2, 0)).toHaveTextContent("2");
  });

  it("does not truncate reaodnly select fields", async () => {
    // Given a column with a select field
    const longText = "Something very long that have to wrap here";
    const selectColumn: GridColumn<Row> = {
      header: "Select",
      w: "150px",
      data: (row) => ({
        content: (
          <SelectField
            label="field"
            getOptionLabel={(r) => r.name}
            getOptionValue={(r) => r.id}
            value={row.value}
            onSelect={noop}
            options={[{ id: row.value, name: row.name }]}
            readOnly
          />
        ),
      }),
    };
    const rows: GridDataRow<Row>[] = [simpleHeader, { kind: "data", id: "1", data: { name: longText, value: 1 } }];
    // And it's rendered with row height flexible
    const r = await render(<GridTable style={{ rowHeight: "flexible" }} columns={[selectColumn]} rows={rows} />);

    // Then field do not have any Css.truncate styles
    expect(r.field).not.toHaveStyle({ whiteSpace: "nowrap" });
    expect(r.field).not.toHaveStyle({ overflow: "hidden" });
    expect(r.field).not.toHaveStyle({ textOverflow: "ellipsis" });
  });

  it("can have per-row styles", async () => {
    // Given the data row has specific row and cell styling
    const rowStyles: RowStyles<Row> = {
      header: {},
      data: { cellCss: Css.red500.$, rowCss: Css.bgRed500.$ },
    };
    const r = await render(<GridTable {...{ columns, rows, rowStyles }} />);
    // Then the data row has the style added
    expect(row(r, 1)).toHaveStyle({ backgroundColor: Palette.Red500 });
    // TODO Ideally assert against the maybeDarken'd but the target isn't working on our fancy hover + child selector
    // expect(row(r, 1)).toHaveStyleRule("background-color", Palette.Primary, { target: ":hover>*" });
    // And the cell style is added to both cells
    expect(cell(r, 1, 0)).toHaveStyle({ color: Palette.Red500 });
    expect(cell(r, 1, 1)).toHaveStyle({ color: Palette.Red500 });
    // But the header row does not have any of these
    expect(row(r, 0)).not.toHaveStyle({ backgroundColor: Palette.Red500 });
    expect(cell(r, 0, 0)).not.toHaveStyle({ color: Palette.Red500 });
    expect(cell(r, 0, 1)).not.toHaveStyle({ color: Palette.Red500 });
  });

  it("can have dynamic per-row styles", async () => {
    // Given the data row css changes based on the row's value
    const rowStyles: RowStyles<Row> = {
      header: {},
      data: {
        rowCss: (row) => (row.data.value === 1 ? Css.bgRed500.$ : Css.bgGreen500.$),
        cellCss: (row) => (row.data.value === 1 ? Css.green500.$ : Css.red500.$),
      },
    };
    const r = await render(<GridTable {...{ columns, rows, rowStyles }} />);
    // Then the rowCss styles the 1st row and 2nd are differently
    expect(row(r, 1)).toHaveStyle({ backgroundColor: Palette.Red500 });
    expect(row(r, 2)).toHaveStyle({ backgroundColor: Palette.Green500 });
    // And the cellCss also styles the 1st row and 2nd are differently
    expect(cell(r, 1, 0)).toHaveStyle({ color: Palette.Green500 });
    expect(cell(r, 2, 0)).toHaveStyle({ color: Palette.Red500 });
  });

  it("can apply cell-specific styling", async () => {
    // Given a column
    const nameColumn: GridColumn<Row> = {
      header: () => "Name",
      // That returns dynamic values from its GridCellContent.css
      data: ({ name }) => ({
        content: name,
        css: name === "foo" ? Css.bgRed500.$ : Css.bgRed100.$,
      }),
    };
    // When we render the data
    const rows: GridDataRow<Row>[] = [
      { kind: "data", id: "1", data: { name: "foo", value: 1 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
    ];
    const r = await render(<GridTable columns={[nameColumn]} rows={rows} />);
    // Then the rows are styled appropriately
    expect(cell(r, 0, 0)).toHaveStyle({ backgroundColor: Palette.Red500 });
    expect(cell(r, 1, 0)).toHaveStyle({ backgroundColor: Palette.Red100 });
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
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            { kind: "data", id: "1", data: { name: "a", value: 3 } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
          ]}
        />,
      );
      // Then the data is initially render sorted by 1st column
      expect(cell(r, 1, 0)).toHaveTextContent("a");

      // And when sorted by column 1
      click(r.sortHeader_0);
      // Then 'name: c' row is first
      expect(cell(r, 1, 0)).toHaveTextContent("c");

      // And when sorted by column 2
      click(r.sortHeader_1);
      // Then the `value: 1` row is first
      expect(cell(r, 1, 0)).toHaveTextContent("c");

      // And the rows were memoized so didn't re-render
      expect(row(r, 1).getAttribute("data-render")).toEqual("1");
      expect(row(r, 2).getAttribute("data-render")).toEqual("1");
      expect(row(r, 3).getAttribute("data-render")).toEqual("1");
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
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            { kind: "data", id: "1", data: { name: "a", value: 3 } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
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
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            { kind: "data", id: "1", data: { name: "a", value: 3 } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
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
          sorting={{ on: "client", initial: [generateColumnId(1), "ASC"] }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            { kind: "data", id: "1", data: { name: "a", value: 3 } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
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
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            { kind: "data", id: "1", data: { name: "a", value: undefined } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
            { kind: "data", id: "4", data: { name: "d", value: undefined } },
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
          rows={[simpleHeader, { kind: "data", id: "2", data: { name: "b", value: 2 } }]}
        />,
      );
      // Then we have only a single sort header in the dom
      expect(r.sortHeader_0).toBeDefined();
      expect(r.sortHeader_1).toBeUndefined();
    });

    it("can sort primary rows", async () => {
      // Given the table is using client-side sorting
      type FavoriteData = { name: string; value: number; favorite: boolean };
      type FavoriteRow = SimpleHeaderAndData<FavoriteData>;

      const favNameColumn: GridColumn<FavoriteRow> = { header: () => "Name", data: ({ name }) => name };
      const favValueColumn: GridColumn<FavoriteRow> = { header: () => "Value", data: ({ value }) => value };
      const favoriteColumn: GridColumn<FavoriteRow> = {
        id: "favorite",
        header: () => "Favorite",
        data: ({ favorite }) => favorite,
      };

      const r = await render(
        <GridTable
          columns={[favNameColumn, favValueColumn, favoriteColumn]}
          sorting={{ on: "client", primary: [favoriteColumn.id!, "DESC"] }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "4", data: { name: "b", value: 2, favorite: true } },
            { kind: "data", id: "1", data: { name: "a", value: 3, favorite: false } },
            { kind: "data", id: "3", data: { name: "c", value: 1, favorite: false } },
            { kind: "data", id: "2", data: { name: "d", value: 1, favorite: true } },
            { kind: "data", id: "5", data: { name: "e", value: 3, favorite: false } },
            { kind: "data", id: "6", data: { name: "f", value: 1, favorite: false } },
          ]}
        />,
      );
      // Then the data is initially render sorted by 1st column
      expect(cell(r, 1, 0)).toHaveTextContent("b");

      // And when sorted by column 2
      click(r.sortHeader_1);
      // Then the `value: 1` row is first
      expect(cell(r, 1, 0)).toHaveTextContent("d");

      // And when sorted by column 1
      click(r.sortHeader_0);
      // Then 'name: b' row is first
      expect(cell(r, 1, 0)).toHaveTextContent("b");
      // And the rows were memoized so didn't re-render
      expect(row(r, 1).getAttribute("data-render")).toEqual("1");
      expect(row(r, 2).getAttribute("data-render")).toEqual("1");
      expect(row(r, 3).getAttribute("data-render")).toEqual("1");
    });

    it("can inverse sort primary rows", async () => {
      // Given the table is using client-side sorting
      type FavoriteData = { name: string; value: number; favorite: boolean };
      type FavoriteRow = SimpleHeaderAndData<FavoriteData>;

      const favNameColumn: GridColumn<FavoriteRow> = { header: () => "Name", data: ({ name }) => name };
      const favValueColumn: GridColumn<FavoriteRow> = { header: () => "Value", data: ({ value }) => value };
      const favoriteColumn: GridColumn<FavoriteRow> = {
        id: "favorite",
        header: () => "Favorite",
        data: ({ favorite }) => favorite,
      };

      const r = await render(
        <GridTable
          columns={[favNameColumn, favValueColumn, favoriteColumn]}
          sorting={{ on: "client", primary: [favoriteColumn.id!, "ASC"] }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "4", data: { name: "b", value: 2, favorite: true } },
            { kind: "data", id: "1", data: { name: "a", value: 3, favorite: false } },
            { kind: "data", id: "3", data: { name: "c", value: 1, favorite: false } },
            { kind: "data", id: "2", data: { name: "d", value: 1, favorite: true } },
            { kind: "data", id: "5", data: { name: "e", value: 3, favorite: false } },
            { kind: "data", id: "6", data: { name: "f", value: 1, favorite: false } },
          ]}
        />,
      );
      // Then the data is initially render sorted by 1st column
      // The last row will have our primarily sorted values
      expect(cell(r, 6, 0)).toHaveTextContent("d");

      // And when sorted by column 2
      click(r.sortHeader_1);
      // Then the `value: 1` row is first
      expect(cell(r, 6, 0)).toHaveTextContent("b");

      // And when sorted by column 1
      click(r.sortHeader_0);
      // Then 'name: b' row is first
      expect(cell(r, 6, 0)).toHaveTextContent("d");
      // And the rows were memoized so didn't re-render
      expect(row(r, 1).getAttribute("data-render")).toEqual("1");
      expect(row(r, 2).getAttribute("data-render")).toEqual("1");
      expect(row(r, 3).getAttribute("data-render")).toEqual("1");
    });

    it("can be initially sorted by a column id", async () => {
      // Given a table
      const r = await render(
        <GridTable
          columns={[nameColumn, valueColumn]}
          // And it wants to be initially sorted by column 1/asc
          sorting={{ on: "client", initial: [valueColumn.id!, "ASC"] }}
          rows={[
            simpleHeader,
            // And the data is initially unsorted
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            { kind: "data", id: "1", data: { name: "a", value: 3 } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
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
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            { kind: "data", id: "1", data: { name: "a", value: 3 } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
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
          sorting={{ on: "client", initial: ["someRandomId", "ASC"] }}
          rows={[
            simpleHeader,
            { kind: "data", id: "1", data: { name: "a", value: 2 } },
            { kind: "data", id: "2", data: { name: "b", value: 3 } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
          ]}
        />,
      );
      expect(cell(r, 1, 1)).toHaveTextContent("2");
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
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            { kind: "data", id: "1", data: { name: "a", value: 3 } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
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
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            { kind: "data", id: "1", data: { name: "a", value: 3 } },
            { kind: "data", id: "3", data: { name: "c", value: 1 } },
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
      function TestComponent() {
        const [, setCount] = useState(0);
        const columns = useMemo(() => [nameColumn, valueColumn], []);
        const rows = useMemo<GridDataRow<Row>[]>(() => {
          return [
            simpleHeader,
            // And the data is initially unsorted
            {
              ...{ kind: "data", id: "2", data: { name: "2", value: 2 } },
              children: [
                { kind: "data", id: "20", data: { name: "1", value: 1 } },
                { kind: "data", id: "21", data: { name: "2", value: 2 } },
              ],
            },
            {
              ...{ kind: "data", id: "1", data: { name: "1", value: 1 } },
              children: [
                { kind: "data", id: "10", data: { name: "1", value: 1 } },
                { kind: "data", id: "11", data: { name: "2", value: 2 } },
              ],
            },
          ];
        }, []);
        return (
          <div>
            <button data-testid="rerenderParent" onClick={() => setCount(1)}>
              rerender
            </button>
            <GridTable
              columns={columns}
              // And there is no initial sort given
              sorting={{ on: "client" }}
              rows={rows}
            />
          </div>
        );
      }

      const r = await render(<TestComponent />);

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

      // And the header row re-rendered
      expect(row(r, 0).getAttribute("data-render")).toEqual("1");
      // But the data rows did not
      expect(row(r, 1).getAttribute("data-render")).toEqual("1");
      expect(row(r, 2).getAttribute("data-render")).toEqual("1");
      expect(row(r, 3).getAttribute("data-render")).toEqual("1");
      expect(row(r, 4).getAttribute("data-render")).toEqual("1");
      expect(row(r, 5).getAttribute("data-render")).toEqual("1");
      expect(row(r, 6).getAttribute("data-render")).toEqual("1");

      // And the table re-renders for some other reason
      click(r.rerenderParent);

      // Then memoization did not break
      expect(row(r, 0).getAttribute("data-render")).toEqual("1");
      expect(row(r, 1).getAttribute("data-render")).toEqual("1");
      expect(row(r, 2).getAttribute("data-render")).toEqual("1");
      expect(row(r, 3).getAttribute("data-render")).toEqual("1");
      expect(row(r, 4).getAttribute("data-render")).toEqual("1");
      expect(row(r, 5).getAttribute("data-render")).toEqual("1");
      expect(row(r, 6).getAttribute("data-render")).toEqual("1");
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
            rows={[simpleHeader, { kind: "data", id: "1", data: { name: "a", value: 3 } }]}
          />,
        ),
      ).rejects.toThrow("Column 0 passed an unsortable value, use GridCellContent or clientSideSort=false");
    });

    it("can pin rows and filter - filterable pin", async () => {
      // Given the table with 3 rows with pins
      const r = await render(
        <GridTable<Row>
          filter={"d"}
          columns={[nameColumn, valueColumn]}
          sorting={{ on: "client" }}
          rows={[
            simpleHeader,
            // pin that is filterable
            { kind: "data", id: "1", pin: { at: "first", filter: true }, data: { name: "a", value: 11 } },
            // pin that is not filterable
            { kind: "data", id: "2", pin: { at: "first", filter: false }, data: { name: "b", value: 10 } },
            // traditional pin that by default is not filterable
            { kind: "data", id: "3", pin: "first", data: { name: "c", value: 3 } },
          ]}
        />,
      );

      // We expect the 1 record to not be visible
      // and the 2 record to be in the first row
      expect(cell(r, 1, 0)).toHaveTextContent("b");
      // and the 3 record to be the second row
      expect(cell(r, 2, 0)).toHaveTextContent("c");
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
      // It is initially not sorted
      expect(r.sortHeader_icon_0).not.toBeVisible();

      // Then when sorted by the 1st column
      click(r.sortHeader_0);
      // Then the callback was called
      expect(onSort).toHaveBeenCalledWith("name", "ASC");
      // And we show the sort toggle
      expect(r.sortHeader_icon_0).toHaveAttribute("data-icon", "sortUp").toBeVisible();
      // And the data was not reordered (we defer to the server-side)
      expect(cell(r, 1, 0)).toHaveTextContent("foo");

      // And when we sort again
      click(r.sortHeader_0);
      // Then it was called again but desc
      expect(onSort).toHaveBeenCalledWith("name", "DESC");
      // And we flip the sort toggle
      expect(r.sortHeader_icon_0).toHaveAttribute("data-icon", "sortDown").toBeVisible();

      // And when we sort again
      click(r.sortHeader_0);
      // Then it was called again with undefined
      expect(onSort).toHaveBeenCalledWith(undefined, undefined);
      // And we hide the sort toggle (back to the initial sort)
      expect(r.sortHeader_icon_0).not.toBeVisible();
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
      expect(r.sortHeader_0).toBeDefined();
      expect(r.sortHeader_1).toBeUndefined();
    });

    it("initializes with asc sorting", async () => {
      // Given the table is using server-side sorting
      const onSort = jest.fn();
      const r = await render(
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
      expect(r.sortHeader_icon_0).toHaveAttribute("data-icon", "sortUp").toBeVisible();
    });

    it("initializes with desc sorting", async () => {
      // Given the table is using server-side sorting
      const onSort = jest.fn();
      const r = await render(
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
      expect(r.sortHeader_icon_0).toHaveAttribute("data-icon", "sortDown").toBeVisible();
    });

    it("can pin rows first", async () => {
      // Given the table is using client-side sorting
      const r = await render(
        <GridTable<Row>
          columns={[nameColumn, valueColumn]}
          sorting={{ on: "client", initial: [valueColumn.id!, "ASC"] }}
          rows={[
            simpleHeader,
            // And the 1st row is pinned first
            { kind: "data", id: "1", pin: "first", data: { name: "a", value: 11 } },
            { kind: "data", id: "2", pin: "first", data: { name: "b", value: 10 } },
            // And the middle rows need sorted
            { kind: "data", id: "3", data: { name: "c", value: 3 } },
            { kind: "data", id: "4", data: { name: "d", value: 1 } },
            // And the last rows are pinned last
            { kind: "data", id: "5", pin: "last", data: { name: "e", value: 20 } },
            { kind: "data", id: "6", pin: "last", data: { name: "f", value: 21 } },
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
            { kind: "data", id: "3", data: { name: "c", value: 3 } },
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
            // And the last row is pinned first
            { kind: "data", id: "1", pin: "last", data: { name: "a", value: 1 } },
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
      expect(calcColumnSizes([{ id: "c1" }, { id: "c2" }], undefined, undefined, []).join(" ")).toEqual(
        "((100% - 0% - 0px) * (1 / 2)) ((100% - 0% - 0px) * (1 / 2))",
      );
    });

    it("as=virtual treats numbers as fr", () => {
      expect(calcColumnSizes([{ w: 1 }, { w: 2 }] as any, undefined, undefined, []).join(" ")).toEqual(
        "((100% - 0% - 0px) * (1 / 3)) ((100% - 0% - 0px) * (2 / 3))",
      );
    });

    it("as=virtual accepts percentages", () => {
      expect(calcColumnSizes([{ w: "10%" }, { w: 2 }] as any, undefined, undefined, []).join(" ")).toEqual(
        "10% ((100% - 10% - 0px) * (2 / 2))",
      );
    });

    it("as=virtual rejects relative units", () => {
      expect(() => calcColumnSizes([{ w: "auto" }] as any, undefined, undefined, []).join(" ")).toThrow(
        "Beam Table column width definition only supports px, percentage, or fr units",
      );
    });

    it("as=virtual with both px and default", () => {
      expect(
        calcColumnSizes(
          [{ w: "200px" }, { w: "100px" }, { w: "10%" }, { w: "20%" }, { w: 2 }, {}] as any,
          undefined,
          undefined,
          [],
        ).join(" "),
      ).toEqual("200px 100px 10% 20% ((100% - 30% - 300px) * (2 / 3)) ((100% - 30% - 300px) * (1 / 3))");
    });

    it("returns expandedColumns value if is a number and column is currently expanded", () => {
      expect(
        calcColumnSizes([{ id: "c1", w: "10%", expandedWidth: "300px" }, { w: 2 }] as any, undefined, undefined, [
          "c1",
        ]).join(" "),
      ).toEqual("300px ((100% - 0% - 300px) * (2 / 2))");
    });
  });

  it("throws error if column min-width definition is set with a non-px value", async () => {
    // Given a column with an invalid `mw` value, then the render will fail
    await expect(
      render(
        <GridTable
          columns={[{ header: () => "Name", data: "Test", mw: "fit-content" }]}
          rows={[simpleHeader, { kind: "data", id: "1", data: { name: "a", value: 3 } }]}
        />,
      ),
    ).rejects.toThrow("Beam Table column minWidth definition only supports pixel units");
  });

  it("accepts pixel values for column min-width definition", async () => {
    // Given a column with an valid `mw` percentage value, then the render will succeed.
    const r = await render(
      <GridTable
        columns={[{ header: () => "Name", data: "Test", mw: "100px" }]}
        rows={[simpleHeader, { kind: "data", id: "1", data: { name: "a", value: 3 } }]}
      />,
    );
    expect(r.gridTable).toBeTruthy();
  });

  it("can handle onClick for rows", async () => {
    const onClick = jest.fn();
    const rowStyles: RowStyles<Row> = { header: {}, data: { onClick } };
    const r = await render(<GridTable {...{ columns, rows, rowStyles }} />);
    click(cell(r, 1, 0));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0].data.name).toEqual("foo");
  });

  it("can omit onClick for columns", async () => {
    // Given rowStyles that specify an action for each row
    const onClick = jest.fn();
    const rowStyles: RowStyles<Row> = { header: {}, data: { onClick } };
    // And a table where one columns omits wrapping the action
    const r = await render(
      <GridTable {...{ columns: [{ ...columns[0], wrapAction: false }, columns[1]], rows, rowStyles }} />,
    );
    // When clicking on both columns
    click(cell(r, 1, 0));
    click(cell(r, 1, 1));
    // Then the action is performed only once
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("can omit rowLink for columns", async () => {
    // Given rowStyles that specify an action for each row
    const rowStyles: RowStyles<Row> = {
      header: {},
      data: {
        rowLink: () => "https://www.homebound.com",
      },
    };
    // And a table where one columns omits wrapping the action
    const r = await render(
      <GridTable {...{ columns: [{ ...columns[0], wrapAction: false }, columns[1]], rows, rowStyles }} />,
      withRouter(),
    );
    // Then expect that only one column is wrapped in an anchor tag
    expect(cell(r, 1, 0).tagName).toBe("DIV");
    expect(cell(r, 1, 1).tagName).toBe("A");
  });

  it("can handle onClick for GridCellContent", async () => {
    const onClick = jest.fn();
    // Given a table with an onClick specified GridCellContent
    const nameColumn: GridColumn<Row> = {
      header: () => "Name",
      data: ({ name }) => ({ content: name, onClick: name === "button" ? onClick : name }),
    };
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "button", value: 1 } },
      { kind: "data", id: "2", data: { name: "https://www.homebound.com", value: 2 } },
      { kind: "data", id: "3", data: { name: "/testPath", value: 3 } },
    ];
    // When rendered
    const r = await render(<GridTable rows={rows} columns={[nameColumn]} />, {});
    // Then expect the cell with a callback function to be a button
    click(r.getByText("button"));
    // And can be clicked
    expect(onClick).toHaveBeenCalledTimes(1);
    // And onClick properties with a string value should be applied as the 'href' value
    expect(r.getByText("https://www.homebound.com")).toHaveAttribute("href", "https://www.homebound.com");
    expect(r.getByText("/testPath")).toHaveAttribute("href", "/testPath");
  });

  it("displays a custom fallback if only a header", async () => {
    const fallbackMessage = "No special rows found";
    const r = await render(<GridTable {...{ columns, rows: [simpleHeader], fallbackMessage }} />);
    expect(row(r, 1)).toHaveTextContent(fallbackMessage);
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
      simpleHeader,
      { kind: "data", id: "1", data: { name: "foo", value: 1 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
    ];
    const r = await render(<GridTable filter={"bar"} {...{ columns, rows }} />);
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("bar");
    expect(row(r, 2)).toBeUndefined();
  });

  it("can filter by string content values", async () => {
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "foo", value: 1 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
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
      simpleHeader,
      { kind: "data", id: "1", data: { name: "foo", value: 1 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
    ];
    const r = await render(<GridTable filter={"2"} {...{ columns, rows }} />);
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("bar");
    expect(row(r, 2)).toBeUndefined();
  });

  it("can filter and treat space as 'and'", async () => {
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "foo", value: 2 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
    ];
    const r = await render(<GridTable filter={"bar 2"} {...{ columns, rows }} />);
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("bar");
    expect(row(r, 2)).toBeUndefined();
  });

  it("treats filtering by empty string as no filter", async () => {
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "foo", value: 1 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
    ];
    const r = await render(<GridTable filter={""} {...{ columns, rows }} />);
    expect(cell(r, 0, 0)).toHaveTextContent("Name");
    expect(cell(r, 1, 0)).toHaveTextContent("foo");
    expect(cell(r, 2, 0)).toHaveTextContent("bar");
  });

  it("can filter by GridCellContent values", async () => {
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "foo", value: 1 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
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
      simpleHeader,
      {
        kind: "parent",
        id: "1",
        data: { name: "p1" },
        children: [
          // And one child does match the filter
          { kind: "child", id: "p1c1", data: { name: "child foo" } },
          // And the other does not
          { kind: "child", id: "p1c2", data: { name: "child bar" } },
        ],
      },
    ];
    // When we filter by 'foo'
    const r = await render(<GridTable filter="foo" columns={nestedColumns} rows={rows} />);
    // Then we show the header
    expect(cell(r, 0, 2)).toHaveTextContent("Name");
    // And the parent that had a child that matched
    expect(cell(r, 1, 2)).toHaveTextContent("p1");
    // And the child that matched
    expect(cell(r, 2, 2)).toHaveTextContent("foo");
    // And that's it
    expect(row(r, 3)).toBeUndefined();
  });

  it("filtering with match on parent row also shows nested children", async () => {
    // Given a table that can apply a filter and two parents with children.
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          { kind: "child", id: "p1c1", data: { name: "filter child p1c1" } },
          { kind: "child", id: "p1c2", data: { name: "filter child p1c2" } },
        ],
      },
      {
        ...{ kind: "parent", id: "p2", data: { name: "parent 2" } },
        children: [
          { kind: "child", id: "p2c1", data: { name: "filter child p2c1" } },
          { kind: "child", id: "p2c2", data: { name: "child p2c2" } },
        ],
      },
    ];
    // applying filter to get parent 1 (p1)
    const r = await render(<GridTable filter="parent 1" columns={nestedColumns} rows={rows} />);

    // Then we show the header
    expect(cell(r, 0, 2)).toHaveTextContent("Name");
    // And the parent that matched the filter
    expect(cell(r, 1, 2)).toHaveTextContent("parent 1");
    // And the children of the matched parent
    expect(cell(r, 2, 2)).toHaveTextContent("filter child p1c1");
    expect(cell(r, 3, 2)).toHaveTextContent("filter child p1c2");
    // And that's it
    expect(row(r, 4)).toBeUndefined();
  });

  it("can collapse parent rows", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          {
            ...{ kind: "child", id: "p1c1", data: { name: "child p1c1" } },
            children: [{ kind: "grandChild", id: "p1c1g1", data: { name: "grandchild p1c1g1" } }],
          },
        ],
      },
    ];
    const r = await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);
    // And all three rows are initially rendered
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 2, 2)).toHaveTextContent("grandchild p1c1g1");
    // When the parent is collapsed
    click(cell(r, 0, 0).children[0] as any);
    // Then only the parent row is still shown
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(row(r, 1)).toBeUndefined();
  });

  it("can collapse child rows", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          {
            ...{ kind: "child", id: "p1c1", data: { name: "child p1c1" } },
            children: [{ kind: "grandChild", id: "p1c1g1", data: { name: "grandchild p1c1g1" } }],
          },
        ],
      },
    ];
    const r = await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);
    // And all three rows are initially rendered
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 2, 2)).toHaveTextContent("grandchild p1c1g1");
    expectRenderedRows("p1", "p1c1", "p1c1g1");
    // When the child is collapsed
    click(cell(r, 1, 0).children[0] as any);
    // Then the parent and child rows are still shown
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 2)).toHaveTextContent("child p1c1");
    // But not the grandchild
    expect(row(r, 2)).toBeUndefined();
    // And nothing needed to re-render
    expectRenderedRows();
  });

  it("can collapse all", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          {
            ...{ kind: "child", id: "p1c1", data: { name: "child p1c1" } },
            children: [{ kind: "grandChild", id: "p1c1g1", data: { name: "grandchild p1c1g1" } }],
          },
        ],
      },
    ];
    const r = await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);
    // And all three rows are initially rendered
    expect(cell(r, 1, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 2, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 3, 2)).toHaveTextContent("grandchild p1c1g1");

    // When we collapse all
    click(cell(r, 0, 0).children[0] as any);
    // Then the parent is shown as collapsed
    expect(row(r, 1)).toBeDefined();
    // And children/grandchildren are not shown
    expect(row(r, 2)).toBeUndefined();

    // And when we re-open all
    click(cell(r, 0, 0).children[0] as any);
    // Then all rows are shown
    expect(cell(r, 1, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 2, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 3, 2)).toHaveTextContent("grandchild p1c1g1");
  });

  it("can collapse using api", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          {
            ...{ kind: "child", id: "p1c1", data: { name: "child p1c1" } },
            children: [{ kind: "grandChild", id: "p1c1g1", data: { name: "grandchild p1c1g1" } }],
          },
        ],
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };

    function Test() {
      const _api = useGridTableApi<NestedRow>();
      api.current = _api;
      return <GridTable<NestedRow> api={_api} columns={nestedColumns} rows={rows} />;
    }

    const r = await render(<Test />);
    // And all three rows are initially rendered
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 2, 2)).toHaveTextContent("grandchild p1c1g1");
    expectRenderedRows("p1", "p1c1", "p1c1g1");
    // When the child is collapsed
    act(() => api.current!.toggleCollapsedRow(rows[0].children![0].id));
    // Then the parent and child rows are still shown
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 2)).toHaveTextContent("child p1c1");
    // But not the grandchild
    expect(row(r, 2)).toBeUndefined();
    // And nothing needed to re-render
    expectRenderedRows();
  });

  it("can check if row is collapsed via api", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          {
            ...{ kind: "child", id: "p1c1", data: { name: "child p1c1" } },
            children: [{ kind: "grandChild", id: "p1c1g1", data: { name: "grandchild p1c1g1" } }],
          },
        ],
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };

    function Test() {
      const _api = useGridTableApi<NestedRow>();
      api.current = _api;
      return <GridTable<NestedRow> api={_api} columns={nestedColumns} rows={rows} />;
    }

    const r = await render(<Test />);
    // And all three rows are initially rendered
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 2, 2)).toHaveTextContent("grandchild p1c1g1");
    expectRenderedRows("p1", "p1c1", "p1c1g1");
    // When the child is collapsed
    act(() => api.current!.toggleCollapsedRow(rows[0].children![0].id));
    // Then isCollapsed for this row should be true
    expect(api.current!.isCollapsedRow(rows[0].children![0].id)).toBeTruthy();
    // And nothing needed to re-render
    expectRenderedRows();
  });

  it("can access all visible rows", async () => {
    // Given a header and two rows
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [{ kind: "child", id: "p1c1", data: { name: "child p1c1" } }],
      },
    ];
    // When we render them
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<NestedRow>();
      api.current = _api;
      return <GridTable<NestedRow> api={_api} columns={nestedColumns} rows={rows} />;
    }
    const r = await render(<Test />);
    expect(cell(r, 1, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 2, 2)).toHaveTextContent("child p1c1");
    // Then the API get can get rows back
    expect(api.current!.getVisibleRows()).toEqual([rows[0], rows[1], rows[1].children?.[0]]);
    // And it can also return kinds
    expect(api.current!.getVisibleRows("child")).toEqual([rows[1].children?.[0]]);
  });

  it("can access visible child rows", async () => {
    // Given a parent with two children
    const rows: GridDataRow<NestedRow>[] = [
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          { kind: "child", id: "p1c1", data: { name: "child p1c1" } },
          { kind: "child", id: "p1c2", data: { name: "child p1c2" } },
        ],
      },
    ];
    // And a column where the parent counts the number of visible children
    const columns: GridColumn<NestedRow>[] = [
      ...nestedColumns,
      {
        totals: emptyCell,
        header: emptyCell,
        parent: (data, { api }) => api.getVisibleChildren("child").length,
        child: emptyCell,
        grandChild: emptyCell,
      },
    ];
    const r = await render(<GridTable<NestedRow> columns={columns} rows={rows} />);
    // And both child rows are initially rendered
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 2, 2)).toHaveTextContent("child p1c2");
    // Then we show the number of children
    expect(cell(r, 0, 3)).toHaveTextContent("2");
    // When the 1st child is filtered out
    await r.rerender(<GridTable<NestedRow> columns={columns} rows={rows} filter="p1c2" />);
    // Then the parent and child row are still shown
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 2)).toHaveTextContent("child p1c2");
    // And the parent knows the number of visible children
    expect(cell(r, 0, 3)).toHaveTextContent("1");
    // And when the parent matches the filter
    await r.rerender(<GridTable<NestedRow> columns={columns} rows={rows} filter="parent" />);
    // Then the parent knows both children are shown again
    expect(cell(r, 0, 3)).toHaveTextContent("2");
  });

  it("can access selected child rows", async () => {
    // Given a parent with two children
    const rows: GridDataRow<NestedRow>[] = [
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          { kind: "child", id: "p1c1", data: { name: "child p1c1" } },
          { kind: "child", id: "p1c2", data: { name: "child p1c2" } },
        ],
      },
    ];
    // And a column where the parent counts the selected children
    const columns: GridColumn<NestedRow>[] = [
      ...nestedColumns,
      {
        totals: emptyCell,
        header: emptyCell,
        parent: (data, { api }) => api.getSelectedChildren("child").length,
        child: emptyCell,
        grandChild: emptyCell,
      },
    ];
    const r = await render(<GridTable<NestedRow> columns={columns} rows={rows} />);
    // And both child rows are initially rendered
    expect(cell(r, 0, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 1, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 2, 2)).toHaveTextContent("child p1c2");
    // Then we show no children are selected
    expect(cell(r, 0, 3)).toHaveTextContent("0");
    // When we select the 1st child
    click(r.select_1);
    // Then the parent renders the number of selected children
    expect(cell(r, 0, 3)).toHaveTextContent("1");
  });

  it("persists collapse", async () => {
    const tableIdentifier = "gridTableTest";
    // Given that parent 2 is set to collapsed in local storage
    sessionStorage.setItem(tableIdentifier, JSON.stringify(["p2", "p2c1"]));
    // And two parents with a child each
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        kind: "parent",
        id: "p1",
        data: { name: "parent 1" },
        children: [{ kind: "child", id: "p1c1", data: { name: "child p1c1" } }],
      },
      {
        kind: "parent",
        id: "p2",
        data: { name: "parent 2" },
        children: [{ kind: "child", id: "p2c1", data: { name: "child p2c1" } }],
      },
    ];

    // When we render the table with the persistCollapse prop set
    const r = await render(
      <GridTable<NestedRow> columns={nestedColumns} rows={rows} persistCollapse={tableIdentifier} />,
    );
    // Then the header is shown
    expect(row(r, 0)).toBeDefined();
    // And Child of parent 1 is shown
    expect(row(r, 2)).toBeDefined();
    // And Parent 2 is collapsed
    expect(row(r, 4)).toBeUndefined();

    // Unset local storage
    sessionStorage.setItem(tableIdentifier, "");
  });

  it("updates collapse state in header when collapsing and expanding the parent rows", async () => {
    // Given two parents with a child each
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        kind: "parent",
        id: "p1",
        data: { name: "parent 1" },
        children: [{ kind: "child", id: "p1c1", data: { name: "child p1c1" } }],
      },
      {
        kind: "parent",
        id: "p2",
        data: { name: "parent 2" },
        children: [{ kind: "child", id: "p2c1", data: { name: "child p2c1" } }],
      },
    ];

    const r = await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);

    // Then the rows are all initially expanded state
    expect(r.collapse_0.textContent).toBe("-");
    expect(r.collapse_1.textContent).toBe("-");
    expect(r.collapse_2.textContent).toBe("-");

    // When we close the parent rows
    click(r.collapse_1);
    click(r.collapse_2);

    // Then expect the header and parent row collapse toggles are in the 'collapsed' state
    expect(r.collapse_0.textContent).toBe("+");
    expect(r.collapse_1.textContent).toBe("+");
    expect(r.collapse_2.textContent).toBe("+");

    // And when we open the parent rows back up
    click(r.collapse_1);
    click(r.collapse_2);

    // Then expect the header and parent row collapse toggles are in the 'expanded' state
    expect(r.collapse_0.textContent).toBe("-");
    expect(r.collapse_1.textContent).toBe("-");
    expect(r.collapse_2.textContent).toBe("-");
  });

  it("can toggle the header state after parent rows have been collapsed", async () => {
    // Given two parents with a child each
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        kind: "parent",
        id: "p1",
        data: { name: "parent 1" },
        children: [{ kind: "child", id: "p1c1", data: { name: "child p1c1" } }],
      },
      {
        kind: "parent",
        id: "p2",
        data: { name: "parent 2" },
        children: [{ kind: "child", id: "p2c1", data: { name: "child p2c1" } }],
      },
    ];

    const r = await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);

    // When we close one of the parent rows
    click(r.collapse_1);
    // And then click the header collapse toggle
    click(r.collapse_0);

    // Then expect the header and parent row collapse toggles are in the 'collapsed' state
    expect(r.collapse_0.textContent).toBe("+");
    expect(r.collapse_1.textContent).toBe("+");
    expect(r.collapse_2.textContent).toBe("+");
  });

  it("can select all", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          {
            ...{ kind: "child", id: "p1c1", data: { name: "child p1c1" } },
            children: [{ kind: "grandChild", id: "p1c1g1", data: { name: "grandchild p1c1g1" } }],
          },
        ],
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };

    function Test() {
      const _api = useGridTableApi<NestedRow>();
      api.current = _api;
      return <GridTable<NestedRow> api={_api} columns={nestedColumns} rows={rows} />;
    }

    const r = await render(<Test />);
    // And all three rows are initially rendered
    expect(cell(r, 1, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 2, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 3, 2)).toHaveTextContent("grandchild p1c1g1");

    // When we select all
    click(cell(r, 0, 1).children[0] as any);
    // Then all rows are shown as selected
    expect(cellAnd(r, 0, 1, "select")).toBeChecked();
    expect(cellAnd(r, 1, 1, "select")).toBeChecked();
    expect(cellAnd(r, 2, 1, "select")).toBeChecked();
    expect(cellAnd(r, 3, 1, "select")).toBeChecked();
    // And the api can fetch them
    expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1", "p1c1g1"]);
    expect(api.current!.getSelectedRowIds("child")).toEqual(["p1c1"]);
    expect(api.current!.getSelectedRows()).toEqual([rows[1], rows[1].children![0], rows[1].children![0].children![0]]);
    expect(api.current!.getSelectedRows("child")).toEqual([rows[1].children![0]]);

    // And when we unselect all
    click(cell(r, 0, 1).children[0] as any);
    // Then all rows are shown as unselected
    expect(cellAnd(r, 0, 1, "select")).not.toBeChecked();
    expect(cellAnd(r, 1, 1, "select")).not.toBeChecked();
    expect(cellAnd(r, 2, 1, "select")).not.toBeChecked();
    expect(cellAnd(r, 3, 1, "select")).not.toBeChecked();
    // And they are no longer selected
    expect(api.current!.getSelectedRowIds()).toEqual([]);
  });

  it("can select all with disabled children", async () => {
    // Given a parent with two children
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          { kind: "child", id: "p1c1", data: { name: "child p1c1" } },
          // And the 2nd one is disabled
          { kind: "child", id: "p1c2", data: { name: "child p1c2" }, selectable: false },
        ],
      },
    ];

    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<NestedRow>();
      api.current = _api;
      return <GridTable<NestedRow> api={_api} columns={nestedColumns} rows={rows} />;
    }
    const r = await render(<Test />);

    // And all three rows are initially rendered
    expect(cell(r, 1, 2)).toHaveTextContent("parent 1");
    expect(cell(r, 2, 2)).toHaveTextContent("child p1c1");
    expect(cell(r, 3, 2)).toHaveTextContent("child p1c2");

    // When we select all
    click(cell(r, 0, 1).children[0] as any);
    // Then the 'All', Parent, and 1st child rows are shown as selected
    expect(cellAnd(r, 0, 1, "select")).toBeChecked();
    expect(cellAnd(r, 1, 1, "select")).toBeChecked();
    expect(cellAnd(r, 2, 1, "select")).toBeChecked();
    // But the 2nd child is not
    expect(cellAnd(r, 3, 1, "select")).toBeDisabled();
    // And the api can fetch them
    expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1"]);
    expect(api.current!.getSelectedRowIds("child")).toEqual(["p1c1"]);

    // And when we unselect all
    click(cell(r, 0, 1).children[0] as any);
    // Then all rows are shown as unselected
    expect(cellAnd(r, 0, 1, "select")).not.toBeChecked();
    expect(cellAnd(r, 1, 1, "select")).not.toBeChecked();
    expect(cellAnd(r, 2, 1, "select")).not.toBeChecked();
    expect(cellAnd(r, 3, 1, "select")).not.toBeChecked();
    expect(cellAnd(r, 3, 1, "select")).toBeDisabled();
    // And they are no longer selected
    expect(api.current!.getSelectedRowIds()).toEqual([]);
  });

  it("fires props.onSelect", async () => {
    // Given a parent with a child
    const actions: string[] = [];
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [{ kind: "child", id: "p1c1", data: { name: "child p1c1" } }],
      },
    ];
    function Test() {
      const onSelect: OnRowSelect<NestedRow> = {
        parent: (data, isSelected, { row }) => {
          actions.push(`${row.kind} ${data.name} ${isSelected}`);
        },
        child: (data, isSelected, { row }) => {
          actions.push(`${row.kind} ${data.name} ${isSelected}`);
        },
      };
      return <GridTable<NestedRow> columns={nestedColumns} rows={rows} onRowSelect={onSelect} />;
    }
    const r = await render(<Test />);
    // When we select all
    click(cell(r, 0, 1).children[0] as any);
    // Then all rows are shown as selected
    expect(actions).toEqual(["parent parent 1 true", "child child p1c1 true"]);
    // And when we unselect all
    click(cell(r, 0, 1).children[0] as any);
    // Then they are unselected
    expect(actions).toEqual([
      "parent parent 1 true",
      "child child p1c1 true",
      "parent parent 1 false",
      "child child p1c1 false",
    ]);
  });

  it("getSelectedRows can see update rows", async () => {
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    const _columns = [selectColumn<Row>(), ...columns];

    // Given a component using a useComputed against getSelectedRows
    function Test({ rows }: { rows: GridDataRow<Row>[] }) {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      const selectedNames = useComputed(() => {
        return _api
          .getSelectedRows("data")
          .map((r) => r.data.name)
          .join(",");
      }, [_api]);
      return (
        <div>
          <div data-testid="selectedNames">{selectedNames}</div>
          <GridTable<Row> api={_api} columns={_columns} rows={rows} />
        </div>
      );
    }

    const r = await render(<Test rows={rows} />);
    click(r.select_1);
    // And selected rows is initially calc-d
    expect(r.selectedNames.textContent).toEqual("foo");
    // When we re-render with an updated row
    await r.rerender(<Test rows={[rows[0], { kind: "data", id: "1", data: { name: "foo2", value: 1 } }, rows[2]]} />);
    // Then selected computed sees the new value
    expect(r.selectedNames.textContent).toEqual("foo2");
    // And the table value is updated as expected
    expect(cell(r, 1, 1)).toHaveTextContent("foo2");
  });

  it("getSelectedRows doesn't fire if data has not changed", async () => {
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    const _columns = [selectColumn<Row>(), ...columns];
    let computedCount = 0;

    // Given a component using a useComputed against getSelectedRows
    function Test({ rows }: { rows: GridDataRow<Row>[] }) {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      const selectedNames = useComputed(() => {
        computedCount++;
        return _api
          .getSelectedRows("data")
          .map((r) => r.data.name)
          .join(",");
      }, [_api]);
      return (
        <div>
          <div data-testid="selectedNames">{selectedNames}</div>
          <GridTable<Row> api={_api} columns={_columns} rows={rows} />
        </div>
      );
    }
    // And the initial render has computed
    const r = await render(<Test rows={rows} />);
    expect(computedCount).toBe(1);
    // And the user has selected one row
    click(r.select_1);
    // And selected rows is initially calc-d
    expect(r.selectedNames.textContent).toEqual("foo");
    expect(computedCount).toBe(2);
    // When we re-render with the different row literals, but stable data
    await r.rerender(
      <Test
        rows={[
          rows[0],
          { kind: "data", id: "1", data: rows[1].data as any },
          { kind: "data", id: "2", data: rows[2].data as any },
        ]}
      />,
    );
    // Then we didn't recompute
    expect(computedCount).toBe(2);
  });

  it("getSelectedRowsId doesn't fire if data has changed but not ids", async () => {
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    const _columns = [selectColumn<Row>(), ...columns];
    let computedCount = 0;

    // Given a component using a useComputed against getSelectedRowIds
    function Test({ rows }: { rows: GridDataRow<Row>[] }) {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      const selectedIds = useComputed(() => {
        computedCount++;
        return _api.getSelectedRowIds("data").join(",");
      }, [_api]);
      return (
        <div>
          <div data-testid="selectedIds">{selectedIds}</div>
          <GridTable<Row> api={_api} columns={_columns} rows={rows} />
        </div>
      );
    }
    // And the initial render has computed
    const r = await render(<Test rows={rows} />);
    expect(computedCount).toBe(1);
    // And the user has selected one row
    click(r.select_1);
    // And selected rows is initially calc-d
    expect(r.selectedIds.textContent).toEqual("1");
    expect(computedCount).toBe(2);
    // When we re-render with the different row literals and different data literals
    await r.rerender(
      <Test
        rows={[
          rows[0],
          { kind: "data", id: "1", data: { name: "foo", value: 1 } },
          { kind: "data", id: "2", data: { name: "bar", value: 2 } },
        ]}
      />,
    );
    // Then we didn't recompute
    expect(r.selectedIds.textContent).toEqual("1");
    expect(computedCount).toBe(2);
  });

  it("can select rows via api", async () => {
    // Given a table with selectable rows
    const rows: GridDataRow<NestedRow>[] = [simpleHeader, { kind: "parent", id: "p1", data: { name: "parent 1" } }];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };

    function Test() {
      const _api = useGridTableApi<NestedRow>();
      api.current = _api;
      return <GridTable<NestedRow> api={_api} columns={nestedColumns} rows={rows} />;
    }

    await render(<Test />);
    // And the row is not selected
    expect(api.current!.getSelectedRowIds()).toEqual([]);
    // When selecting the row via the API
    act(() => api.current!.selectRow("p1"));
    // Then the row is now selected
    expect(api.current!.getSelectedRowIds()).toEqual(["p1"]);

    // And when deselecting the row via the API
    act(() => api.current!.selectRow("p1", false));
    // Then the row is not selected
    expect(api.current!.getSelectedRowIds()).toEqual([]);
  });

  it("only returns selected visible rows", async () => {
    // Given a parent with a child and grandchildren
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          {
            ...{ kind: "child", id: "p1c1", data: { name: "child p1c1" } },
            children: [
              { kind: "grandChild", id: "p1c1g1", data: { name: "grandchild p1c1g1" } },
              { kind: "grandChild", id: "p1c1g2", data: { name: "grandchild p1c1g2" } },
            ],
          },
        ],
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    // When rendering a GridTable with filtering and selectable rows
    const r = await render(<TestFilterAndSelect api={api} rows={rows} />);

    // And selecting all rows
    click(cell(r, 0, 1).children[0] as any);
    // Then every row should be returned.
    expect(api.current!.getSelectedRows()).toEqual([
      rows[1],
      rows[1].children![0],
      rows[1].children![0].children![0],
      rows[1].children![0].children![1],
    ]);
    expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1", "p1c1g1", "p1c1g2"]);

    // And when applying a filter
    type(r.filter, "p1c1g2");
    // Then expect all rows are still returned as selected
    expect(api.current!.getSelectedRows()).toEqual([
      rows[1],
      rows[1].children![0],
      rows[1].children![0].children![0],
      rows[1].children![0].children![1],
    ]);
    expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1", "p1c1g1", "p1c1g2"]);
  });

  it("renders the header as checked", async () => {
    // Given a parent
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    // When rendering a GridTable with filtering and selectable rows
    const r = await render(<TestFilterAndSelect api={api} rows={rows} />);
    // Then the header should not be checked
    expect(cellAnd(r, 0, 1, "select")).not.toBeChecked();
    // Nor indeterminate
    expect(cellAnd(r, 0, 1, "select")).toHaveAttribute("data-indeterminate", "false");
  });

  it("re-derives parent row selected state", async () => {
    // Given a parent with children
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          { kind: "child", id: "p1c1", data: { name: "child p1c1" } },
          { kind: "child", id: "p1c2", data: { name: "child p1c2" } },
        ],
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    // When rendering a GridTable with filtering and selectable rows
    const r = await render(<TestFilterAndSelect api={api} rows={rows} />);

    // And selecting one of the child rows
    click(cell(r, 3, 1).children[0] as any);

    // Then the Header and Parent rows should have the `indeterminate` checked value
    expect(cellAnd(r, 0, 1, "select")).toHaveAttribute("data-indeterminate", "true");
    expect(cellAnd(r, 1, 1, "select")).toHaveAttribute("data-indeterminate", "true");

    // And when applying a filter to hide non-selected child rows
    type(r.filter, "p1 c2");
    // Then the header and parents should flip to fully checked
    expect(cellAnd(r, 1, 1, "select")).toBeChecked();
    expect(cellAnd(r, 0, 1, "select")).toBeChecked();
  });

  it("only selects visible rows", async () => {
    // Given a parent with a child and grandchildren
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          {
            ...{ kind: "child", id: "p1c1", data: { name: "child p1c1" } },
            children: [
              { kind: "grandChild", id: "p1c1g1", data: { name: "grandchild p1c1g1" } },
              { kind: "grandChild", id: "p1c1g2", data: { name: "grandchild p1c1g2" } },
            ],
          },
        ],
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    // When rendering a GridTable with filtering and selectable rows
    const r = await render(<TestFilterAndSelect api={api} rows={rows} />);
    // And filtering without any rows selected
    type(r.filter, "p1c1g2");
    // And selecting the parent row
    click(cellAnd(r, 1, 1, "select"));
    // Then expect all rows should be checked
    expect(cellAnd(r, 0, 1, "select")).toBeChecked(); // Header
    expect(cellAnd(r, 1, 1, "select")).toBeChecked(); // Parent
    expect(cellAnd(r, 2, 1, "select")).toBeChecked(); // Child
    expect(cellAnd(r, 3, 1, "select")).toBeChecked(); // Grandchild

    // When removing the filter to show all rows.
    type(r.filter, "");

    // Then expect the parent rows to have updated based on the row status
    expect(cellAnd(r, 0, 1, "select")).toHaveAttribute("data-indeterminate", "true"); // Header
    expect(cellAnd(r, 1, 1, "select")).toHaveAttribute("data-indeterminate", "true"); // Parent
    expect(cellAnd(r, 2, 1, "select")).toHaveAttribute("data-indeterminate", "true"); // Child
    expect(cellAnd(r, 3, 1, "select")).not.toBeChecked(); // Grandchild - reintroduced by clearing filter.
    expect(cellAnd(r, 4, 1, "select")).toBeChecked(); // Grandchild
  });

  it("only selects non-disabled rows", async () => {
    // Given three rows with a header
    const _rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "Tony Stark", value: 1 } },
      { kind: "data", id: "2", selectable: false, data: { name: "Natasha Romanova", value: 2 } },
      { kind: "data", id: "3", data: { name: "Thor Odinson", value: 3 } },
    ];
    const _columns = [selectColumn<Row>(), ...columns];
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };

    // and a component using a useComputed against getSelectedRows
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      const selectedNames = useComputed(() => {
        return _api
          .getSelectedRows("data")
          .map((r) => r.data.name)
          .join(",");
      }, [_api]);
      return (
        <div>
          <div data-testid="selectedNames">{selectedNames}</div>
          <GridTable<Row> api={_api} columns={_columns} rows={_rows} />
        </div>
      );
    }

    // When table is rendered
    const r = await render(<Test />);

    // Then select toggle for row 2 is disabled
    expect(r.select_2).toBeDisabled();

    // When selecting the header row select toggle
    click(r.select_0);

    // Then row id 2 is not selected as it's disabled
    expect(api.current!.getSelectedRowIds()).toEqual(["1", "3"]);
    // and selected rows does not include row 2 as it's disabled
    expect(r.selectedNames).toHaveTextContent("Tony Stark,Thor Odinson");
  });

  it("can deselect all rows via 'clearSelections' api method", async () => {
    // Given a parent with children
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          { kind: "child", id: "p1c1", data: { name: "child p1c1" } },
          { kind: "child", id: "p1c2", data: { name: "child p1c2" } },
        ],
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    // When rendering a GridTable with selectable rows
    const r = await render(<TestFilterAndSelect api={api} rows={rows} />);
    // And selecting the header row
    click(cellAnd(r, 0, 1, "select"));
    // Then expect all rows should selected
    expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1", "p1c2"]);
    // When using the api to clear the selected rows
    act(() => api.current!.clearSelections());
    // Then all rows should be deselected
    expect(api.current!.getSelectedRowIds()).toEqual([]);
  });

  it("sets the selected state of the group row as expected when children are collapsed", async () => {
    // Given a table that can apply a filter and three parents with children.
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        // One parent where all children match the filter
        children: [
          { kind: "child", id: "p1c1", data: { name: "filter child p1c1" } },
          { kind: "child", id: "p1c2", data: { name: "filter child p1c2" } },
        ],
      },
      {
        ...{ kind: "parent", id: "p2", data: { name: "parent 2" } },
        // A second parent where only one child matches the filter
        children: [
          { kind: "child", id: "p2c1", data: { name: "filter child p2c1" } },
          { kind: "child", id: "p2c2", data: { name: "child p2c2" } },
        ],
      },
      {
        // A third parent that matches the filter, but no children match the filter
        ...{ kind: "parent", id: "p3", data: { name: "filter parent 3" } },
        children: [{ kind: "child", id: "p3c1", data: { name: "child p3c1" } }],
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    const r = await render(<TestFilterAndSelect rows={rows} api={api} />);

    // When triggering all rows as selected
    click(cellAnd(r, 0, 1, "select"));
    // Then expect all rows should selected
    expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1", "p1c2", "p2", "p2c1", "p2c2", "p3", "p3c1"]);

    // When collapsing all rows
    click(cellAnd(r, 0, 0, "collapse"));
    // Then expect each group row to persist the selected stated
    expect(cellAnd(r, 1, 1, "select")).toBeChecked();
    expect(cellAnd(r, 2, 1, "select")).toBeChecked();
    expect(cellAnd(r, 3, 1, "select")).toBeChecked();

    // And all rows are still returned by the API
    expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1", "p1c2", "p2", "p2c1", "p2c2", "p3", "p3c1"]);

    // When applying a filter
    type(r.filter, "filter");
    // Then each group rows selected state should reflect the children that match the filter
    expect(cellAnd(r, 2, 1, "select")).toBeChecked();
    expect(cellAnd(r, 3, 1, "select")).toBeChecked();
    // because the parent matches the filter, and the child was selected, the new behavior shows the nested children of matched parent, child should keep selected
    // expect(cellAnd(r, 4, 1, "select")).toBeChecked();
    // And the API reflects the expected selected states
    expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1", "p1c2", "p2", "p2c1", "p2c2", "p3", "p3c1"]);
  });

  // it can switch between partially checked to checked depending on applied filter
  it("can switch between partially checked to checked depending on applied filter", async () => {
    // Given a table that can apply a filter and a parent row with one child will match the filter
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [
          { kind: "child", id: "p1c1", data: { name: "filter child p1c1" } },
          { kind: "child", id: "p1c2", data: { name: "child p1c2" } },
        ],
      },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    const r = await render(<TestFilterAndSelect rows={rows} api={api} />);

    // When selecting the row that matches the filter
    click(cellAnd(r, 2, 1, "select"));
    // Then expect only the selected row to be returned
    expect(api.current!.getSelectedRowIds()).toEqual(["p1c1"]);
    // And the group row to be partially checked
    expect(cellAnd(r, 1, 1, "select")).toHaveAttribute("data-indeterminate", "true");

    // When collapsing all rows
    click(cellAnd(r, 0, 0, "collapse"));
    // Then expect each group row to persist the selected stated
    expect(cellAnd(r, 1, 1, "select")).toHaveAttribute("data-indeterminate", "true");

    // When applying a filter
    type(r.filter, "filter");
    // Then the group row's selected state should reflect the children that match the filter
    expect(cellAnd(r, 1, 1, "select")).toBeChecked();

    // When removing the filter
    type(r.filter, "");
    // Then the group row's selected state should be back to partially checked
    expect(cellAnd(r, 1, 1, "select")).toHaveAttribute("data-indeterminate", "true");
  });

  it("treats parents with no children as selectable", async () => {
    // Given a parent
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      // And they define children as an empty list
      { kind: "parent", id: "p1", data: { name: "parent 1" }, children: [] },
    ];
    const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
    // When rendering a GridTable with filtering and selectable rows
    const r = await render(<TestFilterAndSelect api={api} rows={rows} />);
    // When we select the parent row
    click(cellAnd(r, 1, 1, "select"));
    // Then it's checked
    expect(cellAnd(r, 1, 1, "select")).toBeChecked();
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
    const r1 = { kind: "data", id: "r:1", data: { name: "one", value: 1 } } as const;
    const r2 = { kind: "data", id: "r:2", data: { name: "two", value: 2 } } as const;
    const r3 = { kind: "data", id: "r:3", data: { name: "thr", value: 3 } } as const;
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
    const r1 = { kind: "data", id: "r:1", data: { name: "one", value: 1 } } as const;
    const r2 = { kind: "data", id: "r:2", data: { name: "two", value: 2_000 } } as const;
    const r3 = { kind: "data", id: "r:3", data: { name: "thr", value: 3 } } as const;
    const r4 = { kind: "data", id: "r:4", data: { name: "fur", value: 4_000 } } as const;
    const r5 = { kind: "data", id: "r:5", data: { name: "fiv", value: 5 } } as const;
    const rows: GridDataRow<Row>[] = [r1, r2, r3, r4, r5];
    // A pretend MutableRefObject
    const rowLookup: MutableRefObject<GridRowLookup<Row> | undefined> = { current: undefined };
    await render(<GridTable<Row> columns={columns} rows={rows} rowLookup={rowLookup} />);
    // When the page does a lookup for only "small value" rows
    const result = rowLookup.current!.lookup(r3, (r) => r.kind === "data" && !!r.data.value && r.data.value < 10);
    // Then we ignored r2 and r4
    expect(result).toMatchObject({ prev: r1, next: r5, data: { prev: r1, next: r5 } });
  });

  it("can look up row locations and be kind-aware", async () => {
    const p1 = { kind: "parent" as const, id: "p1", data: { name: "parent 1" } };
    const p1c1 = { kind: "child" as const, id: "p1c1", parentIds: ["p1"], data: { name: "child p1c1" } };
    const p2 = { kind: "parent" as const, id: "p2", data: { name: "parent 2" } };
    const p2c1 = { kind: "child" as const, id: "p2c1", parentIds: ["p2"], data: { name: "child p2c1" } };
    const rows: GridDataRow<NestedRow>[] = [simpleHeader, p1, p1c1, p2, p2c1];

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
    const r1 = { kind: "data", id: "r:1", data: { name: "one", value: 1 } } as const;
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
    // Given a row that uses SimpleHeaderAndData
    type Row = SimpleHeaderAndData<{ value: number }>;
    // And also uses the simpleDataRows factory method
    const rows: GridDataRow<Row>[] = simpleDataRows([
      { id: "a:1", value: 1 },
      { id: "a:2", value: 2 },
    ]);
    const valueColumn: GridColumn<Row> = {
      header: "",
      // Then the column can accept both the value (not the GriDataRow) directly and the row id
      data: (v, { row }) => `id=${row.id} value=${v.value}`,
    };
    const r = await render(<GridTable columns={[valueColumn]} rows={rows} />);
    expect(cell(r, 1, 0)).toHaveTextContent("id=a:1 value=1");
    expect(cell(r, 2, 0)).toHaveTextContent("id=a:2 value=2");
  });

  it("simpleDataRows can accept undefined", async () => {
    // Given a row that uses SimpleHeaderAndData
    type Row = SimpleHeaderAndData<{ value: number }>;
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
          { kind: "data", id: "1", data: { name: "", value: null } },
          { kind: "data", id: "2", data: { name: "a", value: undefined } },
          { kind: "data", id: "3", data: { name: "c", value: 1 } },
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
        rows={[simpleHeader, { kind: "data", id: "1", data: { name: "a", value: 1 } }]}
      />,
    );
    // Then the cell in this column should actually be empty
    expect(cell(r, 1, 0)).toBeEmptyDOMElement();
    expect(cell(r, 1, 1).textContent).toBe("1");
  });

  it("can use custom table test ids on cell helpers that support it", async () => {
    const r = await render(<GridTable id="customTestId" rows={rows} columns={columns} />);
    expect(cellOf(r, "customTestId", 0, 0).textContent).toBe("Name");
    expect(row(r, 0, "customTestId").textContent).toBe("NameValue");
  });

  it("does not blow up when rows have circular references", async () => {
    // Given rows that have a circular reference, i.e. from our GraphQL fragment factories
    const row1 = rows[1];
    (row1 as any).parent = row1;
    // Then we can still render
    await render(<GridTable rows={[row1]} columns={columns} />);
  });

  it("provides a per-row render count", async () => {
    const [header, row1, row2] = rows;
    const columns = [nameColumn];

    // Given a table is initially rendered with 1 row
    const r = await render(<GridTable columns={columns} rows={[header, row1]} />);
    // Then the 1st row was rendered once
    expect(row(r, 1).getAttribute("data-render")).toEqual("1");

    // And when we render a new row
    r.rerender(<GridTable columns={columns} rows={[header, row1, row2]} />);
    // Then the new row also rendered once
    expect(row(r, 2).getAttribute("data-render")).toEqual("1");
    // And the original row did not need to re-render
    expect(row(r, 1).getAttribute("data-render")).toEqual("1");

    // And when the original does actually change
    const row1_changed: GridDataRow<Row> = { kind: "data", id: row1.id, data: { name: "one", value: 3 } };
    r.rerender(<GridTable columns={columns} rows={[header, row1_changed, row2]} />);
    // And the original row re-rendered
    expect(row(r, 1).getAttribute("data-render")).toEqual("2");
    // But the 2nd added row did not
    expect(row(r, 2).getAttribute("data-render")).toEqual("1");
  });

  it("memoizes rows based on the data attribute", async () => {
    const [header, row1, row2] = rows;
    const columns = [nameColumn];
    // Given a table is initially rendered with 2 rows
    const r = await render(<GridTable key="a" columns={columns} rows={[header, row1, row2]} />);
    // When we render with new rows but unchanged data values
    r.rerender(<GridTable key="a" columns={columns} rows={[header, { ...row1 }, { ...row2 }]} />);
    // Then neither row was re-rendered
    expect(row(r, 1).getAttribute("data-render")).toEqual("1");
    expect(row(r, 2).getAttribute("data-render")).toEqual("1");
  });

  it("memoizes draggable rows based on the data attribute", async () => {
    const [header, row1, row2] = draggableRows;
    const columns = [nameColumn];
    function onDropRow() {}
    // Given a table is initially rendered with 2 rows
    const r = await render(<GridTable key="a" columns={columns} rows={[header, row1, row2]} onRowDrop={onDropRow} />);
    // When we render with new rows but unchanged data values
    r.rerender(<GridTable key="a" columns={columns} rows={[header, { ...row1 }, { ...row2 }]} onRowDrop={onDropRow} />);
    // Then neither row was re-rendered
    expect(row(r, 1).getAttribute("data-render")).toEqual("1");
    expect(row(r, 2).getAttribute("data-render")).toEqual("1");
  });

  it("reacts to setting activeRowId", async () => {
    const activeRowIdRowStyles: RowStyles<Row> = {
      data: {
        onClick: (row, api) => {
          api.setActiveRowId(`${row.kind}_${row.id}`);
        },
      },
    };

    // Given a table initially rendered without an active row id
    const r = await render(
      <GridTable columns={columns} rows={rows} rowStyles={activeRowIdRowStyles} style={{ cellCss: Css.bgWhite.$ }} />,
    );
    // And the first row/cell has the default background color
    expect(cell(r, 1, 1)).toHaveStyle({ backgroundColor: Palette.White });

    // When clicking the cell
    click(cell(r, 1, 1));

    // Then the first row/cell has the 'active' background color
    expect(cell(r, 1, 1)).toHaveStyle({ backgroundColor: Palette.Blue50 });
  });

  it("does not shows cell border when 'cellHighlight' is not defined", async () => {
    // Given a table without cellHighlight defined
    const r = await render(<GridTable columns={columns} rows={rows} style={{ cellHighlight: false }} />);

    // When clicking a cell
    click(cell(r, 1, 1));

    // Then the cell does not have the highlight color.
    expect(cell(r, 1, 1)).not.toHaveStyle({ boxShadow: `inset 0 0 0 1px ${Palette.Blue700}` });
  });

  it("shows cell border when 'cellHighlight' is defined", async () => {
    // Given a table without cellHighlight defined
    const r = await render(<GridTable columns={columns} rows={rows} style={{ cellHighlight: true }} />);

    // When clicking a cell
    click(cell(r, 1, 1));

    // Then the cell has the highlight color.
    expect(cell(r, 1, 1)).toHaveStyle({ boxShadow: `inset 0 0 0 1px ${Palette.Blue700}` });
  });

  it("can render with rows with initCollapsed defined", async () => {
    // Given rows with multiple levels of nesting where one parent is initially collapsed and one child is initially collapsed
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" }, initCollapsed: true },
        children: [
          {
            ...{ kind: "child", id: "p1c1", data: { name: "child p1c1" } },
            children: [{ kind: "grandChild", id: "p1c1g1", data: { name: "grandchild p1c1g1" } }],
          },
        ],
      },
      {
        ...{ kind: "parent", id: "p2", data: { name: "parent 2" } },
        children: [
          {
            ...{ kind: "child", id: "p2c1", data: { name: "child p2c1" }, initCollapsed: true },
            children: [{ kind: "grandChild", id: "p2c1g1", data: { name: "grandchild p2c1g1" } }],
          },
        ],
      },
    ];

    // When initially rendering the table
    const r = await render(<GridTable columns={nestedColumns} rows={rows} />);

    // Then expect "parent 1" to be collapsed
    expect(cell(r, 1, 0).textContent).toBe("+");
    expect(cell(r, 1, 2).textContent).toBe("parent 1");
    // And "parent 2" to be expanded
    expect(cell(r, 2, 0).textContent).toBe("-");
    expect(cell(r, 2, 2).textContent).toBe("parent 2");
    // And "child p2c1" to be collapsed
    expect(cell(r, 3, 0).textContent).toBe("+");
    expect(cell(r, 3, 2).textContent).toBe("child p2c1");
  });

  it("respects initCollapsed on rows if persistCollapse is set but not yet stored", async () => {
    const tableIdentifier = "persistCollapse";
    // Given rows with a group row that is initially collapsed
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" }, initCollapsed: true },
        children: [{ kind: "child", id: "p1c1", data: { name: "child p1c1" } }],
      },
    ];

    // When initially rendering the table with a 'persistCollapse' value, but an associated local storage item has not been set
    const r = await render(<GridTable columns={nestedColumns} rows={rows} persistCollapse={tableIdentifier} />);

    // Then expect "parent 1" to be collapsed based on the GridDataRow property
    expect(cell(r, 1, 0).textContent).toBe("+");
    expect(cell(r, 1, 2).textContent).toBe("parent 1");

    // And the local storage value is initially set with the current state
    expect(sessionStorage.getItem(tableIdentifier)).toBe('["keptGroup","p1"]');
  });

  it("ignores initCollapsed on rows if persistCollapse is set and available in sessionStorage", async () => {
    const tableIdentifier = "persistCollapse";
    // Given rows with a group row that is initially collapsed
    const rows: GridDataRow<NestedRow>[] = [
      simpleHeader,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" }, initCollapsed: true },
        children: [{ kind: "child", id: "p1c1", data: { name: "child p1c1" } }],
      },
    ];

    sessionStorage.setItem(tableIdentifier, "[]");

    // When initially rendering the table with a 'persistCollapse' value with an existing sessionStorage value
    const r = await render(<GridTable columns={nestedColumns} rows={rows} persistCollapse={tableIdentifier} />);

    // Then expect "parent 1" to not be collapsed
    expect(cell(r, 1, 0).textContent).toBe("-");
    expect(cell(r, 1, 2).textContent).toBe("parent 1");
    expect(cell(r, 2, 2).textContent).toBe("child p1c1");
  });

  it("can update table with new rows with initCollapsed set and updates sessionStorage with new values", async () => {
    // Given a table that can update its set of rows and persists its collapse state
    function TestComponent() {
      const [rows, setRows] = useState<GridDataRow<NestedRow>[]>(staticRows);
      return (
        <>
          <button onClick={() => setRows(initRows)} data-testid="initRows" />
          <button onClick={() => setRows(newRows)} data-testid="updateRows" />
          <GridTable
            columns={nestedColumns}
            rows={rows}
            persistCollapse={tableIdentifier}
            fallbackMessage="Loading..."
          />
        </>
      );
    }

    const tableIdentifier = "persistCollapse";
    const staticRows: GridDataRow<NestedRow>[] = [
      { kind: "totals" as const, id: "totals", data: undefined },
      simpleHeader,
    ];
    const initRows: GridDataRow<NestedRow>[] = [
      ...staticRows,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" }, initCollapsed: true },
        children: [{ kind: "child", id: "p1c1", data: { name: "child p1c1" } }],
      },
      {
        ...{ kind: "parent", id: "p2", data: { name: "parent 2" }, initCollapsed: true },
        children: [{ kind: "child", id: "p2c1", data: { name: "child p2c1" } }],
      },
    ];

    const newRows: GridDataRow<NestedRow>[] = [
      ...initRows,
      {
        ...{ kind: "parent", id: "p3", data: { name: "parent 3" }, initCollapsed: true },
        children: [{ kind: "child", id: "p3c1", data: { name: "child p3c1" } }],
      },
    ];

    // With the sessionStorage value differing from the initial row set.
    sessionStorage.setItem(tableIdentifier, "[]");

    // When rendering the table
    const r = await render(<TestComponent />);

    // Then expect the fallback message
    expect(cell(r, 2, 0).textContent).toBe("Loading...");

    // When initializing the first set of rows
    click(r.initRows);

    // Then expect "parent 1" and "parent 2" to be expanded, as their `initCollapsed` properties were ignored due to the sessionStorage
    expect(cell(r, 2, 0).textContent).toBe("-");
    expect(cell(r, 4, 0).textContent).toBe("-");

    // When expanding parent 2
    click(r.collapse_2);

    // Then expect parent 2 to now be expanded
    expect(cell(r, 4, 0).textContent).toBe("+");

    // When updating the set of rows
    click(r.updateRows);

    // Then expect "parent 1" to remain not collapsed
    expect(cell(r, 2, 0).textContent).toBe("-");
    // And parent 2 to remain expanded, as it was updated since the initial render
    expect(cell(r, 4, 0).textContent).toBe("+");
    // And parent 3, the newly added row, to be collapsed based on its `initCollapsed` prop
    expect(cell(r, 5, 0).textContent).toBe("+");

    // And the local storage value is updated with the current state
    expect(sessionStorage.getItem(tableIdentifier)).toBe('["keptGroup","p2","p3"]');
  });

  it("can lazily initialize table with collapsed rows", async () => {
    // Given a table that can update its set of rows
    function TestComponent() {
      const [rows, setRows] = useState<GridDataRow<NestedRow>[]>(staticRows);
      return (
        <>
          <button onClick={() => setRows(initRows)} data-testid="initRows" />
          <GridTable columns={nestedColumns} rows={rows} fallbackMessage="Loading..." />
        </>
      );
    }

    const staticRows: GridDataRow<NestedRow>[] = [
      { kind: "totals" as const, id: "totals", data: undefined },
      simpleHeader,
    ];
    const initRows: GridDataRow<NestedRow>[] = [
      ...staticRows,
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" }, initCollapsed: true },
        children: [{ kind: "child", id: "p1c1", data: { name: "child p1c1" } }],
      },
    ];

    // When rendering the table
    const r = await render(<TestComponent />);

    // Then expect the fallback message
    expect(cell(r, 2, 0).textContent).toBe("Loading...");

    // When initializing the rows
    click(r.initRows);

    // Then expect "parent 1" to be collapsed
    expect(cell(r, 2, 0).textContent).toBe("+");
  });

  it("can render with rows with initSelected defined", async () => {
    const selectCol = selectColumn<Row>();
    const nameCol: GridColumn<Row> = { header: "Name", data: ({ name }) => ({ content: name }), mw: "160px" };

    // Given rows initially set as selected
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "foo", value: 1 }, initSelected: true },
      { kind: "data", id: "2", data: { name: "bar", value: 2 }, initSelected: true },
    ];

    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };

    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return <GridTable<Row> api={_api} columns={[selectCol, nameCol]} rows={rows} />;
    }

    // When rendering the table
    const r = await render(<Test />);

    // Then all rows are shown as selected
    expect(cellAnd(r, 1, 0, "select")).toBeChecked();
    expect(cellAnd(r, 2, 0, "select")).toBeChecked();

    // And the api can fetch them
    expect(api.current!.getSelectedRowIds()).toEqual(["1", "2"]);

    // And when we unselect all
    click(cellAnd(r, 1, 0, "select"));
    click(cellAnd(r, 2, 0, "select"));

    // Then all rows are shown as unselected
    expect(cellAnd(r, 1, 0, "select")).not.toBeChecked();
    expect(cellAnd(r, 2, 0, "select")).not.toBeChecked();

    // And they can no longer be fetched by the api
    expect(api.current!.getSelectedRowIds()).toEqual([]);
  });

  it("can render with rows with initSelected defined include the children rows", async () => {
    type ParentRow = { kind: "parent"; id: string; data: string };
    type ChildRow = { kind: "child"; id: string; data: string };
    type GrandChildRow = { kind: "grandChild"; id: string; data: string };
    type Row = ParentRow | ChildRow | GrandChildRow;

    const selectCol = selectColumn<Row>();
    const nameCol: GridColumn<Row> = {
      parent: (name) => name,
      child: (name) => name,
      grandChild: (name) => name,
      mw: "160px",
    };

    // Given rows initially set as selected
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      {
        kind: "parent",
        id: "1",
        data: "Howard Stark",
        inferSelectedState: false,
        initSelected: true,
        children: [
          {
            kind: "child" as const,
            id: "2",
            data: "Tony Stark",
            initSelected: false,
            inferSelectedState: false,
            children: [
              {
                kind: "grandChild" as const,
                id: "5",
                data: "Morgan Stark",
                initSelected: true,
              },
            ],
          },
        ],
      },
      {
        kind: "parent",
        id: "3",
        data: "Odin",
        inferSelectedState: false,
        initSelected: false,
        children: [
          {
            kind: "child" as const,
            id: "4",
            data: "Thor",
            initSelected: true,
          },
        ],
      },
    ] as GridDataRow<Row>[];

    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };

    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return <GridTable<Row> api={_api} columns={[selectCol, nameCol]} rows={rows} />;
    }

    // When rendering the table
    const r = await render(<Test />);

    expect(tableSnapshot(r)).toMatchInlineSnapshot(`
      "
      | on |              |
      | -- | ------------ |
      | on | Howard Stark |
      | on | Tony Stark   |
      | on | Morgan Stark |
      | on | Odin         |
      | on | Thor         |
      "
    `);

    // Then all rows are shown as selected
    expect(cell(r, 1, 1)).toHaveTextContent("Howard Stark");
    expect(cellAnd(r, 1, 0, "select")).toBeChecked();

    expect(cell(r, 2, 1)).toHaveTextContent("Tony Stark");
    expect(cellAnd(r, 2, 0, "select")).not.toBeChecked();

    expect(cell(r, 3, 1)).toHaveTextContent("Morgan Stark");
    expect(cellAnd(r, 3, 0, "select")).toBeChecked();

    expect(cell(r, 4, 1)).toHaveTextContent("Odin");
    expect(cellAnd(r, 4, 0, "select")).not.toBeChecked();

    expect(cell(r, 5, 1)).toHaveTextContent("Thor");
    expect(cellAnd(r, 5, 0, "select")).toBeChecked();

    // And they can no longer be fetched by the api
    expect(api.current!.getSelectedRowIds()).toEqual(["1", "5", "4"]);
  });

  describe("expandable columns", () => {
    type ExpandHeader = { id: "expandableHeader"; kind: "expandableHeader" };
    type Header = { id: "header"; kind: "header" };
    type ExpandableData = {
      kind: "data";
      data: { firstName: string | undefined; lastName: string | undefined; age: number | undefined };
    };
    type ExpandableRow = ExpandHeader | Header | ExpandableData;

    it("can expand and collapse columns", async () => {
      // Given a table with expandable columns
      // When initially rendered
      const r = await render(
        <GridTable
          columns={[
            column<ExpandableRow>({
              expandableHeader: () => "Client name",
              header: (data, { expanded }) => (expanded ? "First name" : "Full name"),
              data: ({ firstName, lastName }, { expanded }) => (expanded ? firstName : `${firstName} ${lastName}`),
              expandColumns: [
                column<ExpandableRow>({
                  expandableHeader: emptyCell,
                  header: "Last name",
                  data: ({ lastName }) => lastName,
                }),
              ],
            }),
            column<ExpandableRow>({ expandableHeader: () => "Age", header: emptyCell, data: ({ age }) => age }),
          ]}
          rows={[
            { kind: "header", id: "header", data: {} },
            { kind: "expandableHeader", id: "expandableHeader", data: {} },
            { kind: "data", id: "user:1", data: { firstName: "Brandon", lastName: "Dow", age: 36 } },
          ]}
        />,
      );

      // Then only two columns are shown
      expect(cell(r, 0, 0)).toHaveTextContent("Client name");
      expect(cell(r, 0, 1)).toHaveTextContent("Age");
      // And the header row displays the expected values when the column is collapsed
      expect(cell(r, 1, 0)).toHaveTextContent("Full name");
      expect(cell(r, 1, 1)).toBeEmptyDOMElement();
      // And the data row displays the expected values when the column is collapsed
      expect(cell(r, 2, 0)).toHaveTextContent("Brandon Dow");
      expect(cell(r, 2, 1)).toHaveTextContent("36");

      // When clicking to expand the column
      click(r.expandableColumn);

      // Then the new column in introduced and the existing column's values have been updated
      expect(cell(r, 1, 0)).toHaveTextContent("First name");
      expect(cell(r, 1, 1)).toHaveTextContent("Last name");
      // And the data row displays the expected values when the column is collapsed
      expect(cell(r, 2, 0)).toHaveTextContent("Brandon");
      expect(cell(r, 2, 1)).toHaveTextContent("Dow");
    });

    it("can initialize with a column expanded", async () => {
      // Given a table with expandable columns
      // When initially rendered with the expandable column set to `initExpanded: true`.
      const r = await render(
        <GridTable
          columns={[
            column<ExpandableRow>({
              expandableHeader: () => "Client name",
              header: (data, { expanded }) => (expanded ? "First name" : "Full name"),
              data: ({ firstName }) => firstName,
              expandColumns: [
                column<ExpandableRow>({
                  expandableHeader: emptyCell,
                  header: "Last name",
                  data: ({ lastName }) => lastName,
                }),
              ],
              initExpanded: true,
            }),
          ]}
          rows={[
            { kind: "header", id: "header", data: {} },
            { kind: "expandableHeader", id: "expandableHeader", data: {} },
            { kind: "data", id: "user:1", data: { firstName: "Brandon", lastName: "Dow", age: 36 } },
          ]}
        />,
      );

      // Then the column is initially expanded
      expect(cell(r, 1, 0)).toHaveTextContent("First name");
      expect(cell(r, 1, 1)).toHaveTextContent("Last name");
    });

    it("can expand columns when `expandedWidth` defines a value", async () => {
      // Given a table with `expandedWidth` defined
      const r = await render(
        <GridTable
          columns={[
            column<ExpandableRow>({
              expandableHeader: () => "Client name",
              header: () => "Name",
              data: ({ firstName }) => firstName,
              expandedWidth: "300px",
              initExpanded: true,
              w: "200px",
            }),
          ]}
          rows={[
            { kind: "header", id: "header", data: {} },
            { kind: "expandableHeader", id: "expandableHeader", data: {} },
            { kind: "data", id: "user:1", data: { firstName: "Brandon", lastName: "Dow", age: 36 } },
          ]}
        />,
      );

      // Then the column's width is initially set to the `column.expandColumns` property
      expect(cell(r, 0, 0)).toHaveStyle({ width: "calc(300px)" });
    });

    it("auto assigns 'visibleColumnsStorageKey'", async () => {
      jest.spyOn(Object.getPrototypeOf(window.sessionStorage), "setItem");

      // Given some hide-able columns
      const columns: GridColumn<Row>[] = [
        { id: "name", header: () => "Name", data: ({ name }) => name, canHide: true, initVisible: true },
        { id: "value", header: () => "Value", data: ({ value }) => value, canHide: true },
        { id: "action", header: () => "Action", data: () => "action" },
      ];

      // Given a table
      await render(<GridTable columns={columns} rows={rows} />);
      // Then the visible column session storage is defined using a key build via the columns' `id` prop
      expect(sessionStorage.setItem).toHaveBeenLastCalledWith("nameValueAction", '["name","action"]');
    });

    it("accepts a specified 'visibleColumnsStorageKey'", async () => {
      jest.spyOn(Object.getPrototypeOf(window.sessionStorage), "setItem");

      // Given some hide-able columns
      const columns: GridColumn<Row>[] = [
        { id: "name", header: () => "Name", data: ({ name }) => name, canHide: true, initVisible: true },
        { id: "value", header: () => "Value", data: ({ value }) => value, canHide: true },
      ];

      // And a table with setting the `visibleColumnsStorageKey`
      await render(<GridTable columns={columns} rows={rows} visibleColumnsStorageKey="testStorageKey" />);
      // Then the visible column session storage is defined using the `visibleColumnsStorageKey` prop
      expect(sessionStorage.setItem).toHaveBeenLastCalledWith("testStorageKey", '["name"]');
    });

    it("respects setting inferSelectState to false", async () => {
      // Given nested rows
      const rows: GridDataRow<NestedRow>[] = [
        simpleHeader,
        {
          // With one parent that sets `inferSelectedState: false`
          ...{ kind: "parent", id: "p1", inferSelectedState: false, data: { name: "parent 1" } },
          children: [
            {
              ...{ kind: "child", id: "p1c1", data: { name: "child 1" } },
              children: [
                { kind: "grandChild", id: "p1c1gc1", data: { name: "grandChild p1c1gc1" } },
                { kind: "grandChild", id: "p1c1gc2", data: { name: "grandChild p1c1gc2" } },
              ],
            },
          ],
        },
      ];
      const api: MutableRefObject<GridTableApi<NestedRow> | undefined> = { current: undefined };
      const r = await render(<TestFilterAndSelect api={api} rows={rows} />);

      // When selecting a grand child of the grandparent that sets `inferSelectedState: false`
      click(cellAnd(r, 3, 1, "select"));

      // Then the header row should be indeterminate
      expect(cellAnd(r, 0, 1, "select")).toHaveAttribute("data-indeterminate", "true");
      // And the parent row to not be checked.
      expect(cellAnd(r, 1, 1, "select")).not.toBeChecked();
      // And the child row should show indeterminate
      expect(cellAnd(r, 2, 1, "select")).toHaveAttribute("data-indeterminate", "true");
      expect(api.current!.getSelectedRowIds()).toEqual(["p1c1gc1"]);

      // When selecting the parent
      click(cellAnd(r, 1, 1, "select"));

      // Then children should not be selected
      expect(cellAnd(r, 0, 1, "select")).not.toBeChecked();
      expect(cellAnd(r, 1, 1, "select")).toBeChecked();
      expect(cellAnd(r, 2, 1, "select")).not.toBeChecked();
      expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1gc1"]);

      // select children
      click(cellAnd(r, 0, 1, "select"));
      click(cellAnd(r, 2, 1, "select"));

      // When unselecting a single grand child
      click(cellAnd(r, 3, 1, "select"));

      // Then the header row should return to indeterminate
      expect(cellAnd(r, 0, 1, "select")).toHaveAttribute("data-indeterminate", "true");
      // And the parent row to remain checked, b/c it does not infer selected
      expect(cellAnd(r, 1, 1, "select")).toBeChecked();
      // And the child row should return to indeterminate, b/c it does infer selected
      expect(cellAnd(r, 2, 1, "select")).toHaveAttribute("data-indeterminate", "true");
      expect(api.current!.getSelectedRowIds()).toEqual(["p1", "p1c1gc2"]);
    });

    it("respects initExpand and updates localStorage", async () => {
      const tableIdentifier = "persistCollapse";

      // Given a table with expandable columns that are initially expanded
      // When initially rendered with the expandable column set to `initExpanded: true`.
      const r = await render(
        <GridTable
          columns={[
            column<ExpandableRow>({
              expandableHeader: () => "Client name",
              initExpanded: true,
              header: () => "First name",
              data: ({ firstName }) => firstName,
              expandColumns: [
                column<ExpandableRow>({
                  expandableHeader: emptyCell,
                  header: "Last name",
                  data: ({ lastName }) => lastName,
                }),
              ],
            }),
          ]}
          rows={[
            { kind: "header", id: "header", data: {} },
            { kind: "expandableHeader", id: "expandableHeader", data: {} },
            { kind: "data", id: "user:1", data: { firstName: "Brandon", lastName: "Dow", age: 36 } },
          ]}
          persistCollapse={tableIdentifier}
        />,
      );

      // Then the column is initially expanded
      expect(cell(r, 1, 0)).toHaveTextContent("First name");
      expect(cell(r, 1, 1)).toHaveTextContent("Last name");
      // And the local storage value is updated with the current state
      expect(sessionStorage.getItem(`expandedColumn_${tableIdentifier}`)).toBe('["beamColumn_0"]');
    });

    it("respects initially expands columns set in localstorage", async () => {
      const tableIdentifier = "persistCollapse";

      sessionStorage.setItem(`expandedColumn_${tableIdentifier}`, JSON.stringify(["column1"]));

      // Given a table with expandable columns that are initially expanded
      // When initially rendered with the expandable column not initially collapsed
      const r = await render(
        <GridTable
          columns={[
            column<ExpandableRow>({
              id: "column1",
              expandableHeader: () => "Client name",
              header: () => "First name",
              data: ({ firstName }) => firstName,
              expandColumns: [
                column<ExpandableRow>({
                  expandableHeader: emptyCell,
                  header: "Last name",
                  data: ({ lastName }) => lastName,
                }),
              ],
            }),
          ]}
          rows={[
            { kind: "header", id: "header", data: {} },
            { kind: "expandableHeader", id: "expandableHeader", data: {} },
            { kind: "data", id: "user:1", data: { firstName: "Brandon", lastName: "Dow", age: 36 } },
          ]}
          persistCollapse={tableIdentifier}
        />,
      );

      // Then the column is initially expanded
      expect(cell(r, 1, 0)).toHaveTextContent("First name");
      expect(cell(r, 1, 1)).toHaveTextContent("Last name");
    });

    it("ignores init expanded, but respects new columns", async () => {
      // Given a table with a column that is initially hidden, and initially expanded where the expanded columns are lazily loaded
      const columns: GridColumn<ExpandableRow>[] = [
        {
          id: "myColumn",
          header: emptyCell,
          data: ({ firstName }) => firstName,
          expandableHeader: "First Name",
        },
        {
          id: "myColumn2",
          initVisible: false,
          initExpanded: true,
          canHide: true,
          header: "First",
          data: ({ firstName }) => firstName,
          expandableHeader: "name",
          expandColumns: async () => [
            column<ExpandableRow>({
              expandableHeader: emptyCell,
              header: "Last Name",
              data: ({ lastName }) => lastName,
              w: "250px",
            }),
            column<ExpandableRow>({
              expandableHeader: emptyCell,
              header: "Age",
              data: ({ age }) => age,
              w: "80px",
            }),
          ],
        },
      ];

      const rows: GridDataRow<ExpandableRow>[] = [
        { kind: "header", id: "header", data: {} },
        { kind: "expandableHeader", id: "expandableHeader", data: {} },
        { kind: "data", id: "user:1", data: { firstName: "Brandon", lastName: "Dow", age: 36 } },
      ];

      // And a table tied to the GridTableApi
      const api: MutableRefObject<GridTableApi<ExpandableRow> | undefined> = { current: undefined };

      function Test() {
        const _api = useGridTableApi<ExpandableRow>();
        api.current = _api;
        return <GridTable api={_api} columns={columns} rows={rows} />;
      }

      // When rendering the table
      const r = await render(<Test />);
      // Then the column is initially hidden
      expect(row(r, 1).childNodes).toHaveLength(1);
      // When setting the column to be visible
      // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        api.current?.setVisibleColumns(api.current.getVisibleColumnIds().concat("myColumn2"));
        // wait for promise to resolve
        await wait();
      });
      // then expect 2 columns + 2 expandable columns to be visible
      expect(row(r, 1).childNodes).toHaveLength(4);
    });

    it("ignores initExpanded for existing columns on rerender", async () => {
      // Given a table with a column that is initially expanded
      // And a table tied to the GridTableApi
      const api: MutableRefObject<GridTableApi<ExpandableRow> | undefined> = { current: undefined };

      function Test() {
        const _api = useGridTableApi<ExpandableRow>();
        api.current = _api;
        return (
          <GridTable
            api={_api}
            columns={[
              column<ExpandableRow>({
                id: "columnA",
                expandableHeader: () => "Client name",
                initExpanded: true,
                header: (data, { expanded }) => (expanded ? "First name" : "Full name"),
                data: ({ firstName, lastName }, { expanded }) => (expanded ? firstName : `${firstName} ${lastName}`),
                expandColumns: [
                  column<ExpandableRow>({
                    expandableHeader: emptyCell,
                    header: "Last name",
                    data: ({ lastName }) => lastName,
                  }),
                ],
              }),
              column<ExpandableRow>({
                id: "columnB",
                initVisible: false,
                canHide: true,
                expandableHeader: () => "Age",
                header: emptyCell,
                data: ({ age }) => age,
              }),
            ]}
            rows={[
              { kind: "header", id: "header", data: {} },
              { kind: "expandableHeader", id: "expandableHeader", data: {} },
              { kind: "data", id: "user:1", data: { firstName: "Brandon", lastName: "Dow", age: 36 } },
            ]}
          />
        );
      }

      // When rendering the table
      const r = await render(<Test />);

      // Then the column is initially expanded (1 column + 1 expanded column)
      expect(row(r, 1).childNodes).toHaveLength(2);
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Client name |
        | First name  | Last name |
        | ----------- | --------- |
        | Brandon     | Dow       |
        "
      `);

      //  When clicking to collapse `columnA`
      click(r.expandableColumn);

      // Then the column is collapsed
      expect(row(r, 1).childNodes).toHaveLength(1);
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Client name |
        | Full name   |
        | ----------- |
        | Brandon Dow |
        "
      `);

      // And when then triggering new `columnB` to be introduced
      // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        api.current?.setVisibleColumns(api.current.getVisibleColumnIds().concat("columnB"));
        await wait();
      });

      // Then the `columnA` remains collapsed
      expect(row(r, 1).childNodes).toHaveLength(2);
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Client name | Age |
        | Full name   |     |
        | ----------- | --- |
        | Brandon Dow | 36  |
        "
      `);
    });
  });

  it("can be tested with a human readable inlineSnapshot using tableSnapshot()", async () => {
    // Given a table with simple data
    const r = await render(
      <GridTable
        columns={[nameColumn, valueColumn]}
        sorting={{ on: "client" }}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "Row 1", value: 200 } },
          { kind: "data", id: "2", data: { name: "Row 2 with a longer name", value: 300 } },
          { kind: "data", id: "3", data: { name: "Row 3", value: 1000 } },
        ]}
      />,
    );

    // Then a text snapshot should be generated when using `tableSnapshot`
    expect(tableSnapshot(r)).toMatchInlineSnapshot(`
      "
      | Name                     | Value |
      | ------------------------ | ----- |
      | Row 1                    | 200   |
      | Row 2 with a longer name | 300   |
      | Row 3                    | 1000  |
      "
    `);
  });

  it("tableSnapshot can use a subset of columns", async () => {
    // Given a table with simple data
    const r = await render(
      <GridTable
        columns={[idColumn, nameColumn, valueColumn]}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "Row 1", value: 200 } },
          { kind: "data", id: "2", data: { name: "Row 2", value: 300 } },
          { kind: "data", id: "3", data: { name: "Row 3", value: 1000 } },
        ]}
      />,
    );

    // Then a text snapshot should be generated when using `tableSnapshot`
    expect(tableSnapshot(r, ["Id", "Value"])).toMatchInlineSnapshot(`
      "
      | Id | Value |
      | -- | ----- |
      | 1  | 200   |
      | 2  | 300   |
      | 3  | 1000  |
      "
    `);
  });

  it("renders totals row in the correct order", async () => {
    type Row = SimpleHeaderAndData<Data> | TotalsRow;
    // Given a table with simple header, totals, and data row
    const valueColumn: GridColumn<Row> = {
      totals: () => ({ content: "totals" }),
      header: () => ({ content: "header value" }),
      data: () => ({ content: "data value" }),
    };
    // When the table renders
    const r = await render(
      <GridTable
        columns={[valueColumn]}
        rows={[
          {
            kind: "totals",
            id: "totals",
            data: undefined,
          },
          ...rows,
        ]}
      />,
    );
    // Then the first row is header
    expect(row(r, 0)).toHaveTextContent("header value");
    // And 2nd row is the totals
    expect(row(r, 1)).toHaveTextContent("totals");
    // And final row is the data
    expect(row(r, 2)).toHaveTextContent("data value");
  });

  describe("hidden selected rows", () => {
    it("displays hidden selected rows when filtering server side", async () => {
      // Given the table with the initial rows selected
      // Using a "Test" component in order to be able to change the table rows via a state update
      function Test() {
        const columns = [nameColumn, valueColumn];
        const initRows: GridDataRow<Row>[] = [
          simpleHeader,
          { kind: "data", id: "1", data: { name: "foo", value: 1 }, initSelected: true },
        ];
        const [rows, setRows] = useState(initRows);

        return (
          <>
            <button
              onClick={() =>
                setRows((rows) => [simpleHeader, { kind: "data", id: "2", data: { name: "bar", value: 2 } }])
              }
              data-testid="replace"
            />
            <GridTable columns={columns} rows={rows} />
          </>
        );
      }

      const r = await render(<Test />);
      // Then the hidden selected group row is not displayed initially, as there is no filter applied
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Name | Value |
        | ---- | ----- |
        | foo  | 1     |
        "
      `);
      // When clicking the replace button to simulate server-side filtering
      click(r.replace);
      // Then the hidden selected group row is displayed with the missing row's data
      click(r.chevronRight);
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Name                                 | Value |
        | ------------------------------------ | ----- |
        | 1 selected row hidden due to filters |
        | foo                                  | 1     |
        | bar                                  | 2     |
        "
      `);
    });

    it("displays hidden selected rows when filtering client side", async () => {
      // Given the table with a filter applied and rows selected
      const columns = [nameColumn, valueColumn];
      const rows: GridDataRow<Row>[] = [
        simpleHeader,
        { kind: "data", id: "1", data: { name: "foo", value: 1 }, initSelected: true },
        { kind: "data", id: "2", data: { name: "bar", value: 2 }, initSelected: true },
        { kind: "data", id: "3", data: { name: "biz", value: 3 }, initSelected: true },
      ];
      const r = await render(<GridTable columns={columns} rows={rows} filter="foo" />);
      // Then the hidden selected group row is displayed, and initially collapsed
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Name                                  | Value |
        | ------------------------------------- | ----- |
        | 2 selected rows hidden due to filters |
        | foo                                   | 1     |
        "
      `);

      // When clicking the expand button
      click(r.chevronRight);
      // Then the hidden selected group row is expanded
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Name                                  | Value |
        | ------------------------------------- | ----- |
        | 2 selected rows hidden due to filters |
        | bar                                   | 2     |
        | biz                                   | 3     |
        | foo                                   | 1     |
        "
      `);
    });

    it("sorts hidden selected rows independently from visible rows", async () => {
      // Given the table with a filter applied and rows selected
      const columns = [nameColumn, valueColumn];
      const rows: GridDataRow<Row>[] = [
        simpleHeader,
        { kind: "data", id: "1", data: { name: "foo", value: 1 }, initSelected: true },
        { kind: "data", id: "2", data: { name: "bar", value: 2 }, initSelected: true },
        { kind: "data", id: "3", data: { name: "biz", value: 3 }, initSelected: true },
      ];
      const r = await render(
        <GridTable columns={columns} rows={rows} filter="bar" sorting={{ on: "client", initial: ["value", "DESC"] }} />,
      );

      // When clicking the expand button
      click(r.chevronRight);
      // Then the hidden selected group row is sorted independently of visible rows
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Name                                  | Value |
        | ------------------------------------- | ----- |
        | 2 selected rows hidden due to filters |
        | biz                                   | 3     |
        | foo                                   | 1     |
        | bar                                   | 2     |
        "
      `);
    });

    it("reverts the hidden selected group collapse state once removed", async () => {
      // Given a filterable table with rows selected
      function Test() {
        const columns = [nameColumn, valueColumn];
        const rows: GridDataRow<Row>[] = [
          simpleHeader,
          { kind: "data", id: "1", data: { name: "foo", value: 1 }, initSelected: true },
          { kind: "data", id: "2", data: { name: "bar", value: 2 }, initSelected: true },
        ];
        const [filter, setFilter] = useState("foo");
        return (
          <>
            <input type="text" data-testid="filter" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <GridTable columns={columns} rows={rows} filter={filter} />
          </>
        );
      }
      const r = await render(<Test />);
      // Then the hidden selected group row is initially collapsed
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Name                                 | Value |
        | ------------------------------------ | ----- |
        | 1 selected row hidden due to filters |
        | foo                                  | 1     |
        "
      `);
      // When clicking the expand button
      click(r.chevronRight);
      // Then the hidden selected group row is expanded
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Name                                 | Value |
        | ------------------------------------ | ----- |
        | 1 selected row hidden due to filters |
        | bar                                  | 2     |
        | foo                                  | 1     |
        "
      `);
      // When removing the filter
      type(r.filter, "");
      // Then the hidden selected group row is removed
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Name | Value |
        | ---- | ----- |
        | foo  | 1     |
        | bar  | 2     |
        "
      `);
      // When applying a filter again
      await typeAndWait(r.filter, "bar");
      // Then the hidden selected group row is reintroduced in its collapsed state
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | Name                                 | Value |
        | ------------------------------------ | ----- |
        | 1 selected row hidden due to filters |
        | bar                                  | 2     |
        "
      `);
    });

    it("removes the hidden selected group row when all selected rows are removed", async () => {
      // Given the table with a filter applied and rows selected
      const columns = [selectColumn<Row>(), nameColumn, valueColumn];
      const rows: GridDataRow<Row>[] = [
        simpleHeader,
        { kind: "data", id: "1", data: { name: "foo", value: 1 }, initSelected: true },
        { kind: "data", id: "2", data: { name: "bar", value: 2 }, initSelected: true },
        { kind: "data", id: "3", data: { name: "biz", value: 3 }, initSelected: true },
      ];
      const r = await render(
        <GridTable columns={columns} rows={rows} filter="bar" sorting={{ on: "client", initial: ["value", "DESC"] }} />,
      );
      // When deselecting the kept rows
      click(r.chevronRight);
      expect(cell(r, 1, 0)).toHaveTextContent("2 selected rows hidden due to filters");
      click(r.select_1);
      expect(cell(r, 1, 0)).toHaveTextContent("1 selected row hidden due to filters");
      click(r.select_1);
      // Then the hidden selected group row is removed
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | on | Name | Value |
        | -- | ---- | ----- |
        | on | bar  | 2     |
        "
      `);
    });

    it("updates the selected state of the header and parent rows when rows are hidden", async () => {
      // Given the GridTable with nested rows
      function Test() {
        const rows: GridDataRow<NestedRow>[] = [
          simpleHeader,
          {
            id: "p1",
            kind: "parent",
            data: { name: "p1" },
            children: [
              { id: "c1", kind: "child", data: { name: "c1" } },
              { id: "c2", kind: "child", data: { name: "c2" } },
              { id: "c3", kind: "child", data: { name: "c3" } },
            ],
          },
        ];
        const [filter, setFilter] = useState("");
        return (
          <>
            <input type="text" data-testid="filter" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <GridTable columns={nestedColumns} rows={rows} filter={filter} />
          </>
        );
      }

      const r = await render(<Test />);
      // When selecting two of the three children
      click(r.select_2);
      click(r.select_3);
      // Then the header and parent row is partially selected
      expect(cellAnd(r, 0, 1, "select")).toHaveAttribute("data-indeterminate", "true");
      expect(cellAnd(r, 1, 1, "select")).toHaveAttribute("data-indeterminate", "true");

      // When applying a filter to hide the unselected row
      type(r.filter, "c1");
      // Then the header and parent rows match the selected state of the visible rows
      expect(cellAnd(r, 0, 1, "select")).toBeChecked();
      expect(cellAnd(r, 2, 1, "select")).toBeChecked();
      // When deselecting the visible row
      click(r.select_2);

      // Then the parent row is now unchecked (respecting only the matched rows), but the header is still partially
      // selected as it takes into consideration the kept selected rows
      expect(cellAnd(r, 0, 1, "select")).toHaveAttribute("data-indeterminate", "true");
      expect(cellAnd(r, 2, 1, "select")).not.toBeChecked();

      // And when clearing the filter
      type(r.filter, "");
      // Then the parent row becomes partially selected now that the selected row is no longer "kept"
      expect(cellAnd(r, 1, 1, "select")).toHaveAttribute("data-indeterminate", "true");
    });

    it("hides parent rows in the kept group unless they define inferSelected as false", async () => {
      // Given nested rows with two parents - one that sets `inferSelectedState: false`.
      // And all rows are selected, and a filter is applied that matches none of the rows
      const rows: GridDataRow<NestedRow>[] = [
        simpleHeader,
        {
          id: "p1",
          kind: "parent",
          data: { name: "p1" },
          initSelected: true,
          children: [{ id: "c1", kind: "child", data: { name: "c1" }, initSelected: true }],
        },
        {
          id: "p2",
          kind: "parent",
          data: { name: "p2" },
          inferSelectedState: false,
          initSelected: true,
          children: [{ id: "c2", kind: "child", data: { name: "c2" }, initSelected: true }],
        },
      ];
      const r = await render(<GridTable columns={nestedColumns} rows={rows} filter="no-match" />);
      // And expand the kept group
      click(r.chevronRight);
      // Then the kept group will contain `p2`, but not `p1`.
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | -                                     | on | Name |
        | ------------------------------------- | -- | ---- |
        | 3 selected rows hidden due to filters |
        | -                                     | on | c1   |
        | -                                     | on | p2   |
        | -                                     | on | c2   |
        | No rows found.                        |
        "
      `);
    });

    it("unselects all kept selected rows when deselecting the header", async () => {
      // Given selected rows and a filter applied to show the kept selected group
      const columns = [selectColumn<Row>(), nameColumn, valueColumn];
      const rows: GridDataRow<Row>[] = [
        simpleHeader,
        { kind: "data", id: "1", data: { name: "foo", value: 1 }, initSelected: true },
        { kind: "data", id: "2", data: { name: "bar", value: 2 }, initSelected: true },
      ];
      const r = await render(<GridTable columns={columns} rows={rows} filter="bar" />);
      // Then the kept selected group is shown
      expect(cell(r, 1, 0)).toHaveTextContent("1 selected row hidden due to filters");
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | on                                   | Name | Value |
        | ------------------------------------ | ---- | ----- |
        | 1 selected row hidden due to filters |
        | on                                   | bar  | 2     |
        "
      `);
      // Then the header is fully selected
      expect(r.select_0).toHaveAttribute("data-indeterminate", "false");
      // When deselecting the header
      click(r.select_0);
      // Then the kept selected group is hidden
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | on | Name | Value |
        | -- | ---- | ----- |
        | on | bar  | 2     |
        "
      `);
    });
  });

  describe("deleting rows", () => {
    it("deletes a row", async () => {
      // Given a table with the ability to delete rows
      const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
      function TestComponent() {
        const _api = useGridTableApi<Row>();
        api.current = _api;
        const [rows, setRows] = useState<GridDataRow<Row>[]>([
          simpleHeader,
          { kind: "data", id: "1", data: { name: "foo", value: 1 } },
          { kind: "data", id: "2", data: { name: "bar", value: 2 } },
        ]);
        return (
          <>
            <button
              onClick={() => {
                setRows((rows) => rows.filter((r) => !_api.getSelectedRowIds().includes(r.id)));
                _api.deleteRows(_api.getSelectedRowIds());
              }}
              data-testid="deleteRows"
            />
            <GridTable columns={[selectColumn<Row>(), ...columns]} rows={rows} api={_api} />
          </>
        );
      }
      const r = await render(<TestComponent />);
      // The table has two rows and a header
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | on | Name | Value |
        | -- | ---- | ----- |
        | on | foo  | 1     |
        | on | bar  | 2     |
        "
      `);
      // When selecting a row
      click(r.select_1);
      // And clicking the delete button
      click(r.deleteRows);
      // Then it is removed from the table
      expect(tableSnapshot(r)).toMatchInlineSnapshot(`
        "
        | on | Name | Value |
        | -- | ---- | ----- |
        | on | bar  | 2     |
        "
      `);
    });
  });

  it("rejects cycles in rows", async () => {
    // Given a parent that is its own child
    const rows: GridDataRow<NestedRow>[] = [
      {
        ...{ kind: "parent", id: "p1", data: { name: "parent 1" } },
        children: [{ kind: "parent", id: "p1", data: { name: "child p1c1" } }],
      },
    ];
    // Then we reject it
    const p = render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);
    await expect(p).rejects.toThrow("Duplicate row id p1");
  });

  it("rejects duplicates in rows", async () => {
    // Given an id that is duplicated within the same kind
    const rows: GridDataRow<NestedRow>[] = [
      { kind: "parent", id: "p1", data: { name: "parent 1" } },
      { kind: "parent", id: "p1", data: { name: "parent 1" } },
    ];
    // Then we reject it
    const p = render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);
    await expect(p).rejects.toThrow("Duplicate row id p1");
  });

  it("rejects duplicate ids even if different kinds", async () => {
    // Given an id that is duplicated even across kinds
    const rows: GridDataRow<NestedRow>[] = [
      { kind: "parent", id: "1", data: { name: "parent 1" } },
      { kind: "child", id: "1", data: { name: "child 1" } },
    ];
    // Then we reject it
    const p = render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} />);
    await expect(p).rejects.toThrow("Duplicate row id 1");
  });

  it("can download csvs", async () => {
    let api: GridTableApi<Row> | undefined;

    function amountGridCellContent(amount: number): GridCellContent {
      return {
        content: <div />,
        value: amount,
      };
    }

    const columns: GridColumn<Row>[] = [
      // Given a column returns JSX, but defines a `sortValue`
      { header: "Name", data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }) },
      // And a column returns a number
      { header: "Value", data: ({ value }) => value },
      // And a column returns a string
      { header: "Value", data: ({ value }) => String(value) },
      // And a column returns a string with a comma in it
      { header: "Value", data: ({ value }) => `${value},${value}` },
      // And a column returns a string with a quote in it
      { header: "Value", data: ({ value }) => `a quoted "${value}" value` },
      // And a column returns when it's a grid cell contect
      { header: "GridCellValue", data: ({ value }) => (isDefined(value) ? amountGridCellContent(value) : value) },
      // And a column returns undefined
      { header: "Value", data: () => undefined },
      // And a column returns JSX with nothing else
      { header: "Action", data: () => <div>Actions</div>, isAction: true },
    ];

    const csvRows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "foo", value: 1 } },
      { kind: "data", id: "2", data: { name: "bar", value: 2 } },
      { kind: "data", id: "3", data: { name: "zeroname", value: 0 } },
      { kind: "data", id: "4", data: { name: "nullname", value: null } },
      { kind: "data", id: "5", data: { name: "undefname", value: undefined } },
    ];

    function Test() {
      api = useGridTableApi<Row>();
      return <GridTable<Row> api={api} columns={columns} rows={csvRows} />;
    }

    await render(<Test />);

    expect((api as GridTableApiImpl<Row>).generateCsvContent()).toEqual([
      "Name,Value,Value,Value,Value,GridCellValue,Value",
      `foo,1,1,"1,1","a quoted ""1"" value",1,`,
      `bar,2,2,"2,2","a quoted ""2"" value",2,`,
      `zeroname,0,0,"0,0","a quoted ""0"" value",0,`,
      `nullname,,null,"null,null","a quoted ""null"" value",,`,
      `undefname,,undefined,"undefined,undefined","a quoted ""undefined"" value",,`,
    ]);
  });

  it("can download csvs with extra rows", async () => {
    let api: GridTableApi<Row> | undefined;
    // Given a table with 1 column
    const columns: GridColumn<Row>[] = [{ header: "Value", data: ({ value }) => value }];
    // And just 1 extra csv rows that adds a header
    const extraCsvRows: string[][] = [["Report Title", "From: here", `To: "there"...`]];
    function Test() {
      api = useGridTableApi<Row>();
      return <GridTable<Row> api={api} columns={columns} rows={rows} csvPrefixRows={extraCsvRows} />;
    }
    await render(<Test />);
    // When we generate the csv, then the extra rows are included
    expect((api as GridTableApiImpl<Row>).generateCsvContent()).toEqual([
      `Report Title,From: here,"To: ""there""..."`,
      "Value",
      "1",
      "2",
    ]);
  });
});

function Collapse({ id }: { id: string }) {
  const { tableState } = useContext(TableStateContext);
  const icon = useComputed(() => (tableState.isCollapsed(id) ? "+" : "-"), [tableState]);
  return (
    <div onClick={() => tableState.toggleCollapsed(id)} data-testid="collapse">
      {icon}
    </div>
  );
}

function expectRenderedRows(...rowIds: string[]): void {
  expect(renderedNameColumn).toEqual(rowIds);
  // Reset as a side effect so the test's next call to `expectRenderedRows` will
  // include only the renders since the last assertion.
  renderedNameColumn = [];
}

function TestFilterAndSelect(props: {
  api: MutableRefObject<GridTableApi<NestedRow> | undefined>;
  rows: GridDataRow<NestedRow>[];
}) {
  const { api: apiRef, rows } = props;
  const api = useGridTableApi<NestedRow>();
  apiRef.current = api;
  const [filter, setFilter] = useState<string | undefined>("");
  return (
    <div>
      <TextField label="Filter" value={filter} onChange={setFilter} />
      <GridTable<NestedRow> api={api} columns={nestedColumns} rows={rows} filter={filter} />
    </div>
  );
}
