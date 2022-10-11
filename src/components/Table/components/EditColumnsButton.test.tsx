import { renderHook } from "@testing-library/react-hooks";
import { EditColumnsButton } from "src/components/Table/components/EditColumnsButton";
import { useColumns } from "src/components/Table/hooks";
import { GridColumn } from "src/components/Table/types";
import { SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndData<Data>;
const nameColumn: GridColumn<Row> = { name: "Name", header: "Name", data: ({ name }) => name };
const valueColumn: GridColumn<Row> = { name: "Value", header: "Value", canHide: true, data: ({ value }) => value };
const actionColumn: GridColumn<Row> = {
  name: "Actions",
  header: "Action",
  canHide: true,
  data: () => <div>Actions</div>,
};

describe("EditColumnsButton", () => {
  it("should render EditColumnsButton", async () => {
    // Given an edit columns button
    const r = await render(
      <EditColumnsButton
        trigger={{ label: "Columns" }}
        allColumns={[nameColumn, valueColumn, actionColumn]}
        selectedColumns={[]}
        setSelectedColumns={noop}
      />,
    );
    // Then the button renders with the correct label
    expect(r.columns().textContent).toBe("Columns");
  });

  it("should render only hide-able columns", async () => {
    // Given an edit columns button
    const r = await render(
      <EditColumnsButton
        trigger={{ label: "Columns" }}
        allColumns={[nameColumn, valueColumn, actionColumn]}
        selectedColumns={[]}
        setSelectedColumns={noop}
        defaultOpen={true}
      />,
    );
    // Then the button renders with the correct label
    expect(r.columns().textContent).toBe("Columns");
    // Then only hide-able columns should be render
    expect(r.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("should call setColumns when an option is clicked", async () => {
    // Given an edit columns button with a column with visible equal to false
    const { result } = renderHook(() => useColumns([nameColumn, valueColumn, actionColumn]));
    const setColumns = jest.fn();
    const r = await render(
      <EditColumnsButton
        trigger={{ label: "Columns" }}
        allColumns={[nameColumn, valueColumn, actionColumn]}
        selectedColumns={result.current[0]}
        setSelectedColumns={setColumns}
        defaultOpen={true}
      />,
    );
    // When click on an option
    click(r.value);
    // Then setColumns should be called
    expect(setColumns).toHaveBeenCalled();
  });

  it("should call setColumns when clear seleccions is clicked", async () => {
    // Given an edit columns button
    const { result } = renderHook(() => useColumns([nameColumn, valueColumn, actionColumn]));
    const setColumns = jest.fn();
    const r = await render(
      <EditColumnsButton
        trigger={{ label: "Columns" }}
        allColumns={[nameColumn, valueColumn, actionColumn]}
        selectedColumns={result.current[0]}
        setSelectedColumns={setColumns}
        defaultOpen={true}
      />,
    );
    // When click clearSelections button
    click(r.clearSelections);
    // Then setColumns should be called
    expect(setColumns).toHaveBeenCalled();
  });
});
