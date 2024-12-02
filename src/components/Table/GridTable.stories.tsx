import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { observable } from "mobx";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  actionColumn,
  Button,
  cardStyle,
  Chips,
  collapseColumn,
  CollapseToggle,
  column,
  condensedStyle,
  dateColumn,
  defaultStyle,
  dragHandleColumn,
  emptyCell,
  getTableStyles,
  GridCellAlignment,
  GridColumn,
  GridDataRow,
  GridRowLookup,
  GridTable,
  Icon,
  IconButton,
  insertAtIndex,
  numericColumn,
  recursivelyGetContainingRow,
  RowStyles,
  selectColumn,
  simpleHeader,
  SimpleHeaderAndData,
  useGridTableApi,
} from "src/components/index";
import { Css, Palette } from "src/Css";
import { jan1, jan2, jan29 } from "src/forms/formStateDomain";
import { useComputed } from "src/hooks";
import { DateField, SelectField } from "src/inputs";
import { NumberField } from "src/inputs/NumberField";
import { noop } from "src/utils";
import { newStory, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: GridTable,
  parameters: { layout: "fullscreen", backgrounds: { default: "white" } },
  decorators: [withRouter()],
} as Meta;

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndData<Data>;

export function ClientSideSorting() {
  const nameColumn: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }),
  };
  const valueColumn: GridColumn<Row> = { id: "value", header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div>, clientSideSort: false };
  return (
    <GridTable
      columns={[nameColumn, valueColumn, actionColumn]}
      sorting={{ on: "client", initial: [valueColumn.id!, "ASC"] }}
      rows={[
        simpleHeader,
        { kind: "data", id: "1", data: { name: "c", value: 1 } },
        { kind: "data", id: "2", data: { name: "B", value: 2 } },
        { kind: "data", id: "3", data: { name: "a", value: 3 } },
      ]}
    />
  );
}

export function ClientSideCsv() {
  const api = useGridTableApi<Row>();
  const columns: GridColumn<Row>[] = [
    // Given column one returns JSX, but defines a `sortValue`
    { header: "Name", data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }) },
    // And column two returns a number
    { header: "Value", data: ({ value }) => value },
    // And column three returns a string
    { header: "Value", data: ({ value }) => String(value) },
    // And column four returns JSX with nothing else
    { header: "Action", data: () => <div>Actions</div> },
  ];
  return (
    <div>
      <GridTable
        api={api}
        columns={columns}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "B", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
      />
      <Button label="Download" onClick={() => api.downloadToCsv("test.csv")} />
    </div>
  );
}

export const Hovering = newStory(
  () => {
    const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
    const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
    const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };
    const rowStyles: RowStyles<Row> = {
      data: {
        cellCss: (row) => (row.data.value === 3 ? Css.bgRed300.$ : {}),
        rowLink: () => "http://homebound.com",
      },
      header: {},
    };
    return (
      <GridTable<Row>
        columns={[nameColumn, valueColumn, actionColumn]}
        rowStyles={rowStyles}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "b", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
      />
    );
  },
  { decorators: [withRouter()] },
);

export const ActiveCell = newStory(
  () => {
    const nameColumn: GridColumn<Row> = { id: "name", header: "Name", data: ({ name }) => name };
    const valueColumn: GridColumn<Row> = { id: "value", header: "Value", data: ({ value }) => value };
    const actionColumn: GridColumn<Row> = { id: "actions", header: "Action", data: () => <div>Actions</div> };
    const rowStyles: RowStyles<Row> = useMemo(
      () => ({
        data: {
          onClick: (row, api) => {
            api.setActiveRowId(`data_${row.id}`);
          },
        },
      }),
      [],
    );
    return (
      <GridTable<Row>
        columns={[nameColumn, valueColumn, actionColumn]}
        activeCellId={"data_1_value"}
        style={{ cellHighlight: true }}
        rowStyles={rowStyles}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "b", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
      />
    );
  },
  { decorators: [withRouter()] },
);

export function VirtualFiltering() {
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      simpleHeader,
      ...zeroTo(1_000).map((i) => ({ kind: "data" as const, id: String(i), data: { name: `ccc ${i}`, value: i } })),
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
        <input type="text" value={filter || ""} onChange={(e) => setFilter(e.target.value)} css={Css.ba.bcGray900.$} />
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

export function VirtualFilteringWithFilterablePin() {
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      simpleHeader,
      { kind: "data", id: "1", data: { name: "first, filter true", value: 1 }, pin: { at: "first", filter: true } },
      { kind: "data", id: "2", data: { name: "first, filter false", value: 2 }, pin: { at: "first", filter: false } },
      { kind: "data", id: "3", data: { name: "first, no filter", value: 3 }, pin: "first" },
    ],
    [],
  );
  const columns: GridColumn<Row>[] = useMemo(
    () => [
      { header: "Pin", data: ({ name }) => name },
      { header: "Value", data: ({ value }) => value },
    ],
    [],
  );
  const [filter, setFilter] = useState<string | undefined>();
  return (
    <div css={Css.df.fdc.vh100.$}>
      <div>
        <input type="text" value={filter || ""} onChange={(e) => setFilter(e.target.value)} css={Css.ba.bcGray900.$} />
      </div>
      <div css={Css.fg1.$}>
        <GridTable
          as="virtual"
          columns={columns}
          sorting={{ on: "client" }}
          filter={filter}
          stickyHeader={true}
          rows={rows}
        />
      </div>
    </div>
  );
}

export function InfiniteScroll() {
  const loadRows = useCallback((offset: number) => {
    return zeroTo(50).map((i) => ({
      kind: "data" as const,
      id: String(i + offset),
      data: { name: `row ${i + offset}`, value: i + offset },
    }));
  }, []);

  const [data, setData] = useState<GridDataRow<Row>[]>(() => loadRows(0));
  const rows: GridDataRow<Row>[] = useMemo(() => [simpleHeader, ...data], [data]);
  const columns: GridColumn<Row>[] = useMemo(
    () => [
      { header: "Name", data: ({ name }) => name, w: "200px" },
      { header: "Value", data: ({ value }) => value },
    ],
    [],
  );
  return (
    <div css={Css.df.fdc.vh100.$}>
      <div css={Css.fg1.$}>
        <GridTable
          as="virtual"
          columns={columns}
          sorting={{ on: "client", initial: ["id", "ASC"] }}
          stickyHeader={true}
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

export function InfiniteScrollWithLoader() {
  const loadRows = useCallback((offset: number) => {
    return zeroTo(25).map((i) => ({
      kind: "data" as const,
      id: String(i + offset),
      data: { name: `row ${i + offset}`, value: i + offset },
    }));
  }, []);

  const [data, setData] = useState<GridDataRow<Row>[]>(() => loadRows(0));

  // Simulate a slower network call that doesn't finish before the user reaches the end of the list
  const fetchMoreData = useCallback(
    async (index: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setData([...data, ...loadRows(index)]);
          resolve();
        }, 1_500);
      });
    },
    [data, loadRows],
  );

  const rows: GridDataRow<Row>[] = useMemo(() => [simpleHeader, ...data], [data]);
  const columns: GridColumn<Row>[] = useMemo(
    () => [
      { header: "Name", data: ({ name }) => name, w: "200px" },
      { header: "Value", data: ({ value }) => value },
    ],
    [],
  );
  return (
    <div css={Css.df.fdc.vh100.$}>
      <div css={Css.fg1.$}>
        <GridTable
          as="virtual"
          columns={columns}
          sorting={{ on: "client", initial: ["id", "ASC"] }}
          stickyHeader={true}
          rows={rows}
          infiniteScroll={{
            onEndReached: fetchMoreData,
          }}
        />
      </div>
    </div>
  );
}

