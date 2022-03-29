import { Meta } from "@storybook/react";
import { observable } from "mobx";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  actionColumn,
  beamFlexibleStyle,
  Button,
  cardStyle,
  CollapseToggle,
  column,
  condensedStyle,
  dateColumn,
  defaultStyle,
  emptyCell,
  GridColumn,
  GridDataRow,
  GridRowLookup,
  GridRowStyles,
  GridStyle,
  GridTable,
  GridTableProps,
  Icon,
  IconButton,
  numericColumn,
  simpleHeader,
  SimpleHeaderAndDataOf,
} from "src/components/index";
import { Css, Palette } from "src/Css";
import { NumberField } from "src/inputs/NumberField";
import { noop } from "src/utils";
import { newStory, withDimensions, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: GridTable,
  title: "Components/GridTable",
  parameters: { layout: "fullscreen", backgrounds: { default: "white" } },
} as Meta;

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndDataOf<Data>;

export function ClientSideSorting() {
  const nameColumn: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }),
  };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div>, clientSideSort: false };
  return (
    <GridTable
      columns={[nameColumn, valueColumn, actionColumn]}
      sorting={{ on: "client", initial: [valueColumn, "ASC"] }}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}

export const Hovering = newStory(
  () => {
    const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
    const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
    const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
    const rowStyles: GridRowStyles<Row> = {
      data: {
        cellCss: (row) => (row.value === 3 ? Css.bgRed300.$ : {}),
        rowLink: () => "http://homebound.com",
      },
      header: {},
    };
    return (
      <GridTable<Row>
        columns={[nameColumn, valueColumn, actionColumn]}
        rowStyles={rowStyles}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "c", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
          { kind: "data", id: "3", name: "a", value: 3 },
        ]}
      />
    );
  },
  { decorators: [withRouter()] },
);

export function VirtualFiltering() {
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      { kind: "header", id: "header" },
      ...zeroTo(1_000).map((i) => ({ kind: "data" as const, id: String(i), name: `ccc ${i}`, value: i })),
    ],
    [],
  );
  const columns: GridColumn<Row>[] = useMemo(
    () => [
      { header: "Name", data: ({ name }) => name, w: "200px" },
      { header: "Value", data: ({ value }) => value, w: "10%" },
      { header: "Value", data: ({ value }) => `${value} `.repeat(10), w: "2fr" },
      { header: "Value", data: ({ value }) => value },
      { header: "Action", data: () => <div>Actions</div>, clientSideSort: false },
    ],
    [],
  );
  const rowLookup = useRef<GridRowLookup<Row> | undefined>();
  const [filter, setFilter] = useState<string | undefined>();
  return (
    <div css={Css.df.fdc.vh100.$}>
      <div>
        <input type="text" value={filter || ""} onChange={(e) => setFilter(e.target.value)} css={Css.ba.bGray900.$} />
        <Button label="goto 500" onClick={() => rowLookup.current!.scrollTo("data", "500")} />
      </div>
      <div css={Css.fg1.$}>
        <GridTable
          as="virtual"
          columns={columns}
          sorting={{ on: "client" }}
          filter={filter}
          stickyHeader={true}
          rows={rows}
          rowLookup={rowLookup}
        />
      </div>
    </div>
  );
}

export function NoRowsFallback() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  return (
    <GridTable
      columns={[nameColumn, valueColumn]}
      rows={[{ kind: "header", id: "header" }]}
      fallbackMessage="There were no rows."
    />
  );
}

// Make a `Row` ADT for a table with a header + 3 levels of nesting
type HeaderRow = { kind: "header" };
type ParentRow = { kind: "parent"; id: string; name: string };
type ChildRow = { kind: "child"; id: string; name: string };
type GrandChildRow = { kind: "grandChild"; id: string; name: string };
type AddRow = { kind: "add" };
type NestedRow = HeaderRow | ParentRow | ChildRow | GrandChildRow | AddRow;

