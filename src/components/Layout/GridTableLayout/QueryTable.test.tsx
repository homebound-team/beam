import { column } from "src/components/Table/utils/columns";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { cell, render } from "src/utils/rtl";
import { QueryTable, type QueryResult } from "./QueryTable";

describe("QueryTable", () => {
  it("shows the skeleton on the initial load", async () => {
    // Given a query that is loading with no data yet
    // When rendered
    const r = await render(<TestTable query={{ loading: true }} />);
    // Then the table itself is not rendered
    expect(r.query.gridTable).toBeNull();
  });

  it("renders the rows once data arrives", async () => {
    // Given a loaded query
    // When rendered
    const r = await render(<TestTable query={{ loading: false, data: [{ id: "1", name: "Alpha" }] }} />);
    // Then the row is shown, undimmed
    expect(cell(r, 1, 0)).toHaveTextContent("Alpha");
    expect(r.gridTable).not.toHaveStyle({ opacity: "0.5" });
  });

  it("keeps the previous rows dimmed while refetching", async () => {
    // Given a refetch where Apollo has moved the last result to previousData
    // When rendered
    const r = await render(<TestTable query={{ loading: true, previousData: [{ id: "1", name: "Alpha" }] }} />);
    // Then the previous row is still shown
    expect(cell(r, 1, 0)).toHaveTextContent("Alpha");
    // And the table is dimmed and non-interactive while we wait
    expect(r.gridTable).toHaveStyle({ opacity: "0.5", pointerEvents: "none" });
  });

  it("dims the current rows when Apollo keeps data while refetching", async () => {
    // Given a refetch where Apollo kept the prior data on the query
    // When rendered
    const r = await render(<TestTable query={{ loading: true, data: [{ id: "1", name: "Alpha" }] }} />);
    // Then those rows are shown and dimmed
    expect(cell(r, 1, 0)).toHaveTextContent("Alpha");
    expect(r.gridTable).toHaveStyle({ opacity: "0.5" });
  });

  it("prefers the new data over the previous data", async () => {
    // Given a query that has both new and previous data
    // When rendered
    const r = await render(
      <TestTable
        query={{ loading: false, data: [{ id: "2", name: "Beta" }], previousData: [{ id: "1", name: "Alpha" }] }}
      />,
    );
    // Then only the new rows are shown
    expect(cell(r, 1, 0)).toHaveTextContent("Beta");
    expect(r.gridTable).not.toHaveTextContent("Alpha");
  });

  it("shows the error message instead of stale rows", async () => {
    // Given a query that errored after having previous data
    // When rendered
    const r = await render(
      <TestTable query={{ loading: false, error: { message: "Boom" }, previousData: [{ id: "1", name: "Alpha" }] }} />,
    );
    // Then the error is shown and the stale rows are not
    expect(r.gridTable).toHaveTextContent("Error: Boom");
    expect(r.gridTable).not.toHaveTextContent("Alpha");
  });
});

type Data = { id: string; name: string };
type Row = SimpleHeaderAndData<Data>;

function TestTable(props: { query: QueryResult<Data[]> }) {
  const { query } = props;
  return (
    <QueryTable<Row, Data[], any>
      columns={[column<Row>({ header: "Name", data: (data) => data.name })]}
      query={query}
      createRows={(data) => [simpleHeader, ...(data ?? []).map((d) => ({ kind: "data" as const, id: d.id, data: d }))]}
    />
  );
}
