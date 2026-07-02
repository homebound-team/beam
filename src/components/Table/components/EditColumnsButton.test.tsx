import { MutableRefObject } from "react";
import { EditColumnsButton } from "src/components/Table/components/EditColumnsButton";
import { GridTable } from "src/components/Table/GridTable";
import { GridTableApi, useGridTableApi } from "src/components/Table/GridTableApi";
import { GridColumn } from "src/components/Table/types";
import { actionColumn, column } from "src/components/Table/utils/columns";
import { SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("EditColumnsButton", () => {
  const columns: GridColumn<Row>[] = [
    column<Row>({ id: "name", name: "Name", header: "Name", data: ({ name }) => name }),
    column<Row>({
      id: "value",
      name: "Value",
      header: "Value",
      data: ({ value }) => value,
    }),
    actionColumn<Row>({ id: "actions", name: "Actions", header: "Action", data: () => <div>Actions</div> }),
  ];

  it("should ignore columns that are missing ids and warn", async () => {
    // Given an edit columns button, where a column with canHide: true is missing the name property
    const warnSpy = vi.spyOn(console, "warn");
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton
            columns={columns.map(({ name, ...c }) => (name === "Value" ? c : { name, ...c }))}
            defaultOpen={true}
            api={_api}
          />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    // Then the warning is logged
    expect(warnSpy.mock.calls[0][0]).toBe(
      "Column is missing 'name' and/or 'id' property required by the Edit Columns button",
    );
    // And the list does not include the column with missing name
    expect(r.getAllByRole("switch")).toHaveLength(1);
    expect(r.queryByText("Value")).toBeFalsy();
  });

  it("should render EditColumnsButton", async () => {
    // Given an edit columns button
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton columns={columns} defaultOpen={true} api={_api} />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    // Then the icon trigger renders
    expect(r.columns).toBeInTheDocument();
  });

  it("should render only hide-able columns", async () => {
    // Given an edit columns button
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton columns={columns} defaultOpen={true} api={_api} />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    // Then only hide-able columns should be render
    expect(r.getAllByRole("switch")).toHaveLength(2);
  });

  it("should call setColumns when an option is clicked", async () => {
    // Given an edit columns button
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton columns={columns} defaultOpen={true} api={_api} />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);

    expect(api.current!.getVisibleColumnIds()).toEqual(["name", "value", "actions"]);

    // When click on an option (deselect value)
    click(r.columns_optionvalue);

    // Then setColumns should be called (actions column always visible since canHide: false)
    expect(api.current!.getVisibleColumnIds()).toEqual(["name", "actions"]);
  });

  it("should hide columns when all hideable columns are deselected", async () => {
    // Given an edit columns button
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton columns={columns} defaultOpen={true} api={_api} />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    expect(api.current!.getVisibleColumnIds()).toEqual(["name", "value", "actions"]);
    // When deselect all hideable columns via the switches
    click(r.columns_optionname);
    click(r.columns_optionvalue);
    // Then only non-hideable columns remain visible (actions column always visible since canHide: false)
    expect(api.current!.getVisibleColumnIds()).toEqual(["actions"]);
  });

  it("badges the visible hideable-column count, only while some are hidden", async () => {
    // Given an edit columns button opted into a badge (two hideable columns: name, value)
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return (
        <>
          <EditColumnsButton columns={columns} defaultOpen={true} api={_api} />
          <GridTable columns={columns} rows={[]} api={_api} />
        </>
      );
    }
    const r = await render(<Test />);
    // Given all hideable columns are shown, there is no badge
    expect(r.query.countBadge).toBeFalsy();
    // When one of the two hideable columns is hidden, the badge shows the visible count (1)
    click(r.kanban_optionvalue);
    expect(r.countBadge).toHaveTextContent("1");
    // When the other is also hidden, the badge shows 0 (still visible because columns are hidden)
    click(r.kanban_optionname);
    expect(r.countBadge).toHaveTextContent("0");
    // When all hideable columns are shown again, the badge disappears
    click(r.kanban_optionname);
    click(r.kanban_optionvalue);
    expect(r.query.countBadge).toBeFalsy();
  });
});

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndData<Data>;