export function NoRowsFallback() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  return (
    <div css={Css.wPx(500).hPx(500).$}>
      <GridTable
        columns={[nameColumn, valueColumn]}
        as={"virtual"}
        style={{ bordered: true, allWhite: true }}
        rows={[simpleHeader]}
        fallbackMessage="There were no rows."
      />
    </div>
  );
}

// Make a `Row` ADT for a table with a header + 3 levels of nesting
type HeaderRow = { kind: "header"; data: undefined };
type ParentRow = { kind: "parent"; id: string; data: { name: string } };
type ChildRow = { kind: "child"; id: string; data: { name: string } };
type GrandChildRow = { kind: "grandChild"; id: string; data: { name: string } };
type AddRow = { kind: "add" };
type NestedRow = HeaderRow | ParentRow | ChildRow | GrandChildRow | AddRow;

const rows = makeNestedRows(1);
const rowsWithHeader: GridDataRow<NestedRow>[] = [simpleHeader, ...rows];

export function NestedRows() {
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
      columns={[collapseColumn<NestedRow>(), nameColumn]}
      {...{ rows: rowsWithHeader }}
      sorting={{ on: "client", initial: ["c1", "ASC"] }}
    />
  );
}

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
        "& > div:nth-of-type(-n+3)": Css.tinySb.$,
        "& > div:nth-of-type(n+4)": Css.xs.$,
        "& > div:nth-of-type(3n)": Css.tar.$,
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
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "a", value: 1 } },
          { kind: "data", id: "2", data: { name: "b", value: 2 } },
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
          simpleHeader,
          ...zeroTo(200).map((i) => ({
            kind: "data" as const,
            id: `${i}`,
            data: { name: `row ${i}`, value: i },
          })),
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
        simpleHeader,
        { kind: "data", id: "1", data: { name: "c", value: 1 } },
        { kind: "data", id: "2", data: { name: "b", value: 2 } },
        { kind: "data", id: "3", data: { name: "a", value: 3 } },
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
        simpleHeader,
        { kind: "data", id: "1", data: { name: "c", value: 1 } },
        { kind: "data", id: "2", data: { name: "b", value: 2 } },
        { kind: "data", id: "3", data: { name: "a", value: 3 } },
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
          headerCellCss: Css.smMd.$,
          firstCellCss: Css.pl0.$,
        }}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "b", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
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
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "b", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
      />
    </div>
  );
}, {});

export const LeveledStyleCard = newStory(() => {
  const nameColumn: GridColumn<NestedRow> = {
    header: () => "Name",
    parent: (row) => row.name,
    child: (row) => row.name,
    grandChild: (row) => row.name,
    add: () => "Add",
  };
  const valueColumn: GridColumn<NestedRow> = {
    header: () => "Value",
    parent: (row) => row.name,
    child: (row) => row.name,
    grandChild: (row) => row.name,
    add: () => "Add",
    w: "200px",
  };
  return (
    <div css={Css.wPx(550).$}>
      <GridTable
        style={cardStyle}
        columns={[collapseColumn<NestedRow>(), selectColumn<NestedRow>(), nameColumn, valueColumn]}
        rows={rowsWithHeader}
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
        simpleHeader,
        { kind: "data", id: "1", data: { name: "c", value: 1 } },
        { kind: "data", id: "2", data: { name: "b", value: 2 } },
        { kind: "data", id: "3", data: { name: "a", value: 3 } },
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
        simpleHeader,
        { kind: "data", id: "1", data: { name: "c", value: 1 } },
        { kind: "data", id: "2", data: { name: "b", value: 2 } },
        { kind: "data", id: "3", data: { name: "a", value: 3 } },
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
        simpleHeader,
        { kind: "data", id: "1", data: { name: "c", value: 1 } },
        { kind: "data", id: "2", data: { name: "b", value: 2 } },
        { kind: "data", id: "3", data: { name: "a", value: 3 } },
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
    const rowStyles: RowStyles<Row> = {
      data: { rowLink: () => "http://homebound.com" },
      header: {},
    };
    return (
      <GridTable<Row>
        as="table"
        columns={[nameColumn, valueColumn, actionColumn]}
        rowStyles={rowStyles}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "b", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
      />
    );
  },
  { decorators: [withRouter()] },
);

type Data2 = { name: string; role: string; date: string; priceInCents: number };
type Row2 = SimpleHeaderAndData<Data2>;
export const DataTypeColumns = newStory(
  () => {
    const nameCol = column<Row2>({ header: "Name", data: ({ name }) => name });
    const detailCol = column<Row2>({ header: "Details", data: ({ role }) => role });
    const dateCol = dateColumn<Row2>({ header: "Date", data: ({ date }) => date });
    const priceCol = numericColumn<Row2>({
      header: "Price",
      data: ({ priceInCents }) => <NumberField label="Price" value={priceInCents} onChange={noop} type="cents" />,
    });
    const readOnlyPriceCol = numericColumn<Row2>({
      header: "Read only Price",
      data: ({ priceInCents }) => (
        <NumberField label="Price" value={priceInCents} onChange={noop} type="cents" readOnly />
      ),
    });
    const actionCol = actionColumn<Row2>({ header: "Action", data: () => <IconButton icon="check" onClick={noop} /> });
    return (
      <GridTable<Row2>
        columns={[nameCol, detailCol, dateCol, priceCol, readOnlyPriceCol, actionCol]}
        rows={[
          simpleHeader,
          {
            kind: "data",
            id: "1",
            data: { name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 },
          },
          { kind: "data", id: "2", data: { name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 } },
          {
            kind: "data",
            id: "3",
            data: { name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 },
          },
          {
            kind: "data",
            id: "4",
            data: { name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 },
          },
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
      content: <NumberField label="Price" value={priceInCents} onChange={noop} type="cents" readOnly />,
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
        simpleHeader,
        { kind: "data", id: "1", data: { name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 } },
        { kind: "data", id: "2", data: { name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 } },
        { kind: "data", id: "3", data: { name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 } },
        {
          kind: "data",
          id: "4",
          data: { name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 },
        },
      ]}
    />
  );
}

export function WrappedCells() {
  const leftAlignedColumn = column<Row2>({
    header: "Basic field header",
    data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }),
    w: "150px",
  });
  const centerAlignedColumn = actionColumn<Row2>({
    header: "Readonly select field header",
    data: ({ role }) => (
      <SelectField label="role" value={role} onSelect={noop} options={[{ id: role, name: role }]} readOnly />
    ),
    w: "150px",
  });

  return (
    <GridTable<Row2>
      columns={[leftAlignedColumn, centerAlignedColumn]}
      sorting={{ on: "client", initial: undefined }}
      style={{ rowHeight: "flexible" }}
      rows={[
        simpleHeader,
        {
          kind: "data",
          id: "1",
          data: {
            name: "Very long long name here",
            role: "Something you can wrap",
            date: "11/29/85",
            priceInCents: 113_00,
          },
        },
        {
          kind: "data",
          id: "3",
          data: {
            name: "Another very long long name here",
            role: "A very long text herea very long text here",
            date: "11/08/18",
            priceInCents: 80_65,
          },
        },
      ]}
    />
  );
}