const rows = makeNestedRows(1);
const header = { kind: "header", id: "header" } as const;
const rowsWithHeader: GridDataRow<NestedRow>[] = [header, ...rows];

export function NestedRows() {
  const arrowColumn = actionColumn<NestedRow>({
    header: (row) => <CollapseToggle row={row} />,
    parent: (row) => <CollapseToggle row={row} />,
    child: (row) => <CollapseToggle row={row} />,
    grandChild: () => "",
    add: () => "",
    w: "60px",
  });
  const nameColumn: GridColumn<NestedRow> = {
    header: () => "Name",
    parent: (row) => ({
      content: <div>{row.name}</div>,
      value: row.name,
    }),
    child: (row) => ({
      content: <div css={Css.ml2.$}>{row.name}</div>,
      value: row.name,
    }),
    grandChild: (row) => ({
      content: <div css={Css.ml4.$}>{row.name}</div>,
      value: row.name,
    }),
    add: () => "Add",
  };
  return (
    <GridTable
      columns={[arrowColumn, nameColumn]}
      {...{ rows: rowsWithHeader }}
      sorting={{ on: "client", initial: [1, "ASC"] }}
    />
  );
}

export function NestedCardsThreeLevels() {
  return <NestedCards rows={rowsWithHeader} sorting={{ on: "client", initial: [0, "ASC"] }} />;
}

function deepCount(rows: GridDataRow<any>[]): number {
  return rows.map((row) => 1 + deepCount(row.children ?? [])).reduce((a, b) => a + b, 0);
}

export function NestedCardsThreeLevelsVirtualizedAtScale() {
  const rows = useMemo(() => [header, ...makeNestedRows(500)], []);
  return (
    <div css={Css.df.fdc.vh100.$}>
      Rendering {deepCount(rows)} rows virtualized
      <NestedCards rows={rows} as="virtual" />
    </div>
  );
}

export function NestedCardsThreeLevelsVirtualizedAtScaleSorted() {
  const rows = useMemo(() => [header, ...makeNestedRows(500)], []);
  return (
    <div css={Css.df.fdc.vh100.$}>
      Rendering {deepCount(rows)} rows virtualized & sorted
      <NestedCards rows={rows} as="virtual" sorting={{ on: "client", initial: [0, "ASC"] }} />
    </div>
  );
}

export function NestedCardsTwoLevels() {
  const spacing = { brPx: 4, pxPx: 4 };
  const nestedStyle: GridStyle = {
    nestedCards: {
      firstLastColumnWidth: 24,
      spacerPx: 8,
      kinds: {
        parent: { bgColor: Palette.Gray100, ...spacing },
        child: { bgColor: Palette.White, ...spacing },
      },
    },
  };
  const rows: GridDataRow<NestedRow>[] = [
    { kind: "header", id: "header" },
    {
      ...{ kind: "parent", id: "p1", name: "parent 1" },
      children: [
        { kind: "child", id: "p1c1", name: "child p1c1" },
        { kind: "child", id: "p1c2", name: "child p1c2" },
      ],
    },
    {
      ...{ kind: "parent", id: "p2", name: "parent 2" },
      children: [{ kind: "child", id: "p2c1", name: "child p2c1" }],
    },
  ];
  return <NestedCards rows={rows} style={nestedStyle} sorting={{ on: "client", initial: [0, "ASC"] }} />;
}

