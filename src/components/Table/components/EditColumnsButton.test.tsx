import type { MutableRefObject } from "react";
import { EditColumnsButton } from "src/components/Table/components/EditColumnsButton";
import { GridTable } from "src/components/Table/GridTable";
import { type GridTableApi, useGridTableApi } from "src/components/Table/GridTableApi";
import type { GridColumn } from "src/components/Table/types";
import { actionColumn, column } from "src/components/Table/utils/columns";
import type { SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
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

  it("shows an info icon for columns with a hover tooltip", async () => {
    // Given a hideable column with a tooltip and one without
    const columnsWithTooltip: GridColumn<Row>[] = [
      column<Row>({
        id: "name",
        name: "Name",
        header: "Name",
        data: ({ name }) => name,
        tooltip: "The row name",
      }),
      column<Row>({ id: "value", name: "Value", header: "Value", data: ({ value }) => value }),
    ];
    const api: MutableRefObject<GridTableApi<Row> | undefined> = { current: undefined };
    function Test() {
      const _api = useGridTableApi<Row>();
      api.current = _api;
      return <EditColumnsButton columns={columnsWithTooltip} defaultOpen={true} api={_api} />;
    }
    // When the menu is open
    const r = await render(<Test />);
    // Then only the column with a tooltip shows the icon
    expect(r.columns_tooltip_name).toHaveAttribute("title", "The row name");
    expect(r.query.columns_tooltip_value).toBeNull();
  });

  it("calls a column tooltip and closes the menu", async () => {
    // Given a column whose tooltip opens a modal
    const onTooltip = vi.fn();
    const columnsWithTooltip: GridColumn<Row>[] = [
      column<Row>({ id: "name", name: "Name", header: "Name", data: ({ name }) => name, tooltip: onTooltip }),
      column<Row>({ id: "value", name: "Value", header: "Value", data: ({ value }) => value }),
    ];
    function Test() {
      const api = useGridTableApi<Row>();
      return <EditColumnsButton columns={columnsWithTooltip} defaultOpen={true} api={api} />;
    }
    const r = await render(<Test />);
    expect(r.columns_tooltip_name).toHaveAttribute("aria-label", "Name information");
    // When the info icon is clicked
    click(r.columns_tooltip_name);
    // Then the callback runs and the menu closes
    expect(onTooltip).toHaveBeenCalledTimes(1);
    expect(r.query.columns_optionname).toBeNull();
  });
});

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndData<Data>;
