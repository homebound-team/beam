import { Meta } from "@storybook/react-vite";
import { useMemo } from "react";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { Button } from "src/components/Button";
import { checkboxFilter, multiFilter } from "src/components/Filters";
import { GridTableLayout, useGridTableLayoutState } from "src/components/Layout/GridTableLayout/GridTableLayout";
import { GridDataRow } from "src/components/Table";
import { collapseColumn, column, numericColumn, selectColumn } from "src/components/Table/utils/columns";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { Css } from "src/Css";
import { NavbarLayout } from "src/layouts/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { viewportModes, withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { createNavbar, TableExample } from "src/utils/sbComponents";

export default {
  component: NavbarLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} as Meta;

export function Default() {
  return (
    <NavbarLayout navbar={createNavbar()}>
      <div css={Css.bgGray50.p3.$}>Body slot — pass a SideNavLayout or PageHeaderLayout here.</div>
    </NavbarLayout>
  );
}

/**
 * The canonical composition: `NavbarLayout` → `SideNavLayout` → `PageHeaderLayout` wrapping a wide
 * table so the **document** scrollbars handle overflow. The navbar and page header auto-hide on
 * scroll-down and reveal on scroll-up; CSS-var coordination keeps the table's sticky header below the
 * navbar + page header and its sticky columns right of the side nav rail.
 */
export const Composed = () => (
  <NavbarLayout navbar={createNavbar()}>
    <SideNavLayout sideNav={{ items: sideNavItems() }}>
      <PageHeaderLayout pageHeader={{ title: "Page header", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
        <div css={Css.px3.py2.$}>
          <TableExample numCols={20} numRows={100} virtualized />
        </div>
      </PageHeaderLayout>
    </SideNavLayout>
  </NavbarLayout>
);

/** Same as {@link Composed} but without a side nav, so the page header spans from the viewport left edge. */
export const ComposedWithoutSideNav = () => (
  <NavbarLayout navbar={createNavbar()}>
    <PageHeaderLayout pageHeader={{ title: "Page header" }}>
      <div css={Css.px3.py2.$}>
        <TableExample numCols={20} numRows={100} virtualized />
      </div>
    </PageHeaderLayout>
  </NavbarLayout>
);

/**
 * `NavbarLayout` → `PageHeaderLayout` → `GridTableLayout` without a side nav. Page title and actions live in
 * `PageHeaderLayout`; filters and search live in `GridTableLayout` (no `pageTitle`). The virtualized table uses
 * document scroll so the navbar and page header auto-hide on scroll-down and the sticky table header pins below them.
 * Layout gutter columns (12px left/right) align table content with page padding.
 */
export function ComposedGridTableWithoutSideNav() {
  const filterDefs = useMemo(() => getGridTableFilterDefs(), []);
  const columns = useMemo(() => getGridTableColumns(), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "navbar-layout-grid-table",
    },
    search: "client",
  });

  return (
    <NavbarLayout navbar={createNavbar()}>
      <PageHeaderLayout
        pageHeader={{
          title: "Projects",
          rightSlot: <Button label="Action" onClick={() => {}} />,
        }}
      >
        <GridTableLayout
          layoutState={layoutState}
          tableProps={{
            as: "virtual",
            columns,
            rows: [simpleHeader, ...makeGridTableNestedRows(20)],
            sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
          }}
        />
      </PageHeaderLayout>
    </NavbarLayout>
  );
}

function sideNavItems(): AppNavItem[] {
  return [
    {
      section: true,
      label: "Main",
      items: [
        { label: "Dashboard", icon: "kanban", onClick: "/", active: true },
        { label: "Schedule", icon: "calendar", onClick: "/schedule" },
        { label: "Commitments", icon: "fileBlank", onClick: "/commitments" },
        { label: "Documents", icon: "comment", onClick: "/documents" },
        { label: "Settings", icon: "pencil", onClick: "/settings" },
      ],
    },
  ];
}

type GridTableData = { name: string | undefined; value: number | undefined; status: string; priority: number };
type GridTableHeaderRow = { kind: "header"; id: string; data: undefined };
type GridTableParentRow = { kind: "parent"; id: string; data: GridTableData; children: GridDataRow<GridTableRow>[] };
type GridTableDataRow = { kind: "data"; id: string; data: GridTableData };
type GridTableRow = GridTableHeaderRow | GridTableParentRow | GridTableDataRow;

function getGridTableFilterDefs() {
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

function getGridTableColumns() {
  const nameColumn = column<GridTableRow>({
    id: "name-col",
    name: "Name",
    header: () => ({ content: "Name" }),
    parent: (row) => ({ content: row.name, value: row.name }),
    data: (row) => ({ content: row.name }),
    mw: "200px",
  });
  const valueColumn = numericColumn<GridTableRow>({
    id: "value-col",
    name: "Value",
    header: () => ({ content: "Value" }),
    parent: (row) => ({ content: row.value, value: row.value }),
    data: (row) => ({ content: row.value }),
    mw: "100px",
  });
  const statusColumn = column<GridTableRow>({
    id: "status-col",
    name: "Status",
    header: () => ({ content: "Status" }),
    parent: (row) => ({ content: row.status, value: row.status }),
    data: (row) => ({ content: row.status }),
    w: "20%",
    mw: "100px",
  });
  const priorityColumn = numericColumn<GridTableRow>({
    id: "priority-col",
    name: "Priority",
    header: () => ({ content: "Priority" }),
    parent: (row) => ({ content: row.priority, value: row.priority }),
    data: (row) => ({ content: row.priority }),
    mw: "80px",
  });
  const actionColumn = column<GridTableRow>({
    id: "action-col",
    name: "Action",
    header: () => ({ content: "Action" }),
    parent: () => ({ content: <div>Actions</div>, value: "" }),
    data: () => ({ content: <div>Actions</div> }),
    clientSideSort: false,
    w: "100px",
    mw: "80px",
  });

  return [
    collapseColumn<GridTableRow>(),
    selectColumn<GridTableRow>(),
    nameColumn,
    valueColumn,
    statusColumn,
    priorityColumn,
    actionColumn,
  ];
}

function makeGridTableNestedRows(repeat: number = 1): GridDataRow<GridTableRow>[] {
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
