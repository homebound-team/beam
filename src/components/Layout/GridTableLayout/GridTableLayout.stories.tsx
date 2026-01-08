import { Meta } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";
import { checkboxFilter, multiFilter } from "src/components/Filters";
import { GridDataRow } from "src/components/Table";
import { collapseColumn, column, numericColumn, selectColumn } from "src/components/Table/utils/columns";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TestProjectLayout } from "../Layout.stories";
import { CardItem, GridTableLayout as GridTableLayoutComponent, useGridTableLayoutState } from "./GridTableLayout";

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
  const columns = useMemo(() => getColumns(false), []);

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
          columns,
          rows: [simpleHeader, ...makeNestedRows(3)],
          sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
        }}
        primaryAction={{ label: "Primary Action", onClick: noop }}
        secondaryAction={{ label: "Secondary Action", onClick: noop }}
        tertiaryAction={{
          label: "Tertiary Action",
          tooltip: "I am tertiary",
          onClick: noop,
        }}
        actionMenu={{
          tooltip: "I am the actionMenu",
          items: [
            { label: "First Action", onClick: noop },
            { label: "Second Action", onClick: noop },
            { label: "Third Action", onClick: noop },
          ],
        }}
      />
    </TestProjectLayout>
  );
}

export function ManyFilters() {
  const filterDefs = useMemo(() => getManyFilterDefs(), []);
  const columns = useMemo(() => getColumns(), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout-many-filters",
    },
    search: "client",
  });

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Grid Table Layout with Many Filters"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Sub Page" },
        ]}
        layoutState={layoutState}
        tableProps={{
          columns,
          rows: [simpleHeader, ...makeNestedRows(3)],
          sorting: { on: "client", initial: [columns[3].id!, "ASC"] },
        }}
        primaryAction={{ label: "Primary Action", onClick: noop }}
      />
    </TestProjectLayout>
  );
}

export function WithCheckboxFilter() {
  const filterDefs = useMemo(() => getCheckboxFilterDefs(), []);
  const columns = useMemo(() => getColumns(), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout-checkbox",
    },
    search: "client",
  });

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Grid Table Layout with Checkbox Filter"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Sub Page" },
        ]}
        layoutState={layoutState}
        tableProps={{
          columns,
          rows: [simpleHeader, ...makeNestedRows(3)],
          sorting: { on: "client", initial: [columns[3].id!, "ASC"] },
        }}
        primaryAction={{ label: "Primary Action", onClick: noop }}
      />
    </TestProjectLayout>
  );
}

export function QueryTableLayout() {
  const filterDefs = useMemo(() => getFilterDefs(), []);
  const columns = useMemo(() => getColumns(false), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout",
    },
    search: "server",
    pagination: {
      pageSizes: [25, 50, 100],
      storageKey: "query-table-pagination",
    },
  });

  // In this example, we set up server-side search and pagination using `searchString` and `page` from the layout state,
  // in combination with the "QueryTable" behavior for loading/error states.
  const query = useExampleQuery({
    filter: { ...layoutState.filter, search: layoutState.searchString, page: layoutState.page },
  });

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
          columns,
          query,
          createRows: (data) => [
            simpleHeader,
            ...(data?.map((row) => ({ kind: "data" as const, id: row.id, data: row })) ?? []),
          ],
          sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
        }}
        primaryAction={{ label: "Primary Action", onClick: noop }}
        totalCount={100}
      />
    </TestProjectLayout>
  );
}

export function WithPagination() {
  const filterDefs = useMemo(() => getFilterDefs(), []);
  const columns = useMemo(() => getColumns(), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout",
    },
    search: "client",
    pagination: {
      pageSizes: [25, 50, 100, 500],
      storageKey: "grid-table-pagination",
    },
  });

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Grid Table With Pagination"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Product Offerings" },
        ]}
        layoutState={layoutState}
        totalCount={543}
        tableProps={{
          columns,
          rows: [simpleHeader, ...makeNestedRows(10)],
          sorting: { on: "client", initial: [columns[0].id!, "ASC"] },
        }}
        primaryAction={{ label: "Add Product", onClick: noop }}
      />
    </TestProjectLayout>
  );
}

