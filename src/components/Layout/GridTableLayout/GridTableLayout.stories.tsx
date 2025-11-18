import { Meta } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";
import { checkboxFilter, multiFilter } from "src/components/Filters";
import { GridDataRow } from "src/components/Table";
import { collapseColumn, column, numericColumn, selectColumn } from "src/components/Table/utils/columns";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { noop } from "src/utils";
import { withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TestProjectLayout } from "../Layout.stories";
import { GridTableLayout as GridTableLayoutComponent, useGridTableLayoutState } from "./GridTableLayout";

export default {
  component: GridTableLayoutComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

type Data = { name: string | undefined; value: number | undefined; status: string; priority: number };
type HeaderRow = { kind: "header"; id: string; data: undefined };
type ParentRow = { kind: "parent"; id: string; data: Data; children: GridDataRow<Row>[] };
type DataRow = { kind: "data"; id: string; data: Data };
type Row = HeaderRow | ParentRow | DataRow;

export function GridTableLayout() {
  const filterDefs = useMemo(() => getFilterDefs(), []);
  const columns = useMemo(() => getColumns(), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout",
    },
    search: "client",
  });

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Grid Table Layout Example"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Sub Page" },
        ]}
        layoutState={layoutState}
        tableProps={{
          columns: [collapseColumn<Row>(), selectColumn<Row>(), ...columns],
          rows: [simpleHeader, ...makeNestedRows(3)],
          sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
        }}
        primaryAction={{ label: "Primary Action", onClick: noop }}
        secondaryAction={{ label: "Secondary Action", onClick: noop }}
        tertiaryAction={{ label: "Tertiary Action", onClick: noop }}
      />
    </TestProjectLayout>
  );
}

export function QueryTableLayout() {
  const filterDefs = useMemo(() => getFilterDefs(), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout",
    },
    search: "server",
  });

  // In this example, we set up a server-side search that uses the `searchString` from the layout state.
  // in combination with the "QueryTable" behavior for loading/error states.
  const query = useExampleQuery({ filter: { ...layoutState.filter, search: layoutState.searchString } });
  const columns = useMemo(() => getColumns(), []);

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Query Table Layout Example"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Sub Page" },
        ]}
        layoutState={layoutState}
        tableProps={{
          columns: [collapseColumn<Row>(), selectColumn<Row>(), ...columns],
          query,
          createRows: (data) => [
            simpleHeader,
            ...(data?.map((row) => ({ kind: "data" as const, id: row.id, data: row })) ?? []),
          ],
          sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
        }}
        primaryAction={{ label: "Primary Action", onClick: noop }}
      />
    </TestProjectLayout>
  );
}

export function GridTableLayoutWithSessionStorage() {
  const filterDefs = useMemo(() => getFilterDefs(), []);
  const columns = useMemo(() => getColumns(), []);
  const storageKey = "with-session-storage-test";

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey,
    },
    search: "client",
  });

  // Pre-populate sessionStorage with column widths to simulate a returning user
  // This runs once on mount to set up the test scenario
  useEffect(() => {
    const columnWidthsKey = `columnWidths_${storageKey}`;
    const existingData = sessionStorage.getItem(columnWidthsKey);

    // Only set if not already present (to avoid overwriting during hot reload)
    if (!existingData) {
      const presetColumnWidths = {
        "name-col": 300, // Name column resized to 300px
        "value-col": 150, // Value column resized to 150px
        "status-col": 120, // Status column resized to 120px
        "priority-col": 120, // Priority column resized to 120px
        "action-col": 100, // Action column at 100px
      };
      sessionStorage.setItem(columnWidthsKey, JSON.stringify(presetColumnWidths));
    }
  }, [storageKey]);

  return (
    <TestProjectLayout>
      <div css={Css.p2.ba.bcGray300.mb2.bgGray100.$}>
        <h3 css={Css.mb1.sm.$}>Test Scenario: Pre-populated SessionStorage</h3>
        <p css={Css.xs.gray700.mb1.$}>
          This table has pre-existing column widths in sessionStorage (Name: 300px, Value: 150px, Status: 120px,
          Priority: 120px, Action: 100px).
        </p>
        <p css={Css.xs.gray700.mb1.$}>
          <strong>Expected behavior:</strong> When you resize any column, all columns should lock to their current pixel
          widths to prevent fr units from shifting. This should work correctly even though sessionStorage already
          contains column widths from a "previous session".
        </p>
        <p css={Css.xs.gray700.$}>
          <strong>Test:</strong> Try resizing the Name column. Other columns should not shift unexpectedly. The resize
          should behave consistently whether it's your first resize or subsequent resizes.
        </p>
      </div>
      <GridTableLayoutComponent
        pageTitle="Grid Table Layout with SessionStorage"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Sub Page" },
        ]}
        layoutState={layoutState}
        tableProps={{
          columns: [collapseColumn<Row>(), selectColumn<Row>(), ...columns],
          rows: [simpleHeader, ...makeNestedRows(3)],
          sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
          visibleColumnsStorageKey: storageKey,
        }}
        primaryAction={{ label: "Primary Action", onClick: noop }}
        secondaryAction={{ label: "Secondary Action", onClick: noop }}
        tertiaryAction={{ label: "Tertiary Action", onClick: noop }}
      />
    </TestProjectLayout>
  );
}

