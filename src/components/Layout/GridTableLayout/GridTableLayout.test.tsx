import { checkboxFilter } from "src/components/Filters";
import { actionColumn, column, numericColumn } from "src/components/Table/utils/columns";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { noop } from "src/utils";
import { render, tableSnapshot, withRouter } from "src/utils/rtl";
import { QueryParamProvider } from "use-query-params";
import {
  GridTableLayout as GridTableLayoutComponent,
  GridTableLayoutProps,
  useGridTableLayoutState,
} from "./GridTableLayout";

type Data = { name: string | undefined; value: number | undefined };
type HeaderRow = { kind: "header"; id: string; data: undefined };
type DataRow = { kind: "data"; id: string; data: Data };
type Row = HeaderRow | DataRow;

// Because we also want to test the use of the useGridTableLayoutState hook, we need create a wrapper component
type TestWrapperProps = Omit<GridTableLayoutProps<any, Row, any, any>, "layoutState"> & {
  layoutStateProps: Parameters<typeof useGridTableLayoutState>[0];
};
function TestWrapper(props: TestWrapperProps) {
  const layoutState = useGridTableLayoutState(props.layoutStateProps);
  return <GridTableLayoutComponent {...props} layoutState={layoutState} />;
}

const columns = [
  column<Row>({ header: () => "Name", data: (row) => row.name, id: "name" }),
  numericColumn<Row>({ header: () => "Value", data: (row) => row.value, id: "value" }),
  actionColumn<Row>({ header: () => "Action", data: () => <div>Actions</div>, id: "action" }),
];

const rows: Row[] = [
  { kind: "data", id: "1", data: { name: "Alpha", value: 10 } },
  { kind: "data", id: "2", data: { name: "Beta", value: 20 } },
  { kind: "data", id: "3", data: { name: "Gamma", value: 30 } },
];

describe("GridTableLayout", () => {
  it("renders with static rows", async () => {
    // Given a GridTableLayout with static rows and search and filter config
    const r = await render(
      <QueryParamProvider>
        <TestWrapper
          layoutStateProps={{
            persistedFilter: {
              filterDefs: {
                needsRevision: checkboxFilter({
                  label: "Needs Revision",
                }),
              },
              storageKey: "test",
            },
            search: "client",
          }}
          pageTitle="Grid Table Layout Example"
          breadcrumb={[
            { href: "/", label: "Home" },
            { href: "/", label: "Sub Page" },
          ]}
          tableProps={{
            columns,
            rows: [simpleHeader, ...rows],
          }}
          primaryAction={{ label: "Primary Action", onClick: noop }}
          secondaryAction={{ label: "Secondary Action", onClick: noop }}
          tertiaryAction={{ label: "Tertiary Action", onClick: noop }}
        />
      </QueryParamProvider>,
      withRouter(),
    );

    // We expect the Header to be rendered
    expect(r.pageTitle).toHaveTextContent("Grid Table Layout Example");
    expect(r.primaryAction).toBeInTheDocument();
    expect(r.secondaryAction).toBeInTheDocument();
    expect(r.tertiaryAction).toBeInTheDocument();
    expect(r.pageHeaderBreadcrumbs_navLink_0).toHaveTextContent("Home");
    expect(r.pageHeaderBreadcrumbs_navLink_1).toHaveTextContent("Sub Page");

    // And the table actions to be rendered
    expect(r.search).toHaveValue("");
    expect(r.filter_needsRevision).not.toBeChecked();

    // And the table content to be rendered
    expect(tableSnapshot(r)).toMatchInlineSnapshot(`
      "
      | Name  | Value | Action  |
      | ----- | ----- | ------- |
      | Alpha | 10    | Actions |
      | Beta  | 20    | Actions |
      | Gamma | 30    | Actions |
      "
    `);
  });

  it("renders with query table", async () => {
    // When the table is rendered with a query
    const r = await render(
      <QueryParamProvider>
        <TestWrapper
          layoutStateProps={{
            persistedFilter: {
              filterDefs: {
                needsRevision: checkboxFilter({
                  label: "Needs Revision",
                }),
              },
              storageKey: "test",
            },
            // And no search config
          }}
          pageTitle="Query Table Layout Example"
          breadcrumb={[
            { href: "/", label: "Home" },
            { href: "/", label: "Sub Page" },
          ]}
          tableProps={{
            columns,
            query: {
              data: [
                { id: "1", name: "Delta", value: 100 },
                { id: "2", name: "Epsilon", value: 200 },
              ],
              loading: false,
            },
            createRows: (data) => [
              simpleHeader,
              ...(data?.map((row: Data & { id: string }) => ({ kind: "data", id: row.id, data: row })) ?? []),
            ],
          }}
          primaryAction={{ label: "Primary Action", onClick: noop }}
        />
      </QueryParamProvider>,
      withRouter(),
    );

    // And the search to not be rended
    expect(r.query.search).not.toBeInTheDocument();
    // But the filter still is
    expect(r.filter_needsRevision).not.toBeChecked();

    // And the table content to be rendered
    expect(tableSnapshot(r)).toMatchInlineSnapshot(`
      "
      | Name    | Value | Action  |
      | ------- | ----- | ------- |
      | Delta   | 100   | Actions |
      | Epsilon | 200   | Actions |
      "
    `);
  });
});