type NestedCardsProps = Pick<GridTableProps<NestedRow, any, any>, "rows" | "as" | "sorting" | "style">;
function NestedCards({ rows, as, sorting, style }: NestedCardsProps) {
  const nameColumn: GridColumn<NestedRow> = {
    header: () => "Name",
    parent: (row) => ({
      content: () => <div css={Css.base.$}>{row.name}</div>,
      value: row.name,
    }),
    child: (row) => ({
      content: () => <div css={Css.sm.$}>{row.name}</div>,
      value: row.name,
    }),
    grandChild: (row) => ({
      content: () => <div css={Css.xs.$}>{row.name}</div>,
      value: row.name,
    }),
    add: () => "Add",
  };
  const actionColumn: GridColumn<NestedRow> = {
    header: () => "Action",
    parent: () => "",
    child: () => "",
    grandChild: () => <div css={Css.xs.$}>Delete</div>,
    add: () => "",
    clientSideSort: false,
  };
  const spacing = { brPx: 4, pxPx: 4 };
  const nestedStyle: GridStyle = {
    nestedCards: {
      firstLastColumnWidth: 24,
      spacerPx: 8,
      kinds: {
        parent: { bgColor: Palette.Gray500, ...spacing },
        child: { bgColor: Palette.Gray200, bColor: Palette.Gray600, ...spacing },
        grandChild: { bgColor: Palette.Green200, bColor: Palette.Green400, ...spacing },
        // Purposefully leave out the `add` kind
      },
    },
  };

  return (
    <GridTable
      as={as}
      columns={[nameColumn, nameColumn, actionColumn]}
      rows={rows}
      style={style ?? nestedStyle}
      sorting={sorting}
    />
  );
}

export const NestedCardsOverflowX = newStory(
  () => {
    const nameColumn: GridColumn<NestedRow> = {
      header: () => "Name",
      parent: (row) => ({
        content: () => <div css={Css.base.$}>{row.name}</div>,
        value: row.name,
      }),
      child: (row) => ({
        content: () => <div css={Css.sm.$}>{row.name}</div>,
        value: row.name,
      }),
      grandChild: (row) => ({
        content: () => <div css={Css.xs.$}>{row.name}</div>,
        value: row.name,
      }),
      add: () => "Add",
      w: "300px",
    };
    const actionColumn: GridColumn<NestedRow> = {
      header: () => "Action",
      parent: () => "",
      child: () => "",
      grandChild: () => <div css={Css.xs.$}>Delete</div>,
      add: () => "",
      clientSideSort: false,
      w: "300px",
    };
    const spacing = { brPx: 4, pxPx: 4 };
    const nestedStyle: GridStyle = {
      nestedCards: {
        firstLastColumnWidth: 24,
        spacerPx: 8,
        kinds: {
          parent: { bgColor: Palette.Gray500, ...spacing },
          child: { bgColor: Palette.Gray200, bColor: Palette.Gray600, ...spacing },
          grandChild: { bgColor: Palette.Green200, bColor: Palette.Green400, ...spacing },
        },
      },
    };

    return <GridTable as="virtual" columns={[nameColumn, nameColumn, actionColumn]} rows={rows} style={nestedStyle} />;
  },
  { decorators: [withDimensions("800px")] },
);

export function OneOffInlineTable() {
  const items: { code: string; name: string; quantity: number }[] = [
    { code: "AAA", name: "Aaa", quantity: 1 },
    { code: "BBB", name: "Bbb", quantity: 2 },
    { code: "Ccc", name: "Ccc", quantity: 3 },
  ];
  return (
    <div
      css={{
        ...Css.dig.gtc("auto auto auto").rg1.cg3.gray700.bgGray300.br4.p1.$,
        "& > div:nth-of-type(-n+3)": Css.tinyEm.$,
        "& > div:nth-of-type(n+4)": Css.xs.$,
        "& > div:nth-of-type(3n)": Css.tr.$,
      }}
    >
      <div>Code</div>
      <div>Item</div>
      <div>Qty</div>
      {items.map((item) => {
        return (
          <Fragment key={item.code}>
            <div>{item.code}</div>
            <div>{item.name}</div>
            <div>{item.quantity}</div>
          </Fragment>
        );
      })}
    </div>
  );
}

