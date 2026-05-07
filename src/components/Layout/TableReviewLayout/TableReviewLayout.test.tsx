// Replace AnimatePresence with a passthrough so exit animations don't block element removal
import { column } from "src/components/Table/utils/columns";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { noop } from "src/utils";
import { click, render, tableSnapshot, withRouter } from "src/utils/rtl";
import { SidePanel } from "./SidePanel";
import { TableReviewLayout, TableReviewLayoutProps } from "./TableReviewLayout";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return { ...actual, AnimatePresence: ({ children }: any) => <>{children}</> };
});

describe("TableReviewLayout", () => {
  it("renders title, description, and table", async () => {
    const r = await render(<TableReviewLayout {...baseProps()} />);

    expect(r.tableReviewLayout_pageTitle).toHaveTextContent("Review items");
    expect(r.tableReviewLayout_description).toHaveTextContent("Review and manage items");
    expect(r.tableReviewLayout_closeButton).toBeInTheDocument();
    expect(tableSnapshot(r)).toMatchInlineSnapshot(`
      "
      | Name  |
      | ----- |
      | Alpha |
      | Beta  |
      "
    `);
  });

  it("renders breadcrumbs when provided", async () => {
    const r = await render(
      <TableReviewLayout
        {...baseProps({
          breadCrumb: [
            { href: "/plans", label: "Plans" },
            { href: "/plans/1", label: "Emerson" },
          ],
        })}
      />,
      withRouter(),
    );

    expect(r.pageHeaderBreadcrumbs_navLink_0).toHaveTextContent("Plans");
    expect(r.pageHeaderBreadcrumbs_navLink_1).toHaveTextContent("Emerson");
  });

  it("omits breadcrumbs when not provided", async () => {
    const r = await render(<TableReviewLayout {...baseProps()} />);
    expect(r.query.pageHeaderBreadcrumbs_navLink_0).not.toBeInTheDocument();
  });

  it("calls closeAction when Close is clicked", async () => {
    const closeAction = vi.fn();
    const r = await render(<TableReviewLayout {...baseProps({ closeAction })} />);

    click(r.tableReviewLayout_closeButton);

    expect(closeAction).toHaveBeenCalledTimes(1);
  });

  describe("emptyState", () => {
    describe("rows-based table", () => {
      it("shows emptyState in place of the table when rows contains no data", async () => {
        const r = await render(
          <TableReviewLayout
            {...baseProps({
              tableProps: { columns, rows: [simpleHeader] },
              emptyState: <div data-testid="emptyState">All set!</div>,
            })}
          />,
        );

        expect(r.emptyState).toBeInTheDocument();
        expect(r.query.gridTable).not.toBeInTheDocument();
      });

      it("shows the table when data rows exist, even if emptyState is provided", async () => {
        const r = await render(
          <TableReviewLayout {...baseProps({ emptyState: <div data-testid="emptyState">All set!</div> })} />,
        );

        expect(r.query.emptyState).not.toBeInTheDocument();
        expect(r.gridTable).toBeInTheDocument();
      });
    });

    describe("query-based table", () => {
      const queryTableProps = {
        columns,
        query: { data: dataRows.map((r) => r.data), loading: false },
        createRows: (data: Data[] | undefined) => [
          simpleHeader,
          ...(data?.map((d) => ({ kind: "data" as const, id: d.id, data: d })) ?? []),
        ],
      };

      it("always shows emptyState when defined, regardless of query results", async () => {
        // For query tables the caller owns this decision — the component defers to them
        const r = await render(
          <TableReviewLayout
            {...baseProps({
              tableProps: queryTableProps,
              emptyState: <div data-testid="emptyState">All set!</div>,
            })}
          />,
        );

        expect(r.emptyState).toBeInTheDocument();
        expect(r.query.gridTable).not.toBeInTheDocument();
      });

      it("renders the query table when emptyState is not provided", async () => {
        const r = await render(<TableReviewLayout {...baseProps({ tableProps: queryTableProps })} />);

        expect(r.query.emptyState).not.toBeInTheDocument();
        expect(r.gridTable).toBeInTheDocument();
      });
    });
  });

  describe("side panel", () => {
    it("does not render the panel when panelContent is undefined", async () => {
      const r = await render(<TableReviewLayout {...baseProps()} />);
      expect(r.query.sidePanel).not.toBeInTheDocument();
    });

    it("renders the panel and its title when panelContent is provided", async () => {
      const r = await render(
        <TableReviewLayout
          {...baseProps({
            panelContent: <SidePanel title="Towel / Robe Hook">Detail content</SidePanel>,
          })}
        />,
      );

      expect(r.sidePanel).toBeInTheDocument();
      expect(r.sidePanel_title).toHaveTextContent("Towel / Robe Hook");
    });

    it("closes the panel when X is clicked, even without onPanelClose", async () => {
      // This is the key regression: without internal state management, clicking X was a no-op
      const r = await render(
        <TableReviewLayout
          {...baseProps({
            panelContent: <SidePanel title="Detail">Content</SidePanel>,
          })}
        />,
      );

      expect(r.sidePanel).toBeInTheDocument();
      click(r.x);
      expect(r.query.sidePanel).not.toBeInTheDocument();
    });

    it("calls onPanelClose when X is clicked", async () => {
      const onPanelClose = vi.fn();
      const r = await render(
        <TableReviewLayout
          {...baseProps({
            panelContent: <SidePanel title="Detail">Content</SidePanel>,
            onPanelClose,
          })}
        />,
      );

      click(r.x);

      expect(onPanelClose).toHaveBeenCalledTimes(1);
    });
  });
});

type Data = { id: string; name: string };
type HeaderRow = { kind: "header"; id: string; data: undefined };
type DataRow = { kind: "data"; id: string; data: Data };
type Row = HeaderRow | DataRow;

const columns = [column<Row>({ header: "Name", data: ({ name }) => name, id: "name", name: "Name" })];
const dataRows: Row[] = [
  { kind: "data", id: "1", data: { id: "1", name: "Alpha" } },
  { kind: "data", id: "2", data: { id: "2", name: "Beta" } },
];

function baseProps(
  overrides: Partial<TableReviewLayoutProps<Row, any, any>> = {},
): TableReviewLayoutProps<Row, any, any> {
  return {
    pageTitle: "Review items",
    description: "Review and manage items",
    closeAction: noop,
    tableProps: { columns, rows: [simpleHeader, ...dataRows] },
    ...overrides,
  };
}
