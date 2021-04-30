import { Meta } from "@storybook/react";
import { observable } from "mobx";
import { useContext, useMemo, useState } from "react";
import {
  condensedStyle,
  GridCollapseContext,
  GridColumn,
  GridDataRow,
  GridRowStyles,
  GridTable,
  observableColumns,
  SimpleHeaderAndDataOf,
} from "src/components/index";
import { Css } from "src/Css";
import { newStory, withRouter } from "src/utils/sb";

export default {
  component: GridTable,
  title: "Components/GridTable",
} as Meta;

type Data = { name: string; value: number };
type Row = SimpleHeaderAndDataOf<Data>;

// Test case
// Potential algorithm: see k1, scan until the next k1
// h1
// k1 (division)
//   k2 (sub)
//     k3
//     k3
//   k2 (sub)
//     k3
//     k3
//   k4 (division-total)
// k1 (division)
//   k4 (division-total)
// f1 (total-total)

export function Sorting() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div>, sort: false };
  return (
    <GridTable
      columns={[nameColumn, valueColumn, actionColumn]}
      sorting={"client-side"}
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
      data: { rowLink: () => "http://homebound.com" },
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

export function Filtering() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div>, sort: false };
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      { kind: "header", id: "header" },
      { kind: "data", id: "1", name: "c", value: 1 },
      { kind: "data", id: "2", name: "b", value: 2 },
      { kind: "data", id: "3", name: "a", value: 3 },
    ],
    [],
  );
  const [filter, setFilter] = useState<string | undefined>();
  return (
    <div>
      <input type="text" value={filter || ""} onChange={(e) => setFilter(e.target.value)} css={Css.ba.bGray900.br8.$} />
      <GridTable
        columns={[nameColumn, valueColumn, actionColumn]}
        sorting={"client-side"}
        filter={filter}
        rows={rows}
      />
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
type NestedRow = HeaderRow | ParentRow | ChildRow | GrandChildRow;

const rows: GridDataRow<NestedRow>[] = [
  { kind: "header", id: "header" },
  // a parent w/ two children, 1st child has 2 grandchild, 2nd child has 1 grandchild
  { kind: "parent", id: "p1", name: "parent 1" },
  { kind: "child", id: "p1c1", parentIds: ["p1"], name: "child p1c1" },
  { kind: "grandChild", id: "p1c1g1", parentIds: ["p1", "p1c1"], name: "grandchild p1c1g1" },
  { kind: "grandChild", id: "p1c1g2", parentIds: ["p1", "p1c1"], name: "grandchild p1c1g2" },
  { kind: "child", id: "p1c2", parentIds: ["p1"], name: "child p1c2" },
  { kind: "grandChild", id: "p1c2g1", parentIds: ["p1", "p1c2"], name: "grandchild p1c2g1" },

  // a parent with just a child
  { kind: "parent", id: "p2", name: "parent 2" },
  { kind: "child", id: "p2c1", parentIds: ["p2"], name: "child p2c1" },

  // a parent with no children
  { kind: "parent", id: "p3", name: "parent 3" },
];

export function Collapsing() {
  const arrowColumn: GridColumn<NestedRow> = {
    header: () => <Collapse />,
    parent: () => <Collapse />,
    child: () => <Collapse />,
    grandChild: () => "",
    w: 0,
  };
  const nameColumn: GridColumn<NestedRow> = {
    header: () => "Name",
    parent: (row) => <div>{row.name}</div>,
    child: (row) => <div css={Css.ml2.$}>{row.name}</div>,
    grandChild: (row) => <div css={Css.ml4.$}>{row.name}</div>,
  };
  return <GridTable columns={[arrowColumn, nameColumn]} {...{ rows }} />;
}

function Collapse() {
  const { isCollapsed, toggleCollapse } = useContext(GridCollapseContext);
  const icon = isCollapsed ? "+" : "-";
  return (
    <div css={Css.cursorPointer.$} onClick={toggleCollapse}>
      {icon}
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
      <button onClick={() => (o.a = o.a + 1)} css={Css.ba.bGray900.br1.px1.bgGray100.$}>
        +
      </button>
      <GridTable
        columns={observableColumns([nameColumn])}
        rows={[
          { kind: "header", id: "header" },
          { kind: "data", id: "1", name: "b", value: 1 },
          { kind: "data", id: "2", name: "c", value: 2 },
        ]}
      />
    </div>
  );
}

export const Condensed = newStory(() => {
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
      data: { indent: "2", rowLink: () => "http://homebound.com" },
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