export function ObservableRows() {
  const o = useMemo(() => observable({ a: 1 }), []);
  const nameColumn: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => (
      <div>
        {name} {o.a}
      </div>
    ),
  };

  return (
    <div>
      <IconButton onClick={() => (o.a = o.a + 1)} icon="plus" />
      <GridTable
        columns={[nameColumn]}
        observeRows={true}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "a", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
        ]}
      />
    </div>
  );
}

export function StickyHeader() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = {
    header: () => (
      <div>
        Actions <br /> 2nd line
      </div>
    ),
    data: () => <div>Actions</div>,
  };
  return (
    <div style={Css.vh100.$}>
      some other top of page content
      <GridTable
        columns={[nameColumn, valueColumn, actionColumn]}
        stickyHeader={true}
        rows={[
          { kind: "header", id: "header" },
          ...zeroTo(200).map((i) => ({ kind: "data" as const, id: `${i}`, name: `row ${i}`, value: i })),
        ]}
      />
    </div>
  );
}

export const StyleDefault = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
  return (
    <GridTable<Row>
      columns={[nameColumn, valueColumn, actionColumn]}
      style={defaultStyle}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}, {});

export const StyleCondensed = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
  return (
    <GridTable<Row>
      columns={[nameColumn, valueColumn, actionColumn]}
      style={condensedStyle}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}, {});

export const StyleCondensedWithNoPadding = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
  // Use a green background to show the 1st column is flush left
  return (
    <div css={Css.bgGreen100.$}>
      <GridTable<Row>
        columns={[nameColumn, valueColumn, actionColumn]}
        style={{
          ...condensedStyle,
          headerCellCss: Css.smEm.$,
          firstCellCss: Css.pl0.$,
        }}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "c", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
          { kind: "data", id: "3", name: "a", value: 3 },
        ]}
      />
    </div>
  );
}, {});

export const StyleCondensedWithNoRowsFallback = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
  return (
    <GridTable<Row>
      columns={[nameColumn, valueColumn, actionColumn]}
      style={condensedStyle}
      fallbackMessage="There were no rows"
      rows={[]}
    />
  );
}, {});

export const StyleCard = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name, w: 1 };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value, w: 1 };
  const actionColumn: GridColumn<Row> = { header: "", data: () => <Icon icon="star" />, w: "56px" };
  return (
    <div css={Css.wPx(550).$}>
      <GridTable<Row>
        columns={[nameColumn, valueColumn, actionColumn]}
        style={cardStyle}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "c", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
          { kind: "data", id: "3", name: "a", value: 3 },
        ]}
      />
    </div>
  );
}, {});

export const StyleCardWithOneColumn = newStory(() => {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  return (
    <GridTable<Row>
      columns={[nameColumn]}
      style={cardStyle}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}, {});

export function AsTable() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };

  return (
    <GridTable
      as="table"
      columns={[nameColumn, valueColumn, actionColumn]}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
    />
  );
}

export function AsTableWithCustomStyles() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name, w: "75px", align: "right" };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };

  return (
    <GridTable
      as="table"
      columns={[nameColumn, valueColumn, actionColumn]}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: 2 },
        { kind: "data", id: "3", name: "a", value: 3 },
      ]}
      rowStyles={{
        header: { cellCss: Css.p1.$ },
        data: {},
      }}
    />
  );
}

export const AsTableWithRowLink = newStory(
  () => {
    const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
    const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
    const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
    const rowStyles: GridRowStyles<Row> = {
      data: { indent: 2, rowLink: () => "http://homebound.com" },
      header: {},
    };
    return (
      <GridTable<Row>
        as="table"
        columns={[nameColumn, valueColumn, actionColumn]}
        rowStyles={rowStyles}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "c", value: 1 },
          { kind: "data", id: "2", name: "b", value: 2 },
          { kind: "data", id: "3", name: "a", value: 3 },
        ]}
      />
    );
  },
  { decorators: [withRouter()] },
);

