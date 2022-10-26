import { MutableRefObject } from "react";
import { EditColumnsButton } from "src/components/Table/components/EditColumnsButton";
import { GridTable } from "src/components/Table/GridTable";
import { GridTableApi, useGridTableApi } from "src/components/Table/GridTableApi";
import { GridColumn } from "src/components/Table/types";
import { column } from "src/components/Table/utils/columns";
import { SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { click, render } from "src/utils/rtl";

describe("EditColumnsButton", () => {
  const columns: GridColumn<Row>[] = [
    column<Row>({ id: "name", name: "Name", header: "Name", data: ({ name }) => name }),
    column<Row>({
      id: "value",
      name: "Value",
      header: "Value",
      canHide: true,
      initVisible: true,
      data: ({ value }) => value,
    }),
    column<Row>({ id: "actions", name: "Actions", header: "Action", canHide: true, data: () => <div>Actions</div> }),
  ];

  // This component updates session storage as the selected columns change. Ensure the session storage is reset as needed
  beforeEach(() => sessionStorage.clear());
  afterAll(() => sessionStorage.clear());

  it("should ignore columns that are missing ids and warn", async () => {
    // Given an edit columns button, where the columns do not have the name but do have "canHide: true"
    const warnSpy = jest.spyOn(console, "warn");
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton
            trigger={{ label: "Columns" }}
            // Remove `name` prop from the Actions column for this test
            columns={columns.map(({ name, ...c }) => (name === "Actions" ? c : { name, ...c }))}
            defaultOpen={true}
            api={_api}
          />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    // Then the warning is logged
    expect(warnSpy.mock.calls[0][0]).toBe("Column is missing 'name' property required by the Edit Columns button");
    // And the list does not include the Action column
    expect(r.getAllByRole("checkbox")).toHaveLength(1);
    expect(r.queryByText("Actions")).toBeFalsy();
  });

  it("should render EditColumnsButton", async () => {
    // Given an edit columns button
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton trigger={{ label: "Columns" }} columns={columns} defaultOpen={true} api={_api} />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    // Then the button renders with the correct label
    expect(r.columns().textContent).toBe("Columns");
  });

  it("should render only hide-able columns", async () => {
    // Given an edit columns button
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton trigger={{ label: "Columns" }} columns={columns} defaultOpen={true} api={_api} />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    // Then only hide-able columns should be render
    expect(r.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("should call setColumns when an option is clicked", async () => {
    // Given an edit columns button
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton trigger={{ label: "Columns" }} columns={columns} defaultOpen={true} api={_api} />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    expect(api.current!.getVisibleColumnIds()).toEqual(["name", "value"]);
    // When click on an option
    click(r.value);
    // Then setColumns should be called
    expect(api.current!.getVisibleColumnIds()).toEqual(["name"]);
  });

  it("should call setColumns when clear selections is clicked", async () => {
    // Given an edit columns button
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton trigger={{ label: "Columns" }} columns={columns} defaultOpen={true} api={_api} />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    expect(api.current!.getVisibleColumnIds()).toEqual(["name", "value"]);
    // When click clearSelections button
    click(r.clearSelections);
    // Then setColumns should be called
    expect(api.current!.getVisibleColumnIds()).toEqual(["name"]);
  });
});

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndData<Data>;
