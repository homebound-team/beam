import { checkboxFilter } from "src/components/Filters";
import { actionColumn, column, numericColumn } from "src/components/Table/utils/columns";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { noop } from "src/utils";
import { click, render, tableSnapshot, withRouter } from "src/utils/rtl";
import { QueryParamProvider } from "use-query-params";
import {
  CardItem,
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
  column<Row>({ header: () => "Name", data: (row) => row.name, id: "name", name: "Name" }),
  numericColumn<Row>({ header: () => "Value", data: (row) => row.value, id: "value", name: "Value" }),
  actionColumn<Row>({ header: () => "Action", data: () => <div>Actions</div>, id: "action", name: "Action" }),
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

  describe("column visibility", () => {
    it("does not render EditColumnsButton when hideEditColumns is true", async () => {
      // Given GridTableLayout with hideEditColumns=true
      const r = await render(
        <QueryParamProvider>
          <TestWrapper
            layoutStateProps={{}}
            pageTitle="Test"
            hideEditColumns={true}
            tableProps={{
              columns,
              rows: [simpleHeader, ...rows],
            }}
          />
        </QueryParamProvider>,
        withRouter(),
      );

      // Then EditColumnsButton is not rendered
      expect(r.query.editColumnsButton).not.toBeInTheDocument();
    });

    it("throws error when columns missing id and hideEditColumns is false", async () => {
      // Given columns without id property
      const columnsWithoutId = [column<Row>({ header: () => "Name", data: (row) => row.name, name: "Name" })];

      // Then it throws an error
      await expect(
        render(
          <QueryParamProvider>
            <TestWrapper
              layoutStateProps={{}}
              pageTitle="Test"
              tableProps={{
                columns: columnsWithoutId,
                rows: [simpleHeader, ...rows],
              }}
            />
          </QueryParamProvider>,
          withRouter(),
        ),
      ).rejects.toThrow("Columns must have id and name properties when EditColumnsButtons is enabled");
    });

    it("throws error when columns missing name and hideEditColumns is false", async () => {
      // Given columns without name property
      const columnsWithoutName = [column<Row>({ header: () => "Name", data: (row) => row.name, id: "name" })];

      // Then it throws an error
      await expect(
        render(
          <QueryParamProvider>
            <TestWrapper
              layoutStateProps={{}}
              pageTitle="Test"
              tableProps={{
                columns: columnsWithoutName,
                rows: [simpleHeader, ...rows],
              }}
            />
          </QueryParamProvider>,
          withRouter(),
        ),
      ).rejects.toThrow("Columns must have id and name properties when EditColumnsButtons is enabled");
    });

    it("does not throw error when columns missing id/name and hideEditColumns is true", async () => {
      // Given columns without id/name but hideEditColumns=true
      const columnsWithoutId = [column<Row>({ header: () => "Name", data: (row) => row.name })];

      // Then it does not throw
      const r = await render(
        <QueryParamProvider>
          <TestWrapper
            layoutStateProps={{}}
            pageTitle="Test"
            hideEditColumns={true}
            tableProps={{
              columns: columnsWithoutId,
              rows: [simpleHeader, ...rows],
            }}
          />
        </QueryParamProvider>,
        withRouter(),
      );

      expect(r.pageTitle).toBeInTheDocument();
    });
  });

  describe("Card View", () => {
    const sampleCards: CardItem[] = [
      { id: "card1", image: "image1.png", title: "Card 1", description: "Description 1" },
      { id: "card2", image: "image2.png", title: "Card 2", description: "Description 2" },
    ];

    it("does not show view toggle when cardView is not provided", async () => {
      // Given a GridTableLayout without cardView prop
      const r = await render(
        <QueryParamProvider>
          <TestWrapper
            layoutStateProps={{ search: "client" }}
            pageTitle="Test"
            tableProps={{ columns, rows: [simpleHeader, ...rows] }}
          />
        </QueryParamProvider>,
        withRouter(),
      );
      // Then the view toggle is not rendered
      expect(r.query.viewToggle).not.toBeInTheDocument();
    });

    it("switches to card view when toggle is clicked", async () => {
      // Given a GridTableLayout with cardView prop
      const r = await render(
        <QueryParamProvider>
          <TestWrapper
            layoutStateProps={{}}
            pageTitle="Test"
            tableProps={{ columns, rows: [simpleHeader, ...rows] }}
            cardView={{ cards: sampleCards }}
          />
        </QueryParamProvider>,
        withRouter(),
      );
      // When clicking the view toggle dropdown and selecting card view
      click(r.viewToggle);
      click(r.viewToggle_card);
      // Then cards are rendered
      expect(r.layoutCardCard1).toBeInTheDocument();
      expect(r.layoutCardCard2).toBeInTheDocument();
      // And the card content is visible
      expect(r.layoutCardCard1_title).toHaveTextContent("Card 1");
      expect(r.layoutCardCard1_description).toHaveTextContent("Description 1");
    });

    it("hides EditColumnsButton in card view", async () => {
      // Given a GridTableLayout with cardView and hideable columns
      const hideableColumns = columns.map((c) => ({ ...c, canHide: true }));
      const r = await render(
        <QueryParamProvider>
          <TestWrapper
            layoutStateProps={{}}
            pageTitle="Test"
            tableProps={{ columns: hideableColumns, rows: [simpleHeader, ...rows] }}
            cardView={{ cards: sampleCards }}
          />
        </QueryParamProvider>,
        withRouter(),
      );
      // Then EditColumnsButton is visible in table view
      expect(r.editColumnsButton).toBeInTheDocument();
      // When switching to card view
      click(r.viewToggle);
      click(r.viewToggle_card);
      // Then EditColumnsButton is hidden
      expect(r.query.editColumnsButton).not.toBeInTheDocument();
    });

    it("renders side panel only in card view", async () => {
      // Given a GridTableLayout with cardView and a side panel
      const r = await render(
        <QueryParamProvider>
          <TestWrapper
            layoutStateProps={{}}
            pageTitle="Test"
            tableProps={{ columns, rows: [simpleHeader, ...rows] }}
            cardView={{ cards: sampleCards }}
            sidePanel={<div>Side Panel Content</div>}
          />
        </QueryParamProvider>,
        withRouter(),
      );
      // Then the side panel is not visible in table view
      expect(r.query.sidePanel).not.toBeInTheDocument();
      // And when switching to card view
      click(r.viewToggle);
      click(r.viewToggle_card);
      // Then the side panel is visible
      expect(r.cardGridView_sidePanel).toBeInTheDocument();
      expect(r.cardGridView_sidePanel).toHaveTextContent("Side Panel Content");
    });
  });
});