type Data2 = { name: string; role: string; date: string; priceInCents: number };
type Row2 = SimpleHeaderAndDataOf<Data2>;
export const DataTypeColumns = newStory(
  () => {
    const nameCol = column<Row2>({ header: "Name", data: ({ name }) => name });
    const detailCol = column<Row2>({ header: "Details", data: ({ role }) => role });
    const dateCol = dateColumn<Row2>({ header: "Date", data: ({ date }) => date });
    const priceCol = numericColumn<Row2>({
      header: "Price",
      data: ({ priceInCents }) => (
        <NumberField hideLabel label="Price" value={priceInCents} onChange={noop} type="cents" />
      ),
    });
    const readOnlyPriceCol = numericColumn<Row2>({
      header: "Read only Price",
      data: ({ priceInCents }) => (
        <NumberField hideLabel label="Price" value={priceInCents} onChange={noop} type="cents" readOnly />
      ),
    });
    const actionCol = actionColumn<Row2>({ header: "Action", data: () => <IconButton icon="check" onClick={noop} /> });
    return (
      <GridTable<Row2>
        columns={[nameCol, detailCol, dateCol, priceCol, readOnlyPriceCol, actionCol]}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 },
          { kind: "data", id: "2", name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 },
          { kind: "data", id: "3", name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 },
          { kind: "data", id: "4", name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 },
        ]}
      />
    );
  },
  { decorators: [withRouter()] },
);

export function WrappedHeaders() {
  const leftAlignedColumn = column<Row2>({
    header: "Left aligned column header",
    data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }),
    w: "150px",
  });
  const rightAlignedColumn = numericColumn<Row2>({
    header: "Right aligned column header",
    data: ({ priceInCents }) => ({
      content: <NumberField hideLabel label="Price" value={priceInCents} onChange={noop} type="cents" readOnly />,
      sortValue: priceInCents,
    }),
    w: "150px",
  });
  const centerAlignedColumn = actionColumn<Row2>({
    header: "Center aligned column header",
    data: ({ role }) => role,
    w: "150px",
  });

  return (
    <GridTable<Row2>
      columns={[leftAlignedColumn, rightAlignedColumn, centerAlignedColumn]}
      sorting={{ on: "client", initial: undefined }}
      style={condensedStyle}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 },
        { kind: "data", id: "2", name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 },
        { kind: "data", id: "3", name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 },
        { kind: "data", id: "4", name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 },
      ]}
    />
  );
}

type DataRow = { kind: "data"; name: string; role: string; date: string; priceInCents: number };
type TotalsRow = { kind: "total"; totalPriceInCents: number };
type ColspanRow = HeaderRow | DataRow | TotalsRow;
export function ColSpan() {
  const idCol = column<ColspanRow>({
    header: "ID",
    data: ({ id }) => id,
    // Not putting the colspan here just as a POC that we can colspan somewhere other than from the first column.
    // We should expect this to show the `emptyCell` fallback
    total: "",
  });
  const nameCol = column<ColspanRow>({
    header: "Name",
    data: ({ name }) => name,
    total: () => ({ content: "Totals:", colspan: 3, alignment: "right" }),
  });
  const detailCol = column<ColspanRow>({ header: "Details", data: ({ role }) => role, total: "" });
  const dateCol = dateColumn<ColspanRow>({ header: "Date", data: ({ date }) => date, total: "" });
  const priceCol = numericColumn<ColspanRow>({
    header: "Price",
    data: ({ priceInCents }) => (
      <NumberField hideLabel label="Price" value={priceInCents} onChange={noop} type="cents" />
    ),
    total: ({ totalPriceInCents }) => (
      <NumberField hideLabel label="Price" readOnly value={totalPriceInCents} onChange={noop} type="cents" />
    ),
  });
  // Use a green background to show the 1st column is flush left
  return (
    <GridTable<ColspanRow>
      columns={[idCol, nameCol, detailCol, dateCol, priceCol]}
      style={{ ...condensedStyle, emptyCell: <>&mdash;</> }}
      rows={[
        simpleHeader,
        { kind: "data", id: "1", name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 },
        { kind: "data", id: "2", name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 },
        { kind: "data", id: "3", name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 },
        { kind: "data", id: "4", name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 },
        { kind: "total", id: "total", totalPriceInCents: 14_083_64 },
      ]}
    />
  );
}

