import { Meta } from "@storybook/react-vite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { checkboxFilter, multiFilter } from "src/components/Filters";
import { GridDataRow, SimpleHeaderAndData } from "src/components/Table";
import {
  cardBadgeSlot,
  cardDataBlockSlot,
  cardEyebrowSlot,
  cardProgressSlot,
  cardStatusSlot,
  cardTitleSlot,
} from "src/components/Table/cardSlots";
import { collapseColumn, column, numericColumn, selectColumn } from "src/components/Table/utils/columns";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TestProjectLayout } from "src/utils/sbComponents";
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
  const columns = useMemo(() => getColumns(false), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout",
    },
    search: "client",
  });

  return (
    <TestProjectLayout pageTitle="Grid Table Layout">
      <GridTableLayoutComponent
        pageTitle="Grid Table Layout Example"
        breadCrumb={[
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
        breadCrumb={[
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
        breadCrumb={[
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
  });

  const query = useExampleQuery({
    filter: { ...layoutState.filter, search: layoutState.searchString },
  });

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Query Table Layout Example"
        breadCrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Sub Page A" },
          { href: "/", label: "Sub Page B" },
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
      />
    </TestProjectLayout>
  );
}

export function WithoutHeader() {
  const columns = useMemo(() => getColumns(false), []);

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        tableProps={{
          columns,
          rows: [simpleHeader, ...makeNestedRows(3)],
          sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
        }}
      />
    </TestProjectLayout>
  );
}

export function DefaultEmptyState() {
  const columns = useMemo(() => getColumns(false), []);

  return (
    <TestProjectLayout pageTitle="Product Offerings">
      <GridTableLayoutComponent
        pageTitle="Product Offerings"
        primaryAction={{ label: "Create New", onClick: noop }}
        tableProps={{
          columns,
          rows: [simpleHeader],
          sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
        }}
      />
    </TestProjectLayout>
  );
}

export function EmptyState() {
  const filterDefs = useMemo(() => getFilterDefs(), []);
  const columns = useMemo(() => getColumns(false), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout-empty-state",
    },
    search: "client",
  });

  useEffect(() => {
    layoutState.setSearchString("no-match");
    // This is a hack to ensure the empty state is shown initially while still allowing the user to use the search
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TestProjectLayout pageTitle="Product Offerings">
      <GridTableLayoutComponent
        pageTitle="Product Offerings"
        layoutState={layoutState}
        emptyFallback="No product offerings found"
        primaryAction={{ label: "Create New", onClick: noop }}
        tableProps={{
          columns,
          rows: [simpleHeader, ...makeNestedRows(3)],
          sorting: { on: "client", initial: [columns[1].id!, "ASC"] },
        }}
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
        breadCrumb={[
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

export function WithViewToggle() {
  type PlanData = {
    offeringName: string;
    planCode: string;
    version: string;
    sqft: string;
    beds: string;
    baths: string;
    elevations: string;
    width: string;
    depth: string;
    bidOut: number;
    status: string;
  };
  type PlanRow = SimpleHeaderAndData<PlanData>;

  return (
    <TestProjectLayout pageTitle="With View Toggle">
      <GridTableLayoutComponent
        tableProps={{
          as: "virtual",
          columns: [
            column<PlanRow>({
              id: "offering-name",
              name: "Offering Name",
              header: "Offering Name",
              data: ({ offeringName }) => ({
                content: offeringName,
                value: offeringName,
                cardSlot: cardTitleSlot(offeringName),
              }),
            }),
            column<PlanRow>({
              id: "plan-code",
              name: "Plan Code",
              header: "Plan Code",
              data: ({ planCode }) => ({ content: planCode, value: planCode, cardSlot: cardEyebrowSlot(planCode) }),
            }),
            column<PlanRow>({
              id: "version",
              name: "Version",
              header: "Version",
              data: ({ version }) => ({ content: version, value: version, cardSlot: cardBadgeSlot(version) }),
            }),
            column<PlanRow>({
              id: "sqft",
              name: "Sqft",
              header: "Sqft",
              data: ({ sqft }) => ({
                content: sqft,
                value: sqft,
                cardSlot: cardDataBlockSlot({ label: "Sqft", value: sqft }),
              }),
            }),
            column<PlanRow>({
              id: "beds",
              name: "Beds",
              header: "Beds",
              data: ({ beds }) => ({
                content: beds,
                value: beds,
                cardSlot: cardDataBlockSlot({ label: "Beds", value: beds }),
              }),
            }),
            column<PlanRow>({
              id: "baths",
              name: "Baths",
              header: "Baths",
              data: ({ baths }) => ({
                content: baths,
                value: baths,
                cardSlot: cardDataBlockSlot({ label: "Baths", value: baths }),
              }),
            }),
            column<PlanRow>({
              id: "elevations",
              name: "Elevations",
              header: "Elevations",
              data: ({ elevations }) => ({
                content: elevations,
                value: elevations,
                cardSlot: cardDataBlockSlot({ label: "Elevations", value: elevations }),
              }),
            }),
            column<PlanRow>({
              id: "width",
              name: "Width",
              header: "Width",
              data: ({ width }) => ({
                content: width,
                value: width,
                cardSlot: cardDataBlockSlot({ label: "Width", value: width }),
              }),
            }),
            column<PlanRow>({
              id: "depth",
              name: "Depth",
              header: "Depth",
              data: ({ depth }) => ({
                content: depth,
                value: depth,
                cardSlot: cardDataBlockSlot({ label: "Depth", value: depth }),
              }),
            }),
            column<PlanRow>({
              id: "bid-out",
              name: "Bid out",
              header: "Bid out",
              data: ({ bidOut }) => ({
                content: bidOut,
                value: bidOut,
                cardSlot: cardProgressSlot(bidOut),
              }),
            }),
            column<PlanRow>({
              id: "status",
              name: "Status",
              header: "Status",
              data: ({ status }) => ({
                content: status,
                value: status,
                cardSlot: cardStatusSlot({
                  text: status,
                  type: status === "Active" ? "success" : status === "Archived" ? "warning" : "neutral",
                }),
              }),
            }),
          ],
          rows: [
            simpleHeader,
            {
              kind: "data",
              id: "emerson-houston",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Emerson Houston",
                planCode: "226",
                version: "v23",
                sqft: "4,274 - 4,496",
                beds: "5",
                baths: "4",
                elevations: "3",
                width: "39 - 39.92",
                depth: "70.46 - 71",
                bidOut: 72,
                status: "Draft",
              },
            },
            {
              kind: "data",
              id: "carriage-house-eaton-adu",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "Carriage House - Eaton ADU",
                planCode: "526",
                version: "v16",
                sqft: "526",
                beds: "1",
                baths: "1",
                elevations: "3",
                width: "30",
                depth: "26.25",
                bidOut: 69,
                status: "Active",
              },
            },
            {
              kind: "data",
              id: "the-conroy",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Conroy",
                planCode: "001",
                version: "v2",
                sqft: "4,435 - 5,091",
                beds: "5 - 6",
                baths: "5.5",
                elevations: "2",
                width: "49 - 69",
                depth: "76 - 79",
                bidOut: 24,
                status: "Archived",
              },
            },
            {
              kind: "data",
              id: "plan-5-the-echo",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "Plan 5 - The Echo",
                planCode: "2733",
                version: "v180",
                sqft: "2,845 - 2,877",
                beds: "3 - 5",
                baths: "3 - 3.5",
                elevations: "3",
                width: "40",
                depth: "55 - 60.5",
                bidOut: 74,
                status: "Active",
              },
            },
            {
              kind: "data",
              id: "the-ryan-houston-pof2",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Ryan - Houston (POF2)",
                planCode: "418",
                version: "v4",
                sqft: "4,189 - 4,214",
                beds: "4 - 5",
                baths: "5",
                elevations: "4",
                width: "39.9 - 79.8",
                depth: "74.46 - 161.65",
                bidOut: 54,
                status: "Archived",
              },
            },
            {
              kind: "data",
              id: "1",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Conroy",
                planCode: "SFH-001",
                version: "v2.1",
                sqft: "2,400",
                beds: "4",
                baths: "3",
                elevations: "3",
                width: "52",
                depth: "68",
                bidOut: 75,
                status: "Active",
              },
            },
            {
              kind: "data",
              id: "2",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Aldridge",
                planCode: "SFH-002",
                version: "v1.4",
                sqft: "3,100",
                beds: "5",
                baths: "4",
                elevations: "2",
                width: "58",
                depth: "72",
                bidOut: 30,
                status: "Draft",
              },
            },
            {
              kind: "data",
              id: "3",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Waverly",
                planCode: "TH-003",
                version: "v3.0",
                sqft: "1,850",
                beds: "3",
                baths: "2",
                elevations: "4",
                width: "44",
                depth: "60",
                bidOut: 90,
                status: "Archived",
              },
            },
            {
              kind: "data",
              id: "4",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Pemberton",
                planCode: "SFH-004",
                version: "v1.0",
                sqft: "2,750",
                beds: "4",
                baths: "3.5",
                elevations: "2",
                width: "54",
                depth: "70",
                bidOut: 55,
                status: "Active",
              },
            },
            {
              kind: "data",
              id: "5",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Harlow",
                planCode: "TH-005",
                version: "v2.3",
                sqft: "1,620",
                beds: "2",
                baths: "2",
                elevations: "3",
                width: "38",
                depth: "56",
                bidOut: 10,
                status: "Draft",
              },
            },
            {
              kind: "data",
              id: "6",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Stanton",
                planCode: "SFH-006",
                version: "v4.1",
                sqft: "3,400",
                beds: "5",
                baths: "4",
                elevations: "2",
                width: "62",
                depth: "76",
                bidOut: 80,
                status: "Active",
              },
            },
            {
              kind: "data",
              id: "7",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Meridian",
                planCode: "TH-007",
                version: "v1.2",
                sqft: "2,100",
                beds: "3",
                baths: "2.5",
                elevations: "5",
                width: "46",
                depth: "64",
                bidOut: 45,
                status: "Archived",
              },
            },
            {
              kind: "data",
              id: "8",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Calloway With a way longer title",
                planCode: "SFH-008",
                version: "v2.0",
                sqft: "2,950",
                beds: "4",
                baths: "3",
                elevations: "3",
                width: "56",
                depth: "74",
                bidOut: 65,
                status: "Draft",
              },
            },
            {
              kind: "data",
              id: "9",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Ashford",
                planCode: "SFH-009",
                version: "v3.2",
                sqft: "3,250",
                beds: "5",
                baths: "4.5",
                elevations: "2",
                width: "60",
                depth: "80",
                bidOut: 95,
                status: "Active",
              },
            },
            {
              kind: "data",
              id: "10",
              imgSrc: "plan-exterior.png",
              data: {
                offeringName: "The Ellison",
                planCode: "TH-010",
                version: "v1.8",
                sqft: "1,980",
                beds: "3",
                baths: "2",
                elevations: "4",
                width: "42",
                depth: "62",
                bidOut: 20,
                status: "Archived",
              },
            },
          ],
          rowStyles: { data: { rowLink: () => "https://www.homebound.com" } },
        }}
        withCardView
        defaultView="card"
      />
    </TestProjectLayout>
  );
}