type DataRow = { kind: "data"; id: string; data: { name: string; role: string; date: string; priceInCents: number } };
type TotalsRow = { kind: "total"; data: { totalPriceInCents: number } };
type ColspanRow = HeaderRow | DataRow | TotalsRow;

export function ColSpan() {
  const idCol = column<ColspanRow>({
    header: "ID",
    data: (data, { row }) => row.id,
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
    data: ({ priceInCents }) => <NumberField label="Price" value={priceInCents} onChange={noop} type="cents" />,
    total: ({ totalPriceInCents }) => (
      <NumberField label="Price" readOnly value={totalPriceInCents} onChange={noop} type="cents" />
    ),
  });
  // Use a green background to show the 1st column is flush left
  return (
    <GridTable<ColspanRow>
      columns={[idCol, nameCol, detailCol, dateCol, priceCol]}
      style={{ ...condensedStyle, emptyCell: <>&mdash;</> }}
      rows={[
        simpleHeader,
        { kind: "data", id: "1", data: { name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 } },
        { kind: "data", id: "2", data: { name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 } },
        { kind: "data", id: "3", data: { name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 } },
        {
          kind: "data",
          id: "4",
          data: { name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 },
        },
        { kind: "total", id: "total", data: { totalPriceInCents: 14_083_64 } },
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
        simpleHeader,
        { kind: "data", id: "1", data: { name: "c", value: 1 } },
        { kind: "data", id: "2", data: { name: "b", value: undefined } },
        { kind: "data", id: "3", data: { name: "", value: 3 } },
      ]}
    />
  );
}

function makeNestedRows(repeat: number = 1, draggable: boolean = false): GridDataRow<NestedRow>[] {
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
        ...{ kind: "parent", id: p1, data: { name: `parent ${prefix}1` }, draggable },
        children: [
          {
            ...{ kind: "child", id: `${p1}c1`, data: { name: `child ${prefix}p1c1` }, draggable },
            children: [
              {
                kind: "grandChild",
                id: `${p1}c1g1`,
                data: { name: `grandchild ${prefix}p1c1g1` + " foo".repeat(20) },
                draggable,
              },
              { kind: "grandChild", id: `${p1}c1g2`, data: { name: `grandchild ${prefix}p1c1g2` }, draggable },
            ],
          },
          {
            ...{ kind: "child", id: `${p1}c2`, data: { name: `child ${prefix}p1c2` }, draggable },
            children: [
              { kind: "grandChild", id: `${p1}c2g1`, data: { name: `grandchild ${prefix}p1c2g1` }, draggable },
            ],
          },
          // Put this "grandchild" in the 2nd level to show heterogeneous levels
          { kind: "grandChild", id: `${p1}g1`, data: { name: `grandchild ${prefix}p1g1` }, draggable },
          // Put this "kind" into the 2nd level to show it doesn't have to be a card
          { kind: "add", id: `${p1}add`, pin: "last", data: {}, draggable },
        ],
      },
      // a parent with just a child
      {
        ...{ kind: "parent", id: p2, data: { name: `parent ${prefix}2` }, draggable },
        children: [{ kind: "child", id: `${p2}c1`, data: { name: `child ${prefix}p2c1` }, draggable }],
      },
      // a parent with no children
      { kind: "parent", id: p3, data: { name: `parent ${prefix}3` }, draggable },
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
      <h1 css={Css.lgSb.$}>First column sticky left</h1>
      <div css={Css.wPx(500).oa.$}>
        <GridTable
          columns={[{ ...nameColumn, sticky: "left" }, valueColumn, actionColumn]}
          rows={[
            simpleHeader,
            { kind: "data", id: "1", data: { name: "a", value: 1 } },
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
          ]}
        />
      </div>

      <h1 css={Css.lgSb.mt3.$}>Last column sticky right</h1>
      <div css={Css.wPx(500).oa.$}>
        <GridTable
          columns={[nameColumn, valueColumn, { ...actionColumn, sticky: "right" }]}
          rows={[
            simpleHeader,
            { kind: "data", id: "1", data: { name: "a", value: 1 } },
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
          ]}
        />
      </div>

      <h1 css={Css.lgSb.mt3.$}>Center column sticky left</h1>
      <div css={Css.wPx(500).oa.$}>
        <GridTable
          columns={[nameColumn, { ...valueColumn, sticky: "left" }, actionColumn]}
          rows={[
            simpleHeader,
            { kind: "data", id: "1", data: { name: "a", value: 1 } },
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
          ]}
        />
      </div>

      <h1 css={Css.lgSb.mt3.$}>Center column sticky right</h1>
      <div css={Css.wPx(500).oa.$}>
        <GridTable
          columns={[nameColumn, { ...valueColumn, sticky: "right" }, actionColumn]}
          rows={[
            simpleHeader,
            { kind: "data", id: "1", data: { name: "a", value: 1 } },
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
          ]}
        />
      </div>

      <h1 css={Css.lgSb.mt3.$}>Last column non-header cells sticky</h1>
      <div css={Css.wPx(500).oa.$}>
        <GridTable
          columns={[
            nameColumn,
            valueColumn,
            {
              header: "Actions (not sticky)",
              data: () => ({ content: "Actions (sticky)", sticky: "right" as const }),
              w: "200px",
            },
          ]}
          rows={[
            simpleHeader,
            { kind: "data", id: "1", data: { name: "a", value: 1 } },
            { kind: "data", id: "2", data: { name: "b", value: 2 } },
          ]}
        />
      </div>
    </div>
  );
}

type RowWithTotals = SimpleHeaderAndData<Data> | { kind: "totals"; id: "totals"; data: { value: number | undefined } };

export function StickyColumnsAndHeader() {
  const nameColumn: GridColumn<RowWithTotals> = {
    header: "Name",
    totals: "Totals",
    data: ({ name }) => name,
    w: "200px",
    sticky: "left",
  };
  const valueColumn: GridColumn<RowWithTotals> = {
    header: "Value",
    totals: ({ value }) => value,
    data: ({ value }) => value,
    w: "200px",
  };
  const actionColumn: GridColumn<RowWithTotals> = { header: "Actions", totals: "", data: "Actions", w: "200px" };
  const rows: GridDataRow<RowWithTotals>[] = useMemo(
    () => [
      { kind: "totals", id: "totals", data: { value: 100 } },
      simpleHeader,
      ...zeroTo(50).map((i) => ({ kind: "data" as const, id: String(i), data: { name: `ccc ${i}`, value: i } })),
    ],
    [],
  );
  const scrollWrap = useRef<HTMLDivElement>(null);

  // Scroll wrapping element's x & y coordinates to demonstrate proper z-indices for sticky header and columns.
  useEffect(() => {
    // GridTable's rows have their own useEffect, so use a setTimeout to
    // run after its useEffect has completed.
    setTimeout(() => {
      if (scrollWrap.current) {
        scrollWrap.current.scroll(45, 100);
      }
    }, 1);
  }, []);

  return (
    <div ref={scrollWrap} css={Css.wPx(500).hPx(500).oa.$}>
      <GridTable
        columns={[
          nameColumn,
          valueColumn,
          valueColumn,
          valueColumn,
          valueColumn,
          valueColumn,
          valueColumn,
          valueColumn,
          actionColumn,
        ]}
        rows={rows}
        stickyHeader
      />
    </div>
  );
}