export function CustomEmptyCell() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
  const fourthColumn: GridColumn<Row> = { header: "Really Empty", data: emptyCell };
  return (
    <GridTable<Row>
      columns={[nameColumn, valueColumn, actionColumn, fourthColumn]}
      style={{ ...condensedStyle, emptyCell: <>&mdash;</> }}
      rows={[
        { kind: "header", id: "header" },
        { kind: "data", id: "1", name: "c", value: 1 },
        { kind: "data", id: "2", name: "b", value: undefined },
        { kind: "data", id: "3", name: "", value: 3 },
      ]}
    />
  );
}

function makeNestedRows(repeat: number = 1): GridDataRow<NestedRow>[] {
  let parentId = 0;
  return zeroTo(repeat).flatMap((i) => {
    // Make three unique parent ids for this iteration
    const p1 = `p${parentId++}`;
    const p2 = `p${parentId++}`;
    const p3 = `p${parentId++}`;
    const prefix = i === 0 ? "" : `${i}.`;
    const rows: GridDataRow<NestedRow>[] = [
      // a parent w/ two children, 1st child has 2 grandchild, 2nd child has 1 grandchild
      {
        ...{ kind: "parent", id: p1, name: `parent ${prefix}1` },
        children: [
          {
            ...{ kind: "child", id: `${p1}c1`, name: `child ${prefix}p1c1` },
            children: [
              { kind: "grandChild", id: `${p1}c1g1`, name: `grandchild ${prefix}p1c1g1` + " foo".repeat(20) },
              { kind: "grandChild", id: `${p1}c1g2`, name: `grandchild ${prefix}p1c1g2` },
            ],
          },
          {
            ...{ kind: "child", id: `${p1}c2`, name: `child ${prefix}p1c2` },
            children: [{ kind: "grandChild", id: `${p1}c2g1`, name: `grandchild ${prefix}p1c2g1` }],
          },
          // Put this "grandchild" in the 2nd level to show heterogeneous levels
          { kind: "grandChild", id: `${p1}g1`, name: `grandchild ${prefix}p1g1` },
          // Put this "kind" into the 2nd level to show it doesn't have to be a card
          { kind: "add", id: `${p1}add`, pin: "last" },
        ],
      },
      // a parent with just a child
      {
        ...{ kind: "parent", id: p2, name: `parent ${prefix}2` },
        children: [{ kind: "child", id: `${p2}c1`, name: `child ${prefix}p2c1` }],
      },
      // a parent with no children
      { kind: "parent", id: p3, name: `parent ${prefix}3` },
    ];
    return rows;
  });
}