export function GridTableLayoutWithColor() {
  const filterDefs = useMemo(() => getFilterDefs(), []);
  const columns = useMemo(() => getColumns(true), []);
  const storageKey = "with-session-storage-test";

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey,
    },
    search: "client",
  });

  useEffect(() => {
    const columnWidthsKey = `columnWidths_${storageKey}`;
    if (!sessionStorage.getItem(columnWidthsKey)) {
      sessionStorage.setItem(
        columnWidthsKey,
        JSON.stringify({
          "name-col": 300,
          "value-col": 150,
          "status-col": 120,
          "priority-col": 120,
          "action-col": 100,
        }),
      );
    }
  }, [storageKey]);

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Grid Table Layout with Color for clearer column manipulation"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Sub Page" },
        ]}
        layoutState={layoutState}
        tableProps={{
          columns,
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

function getCheckboxFilterDefs() {
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
    isUrgent: checkboxFilter({
      label: "Urgent",
    }),
    priority: multiFilter({
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
      getOptionLabel: (p) => p.label,
      getOptionValue: (p) => p.value,
      label: "Priority",
    }),
    needsRevision: checkboxFilter({
      label: "Needs Revision",
    }),
  };
}

function getManyFilterDefs() {
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
        { label: "Pending", value: "pending" },
      ],
      getOptionLabel: (cs) => cs.label,
      getOptionValue: (cs) => cs.value,
      label: "Status",
    }),
    priority: multiFilter({
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
      getOptionLabel: (p) => p.label,
      getOptionValue: (p) => p.value,
      label: "Priority",
    }),
    category: multiFilter({
      options: [
        { label: "TypeA", value: "typeA" },
        { label: "TypeB", value: "typeB" },
        { label: "TypeC", value: "typeC" },
      ],
      getOptionLabel: (c) => c.label,
      getOptionValue: (c) => c.value,
      label: "Category",
    }),
    region: multiFilter({
      options: [
        { label: "North", value: "north" },
        { label: "South", value: "south" },
        { label: "East", value: "east" },
        { label: "West", value: "west" },
      ],
      getOptionLabel: (r) => r.label,
      getOptionValue: (r) => r.value,
      label: "Region",
    }),
    department: multiFilter({
      options: [
        { label: "Engineering", value: "engineering" },
        { label: "Sales", value: "sales" },
        { label: "Marketing", value: "marketing" },
      ],
      getOptionLabel: (d) => d.label,
      getOptionValue: (d) => d.value,
      label: "Department",
    }),
    source: multiFilter({
      options: [
        { label: "Web", value: "web" },
        { label: "Mobile", value: "mobile" },
        { label: "API", value: "api" },
        { label: "Import", value: "import" },
      ],
      getOptionLabel: (s) => s.label,
      getOptionValue: (s) => s.value,
      label: "Source",
    }),
    assignee: multiFilter({
      options: [
        { label: "John Doe", value: "john doe" },
        { label: "Jane Smith", value: "jane smith" },
        { label: "Bob Johnson", value: "bob johnson" },
      ],
      getOptionLabel: (a) => a.label,
      getOptionValue: (a) => a.value,
      label: "Assignee",
    }),
    projectType: multiFilter({
      options: [
        { label: "Internal", value: "internal" },
        { label: "External", value: "external" },
        { label: "Partner", value: "partner" },
      ],
      getOptionLabel: (pt) => pt.label,
      getOptionValue: (pt) => pt.value,
      label: "Project Type",
    }),
    needsRevision: checkboxFilter({
      label: "Needs Revision",
    }),
  };
}

