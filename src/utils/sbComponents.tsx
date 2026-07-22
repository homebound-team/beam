import { ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import { checkboxFilter, multiFilter } from "src/components/Filters";
import { GridTableLayout, useGridTableLayoutState } from "src/components/Layout/GridTableLayout/GridTableLayout";
import { collapseColumn, column, numericColumn, selectColumn } from "src/components/Table/utils/columns";
import {
  type AppNavItem,
  GridColumn,
  GridDataRow,
  GridTable,
  HomeboundLogo,
  type NavbarProps,
  type NavbarUser,
  simpleHeader,
  SimpleHeaderAndData,
  Tokens,
} from "src/index";
import {
  NavbarLayout,
  PageHeaderLayout,
  SideNavLayout,
  WorkflowHeaderLayout,
  WorkflowHeaderLayoutProps,
} from "src/layouts";
import { zeroTo } from "src/utils/sb";
import { action } from "storybook/actions";

type Row = SimpleHeaderAndData<{ name: string; value: number }>;

/** Wide sticky-header `GridTable` fixture for layout and scroll stories. */
export function TableExample({
  numCols = 10,
  numRows = 100,
  virtualized = false,
}: {
  numCols?: number;
  numRows?: number;
  virtualized?: boolean;
}) {
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      simpleHeader,
      ...zeroTo(numRows).map((i) => ({
        kind: "data" as const,
        id: String(i),
        data: { name: `ccc ${i}`, value: i + 1 },
      })),
    ],
    [numRows],
  );
  const columns: GridColumn<Row>[] = useMemo(
    () =>
      zeroTo(numCols).map((i) => ({
        header: `Header ${i + 1}`,
        data: ({ value }) => `Cell ${i + 1}x${value}`,
        w: "100px",
        sticky: i === 0 ? "left" : undefined,
      })),
    [numCols],
  );

  return (
    <GridTable
      as={virtualized ? "virtual" : "div"}
      stickyHeader
      columns={columns}
      rows={rows}
      style={{ rowHeight: "fixed" }}
    />
  );
}

export function TestProjectLayout({ pageTitle, children }: { pageTitle?: string; children: ReactNode }) {
  return (
    <NavbarLayout navbar={createNavbar()}>
      <SideNavLayout sideNav={{ items: sideNavItems() }}>
        <PageHeaderLayout pageHeader={{ title: pageTitle ?? "" }}>{children}</PageHeaderLayout>
      </SideNavLayout>
    </NavbarLayout>
  );
}

/**
 * `NavbarLayout` + `SideNavLayout` + `WorkflowHeaderLayout` — for `WorkflowLayout` stories, which are a
 * peer/replacement for `PageHeaderLayout`'s body slot, not a child of `PageHeaderLayout` itself.
 */
export function TestWorkflowProjectLayout({
  workflowHeader,
  children,
}: {
  workflowHeader: WorkflowHeaderLayoutProps["workflowHeader"];
  children: ReactNode;
}) {
  return (
    <NavbarLayout navbar={createNavbar()}>
      <SideNavLayout sideNav={{ items: sideNavItems() }}>
        <WorkflowHeaderLayout workflowHeader={workflowHeader}>{children}</WorkflowHeaderLayout>
      </SideNavLayout>
    </NavbarLayout>
  );
}

export function createNavbar(): NavbarProps {
  return {
    brand: (
      <Link to="/">
        <HomeboundLogo fill={Tokens.OnSurface} width={5} />
      </Link>
    ),
    items: [
      { label: "Dashboard", onClick: "/", active: true },
      { label: "Projects", onClick: "/projects" },
      { label: "Finances", onClick: "/finances" },
      { label: "Warranty", onClick: "/warranty" },
    ],
    rightSlot: (
      <AppNavItems
        variant="global"
        items={[
          { label: "Help", onClick: "/help", icon: "helpCircle", iconOnly: true },
          { label: "Notifications", onClick: "/notifications", icon: "bell", iconOnly: true },
        ]}
      />
    ),
    user: createUser(),
  };
}

export function sideNavItems(): AppNavItem[] {
  return [
    {
      section: true,
      label: "Main",
      items: [
        { label: "Dashboard", icon: "columns", onClick: "/", active: true },
        { label: "Schedule", icon: "calendar", onClick: "/schedule" },
        { label: "Commitments", icon: "fileBlank", onClick: "/commitments" },
        { label: "Documents", icon: "comment", onClick: "/documents" },
        { label: "Settings", icon: "pencil", onClick: "/settings" },
      ],
    },
  ];
}

function createUser(): NavbarUser {
  return {
    name: "Tony Stark",
    picture: "tony-stark.jpg",
    menuItems: [{ label: "Profile", onClick: action("Profile clicked") }],
    persistentItems: [{ label: "Sign out", onClick: action("Sign out clicked") }],
  };
}

type GridTableLayoutData = { name: string | undefined; value: number | undefined; status: string; priority: number };
type GridTableLayoutHeaderRow = { kind: "header"; id: string; data: undefined };
type GridTableLayoutParentRow = {
  kind: "parent";
  id: string;
  data: GridTableLayoutData;
  children: GridDataRow<GridTableLayoutRow>[];
};
type GridTableLayoutDataRow = { kind: "data"; id: string; data: GridTableLayoutData };
type GridTableLayoutRow = GridTableLayoutHeaderRow | GridTableLayoutParentRow | GridTableLayoutDataRow;

/** Document-scroll `GridTableLayout` fixture for composed layout stories. */
export function GridTableLayoutExample({ storageKey }: { storageKey: string }) {
  const filterDefs = useMemo(() => createGridTableLayoutFilterDefs(), []);
  const columns = useMemo(() => createGridTableLayoutColumns(), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey,
    },
    search: "client",
  });

  return (
    <GridTableLayout
      layoutState={layoutState}
      tableProps={{
        as: "virtual",
        columns,
        rows: [simpleHeader, ...createGridTableLayoutNestedRows(20)],
        sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
      }}
    />
  );
}

function createGridTableLayoutFilterDefs() {
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

function createGridTableLayoutColumns() {
  const nameColumn = column<GridTableLayoutRow>({
    id: "name-col",
    name: "Name",
    header: () => ({ content: "Name" }),
    parent: (row) => ({ content: row.name, value: row.name }),
    data: (row) => ({ content: row.name }),
    mw: "200px",
  });
  const valueColumn = numericColumn<GridTableLayoutRow>({
    id: "value-col",
    name: "Value",
    header: () => ({ content: "Value" }),
    parent: (row) => ({ content: row.value, value: row.value }),
    data: (row) => ({ content: row.value }),
    mw: "100px",
  });
  const statusColumn = column<GridTableLayoutRow>({
    id: "status-col",
    name: "Status",
    header: () => ({ content: "Status" }),
    parent: (row) => ({ content: row.status, value: row.status }),
    data: (row) => ({ content: row.status }),
    w: "20%",
    mw: "100px",
  });
  const priorityColumn = numericColumn<GridTableLayoutRow>({
    id: "priority-col",
    name: "Priority",
    header: () => ({ content: "Priority" }),
    parent: (row) => ({ content: row.priority, value: row.priority }),
    data: (row) => ({ content: row.priority }),
    mw: "80px",
  });
  const actionColumn = column<GridTableLayoutRow>({
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
    collapseColumn<GridTableLayoutRow>(),
    selectColumn<GridTableLayoutRow>(),
    nameColumn,
    valueColumn,
    statusColumn,
    priorityColumn,
    actionColumn,
  ];
}

function createGridTableLayoutNestedRows(repeat: number = 1): GridDataRow<GridTableLayoutRow>[] {
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