export function StickyColumns() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name, w: "200px" };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value, w: "200px" };
  const actionColumn: GridColumn<Row> = { header: "Actions", data: "Actions", w: "200px" };
  return (
    <div>
      <h1 css={Css.lgEm.$}>First column sticky left</h1>
      <div css={Css.wPx(500).overflowAuto.$}>
        <GridTable
          columns={[{ ...nameColumn, sticky: "left" }, valueColumn, actionColumn]}
          rows={[
            { kind: "header", id: "header" },
            { kind: "data", id: "1", name: "a", value: 1 },
            { kind: "data", id: "2", name: "b", value: 2 },
          ]}
        />
      </div>

      <h1 css={Css.lgEm.mt3.$}>Last column sticky right</h1>
      <div css={Css.wPx(500).overflowAuto.$}>
        <GridTable
          columns={[nameColumn, valueColumn, { ...actionColumn, sticky: "right" }]}
          rows={[
            { kind: "header", id: "header" },
            { kind: "data", id: "1", name: "a", value: 1 },
            { kind: "data", id: "2", name: "b", value: 2 },
          ]}
        />
      </div>

      <h1 css={Css.lgEm.mt3.$}>Center column sticky left</h1>
      <div css={Css.wPx(500).overflowAuto.$}>
        <GridTable
          columns={[nameColumn, { ...valueColumn, sticky: "left" }, actionColumn]}
          rows={[
            { kind: "header", id: "header" },
            { kind: "data", id: "1", name: "a", value: 1 },
            { kind: "data", id: "2", name: "b", value: 2 },
          ]}
        />
      </div>

      <h1 css={Css.lgEm.mt3.$}>Center column sticky right</h1>
      <div css={Css.wPx(500).overflowAuto.$}>
        <GridTable
          columns={[nameColumn, { ...valueColumn, sticky: "right" }, actionColumn]}
          rows={[
            { kind: "header", id: "header" },
            { kind: "data", id: "1", name: "a", value: 1 },
            { kind: "data", id: "2", name: "b", value: 2 },
          ]}
        />
      </div>

      <h1 css={Css.lgEm.mt3.$}>Last column non-header cells sticky</h1>
      <div css={Css.wPx(500).overflowAuto.$}>
        <GridTable
          columns={[
            nameColumn,
            valueColumn,
            {
              header: "Actions (not sticky)",
              data: () => ({ content: "Actions (sticky)", sticky: "right" }),
              w: "200px",
            },
          ]}
          rows={[
            { kind: "header", id: "header" },
            { kind: "data", id: "1", name: "a", value: 1 },
            { kind: "data", id: "2", name: "b", value: 2 },
          ]}
        />
      </div>
    </div>
  );
}

export function StickyColumnsNestedCards() {
  const nameColumn: GridColumn<NestedRow> = {
    header: () => "Name",
    parent: (row) => ({
      content: () => <div css={Css.base.$}>{row.name}</div>,
      value: row.name,
    }),
    child: (row) => ({
      content: () => <div css={Css.sm.$}>{row.name}</div>,
      value: row.name,
    }),
    grandChild: (row) => ({
      content: () => <div css={Css.xs.$}>{row.name}</div>,
      value: row.name,
    }),
    add: () => "Add",
    w: "200px",
  };
  const actionColumn: GridColumn<NestedRow> = {
    header: () => "Action",
    parent: () => "",
    child: () => "",
    grandChild: () => <div css={Css.xs.$}>Delete</div>,
    add: () => "",
    clientSideSort: false,
    w: "200px",
  };
  const spacing = { brPx: 4, pxPx: 4 };
  const nestedStyle: GridStyle = {
    nestedCards: {
      firstLastColumnWidth: 24,
      spacerPx: 8,
      kinds: {
        parent: { bgColor: Palette.Gray500, ...spacing },
        child: { bgColor: Palette.Gray200, bColor: Palette.Gray600, ...spacing },
        grandChild: { bgColor: Palette.Green200, bColor: Palette.Green400, ...spacing },
      },
    },
  };
  return (
    <div>
      <h1 css={Css.lgEm.$}>First column sticky left</h1>
      <div css={Css.wPx(500).hPx(460).overflowAuto.$}>
        <GridTable
          columns={[{ ...nameColumn, sticky: "left" }, nameColumn, actionColumn]}
          rows={rowsWithHeader}
          style={nestedStyle}
          as="virtual"
        />
      </div>

      <h1 css={Css.lgEm.mt3.$}>Last column sticky right</h1>
      <div css={Css.wPx(500).hPx(460).overflowAuto.$}>
        <GridTable
          columns={[nameColumn, nameColumn, { ...actionColumn, sticky: "right" }]}
          rows={rowsWithHeader}
          style={nestedStyle}
          as="virtual"
        />
      </div>

      <h1 css={Css.lgEm.mt3.$}>Last column only "grandchild" cells sticky</h1>
      <div css={Css.wPx(500).hPx(460).overflowAuto.$}>
        <GridTable
          columns={[
            nameColumn,
            nameColumn,
            {
              ...actionColumn,
              grandChild: () => ({ content: () => <div css={Css.xs.$}>Delete</div>, sticky: "right" }),
            },
          ]}
          rows={rowsWithHeader}
          style={nestedStyle}
          as="virtual"
        />
      </div>
    </div>
  );
}