export function StickyColumnsAndHeaderVirtualized() {
  const nameColumn: GridColumn<RowWithTotals> = {
    header: "Name",
    totals: "Totals",
    data: ({ name }) => name,
    w: "200px",
    sticky: "left",
  };
  const valueColumn: GridColumn<RowWithTotals> = {
    header: "Value",
    totals: ({ value }) => value,
    data: ({ value }) => value,
    w: "200px",
  };
  const actionColumn: GridColumn<RowWithTotals> = { header: "Actions", totals: "", data: "Actions", w: "200px" };
  const rows: GridDataRow<RowWithTotals>[] = useMemo(
    () => [
      { kind: "totals", id: "totals", data: { value: 100 } },
      simpleHeader,
      ...zeroTo(50).map((i) => ({ kind: "data" as const, id: String(i), data: { name: `ccc ${i}`, value: i } })),
    ],
    [],
  );

  const api = useGridTableApi<RowWithTotals>();

  // Scroll the list prior to snapshot to ensure sticky header lays on top of sticky columns.
  useEffect(() => {
    api.scrollToIndex(5);
  });

  return (
    <div css={Css.wPx(500).hPx(500).$}>
      <GridTable
        columns={[
          nameColumn,
          valueColumn,
          valueColumn,
          valueColumn,
          valueColumn,
          valueColumn,
          valueColumn,
          actionColumn,
        ]}
        rows={rows}
        stickyHeader
        as="virtual"
        api={api}
      />
    </div>
  );
}

export function ActiveRow() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name, w: "200px" };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value, w: "200px" };
  const actionColumn: GridColumn<Row> = { header: "Actions", data: "Actions", w: "200px" };
  const rowStyles: RowStyles<Row> = useMemo(
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
      simpleHeader,
      { kind: "data" as const, id: "1", data: { name: "a", value: 1 } },
      { kind: "data" as const, id: "2", data: { name: "b", value: 2 } },
      { kind: "data" as const, id: "3", data: { name: "c", value: 3 } },
    ],
    [],
  );
  // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => [nameColumn, valueColumn, actionColumn], []);
  return <GridTable columns={columns} activeRowId="data_2" rowStyles={rowStyles} rows={rows} />;
}

export function TruncatingCells() {
  const textCol: GridColumn<Row> = {
    header: "As Text",
    data: ({ name }) => ({ content: name }),
    w: "160px",
  };
  const elCol: GridColumn<Row> = {
    header: "Truncated locally",
    data: ({ name }) => ({
      content: <span css={Css.green800.xsMd.truncate.$}>{name}</span>,
    }),
    w: "160px",
  };
  const buttonCol: GridColumn<Row> = {
    header: "As Button",
    data: ({ name }) => ({ content: name, onClick: action("Name column button clicked") }),
    w: "160px",
  };
  const relativeLinkCol: GridColumn<Row> = {
    header: "As Link",
    data: ({ name }) => ({ content: <span>{name}</span>, onClick: "/relative/url" }),
    w: "160px",
  };
  const externalLinkCol: GridColumn<Row> = {
    header: "As External Link",
    data: ({ name }) => ({ content: <span>{name}</span>, onClick: "http://www.homebound.com" }),
    w: "160px",
  };

  return (
    <GridTable
      columns={[textCol, elCol, buttonCol, relativeLinkCol, externalLinkCol]}
      style={{ rowHeight: "fixed" }}
      rows={[
        simpleHeader,
        { kind: "data", id: "1", data: { name: "Tony Stark, Iron Man", value: 1 } },
        { kind: "data", id: "2", data: { name: "Natasha Romanova, Black Widow", value: 2 } },
        { kind: "data", id: "3", data: { name: "Thor Odinson, God of Thunder", value: 3 } },
      ]}
    />
  );
}

export function InteractiveCellAlignment() {
  const textCol: GridColumn<AlignmentRow> = {
    header: "As Text",
    data: ({ name, alignment }) => ({ content: name, alignment }),
    w: "160px",
  };
  const buttonCol: GridColumn<AlignmentRow> = {
    header: "As Button",
    data: ({ name, alignment }) => ({ content: name, onClick: action("Name column button clicked"), alignment }),
    w: "160px",
  };
  const relativeLinkCol: GridColumn<AlignmentRow> = {
    header: "As Link",
    data: ({ name, alignment }) => ({ content: <span>{name}</span>, onClick: "/relative/url", alignment }),
    w: "160px",
  };
  const externalLinkCol: GridColumn<AlignmentRow> = {
    header: "As External Link",
    data: ({ name, alignment }) => ({ content: <span>{name}</span>, onClick: "http://www.homebound.com", alignment }),
    w: "160px",
  };

  return (
    <GridTable
      columns={[textCol, buttonCol, relativeLinkCol, externalLinkCol]}
      style={{}}
      rows={[
        simpleHeader,
        { kind: "data", id: "1", data: { name: "Left aligned ".repeat(3), alignment: "left" as const } },
        { kind: "data", id: "2", data: { name: "Center aligned ".repeat(3), alignment: "center" as const } },
        { kind: "data", id: "3", data: { name: "Right aligned ".repeat(3), alignment: "right" as const } },
      ]}
    />
  );
}

type AlignmentData = { name: string | undefined; alignment: "left" | "right" | "center" };
type AlignmentRow = SimpleHeaderAndData<AlignmentData>;

export function PrimaryColumnSorting() {
  type FavoriteData = { name: string; value: number; favorite: boolean };
  type FavoriteRow = SimpleHeaderAndData<FavoriteData>;

  const favNameColumn: GridColumn<FavoriteRow> = { header: () => "Name", data: ({ name }) => name };
  const favValueColumn: GridColumn<FavoriteRow> = { header: () => "Value", data: ({ value }) => value };
  const favoriteColumn: GridColumn<FavoriteRow> = {
    id: "favorite",
    header: () => "Favorite",
    data: ({ favorite }) => ({
      content: <Icon icon={favorite ? "starFilled" : "star"} color={favorite ? Palette.Yellow500 : Palette.Gray900} />,
      sortValue: favorite,
    }),
    clientSideSort: false,
  };

  const [filter, setFilter] = useState<string | undefined>();
  return (
    <div>
      <div>
        <input type="text" value={filter || ""} onChange={(e) => setFilter(e.target.value)} css={Css.ba.bcGray900.$} />
      </div>
      <GridTable
        filter={filter}
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
      />
    </div>
  );
}