function getColumns(showColor: boolean = false) {
  const nameColumn = column<Row>({
    id: "name-col",
    name: "Name",
    header: () => ({ content: "Name", css: Css.if(showColor).bgRed500.$ }),
    parent: (row) => ({ content: row.name, value: row.name, css: Css.if(showColor).bgRed500.$ }),
    data: (row) => ({ content: row.name, css: Css.if(showColor).bgRed500.$ }),
    mw: "200px",
  });
  const valueColumn = numericColumn<Row>({
    id: "value-col",
    name: "Value",
    header: () => ({ content: "Value", css: Css.if(showColor).bgBlue500.$ }),
    parent: (row) => ({ content: row.value, value: row.value, css: Css.if(showColor).bgBlue500.$ }),
    data: (row) => ({ content: row.value, css: Css.if(showColor).bgBlue500.$ }),
    mw: "100px",
  });
  const statusColumn = column<Row>({
    id: "status-col",
    name: "Status",
    header: () => ({ content: "Status", css: Css.if(showColor).bgGreen500.$ }),
    parent: (row) => ({ content: row.status, value: row.status, css: Css.if(showColor).bgGreen500.$ }),
    data: (row) => ({ content: row.status, css: Css.if(showColor).bgGreen500.$ }),
    w: "20%",
    mw: "100px",
  });
  const priorityColumn = numericColumn<Row>({
    id: "priority-col",
    name: "Priority",
    header: () => ({ content: "Priority", css: Css.if(showColor).bgYellow500.$ }),
    parent: (row) => ({ content: row.priority, value: row.priority, css: Css.if(showColor).bgYellow500.$ }),
    data: (row) => ({ content: row.priority, css: Css.if(showColor).bgYellow500.$ }),
    mw: "80px",
  });
  const actionColumn = column<Row>({
    id: "action-col",
    name: "Action",
    header: () => ({ content: "Action", css: Css.if(showColor).bgPurple500.$ }),
    parent: () => ({ content: <div>Actions</div>, value: "", css: Css.if(showColor).bgPurple500.$ }),
    data: () => ({ content: <div>Actions</div>, css: Css.if(showColor).bgPurple500.$ }),
    clientSideSort: false,
    w: "100px",
    mw: "80px",
  });

  return [
    collapseColumn<Row>(),
    selectColumn<Row>(),
    nameColumn,
    valueColumn,
    statusColumn,
    priorityColumn,
    actionColumn,
  ];
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

const sampleCards: CardItem[] = [
  {
    id: "1",
    image: "plan-exterior.png",
    title: "The Cora Plan",
    description: "SFH-001 - 4,000-5,000sf, 5-6bd - Luxury single family home with premium finishes",
  },
  {
    id: "2",
    image: "plan-exterior.png",
    title: "The Conroy Plan",
    description: "SFH-002 - 4,000-5,000sf, 4-5bd - Traditional style with modern amenities",
  },
  {
    id: "3",
    image: "plan-exterior.png",
    title: "The Rayburn Plan",
    description: "SFH-003 - 2,800-3,200sf, 3-4bd - Contemporary design with open floor plan",
  },
  {
    id: "4",
    image: "plan-exterior.png",
    title: "The Madison Plan",
    description: "SFH-004 - 3,500-4,000sf, 5-6bd - Luxury single family home with premium finishes",
  },
  {
    id: "5",
    image: "plan-exterior.png",
    title: "The Emerson Plan",
    description: "SFH-005 - 2,800-3,200sf, 4-5bd - Traditional style with modern amenities",
  },
  {
    id: "6",
    image: "plan-exterior.png",
    title: "The Hamilton Plan",
    description: "SFH-006 - 2,800-3,200sf, 3-4bd - Contemporary design with open floor plan",
  },
];

export function GridTableLayoutWithCardView() {
  const filterDefs = useMemo(() => getFilterDefs(), []);
  const columns = useMemo(() => getColumns(), []);
  const layoutState = useGridTableLayoutState({
    persistedFilter: { filterDefs, storageKey: "grid-table-layout-card" },
    search: "client",
  });

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Grid Table Layout with Cards View"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Products" },
        ]}
        layoutState={layoutState}
        tableProps={{
          columns: [collapseColumn<Row>(), selectColumn<Row>(), ...columns],
          rows: [simpleHeader, ...makeNestedRows(3)],
          sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
        }}
        cardView={{ cards: sampleCards }}
        primaryAction={{ label: "Add Product", onClick: noop }}
      />
    </TestProjectLayout>
  );
}

export function CardsViewWithSidePanel() {
  const columns = useMemo(() => getColumns(), []);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const layoutState = useGridTableLayoutState({ search: "client" });
  const clickableCards: CardItem[] = sampleCards.map((card) => ({
    ...card,
    onClick: () => setSelectedCard(card),
  }));

  const sidePanel = selectedCard ? (
    <div css={Css.bgWhite.br8.m2.p3.df.fdc.gap2.bshBasic.$}>
      <h2 css={Css.lg.gray900.$}>{selectedCard?.title}</h2>
      <img src={selectedCard.image} alt={selectedCard.title} css={Css.w100.br8.$} />
      <p css={Css.sm.gray700.$}>{selectedCard.description}</p>
      <div css={Css.ba.bcGray200.br8.p3.mt2.$}>
        <div css={Css.smSb.gray900.$}>Details</div>
        <div css={Css.sm.gray700.mt2.$}>
          <p>ID: {selectedCard.id}</p>
          <p>Status: Active</p>
          <p>Last Updated: Today</p>
        </div>
      </div>
    </div>
  ) : (
    <div css={Css.h100.bgGray100.br8.p3.df.aic.jcc.$}>
      <p css={Css.sm.gray500.$}>Click a card to see details</p>
    </div>
  );

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Cards View with Side Panel Example"
        breadcrumb={[{ href: "/", label: "Home" }]}
        layoutState={layoutState}
        tableProps={{
          columns,
          rows: [simpleHeader, ...makeNestedRows(1)],
        }}
        cardView={{ cards: clickableCards, sidePanel }}
      />
    </TestProjectLayout>
  );
}