export function StickyColumnsAndHeader() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name, w: "200px", sticky: "left" };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value, w: "200px" };
  const actionColumn: GridColumn<Row> = { header: "Actions", data: "Actions", w: "200px" };
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      { kind: "header", id: "header" },
      ...zeroTo(500).map((i) => ({ kind: "data" as const, id: String(i), name: `ccc ${i}`, value: i })),
    ],
    [],
  );
  const scrollWrap = useRef<HTMLDivElement>(null);

  // Scroll wrapping element's x & y coordinates to demonstrate proper z-indices for sticky header and columns.
  useEffect(() => {
    if (scrollWrap.current) {
      scrollWrap.current.scroll(45, 26);
    }
  }, []);

  return (
    <div ref={scrollWrap} css={Css.wPx(500).hPx(500).overflowAuto.$}>
      <GridTable columns={[nameColumn, valueColumn, actionColumn]} rows={rows} stickyHeader />
    </div>
  );
}

export function ActiveRow() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name, w: "200px" };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value, w: "200px" };
  const actionColumn: GridColumn<Row> = { header: "Actions", data: "Actions", w: "200px" };
  const rowStyles: GridRowStyles<Row> = useMemo(
    () => ({
      data: {
        onClick: (row, api) => {
          api.setActiveRowId(`data_${row.id}`);
        },
      },
    }),
    [],
  );
  const rows = useMemo(
    () => [
      { kind: "header" as const, id: "header" },
      { kind: "data" as const, id: "1", name: "a", value: 1 },
      { kind: "data" as const, id: "2", name: "b", value: 2 },
      { kind: "data" as const, id: "3", name: "c", value: 3 },
    ],
    [],
  );
  const columns = useMemo(() => [nameColumn, valueColumn, actionColumn], []);
  return <GridTable columns={columns} activeRowId="data_2" rowStyles={rowStyles} rows={rows} observeRows />;
}

export function ActiveRowNestedCard() {
  const nameColumn: GridColumn<NestedRow> = {
    header: () => "Name",
    parent: (row) => ({
      content: () => <div css={Css.base.$}>{row.name}</div>,
      value: row.name,
    }),
    child: (row) => ({
      content: () => <div css={Css.sm.$}>{row.name}</div>,
      value: row.name,
    }),
    grandChild: (row) => ({
      content: () => <div css={Css.xs.$}>{row.name}</div>,
      value: row.name,
    }),
    add: () => "Add",
  };
  const actionColumn: GridColumn<NestedRow> = {
    header: () => "Action",
    parent: () => "",
    child: () => "",
    grandChild: (row, api) => (
      <Button label="Activate Row" onClick={() => api.setActiveRowId(`grandChild_${row.id}`)} />
    ),
    add: () => "",
    clientSideSort: false,
  };
  const spacing = { brPx: 4, pxPx: 4 };
  const nestedStyle: GridStyle = useMemo(
    () => ({
      nestedCards: {
        firstLastColumnWidth: 24,
        spacerPx: 8,
        kinds: {
          parent: { bgColor: Palette.Gray500, ...spacing },
          child: { bgColor: Palette.Gray200, bColor: Palette.Gray600, ...spacing },
          grandChild: { bgColor: Palette.Green200, bColor: Palette.Green400, ...spacing },
        },
      },
    }),
    [],
  );
  const columns = useMemo(() => [nameColumn, nameColumn, actionColumn], []);

  return <GridTable columns={columns} rows={rowsWithHeader} style={nestedStyle} activeRowId="grandChild_p0c1g2" />;
}