export function SelectableRows() {
  const api = useGridTableApi<Row>();
  const selectedIds = useComputed(() => api.getSelectedRows().map((r) => r.id), [api]);

  const selectCol = selectColumn<Row>();

  const nameCol: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => ({ content: name }),
    mw: "160px",
  };

  return (
    <>
      <GridTable
        columns={[selectCol, nameCol]}
        style={{ rowHeight: "fixed" }}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "Tony Stark", value: 1 } },
          { kind: "data", id: "2", selectable: false, data: { name: "Natasha Romanova", value: 2 } },
          { kind: "data", id: "3", data: { name: "Thor Odinson", value: 3 } },
        ]}
        api={api}
      />
      <div>
        <strong>Selected Row Ids:</strong> {selectedIds.length > 0 ? selectedIds.join(", ") : "None"}
      </div>
    </>
  );
}

export function SelectableChildrenRows() {
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

  return (
    <>
      <GridTable
        columns={[collapseColumn<Row>(), selectCol, nameCol]}
        rows={
          [
            simpleHeader,
            {
              kind: "parent",
              id: "1",
              data: "Howard Stark",
              initSelected: true,
              inferSelectedState: false,
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
              initSelected: false,
              inferSelectedState: false,
              children: [
                {
                  kind: "child" as const,
                  id: "4",
                  data: "Thor",
                  initSelected: true,
                },
              ],
            },
          ] as GridDataRow<Row>[]
        }
      />
    </>
  );
}

export function RevealOnRowHover() {
  const nameColumn: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => ({ content: name }),
  };

  const revealColumn: GridColumn<Row> = {
    header: "Reveal",
    data: ({ value }) => ({ content: <span>{value}</span>, revealOnRowHover: true }),
  };

  return (
    <>
      <GridTable
        columns={[nameColumn, revealColumn]}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "Hover over me to reveal the number!", value: 7 } },
        ]}
      />
    </>
  );
}

export function ToggleCustomCollapse() {
  const api = useGridTableApi<Row | ChildRow>();

  const collapseCol = collapseColumn<Row | ChildRow>({
    data: () => emptyCell,
  });

  const nameCol: GridColumn<Row | ChildRow> = {
    header: "Name",
    data: ({ name }, { row }) => {
      return (
        <>
          <Button label={name!} variant="text" onClick={() => api.toggleCollapsedRow(row.id)} />
          <CollapseToggle compact row={row} />
        </>
      );
    },
    child: ({ name }) => ({ content: name }),
    mw: "160px",
  };

  return (
    <>
      <GridTable
        columns={[collapseCol, nameCol]}
        style={{ rowHeight: "fixed" }}
        rows={[
          simpleHeader,
          {
            id: "p1",
            kind: "data",
            data: { name: "Parent", value: 1 },
            children: [
              {
                id: "c1",
                kind: "child",
                data: { name: "Child" },
              },
            ],
          },
        ]}
        api={api}
      />
      <div>
        <Button label={"Toggle Collpase"} variant="secondary" size="sm" onClick={() => api.toggleCollapsedRow("p1")} />
      </div>
    </>
  );
}

type ExpandHeader = { id: "expandableHeader"; kind: "expandableHeader" };
type Header = { id: "header"; kind: "header" };
type ExpandableData = {
  kind: "data";
  data: {
    firstName: string | undefined;
    lastName: string | undefined;
    birthdate: string | undefined;
    age: number | undefined;
    favoriteSports: string[] | undefined;
    occupation: string | undefined;
    manager: string | undefined;
  };
};
type ExpandableRow = ExpandHeader | Header | ExpandableData;

export function ExpandableColumns() {
  const rows: GridDataRow<ExpandableRow>[] = useMemo(
    () => [
      // New reserved 'kind' "groupHeader" property for GridTable to position row correctly
      { kind: "header", id: "header", data: {} },
      { kind: "expandableHeader", id: "expandableHeader", data: {} },
      {
        kind: "data" as const,
        id: `user:1`,
        data: {
          firstName: "Brandon",
          lastName: "Dow",
          birthdate: "Jan 29, 1986",
          age: 36,
          favoriteSports: ["Basketball", "Football"],
          occupation: "Software Engineer",
          manager: "Steve Thompson",
        },
      },
    ],
    [],
  );

  const columns: GridColumn<ExpandableRow>[] = useMemo(
    () => [
      selectColumn<ExpandableRow>({ sticky: "left" }),
      column<ExpandableRow>({
        expandableHeader: () => "Address",
        header: emptyCell,
        data: () => "123 Sesame St",
        w: "200px",
        sticky: "left",
      }),
      column<ExpandableRow>({
        expandableHeader: () => "Employee",
        header: (data, { expanded }) => (expanded ? "First Name" : emptyCell),
        data: ({ firstName, lastName }, { expanded }) => (expanded ? firstName : `${firstName} ${lastName}`),
        hideOnExpand: true,
        expandColumns: [
          column<ExpandableRow>({
            expandableHeader: emptyCell,
            header: "Last Name",
            data: ({ lastName }) => lastName,
            w: "250px",
          }),
          column<ExpandableRow>({
            expandableHeader: emptyCell,
            header: "Birthdate",
            data: ({ birthdate }) => birthdate,
            w: "150px",
          }),
          column<ExpandableRow>({
            expandableHeader: emptyCell,
            header: "Age",
            data: ({ age }) => age,
            w: "80px",
          }),
        ],
        w: "250px",
      }),
      column<ExpandableRow>({
        expandableHeader: () => "Occupation",
        header: emptyCell,
        data: ({ occupation }) => occupation,
        w: "280px",
      }),
      column<ExpandableRow>({
        expandableHeader: () => "Manager",
        header: emptyCell,
        data: ({ manager }) => manager,
        w: "280px",
      }),
      column<ExpandableRow>({
        expandableHeader: () => "Favorite Sports",
        header: emptyCell,
        data: ({ favoriteSports = [] }, { expanded }) =>
          expanded ? <Chips values={favoriteSports} /> : favoriteSports.length,
        w: "160px",
        expandedWidth: "280px",
      }),
    ],
    [],
  );
  return (
    <div css={Css.df.fdc.bgGray100.p2.h("100vh").mw("fit-content").$}>
      <GridTable stickyHeader columns={columns} rows={rows} style={{ allWhite: true }} as="div" />
    </div>
  );
}

