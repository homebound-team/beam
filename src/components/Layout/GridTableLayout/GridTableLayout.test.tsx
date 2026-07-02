import { act } from "@testing-library/react";
import { checkboxFilter } from "src/components/Filters";
import { setRunningInJest } from "src/components/Table/GridTable";
import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import { cardStatusSlot, cardTitleSlot } from "src/components/Table/cardSlots";
import {
  actionColumn,
  collapseColumn,
  column,
  layoutGutterLeftColumnId,
  layoutGutterRightColumnId,
  numericColumn,
  selectColumn,
} from "src/components/Table/utils/columns";
import { SimpleHeaderAndData, simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { beamTableActionsHeightVar } from "src/layouts/layoutVars";
import { noop } from "src/utils";
import { click, render, tableSnapshot, typeAndWait, withRouter } from "src/utils/rtl";
import { vi } from "vitest";
import {
  GridTableLayout as GridTableLayoutComponent,
  GridTableLayoutProps,
  useGridTableLayoutState,
} from "./GridTableLayout";
import { getGridTableViewStorageKey } from "./usePersistedTableView";

describe("GridTableLayout", () => {
  it("renders with static rows", async () => {
    // Given a GridTableLayout with static rows and search and filter config
    const r = await render(
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
        breadCrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Sub Page" },
        ]}
        tableProps={{
          columns: getColumns(),
          rows: [simpleHeader, ...getRows()],
        }}
        primaryAction={{ label: "Primary Action", onClick: noop }}
        secondaryAction={{ label: "Secondary Action", onClick: noop }}
        tertiaryAction={{ label: "Tertiary Action", onClick: noop }}
      />,
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
    expect(r.filter_button).toBeInTheDocument();

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
        breadCrumb={[
          { href: "/", label: "Home" },
          { href: "/", label: "Sub Page" },
        ]}
        tableProps={{
          columns: getColumns(),
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
      />,
      withRouter(),
    );

    // And the search to not be rended
    expect(r.query.search).not.toBeInTheDocument();
    // But the filter button still is
    expect(r.filter_button).toBeInTheDocument();

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
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          hideEditColumns={true}
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      // Then EditColumnsButton is not rendered
      expect(r.query.editColumnsButton).not.toBeInTheDocument();
    });

    it("throws error when columns missing id and hideEditColumns is false", async () => {
      // Given columns without id property
      const columnsWithoutId = [column<Row>({ header: () => "Name", data: (row) => row.name, name: "Name" })];

      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          tableProps={{
            columns: columnsWithoutId,
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      expect(r.baseElement).toHaveTextContent(
        "Columns must have id and name properties when EditColumnsButtons is enabled",
      );
    });

    it("throws error when columns missing name and hideEditColumns is false", async () => {
      // Given columns without name property
      const columnsWithoutName = [column<Row>({ header: () => "Name", data: (row) => row.name, id: "name" })];

      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          tableProps={{
            columns: columnsWithoutName,
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      expect(r.baseElement).toHaveTextContent(
        "Columns must have id and name properties when EditColumnsButtons is enabled",
      );
    });

    it("does not throw error when columns missing id/name and hideEditColumns is true", async () => {
      // Given columns without id/name but hideEditColumns=true
      const columnsWithoutId = [column<Row>({ header: () => "Name", data: (row) => row.name })];

      // Then it does not throw
      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          hideEditColumns={true}
          tableProps={{
            columns: columnsWithoutId,
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      expect(r.pageTitle).toBeInTheDocument();
    });
  });

  describe("view toggle", () => {
    it("should not display a view toggle if withCardView is undefined", async () => {
      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      // Then ViewToggleButton is not rendered
      expect(r.query.viewToggleButton).not.toBeInTheDocument();
    });

    it("should display view toggle if withCardView is defined", async () => {
      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
          withCardView
        />,
        withRouter(),
      );

      expect(r.viewToggleButton).toBeInTheDocument();
    });

    it("shows EditColumnsButton in list view and hides it in card view", async () => {
      // Given a GridTableLayout with hideable columns and card view enabled
      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
          withCardView
        />,
        withRouter(),
      );

      // Then EditColumnsButton is visible in list view
      expect(r.editColumnsButton).toBeInTheDocument();

      // When switching to card view
      click(r.viewToggleButton);
      click(r.viewToggleButton_card);

      // Then EditColumnsButton is hidden in card view
      expect(r.query.editColumnsButton).not.toBeInTheDocument();
    });

    it("persists view selection to localStorage when toggled", async () => {
      const storageKey = getGridTableViewStorageKey("/");

      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
          withCardView
        />,
        withRouter(),
      );

      click(r.viewToggleButton);
      click(r.viewToggleButton_card);

      expect(localStorage.getItem(storageKey)).toBe("card");
    });

    it("restores view from localStorage on mount and trumps defaultView", async () => {
      localStorage.setItem(getGridTableViewStorageKey("/"), "card");

      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
          defaultView="list"
          withCardView
        />,
        withRouter(),
      );

      // Card view is restored from localStorage — EditColumnsButton is hidden in card view
      expect(r.query.editColumnsButton).not.toBeInTheDocument();
    });

    it("does not persist view when withCardView is undefined", async () => {
      const storageKey = getGridTableViewStorageKey("/");

      await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it("falls back to defaultView when localStorage has an invalid value", async () => {
      localStorage.setItem(getGridTableViewStorageKey("/"), "invalid");

      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          pageTitle="Test"
          defaultView="list"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
          withCardView
        />,
        withRouter(),
      );

      // Falls back to defaultView="list" — EditColumnsButton is visible in list view
      expect(r.editColumnsButton).toBeInTheDocument();
    });

    it("renders card content using cardSlot columns when switched to card view", async () => {
      setRunningInJest();
      // Given a layout with cardSlot columns and a single data row
      type CardTestData = { name: string; status: string };
      type CardTestRow = SimpleHeaderAndData<CardTestData>;
      const cardCols = [
        column<CardTestRow>({
          id: "name",
          name: "Name",
          header: "Name",
          data: ({ name }) => ({ content: name, value: name, cardSlot: cardTitleSlot(name) }),
        }),
        column<CardTestRow>({
          id: "status",
          name: "Status",
          header: "Status",
          data: ({ status }) => ({
            content: status,
            value: status,
            cardSlot: cardStatusSlot({ text: status, type: "success" }),
          }),
        }),
      ];

      function CardViewWrapper() {
        const layoutState = useGridTableLayoutState({});
        return (
          <GridTableLayoutComponent
            layoutState={layoutState}
            withCardView
            tableProps={{
              columns: cardCols,
              rows: [
                simpleHeader,
                { kind: "data" as const, id: "row1", data: { name: "The Conroy", status: "Active" } },
              ],
            }}
          />
        );
      }

      const r = await render(<CardViewWrapper />, withRouter());

      // When switching to card view
      click(r.viewToggleButton);
      click(r.viewToggleButton_card);

      // Then the card shows the title and status
      expect(r.tableCard_title).toHaveTextContent("The Conroy");
      expect(r.tableCard_status).toHaveTextContent("Active");
    });
  });

  describe("document scroll layout", () => {
    it("sets table actions height CSS var inside DocumentScrollLayoutProvider", async () => {
      const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        height: 40,
        width: 800,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 40,
        right: 800,
        toJSON: () => ({}),
      } as DOMRect);

      try {
        // Given a GridTableLayout with filters inside a document-scroll layout
        // When the layout mounts
        const r = await render(
          <DocumentScrollLayoutProvider>
            <TestWrapper
              layoutStateProps={getFilterLayoutStateProps("document-scroll-test")}
              hideEditColumns
              tableProps={{
                columns: getColumns(),
                rows: [simpleHeader, ...getRows()],
              }}
            />
          </DocumentScrollLayoutProvider>,
          withRouter(),
        );

        // Then the table actions height var is set for sticky column header coordination
        expect(r.tableWrapper.style.getPropertyValue(beamTableActionsHeightVar)).toBe("40px");
      } finally {
        rectSpy.mockRestore();
      }
    });

    it("does not set table actions height CSS var outside DocumentScrollLayoutProvider", async () => {
      // Given a GridTableLayout with filters but no document-scroll layout
      // When the layout mounts
      const r = await render(
        <TestWrapper
          layoutStateProps={getFilterLayoutStateProps("legacy-layout-test")}
          hideEditColumns
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      // Then the table actions height var is not set
      expect(r.tableWrapper.style.getPropertyValue(beamTableActionsHeightVar)).toBe("");
    });

    it("injects layout gutter columns inside DocumentScrollLayoutProvider", async () => {
      const api = new GridTableApiImpl<Row>();

      const r = await render(
        <DocumentScrollLayoutProvider>
          <TestWrapper
            hideEditColumns
            layoutStateProps={{}}
            tableProps={{
              api,
              columns: [collapseColumn<Row>(), selectColumn<Row>(), ...getColumns()],
              rows: [simpleHeader, ...getRows()],
            }}
          />
        </DocumentScrollLayoutProvider>,
        withRouter(),
      );

      expect(api.getVisibleColumnIds()[0]).toBe(layoutGutterLeftColumnId);
      expect(api.getVisibleColumnIds().at(-1)).toBe(layoutGutterRightColumnId);
      expect(r.gridTable).toBeInTheDocument();
    });

    it("does not inject layout gutter columns outside DocumentScrollLayoutProvider", async () => {
      const api = new GridTableApiImpl<Row>();

      await render(
        <TestWrapper
          hideEditColumns
          layoutStateProps={{}}
          tableProps={{
            api,
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      expect(api.getVisibleColumnIds()[0]).toBe("name");
    });

    function getFilterLayoutStateProps(storageKey: string) {
      return {
        persistedFilter: {
          filterDefs: {
            needsRevision: checkboxFilter({
              label: "Needs Revision",
            }),
          },
          storageKey,
        },
        search: "client" as const,
      };
    }
  });

  describe("empty state", () => {
    it("shows default empty state when there are no data rows and no emptyFallback", async () => {
      // Given a layout with only a header row and no emptyFallback
      // When the layout renders
      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader],
          }}
        />,
        withRouter(),
      );

      // Then the default structured empty state replaces the table
      expect(r.gridTableEmptyState_title).toHaveTextContent("No results found");
      expect(r.query.gridTable).toBeNull();
      expect(r.query.gridTableEmptyState_description).toBeNull();
      expect(r.query.gridTableEmptyState_actions).toBeNull();
    });

    it("shows empty state instead of the table when there are no data rows", async () => {
      // Given a layout with emptyFallback and only a header row (no data rows)
      // When the layout renders
      const r = await render(
        <TestWrapper
          layoutStateProps={{}}
          emptyFallback="No product offerings found"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader],
          }}
        />,
        withRouter(),
      );

      // Then the empty state is shown instead of the table
      expect(r.gridTableEmptyState_title).toHaveTextContent("No product offerings found");
      expect(r.query.gridTable).toBeNull();
    });

    it("shows filter description and clear action when client search filters out all rows", async () => {
      // Given a layout with client search, filters, and data rows
      const r = await render(
        <TestWrapper
          layoutStateProps={{
            persistedFilter: {
              filterDefs: {
                needsRevision: checkboxFilter({ label: "Needs Revision" }),
              },
              storageKey: "empty-state-test",
            },
            search: "client",
          }}
          emptyFallback="No product offerings found"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      // When the search string filters out all rows
      await typeAndWait(r.search, "zzz-no-match");
      expect(r.gridTableEmptyState_title).toBeInTheDocument();

      // Then the empty state shows filter guidance and a clear action
      expect(r.gridTableEmptyState_title).toHaveTextContent("No product offerings found");
      expect(r.gridTableEmptyState_description).toHaveTextContent("Try adjusting your search or filters.");
      expect(r.gridTableEmptyState_actions).toHaveTextContent("Clear Filters");
    });

    it("clears filters from the empty state clear action", async () => {
      // Given a layout with client search, filters, and data rows
      const r = await render(
        <TestWrapper
          layoutStateProps={{
            persistedFilter: {
              filterDefs: {
                needsRevision: checkboxFilter({ label: "Needs Revision" }),
              },
              storageKey: "empty-state-clear-test",
            },
            search: "client",
          }}
          emptyFallback="No product offerings found"
          tableProps={{
            columns: getColumns(),
            rows: [simpleHeader, ...getRows()],
          }}
        />,
        withRouter(),
      );

      await typeAndWait(r.search, "zzz-no-match");
      expect(r.clearFilters).toBeInTheDocument();

      // When the clear-filters action is clicked
      click(r.clearFilters);
      expect(r.gridTable).toBeInTheDocument();

      // Then the table shows the data rows again
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
  });

  it("passes infiniteScroll prop to the underlying table", async () => {
    setRunningInJest();
    // Given a GridTableLayout with infiniteScroll configured
    const onEndReached = vi.fn();
    const r = await render(
      <TestWrapper
        layoutStateProps={{ search: "client" as const }}
        tableProps={{
          as: "virtual",
          columns: getColumns(),
          rows: [simpleHeader, ...getRows()],
          infiniteScroll: { onEndReached },
        }}
      />,
      withRouter(),
    );
    // When the table renders, it should display the rows without error
    expect(tableSnapshot(r)).toMatchInlineSnapshot(`
      "
      | Name  | Value | Action  |
      | ----- | ----- | ------- |
      | Alpha | 10    | Actions |
      | Beta  | 20    | Actions |
      | Gamma | 30    | Actions |
      "
    `);
    // And onEndReached can be called as Virtuoso would call it at runtime
    act(() => {
      onEndReached(3);
    });
    expect(onEndReached).toHaveBeenCalledWith(3);
  });
});

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

function getColumns() {
  return [
    column<Row>({ header: () => "Name", data: (row) => row.name, id: "name", name: "Name", canHide: true }),
    numericColumn<Row>({ header: () => "Value", data: (row) => row.value, id: "value", name: "Value", canHide: true }),
    actionColumn<Row>({ header: () => "Action", data: () => <div>Actions</div>, id: "action", name: "Action" }),
  ];
}

function getRows(): Row[] {
  return [
    { kind: "data", id: "1", data: { name: "Alpha", value: 10 } },
    { kind: "data", id: "2", data: { name: "Beta", value: 20 } },
    { kind: "data", id: "3", data: { name: "Gamma", value: 30 } },
  ];
}
