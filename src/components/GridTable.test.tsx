import React, { MutableRefObject, useContext } from "react";
import {
  GridCollapseContext,
  GridColumn,
  GridDataRow,
  GridRowLookup,
  GridRowStyles,
  GridTable,
  matchesFilter,
  simpleHeader,
  SimpleHeaderAndDataOf,
  SimpleHeaderAndDataWith,
} from "src/components/GridTable";
import { Css, Palette } from "src/Css";
import { cell, click, render, row } from "src/utils/rtl";

// Most of our tests use this simple Row and 2 columns
type Data = { name: string; value: number | undefined };
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
    header: () => <Collapse />,
    parent: () => <Collapse />,
    child: () => <Collapse />,
    grandChild: () => "",
    w: 0,
  },
  {
    header: () => "Name",
    parent: (row) => <div>{row.name}</div>,
    child: (row) => <div css={Css.ml2.$}>{row.name}</div>,
    grandChild: (row) => <div css={Css.ml4.$}>{row.name}</div>,
  },
];

describe("GridTable", () => {
  it("renders", async () => {
    const c = await render(<GridTable columns={[nameColumn, valueColumn]} rows={rows} />);
    expect(c.baseElement).toMatchSnapshot();
  });

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

  it("can sort", async () => {
    // Given the table is using client-side sorting
    const r = await render(
      <GridTable
        columns={[nameColumn, valueColumn]}
        sorting="client-side"
        rows={[
          simpleHeader,
          // And the data is initially unsorted
          { kind: "data", id: "2", name: "b", value: 2 },
          { kind: "data", id: "1", name: "a", value: 3 },
          { kind: "data", id: "3", name: "c", value: 1 },
        ]}
      />,
    );
    // Then the data is initially render un-sorted
    expect(cell(r, 1, 0)).toHaveTextContent("b");

    // And when sorted by column 1
    const { sortHeader_0, sortHeader_1 } = r;
    click(sortHeader_0);
    // Then 'name: a' row is first
    expect(cell(r, 1, 0)).toHaveTextContent("a");

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
        columns={[nameColumn, { header: () => "Value", data: ({ value }) => ({ value, content: <div>{value}</div> }) }]}
        sorting="client-side"
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
        sorting="client-side"
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

  it("can sort undefined values", async () => {
    // Given the table is using client-side sorting
    const r = await render(
      <GridTable<Row>
        columns={[nameColumn, { header: () => "Value", data: ({ value }) => ({ value, content: <div>{value}</div> }) }]}
        sorting="client-side"
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
    const { sortHeader_1 } = r;
    click(sortHeader_1);
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
        columns={[nameColumn, { ...valueColumn, sort: false }]}
        sorting="client-side"
        rows={[simpleHeader, { kind: "data", id: "2", name: "b", value: 2 }]}
      />,
    );
    const { sortHeader_0, sortHeader_1 } = r;
    // Then we have only a single sort header in the dom
    expect(sortHeader_0()).toBeDefined();
    expect(sortHeader_1()).toBeUndefined();
  });

  describe("server-side sorting", () => {
    it("works", async () => {
      // Given the table is using server-side sorting
      const onSort = jest.fn();
      const r = await render(
        <GridTable
          // And the 1st column has a sortValue callback
          columns={[{ ...nameColumn, sortValue: "name" }, valueColumn]}
          sorting="server-side"
          onSort={onSort}
          rows={rows}
        />,
      );
      const { sortHeader_0, sortHeader_icon_0 } = r;
      // It is initially not sorted
      expect(() => sortHeader_icon_0()).toThrow("Unable to find");

      // Then when sorted by the 1st column
      click(sortHeader_0);
      // Then the callback was called
      expect(onSort).toHaveBeenCalledWith("name", "ASC");
      // And we show the sort toggle
      expect(sortHeader_icon_0()).toHaveAttribute("data-icon", "sortUp");
      // And the data was not reordered (we defer to the server-side)
      expect(cell(r, 1, 0)).toHaveTextContent("foo");

      // And when we sort again
      click(sortHeader_0);
      // Then it was called again but desc
      expect(onSort).toHaveBeenCalledWith("name", "DESC");
      // And we flip the sort toggle
      expect(sortHeader_icon_0()).toHaveAttribute("data-icon", "sortDown");
    });

    it("doesn't sort columns w/o onSort", async () => {
      // Given the table is using server-side sorting
      const onSort = jest.fn();
      const r = await render(
        <GridTable
          // And the 2nd column does not have a sortValue
          columns={[{ ...nameColumn, sortValue: "name" }, valueColumn]}
          sorting="server-side"
          onSort={onSort}
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
          // And the 1st column has a sortValue
          columns={[{ ...nameColumn, sortValue: "name" }, valueColumn]}
          sorting="server-side"
          onSort={onSort}
          // And the dataset already came back as sorted by [name, asc]
          sort={["name", "ASC"]}
          rows={rows}
        />,
      );
      // Then it is shown as initially sorted asc
      expect(sortHeader_icon_0()).toHaveAttribute("data-icon", "sortUp");
    });

    it("initializes with desc sorting", async () => {
      // Given the table is using server-side sorting
      const onSort = jest.fn();
      const { sortHeader_icon_0 } = await render(
        <GridTable
          // And the 1st column has a sortValue
          columns={[{ ...nameColumn, sortValue: "name" }, valueColumn]}
          sorting="server-side"
          onSort={onSort}
          // And the dataset already came back as sorted by [name, desc]
          sort={["name", "DESC"]}
          rows={rows}
        />,
      );
      // Then it is shown as initially sorted desc
      expect(sortHeader_icon_0()).toHaveAttribute("data-icon", "sortDown");
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

  it("can collapse parent rows", async () => {
    // Given a parent with a child and grandchild
    const rows: GridDataRow<NestedRow>[] = [
      { kind: "parent", id: "p1", name: "parent 1" },
      { kind: "child", id: "p1c1", parentIds: ["p1"], name: "child p1c1" },
      { kind: "grandChild", id: "p1c1g1", parentIds: ["p1", "p1c1"], name: "grandchild p1c1g1" },
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
      { kind: "parent", id: "p1", name: "parent 1" },
      { kind: "child", id: "p1c1", parentIds: ["p1"], name: "child p1c1" },
      { kind: "grandChild", id: "p1c1g1", parentIds: ["p1", "p1c1"], name: "grandchild p1c1g1" },
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
      { kind: "parent", id: "p1", name: "parent 1" },
      { kind: "child", id: "p1c1", parentIds: ["p1"], name: "child p1c1" },
      { kind: "grandChild", id: "p1c1g1", parentIds: ["p1", "p1c1"], name: "grandchild p1c1g1" },
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
      { kind: "parent", id: "p1", name: "parent 1" },
      { kind: "child", id: "p1c1", parentIds: ["p1"], name: "child p1c1" },
      { kind: "parent", id: "p2", name: "parent 2" },
      { kind: "child", id: "p2c1", parentIds: ["p2"], name: "child p2c1" },
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
    // Given three throws
    const r1 = { kind: "data", id: "r:1", name: "one", value: 1 } as const;
    const r2 = { kind: "data", id: "r:2", name: "two", value: 2 } as const;
    const r3 = { kind: "data", id: "r:3", name: "thr", value: 3 } as const;
    const rows: GridDataRow<Row>[] = [r1, r2, r3];
    // A pretend MutableRefObject
    const rowLookup: MutableRefObject<GridRowLookup<Row> | undefined> = {
      current: undefined,
    };
    const r = await render(<GridTable<Row> columns={columns} rows={rows} rowLookup={rowLookup} />);
    expect(rowLookup.current!.lookup(r1)).toMatchObject({ next: r2, data: { next: r2 } });
    expect(rowLookup.current!.lookup(r2)).toMatchObject({ prev: r1, next: r3, data: { prev: r1, next: r3 } });
    expect(rowLookup.current!.lookup(r3)).toMatchObject({ prev: r2, data: { prev: r2 } });
  });

  it("can look up row locations and be kind-aware", async () => {
    const header = { kind: "header" as const, id: "header" };
    const p1 = { kind: "parent" as const, id: "p1", name: "parent 1" };
    const p1c1 = { kind: "child" as const, id: "p1c1", parentIds: ["p1"], name: "child p1c1" };
    const p2 = { kind: "parent" as const, id: "p2", name: "parent 2" };
    const p2c1 = { kind: "child" as const, id: "p2c1", parentIds: ["p2"], name: "child p2c1" };
    const rows: GridDataRow<NestedRow>[] = [header, p1, p1c1, p2, p2c1];

    // A pretend MutableRefObject
    const rowLookup: MutableRefObject<GridRowLookup<NestedRow> | undefined> = {
      current: undefined,
    };
    const r = await render(<GridTable<NestedRow> columns={nestedColumns} rows={rows} rowLookup={rowLookup} />);
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
});

function Collapse() {
  const { isCollapsed, toggleCollapse } = useContext(GridCollapseContext);
  const icon = isCollapsed ? "+" : "-";
  return <div onClick={toggleCollapse}>{icon}</div>;
}