export function WithInfiniteScroll() {
  const loadRows = useCallback((offset: number) => {
    return zeroTo(50).map((i) => ({
      kind: "data" as const,
      id: String(i + offset),
      data: {
        name: `row ${i + offset}`,
        value: i + offset,
        status: i === 0 || i % 3 === 0 ? "active" : "inactive",
        priority: Math.floor(i % 3) + 1,
        actions: "actions",
      },
    }));
  }, []);

  const [data, setData] = useState(loadRows(0));
  const columns = useMemo(() => getColumns(false), []);
  const rows = useMemo(() => [simpleHeader, ...data], [data]);

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Grid Table Layout with Infinite Scroll"
        tableProps={{
          as: "virtual",
          rows,
          columns,
          infiniteScroll: {
            onEndReached(index) {
              setData([...data, ...loadRows(index)]);
            },
          },
        }}
      />
    </TestProjectLayout>
  );
}

export function WithQueryTableInfiniteScroll() {
  const columns = useMemo(() => getColumns(false), []);
  const filterDefs = useMemo(() => getFilterDefs(), []);

  const layoutState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout",
    },
    search: "client",
  });

  const query = useExamplePaginatedQuery({ filter: layoutState.filter });

  const maybeHasMore = useCallback(
    async (index: number) => {
      if (query.data?.pageInfo.hasNextPage) {
        await query.fetchMore({ variables: { page: { offset: index, limit: 50 } } });
      }
    },
    [query],
  );

  return (
    <TestProjectLayout>
      <GridTableLayoutComponent
        pageTitle="Query Table with Infinite Scroll"
        tableProps={{
          as: "virtual",
          query,
          columns,
          createRows: (data) => [
            simpleHeader,
            ...(data?.simpleData.map((row) => ({ kind: "data" as const, id: row.id, data: row })) ?? []),
          ],
          infiniteScroll: { onEndReached: maybeHasMore },
        }}
        layoutState={layoutState}
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

type ExampleQueryData = {
  simpleData: Array<{ id: string; name: string; value: number; status: string; priority: number }>;
  pageInfo: { hasNextPage: boolean };
};

function useExamplePaginatedQuery({ filter }: { filter: { status: string[] } }) {
  const filterString = JSON.stringify(filter);
  const pageSize = 50;

  const fakeDatabase = useMemo(
    () =>
      zeroTo(200).map((index) => ({
        id: String(index),
        name: `Row ${index}`,
        value: index,
        status: index === 0 || index % 3 === 0 ? "active" : "inactive",
        priority: Math.floor(index % 3) + 1,
      })),
    [],
  );

  const filteredDatabase = useMemo(
    () => (filter.status ? fakeDatabase.filter((row) => filter.status.includes(row.status)) : fakeDatabase),
    [fakeDatabase, filter],
  );

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExampleQueryData>();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setData({
        simpleData: filteredDatabase.slice(0, pageSize),
        pageInfo: { hasNextPage: pageSize < filteredDatabase.length },
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterString, filteredDatabase, pageSize, filter]);

  const fetchMore = useCallback(
    async ({
      variables: {
        page: { offset, limit },
      },
    }: {
      variables: { page: { offset: number; limit: number } };
    }) => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          setData((prev) => {
            const previousData = prev?.simpleData ?? [];

            return {
              simpleData: [...previousData, ...filteredDatabase.slice(offset, offset + limit)],
              pageInfo: { hasNextPage: offset + limit < filteredDatabase.length },
            };
          });

          resolve(true);
        }, 800);
      });
    },
    [filteredDatabase],
  );

  return { data, loading, fetchMore };
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
        { label: "TypeA", value: "type:1" },
        { label: "TypeB", value: "type:2" },
        { label: "TypeC", value: "type:3" },
      ],
      getOptionLabel: (c) => c.label,
      getOptionValue: (c) => c.value,
      label: "Category",
    }),
    region: multiFilter({
      options: [
        { label: "North", value: "region:north" },
        { label: "South", value: "region:south" },
        { label: "East", value: "region:east" },
        { label: "West", value: "region:west" },
      ],
      getOptionLabel: (r) => r.label,
      getOptionValue: (r) => r.value,
      label: "Region",
    }),
    department: multiFilter({
      options: [
        { label: "Engineering", value: "department:engineering" },
        { label: "Sales", value: "department:sales" },
        { label: "Marketing", value: "department:marketing" },
      ],
      getOptionLabel: (d) => d.label,
      getOptionValue: (d) => d.value,
      label: "Department",
    }),
    source: multiFilter({
      options: [
        { label: "Web", value: "source:web" },
        { label: "Mobile", value: "source:mobile" },
        { label: "API", value: "source:api" },
        { label: "Import", value: "source:import" },
      ],
      getOptionLabel: (s) => s.label,
      getOptionValue: (s) => s.value,
      label: "Source",
    }),
    assignee: multiFilter({
      options: [
        { label: "John Doe", value: "u:1" },
        { label: "Jane Smith", value: "u:2" },
        { label: "Bob Johnson", value: "u:3" },
      ],
      getOptionLabel: (a) => a.label,
      getOptionValue: (a) => a.value,
      label: "Assignee",
    }),
    projectType: multiFilter({
      options: [
        { label: "Internal", value: "pt:1" },
        { label: "External", value: "pt:2" },
        { label: "Partner", value: "pt:3" },
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
