import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { observable } from "mobx";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
  emptyCell,
  GridColumn,
  GridDataRow,
  GridRowLookup,
  GridTable,
  Icon,
  IconButton,
  numericColumn,
  RowStyles,
  selectColumn,
  simpleHeader,
  SimpleHeaderAndData,
  useGridTableApi,
} from "src/components/index";
import { Css, Palette } from "src/Css";
import { useComputed } from "src/hooks";
import { NumberField } from "src/inputs/NumberField";
import { noop } from "src/utils";
import { newStory, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: GridTable,
  title: "Workspace/Components/GridTable",
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
        <input type="text" value={filter || ""} onChange={(e) => setFilter(e.target.value)} css={Css.ba.bGray900.$} />
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

export function NoRowsFallback() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  return <GridTable columns={[nameColumn, valueColumn]} rows={[simpleHeader]} fallbackMessage="There were no rows." />;
}

// Make a `Row` ADT for a table with a header + 3 levels of nesting
type HeaderRow = { kind: "header"; data: {} };
type ParentRow = { kind: "parent"; id: string; data: { name: string } };
type ChildRow = { kind: "child"; id: string; data: { name: string } };
type GrandChildRow = { kind: "grandChild"; id: string; data: { name: string } };
type AddRow = { kind: "add" };
type NestedRow = HeaderRow | ParentRow | ChildRow | GrandChildRow | AddRow;

const rows = makeNestedRows(1);
const rowsWithHeader: GridDataRow<NestedRow>[] = [simpleHeader, ...rows];

export function NestedRows() {
  const arrowColumn = actionColumn<NestedRow>({
    header: (data, { row }) => <CollapseToggle row={row} />,
    parent: (data, { row }) => <CollapseToggle row={row} />,
    child: (data, { row }) => <CollapseToggle row={row} />,
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
          ...zeroTo(200).map((i) => ({ kind: "data" as const, id: `${i}`, data: { name: `row ${i}`, value: i } })),
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
      data: { indent: 2, rowLink: () => "http://homebound.com" },
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
        simpleHeader,
        { kind: "data", id: "1", data: { name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 } },
        { kind: "data", id: "2", data: { name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 } },
        { kind: "data", id: "3", data: { name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 } },
        { kind: "data", id: "4", data: { name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 } },
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
        { kind: "data", id: "1", data: { name: "Foo", role: "Manager", date: "11/29/85", priceInCents: 113_00 } },
        { kind: "data", id: "2", data: { name: "Bar", role: "VP", date: "01/29/86", priceInCents: 1_524_99 } },
        { kind: "data", id: "3", data: { name: "Biz", role: "Engineer", date: "11/08/18", priceInCents: 80_65 } },
        { kind: "data", id: "4", data: { name: "Baz", role: "Contractor", date: "04/21/21", priceInCents: 12_365_00 } },
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
        ...{ kind: "parent", id: p1, data: { name: `parent ${prefix}1` } },
        children: [
          {
            ...{ kind: "child", id: `${p1}c1`, data: { name: `child ${prefix}p1c1` } },
            children: [
              { kind: "grandChild", id: `${p1}c1g1`, data: { name: `grandchild ${prefix}p1c1g1` + " foo".repeat(20) } },
              { kind: "grandChild", id: `${p1}c1g2`, data: { name: `grandchild ${prefix}p1c1g2` } },
            ],
          },
          {
            ...{ kind: "child", id: `${p1}c2`, data: { name: `child ${prefix}p1c2` } },
            children: [{ kind: "grandChild", id: `${p1}c2g1`, data: { name: `grandchild ${prefix}p1c2g1` } }],
          },
          // Put this "grandchild" in the 2nd level to show heterogeneous levels
          { kind: "grandChild", id: `${p1}g1`, data: { name: `grandchild ${prefix}p1g1` } },
          // Put this "kind" into the 2nd level to show it doesn't have to be a card
          { kind: "add", id: `${p1}add`, pin: "last", data: {} },
        ],
      },
      // a parent with just a child
      {
        ...{ kind: "parent", id: p2, data: { name: `parent ${prefix}2` } },
        children: [{ kind: "child", id: `${p2}c1`, data: { name: `child ${prefix}p2c1` } }],
      },
      // a parent with no children
      { kind: "parent", id: p3, data: { name: `parent ${prefix}3` } },
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
      <div css={Css.wPx(500).overflowAuto.$}>
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
      <div css={Css.wPx(500).overflowAuto.$}>
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
      <div css={Css.wPx(500).overflowAuto.$}>
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
      <div css={Css.wPx(500).overflowAuto.$}>
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
    if (scrollWrap.current) {
      scrollWrap.current.scroll(45, 100);
    }
  }, []);

  return (
    <div ref={scrollWrap} css={Css.wPx(500).hPx(500).overflowAuto.$}>
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [filter, setFilter] = useState<string | undefined>();
  return (
    <div>
      <div>
        <input type="text" value={filter || ""} onChange={(e) => setFilter(e.target.value)} css={Css.ba.bGray900.$} />
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

export function ToggleCustomCollapseLabeled() {
  const collapseCol = collapseColumn<Row | ChildRow>({
    data: () => emptyCell,
  });

  const nameCol: GridColumn<Row | ChildRow> = {
    header: "Name",
    data: ({ name }, { row }) => <CollapseToggle label={name} compact row={row} />,
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
      />
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