export function ExpandableColumnsWithSetTimeout() {
  const rows: GridDataRow<ExpandableRow>[] = useMemo(
    () => [
      // New reserved 'kind' "groupHeader" property for GridTable to position row correctly
      { kind: "header", id: "header", data: {} },
      { kind: "expandableHeader", id: "expandableHeader", data: {} },
      {
        kind: "data" as const,
        id: `user:1`,
        data: {
          firstName: "Brandon",
          lastName: "Dow",
          birthdate: "Jan 29, 1986",
          age: 36,
          favoriteSports: ["Basketball", "Football"],
          occupation: "Software Engineer",
          manager: "Steve Thompson",
        },
      },
    ],
    [],
  );

  const columns: GridColumn<ExpandableRow>[] = useMemo(
    () => [
      selectColumn<ExpandableRow>({ sticky: "left" }),
      column<ExpandableRow>({
        expandableHeader: () => "Address",
        header: emptyCell,
        data: () => "123 Sesame St",
        w: "200px",
        sticky: "left",
      }),
      column<ExpandableRow>({
        expandableHeader: () => "Employee",
        header: (data, { expanded }) => (expanded ? "First Name" : emptyCell),
        data: ({ firstName, lastName }, { expanded }) => (expanded ? firstName : `${firstName} ${lastName}`),
        expandColumns: async () =>
          await new Promise((resolve) =>
            setTimeout(
              () =>
                resolve([
                  column<ExpandableRow>({
                    expandableHeader: emptyCell,
                    header: "Last Name",
                    data: ({ lastName }) => lastName,
                    w: "250px",
                  }),
                  column<ExpandableRow>({
                    expandableHeader: emptyCell,
                    header: "Birthdate",
                    data: ({ birthdate }) => birthdate,
                    w: "150px",
                  }),
                  column<ExpandableRow>({
                    expandableHeader: emptyCell,
                    header: "Age",
                    data: ({ age }) => age,
                    w: "80px",
                  }),
                ]),
              2000,
            ),
          ),
        w: "250px",
      }),

      column<ExpandableRow>({
        expandableHeader: () => "Occupation",
        header: emptyCell,
        data: ({ occupation }) => occupation,
        w: "280px",
      }),
      column<ExpandableRow>({
        expandableHeader: () => "Manager",
        header: emptyCell,
        data: ({ manager }) => manager,
        w: "280px",
      }),
      column<ExpandableRow>({
        expandableHeader: () => "Favorite Sports",
        header: emptyCell,
        data: ({ favoriteSports = [] }, { expanded }) =>
          expanded ? <Chips values={favoriteSports} /> : favoriteSports.length,
        w: "160px",
        expandedWidth: "280px",
      }),
    ],
    [],
  );
  return (
    <div css={Css.df.fdc.bgGray100.p2.h("100vh").mw("fit-content").$}>
      <GridTable stickyHeader columns={columns} rows={rows} style={{ allWhite: true }} as="div" />
    </div>
  );
}