function useExampleQuery({ filter }: { filter: Record<string, unknown> }) {
  const filterString = JSON.stringify(filter);

  const [loading, setLoading] = useState(true);
  const [data, setData] =
    useState<Array<{ id: string; name: string; value: number; status: string; priority: number }>>();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setData([
        { id: "1", name: "a", value: 1, status: "active", priority: 1 },
        { id: "2", name: "b", value: 2, status: "inactive", priority: 2 },
        { id: "3", name: "c", value: 3, status: "active", priority: 3 },
      ]);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filterString]);

  return {
    data,
    loading,
  };
}

function getFilterDefs() {
  return {
    primary: multiFilter({
      options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
      ],
      getOptionLabel: (tp) => tp.label,
      getOptionValue: (tp) => tp.value,
      label: "Preference",
    }),
    status: multiFilter({
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      getOptionLabel: (cs) => cs.label,
      getOptionValue: (cs) => cs.value,
      label: "Status",
    }),
    needsRevision: checkboxFilter({
      label: "Needs Revision",
    }),
  };
}

function getColumns() {
  const nameColumn = column<Row>({
    header: () => "Name",
    parent: (row) => ({ content: row.name, value: row.name }),
    data: (row) => row.name,
    mw: "200px",
  });
  const valueColumn = numericColumn<Row>({
    header: () => "Value",
    parent: (row) => ({ content: row.value, value: row.value }),
    data: (row) => row.value,
    mw: "100px",
  });
  const statusColumn = column<Row>({
    header: () => "Status",
    parent: (row) => ({ content: row.status, value: row.status }),
    data: (row) => row.status,
    mw: "100px",
  });
  const priorityColumn = numericColumn<Row>({
    header: () => "Priority",
    parent: (row) => ({ content: row.priority, value: row.priority }),
    data: (row) => row.priority,
    mw: "100px",
  });
  const actionColumn = column<Row>({
    header: () => "Action",
    parent: () => ({ content: <div>Actions</div>, value: "" }),
    data: () => <div>Actions</div>,
    clientSideSort: false,
    w: "100px",
  });

  return [nameColumn, valueColumn, statusColumn, priorityColumn, actionColumn];
}

function makeNestedRows(repeat: number = 1): GridDataRow<Row>[] {
  let parentId = 0;
  return zeroTo(repeat).flatMap((i) => {
    const p1 = `p${parentId++}`;
    const p2 = `p${parentId++}`;
    const p3 = `p${parentId++}`;
    const prefix = i === 0 ? "" : `${i}.`;
    return [
      {
        kind: "parent",
        id: p1,
        data: { name: `parent ${prefix}1`, value: 100, status: "active", priority: 1 },
        children: [
          {
            kind: "data",
            id: `${p1}c1`,
            data: { name: `child ${prefix}p1c1`, value: 50, status: "active", priority: 2 },
          },
          {
            kind: "data",
            id: `${p1}c2`,
            data: { name: `child ${prefix}p1c2`, value: 30, status: "inactive", priority: 1 },
          },
        ],
      },
      {
        kind: "parent",
        id: p2,
        data: { name: `parent ${prefix}2`, value: 200, status: "inactive", priority: 2 },
        children: [
          {
            kind: "data",
            id: `${p2}c1`,
            data: { name: `child ${prefix}p2c1`, value: 100, status: "active", priority: 3 },
          },
        ],
      },
      {
        kind: "parent",
        id: p3,
        data: { name: `parent ${prefix}3`, value: 150, status: "active", priority: 3 },
        children: [],
      },
    ];
  });
}
