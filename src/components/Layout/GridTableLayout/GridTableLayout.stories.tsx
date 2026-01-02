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
    id: "name-col",
    name: "Name",
    header: () => "Name",
    parent: (row) => ({ content: row.name, value: row.name }),
    data: (row) => row.name,
    mw: "200px",
  });
  const valueColumn = numericColumn<Row>({
    id: "value-col",
    name: "Value",
    header: () => "Value",
    parent: (row) => ({ content: row.value, value: row.value }),
    data: (row) => row.value,
    mw: "100px",
  });
  const statusColumn = column<Row>({
    id: "status-col",
    name: "Status",
    header: () => "Status",
    parent: (row) => ({ content: row.status, value: row.status }),
    data: (row) => row.status,
    mw: "100px",
  });
  const priorityColumn = numericColumn<Row>({
    id: "priority-col",
    name: "Priority",
    header: () => "Priority",
    parent: (row) => ({ content: row.priority, value: row.priority }),
    data: (row) => row.priority,
    mw: "100px",
  });
  const actionColumn = column<Row>({
    id: "action-col",
    name: "Action",
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