type SimpleExpandableRow = ExpandHeader | Header | { id: string; kind: "data"; data: Data };
export function Tooltips() {
  const primitiveColumn: GridColumn<SimpleExpandableRow> = {
    expandableHeader: () => ({
      content: "Expandable header with tooltip",
      tooltip: "Tooltip Text for Expandable Header",
    }),
    header: () => ({
      content: "Primitive value - SortHeader with Tooltip",
      tooltip: "This column demonstrates a tooltip on a cell that renders a primitive value (like a string)",
    }),
    data: ({ name, value }, { expanded }) => ({
      content: expanded ? `Expanded - ${name}` : name,
      tooltip: "Tooltip text for a primitive value",
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "300px",
    expandedWidth: "600px",
  };
  const withMarkupColumn: GridColumn<SimpleExpandableRow> = {
    expandableHeader: () => ({
      content: "Nothing to expand",
      tooltip: "This demonstrates a tooltip on an expandable header cell that is not expandable",
    }),
    header: () => ({
      content: () => <div>Cell with markup</div>,
      tooltip: "This column demonstrates a tooltip on a cell that renders markup",
    }),
    data: ({ name, value }) => ({
      content: () => <div>{name}</div>,
      tooltip: "Cell tooltip for a value wrapped in markup",
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    clientSideSort: false,
    w: "220px",
  };
  const buttonColumn: GridColumn<SimpleExpandableRow> = {
    expandableHeader: emptyCell,
    header: () => ({
      content: "As button",
      tooltip: "This column demonstrates a tooltip on a cell that renders a button element",
    }),
    data: ({ value }) => ({
      content: "Trigger console log" + value,
      onClick: () => console.log("clicked!"),
      tooltip: "Cell tooltip for a button cell",
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "200px",
  };
  const linkColumn: GridColumn<SimpleExpandableRow> = {
    expandableHeader: emptyCell,
    header: () => ({
      content: "As link",
      tooltip: "This column demonstrates a tooltip on a cell that renders a Link component",
    }),
    data: ({ value }) => ({
      content: "Relative link: /",
      onClick: "/",
      tooltip: "Cell tooltip for a relative link / React Router Link component",
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "200px",
  };
  const externalLinkColumn: GridColumn<SimpleExpandableRow> = {
    expandableHeader: emptyCell,
    header: () => ({
      content: "As External link",
      tooltip: "This column demonstrates a tooltip on a cell that renders an anchor element",
    }),
    data: ({ value }) => ({
      content: "homebound.com",
      onClick: "https://www.homebound.com",
      tooltip: "Cell tooltip for an external link",
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "200px",
  };
  const truncatedColumn: GridColumn<SimpleExpandableRow> = {
    expandableHeader: emptyCell,
    header: () => ({
      content: "Truncated cells",
      tooltip: "This column demonstrates a tooltip on a cell where the text should truncate",
    }),
    data: ({ name, value }) => ({
      content: name!.repeat(2),
      tooltip: "Tooltip for a truncated cell",
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "200px",
    clientSideSort: false,
  };

  const primitiveColumnWoTt: GridColumn<SimpleExpandableRow> = {
    expandableHeader: "Expandable header with tooltip",
    header: "Primitive value - SortHeader with Tooltip",
    data: ({ name, value }, { expanded }) => ({
      content: expanded ? `Expanded - ${name}` : name,
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "300px",
    expandedWidth: "600px",
  };
  const withMarkupColumnWoTt: GridColumn<SimpleExpandableRow> = {
    expandableHeader: "Nothing to expand",
    header: () => <div>Cell with markup</div>,
    data: ({ name, value }) => ({
      content: () => <div>{name}</div>,
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    clientSideSort: false,
    w: "220px",
  };
  const buttonColumnWoTt: GridColumn<SimpleExpandableRow> = {
    expandableHeader: emptyCell,
    header: "As button",
    data: ({ value }) => ({
      content: "Trigger console log" + value,
      onClick: () => console.log("clicked!"),
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "200px",
  };
  const linkColumnWoTt: GridColumn<SimpleExpandableRow> = {
    expandableHeader: emptyCell,
    header: "As link",
    data: ({ value }) => ({
      content: "Relative link: /",
      onClick: "/",
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "200px",
  };
  const externalLinkColumnWoTt: GridColumn<SimpleExpandableRow> = {
    expandableHeader: emptyCell,
    header: "As External link",
    data: ({ value }) => ({
      content: "homebound.com",
      onClick: "https://www.homebound.com",
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "200px",
  };
  const truncatedColumnWoTt: GridColumn<SimpleExpandableRow> = {
    expandableHeader: emptyCell,
    header: "Truncated cells",
    data: ({ name, value }) => ({
      content: name!.repeat(2),
      alignment: value === 1 ? "left" : value === 2 ? "center" : "right",
    }),
    w: "200px",
    clientSideSort: false,
  };

  return (
    <div css={Css.bgGray100.p2.$}>
      <h1 css={Css.xlMd.$}>Fixed Row Height</h1>
      <GridTable
        style={{ allWhite: true, rowHeight: "fixed" }}
        columns={[primitiveColumn, withMarkupColumn, buttonColumn, linkColumn, externalLinkColumn, truncatedColumn]}
        sorting={{ on: "client", initial: [buttonColumn.id!, "ASC"] }}
        rows={[
          { kind: "header", id: "header", data: {} },
          { kind: "expandableHeader", id: "expandableHeader", data: {} },
          { kind: "data", id: "1", data: { name: "Tony Stark, Iron Man", value: 1 } },
          { kind: "data", id: "2", data: { name: "Natasha Romanova, Black Widow", value: 2 } },
          { kind: "data", id: "3", data: { name: "Thor Odinson, God of Thunder", value: 3 } },
        ]}
      />
      <h1 css={Css.xlMd.mt4.$}>Flexible Row Height</h1>
      <GridTable
        style={{ allWhite: true }}
        columns={[primitiveColumn, withMarkupColumn, buttonColumn, linkColumn, externalLinkColumn, truncatedColumn]}
        sorting={{ on: "client", initial: [buttonColumn.id!, "ASC"] }}
        rows={[
          { kind: "header", id: "header", data: {} },
          { kind: "expandableHeader", id: "expandableHeader", data: {} },
          { kind: "data", id: "1", data: { name: "Tony Stark, Iron Man", value: 1 } },
          { kind: "data", id: "2", data: { name: "Natasha Romanova, Black Widow", value: 2 } },
          { kind: "data", id: "3", data: { name: "Thor Odinson, God of Thunder", value: 3 } },
        ]}
      />
      <h1 css={Css.xlMd.mt4.$}>
        Without Tooltips - <span css={Css.base.$}>For visual comparison</span>
      </h1>
      <GridTable
        style={{ allWhite: true }}
        columns={[
          primitiveColumnWoTt,
          withMarkupColumnWoTt,
          buttonColumnWoTt,
          linkColumnWoTt,
          externalLinkColumnWoTt,
          truncatedColumnWoTt,
        ]}
        sorting={{ on: "client", initial: [buttonColumn.id!, "ASC"] }}
        rows={[
          { kind: "header", id: "header", data: {} },
          { kind: "expandableHeader", id: "expandableHeader", data: {} },
          { kind: "data", id: "1", data: { name: "Tony Stark, Iron Man", value: 1 } },
          { kind: "data", id: "2", data: { name: "Natasha Romanova, Black Widow", value: 2 } },
          { kind: "data", id: "3", data: { name: "Thor Odinson, God of Thunder", value: 3 } },
        ]}
      />
    </div>
  );
}

export function Headers() {
  function makeColumn(
    header: string | (() => JSX.Element),
    clientSideSort: boolean = true,
    align: GridCellAlignment = "left",
  ) {
    return column<Row>({ header, data: ({ value }) => value, w: "172px", clientSideSort, align });
  }
  const columns = [
    makeColumn("Sortable"),
    makeColumn("Sortable With multiple lines of text. ".repeat(2)),
    makeColumn("Sortable aligned right", true, "right"),
    makeColumn("Sortable aligned right With multiple lines of text. ".repeat(2), true, "right"),
    makeColumn("Not Sortable", false),
    makeColumn("Not Sortable with multiple lines of text. ".repeat(2), false),
    makeColumn(() => <span>With Markup</span>),
    makeColumn(() => (
      <span css={Css.lineClamp2.$}>{`With Markup and multiple lines of that will also truncate`.repeat(2)}</span>
    )),
  ];
  return (
    <div css={Css.p2.$}>
      <h1 css={Css.xlMd.$}>Default Style</h1>
      <GridTable
        columns={columns}
        style={{}}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "B", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
        sorting={{ on: "client" }}
      />
      <h1 css={Css.xlMd.mt4.$}>
        <pre>rowHeight: fixed</pre>
      </h1>
      <GridTable
        columns={columns}
        style={{ rowHeight: "fixed" }}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "B", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
        sorting={{ on: "client" }}
      />
    </div>
  );
}

/**
 * Shows how drag & drop reordering can be implemented with GridTable drag events
 */
export function DraggableRows() {
  const dragColumn = dragHandleColumn<Row>({});
  const nameColumn: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }),
  };

  const actionColumn: GridColumn<Row> = {
    header: "Action",
    data: () => <div>Actions</div>,
    clientSideSort: false,
  };

  let rowArray: GridDataRow<Row>[] = new Array(26).fill(0);
  rowArray = rowArray.map((elem, idx) => ({
    kind: "data",
    id: "" + (idx + 1),
    order: idx + 1,
    data: { name: "" + (idx + 1), value: idx + 1 },
    draggable: true,
  }));

  const [rows, setRows] = useState<GridDataRow<Row>[]>([simpleHeader, ...rowArray]);

  // also works with as="table" and as="virtual"
  return (
    <GridTable
      columns={[dragColumn, nameColumn, actionColumn]}
      onRowDrop={(draggedRow, droppedRow, indexOffset) => {
        const tempRows = [...rows];
        // remove dragged row
        const draggedRowIndex = tempRows.findIndex((r) => r.id === draggedRow.id);
        const reorderRow = tempRows.splice(draggedRowIndex, 1)[0];

        const droppedRowIndex = tempRows.findIndex((r) => r.id === droppedRow.id);

        // insert it at the dropped row index
        setRows([...insertAtIndex(tempRows, reorderRow, droppedRowIndex + indexOffset)]);
      }}
      rows={[...rows]}
    />
  );
}

export const DraggableWithInputColumns = newStory(
  () => {
    const dragColumn = dragHandleColumn<Row2>({});
    const nameCol = column<Row2>({ header: "Name", data: ({ name }) => name });
    const priceCol = numericColumn<Row2>({
      header: "Price",
      data: ({ priceInCents }) => <NumberField label="Price" value={priceInCents} onChange={noop} type="cents" />,
    });
    const actionCol = actionColumn<Row2>({ header: "Action", data: () => <IconButton icon="check" onClick={noop} /> });

    const [rows, setRows] = useState<GridDataRow<Row2>[]>([
      simpleHeader,
      {
        kind: "data",
        id: "1",
        data: { name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 },
        draggable: true,
      },
      {
        kind: "data",
        id: "2",
        data: { name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 },
        draggable: true,
      },
      {
        kind: "data",
        id: "3",
        data: { name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 },
        draggable: true,
      },
      {
        kind: "data",
        id: "4",
        data: { name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 },
        draggable: true,
      },
    ]);

    return (
      <GridTable<Row2>
        columns={[dragColumn, nameCol, priceCol, actionCol]}
        rows={rows}
        onRowDrop={(draggedRow, droppedRow, indexOffset) => {
          const tempRows = [...rows];
          // remove dragged row
          const draggedRowIndex = tempRows.findIndex((r) => r.id === draggedRow.id);
          const reorderRow = tempRows.splice(draggedRowIndex, 1)[0];

          const droppedRowIndex = tempRows.findIndex((r) => r.id === droppedRow.id);

          // insert it at the dropped row index
          setRows([...insertAtIndex(tempRows, reorderRow, droppedRowIndex + indexOffset)]);
        }}
      />
    );
  },
  { decorators: [withRouter()] },
);

const draggableRows = makeNestedRows(1, true);
const draggableRowsWithHeader: GridDataRow<NestedRow>[] = [simpleHeader, ...draggableRows];
export function DraggableNestedRows() {
  const dragColumn = dragHandleColumn<NestedRow>({});
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

  const [rows, setRows] = useState<GridDataRow<NestedRow>[]>(draggableRowsWithHeader);

  return (
    <GridTable
      columns={[dragColumn, collapseColumn<NestedRow>(), nameColumn]}
      rows={rows}
      sorting={{ on: "client", initial: ["c1", "ASC"] }}
      onRowDrop={(draggedRow, droppedRow, indexOffset) => {
        const tempRows = [...rows];
        const foundRowContainer = recursivelyGetContainingRow(draggedRow.id, tempRows)!;
        if (!foundRowContainer) {
          console.error("Could not find row array for row", draggedRow);
          return;
        }
        if (!foundRowContainer.array.some((row) => row.id === droppedRow.id)) {
          console.error("Could not find dropped row in row array", droppedRow);
          return;
        }
        // remove dragged row
        const draggedRowIndex = foundRowContainer.array.findIndex((r) => r.id === draggedRow.id);
        const reorderRow = foundRowContainer.array.splice(draggedRowIndex, 1)[0];

        const droppedRowIndex = foundRowContainer.array.findIndex((r) => r.id === droppedRow.id);

        // we also need the parent row so we can set the newly inserted array
        if (foundRowContainer.parent && foundRowContainer.parent?.children) {
          foundRowContainer.parent.children = [
            ...insertAtIndex(foundRowContainer.parent?.children, reorderRow, droppedRowIndex + indexOffset),
          ];
          setRows([...tempRows]);
        } else {
          setRows([...insertAtIndex(tempRows, reorderRow, droppedRowIndex + indexOffset)]);
        }
      }}
    />
  );
}

export function DraggableCardRows() {
  const dragColumn = dragHandleColumn<Row>({});
  const nameColumn: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => ({ content: <div>{name}</div>, sortValue: name }),
  };

  const actionColumn: GridColumn<Row> = {
    header: "Action",
    data: () => <div>Actions</div>,
    clientSideSort: false,
  };

  let rowArray: GridDataRow<Row>[] = new Array(26).fill(0);
  rowArray = rowArray.map((elem, idx) => ({
    kind: "data",
    id: "" + (idx + 1),
    order: idx + 1,
    data: { name: "" + (idx + 1), value: idx + 1 },
    draggable: true,
  }));

  const [rows, setRows] = useState<GridDataRow<Row>[]>([simpleHeader, ...rowArray]);

  // also works with as="table" and as="virtual"
  return (
    <GridTable
      columns={[dragColumn, nameColumn, actionColumn]}
      onRowDrop={(draggedRow, droppedRow, indexOffset) => {
        const tempRows = [...rows];
        // remove dragged row
        const draggedRowIndex = tempRows.findIndex((r) => r.id === draggedRow.id);
        const reorderRow = tempRows.splice(draggedRowIndex, 1)[0];

        const droppedRowIndex = tempRows.findIndex((r) => r.id === droppedRow.id);

        // insert it at the dropped row index
        setRows([...insertAtIndex(tempRows, reorderRow, droppedRowIndex + indexOffset)]);
      }}
      rows={[...rows]}
      style={cardStyle}
    />
  );
}

export function MinColumnWidths() {
  const nameColumn: GridColumn<Row> = {
    header: "Name",
    data: ({ name }) => ({
      content: name === "group" ? "Col-spans across all!" : `Width: 2fr; Min-width: 300px`,
      colspan: name === "group" ? 3 : 1,
    }),
    w: 2,
    mw: "300px",
  };
  const valueColumn: GridColumn<Row> = {
    id: "value",
    header: "Value",
    data: ({ value }) => `Width: 1fr; Min-width: 200px`,
    w: 1,
    mw: "200px",
  };
  const actionColumn: GridColumn<Row> = {
    header: "Action",
    data: () => `Width: 1fr; Min-width: 150px`,
    w: 1,
    mw: "150px",
  };
  return (
    <div css={Css.mx2.$}>
      <GridTable
        columns={[nameColumn, valueColumn, actionColumn]}
        style={{ bordered: true, allWhite: true }}
        rows={[
          simpleHeader,
          { kind: "data", id: "group", data: { name: "group", value: 0 } },
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "B", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
      />
    </div>
  );
}

enum EditableRowStatus {
  Foo = "Foo",
  Bar = "Bar",
}

type EditableRowData = {
  kind: "data";
  id: string;
  data: { id: string; name: string; status: EditableRowStatus; value: number; date?: Date };
};
type EditableRow = EditableRowData | HeaderRow;

export function HighlightFields() {
  const [rows, setRows] = useState<GridDataRow<EditableRow>[]>([
    simpleHeader,
    {
      kind: "data" as const,
      id: "1",
      data: { id: "1", name: "Tony Stark", status: EditableRowStatus.Foo, value: 1, date: jan1 },
    },
    {
      kind: "data" as const,
      id: "2",
      data: { id: "2", name: "Natasha Romanova", status: EditableRowStatus.Foo, value: 2, date: jan2 },
    },
    {
      kind: "data" as const,
      id: "3",
      data: { id: "3", name: "Thor Odinson", status: EditableRowStatus.Bar, value: 3, date: jan29 },
    },
  ]);

  const setRow = useCallback((rowId: string, field: keyof EditableRowData["data"], value: any) => {
    setRows((rows) =>
      rows.map((row) =>
        row.kind === "data" && row.id === rowId ? { ...row, data: { ...row.data, [field]: value } } : row,
      ),
    );
  }, []);

  const nameColumn: GridColumn<EditableRow> = {
    header: "Name",
    data: ({ name }) => name,
  };

  const selectColumn: GridColumn<EditableRow> = {
    header: "Status",
    data: (row) => ({
      content: (
        <SelectField
          label=""
          options={Object.values(EditableRowStatus).map((status) => ({ label: status, code: status }))}
          value={row.status}
          onSelect={(status) => setRow(row.id, "status", status)}
        />
      ),
    }),
    w: "120px",
  };

  const date1Column: GridColumn<EditableRow> = {
    header: "Date",
    data: (row) => ({
      content: (
        <DateField
          label=""
          value={row.date}
          onChange={(date) => setRow(row.id, "date", date)}
          hideCalendarIcon
          format="medium"
        />
      ),
    }),
    w: "120px",
  };

  const date2Column: GridColumn<EditableRow> = {
    header: "Date",
    data: (row) => ({
      content: (
        <DateField
          label=""
          value={row.date}
          onChange={(date) => setRow(row.id, "date", date)}
          hideCalendarIcon
          format="medium"
        />
      ),
    }),
    w: "120px",
  };

  const style = getTableStyles({ bordered: true, allWhite: true, highlightOnHover: true });

  return (
    <div css={Css.m2.$}>
      <GridTable
        columns={[nameColumn, selectColumn, date1Column, date2Column]}
        rows={rows}
        style={{
          ...style,
          rowHoverColor: Palette.Blue50,
        }}
      />
    </div>
  );
}
