import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";
import { EditColumnsButton } from "./EditColumnsButton";
import { GridColumn } from "./GridTable";
import { SimpleHeaderAndData } from "./simpleHelpers";

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
        setColumns={noop}
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
        setColumns={noop}
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
    const setColumns = jest.fn();
    const r = await render(
      <EditColumnsButton
        trigger={{ label: "Columns" }}
        allColumns={[nameColumn, valueColumn, actionColumn]}
        selectedColumns={[]}
        setColumns={setColumns}
        defaultOpen={true}
      />,
    );
    // When click on an option
    click(r.value);
    // Then setColumns should be called and visible should be updated to true
    expect(setColumns).toHaveBeenCalled();
    expect(r.value()).toBeChecked();
  });

  it("should call setColumns when clear seleccions is clicked", async () => {
    // Given an edit columns button
    const setColumns = jest.fn();
    const r = await render(
      <EditColumnsButton
        trigger={{ label: "Columns" }}
        allColumns={[nameColumn, valueColumn, actionColumn]}
        selectedColumns={[]}
        setColumns={setColumns}
        defaultOpen={true}
      />,
    );
    // When click on an option
    click(r.value);
    click(r.actions);
    // Then setColumns should be called and visible should be updated to true
    expect(setColumns).toHaveBeenCalled();
    expect(r.value()).toBeChecked();
    expect(r.actions()).toBeChecked();
    // When click clearSelections button
    click(r.clearSelections);
    // Then setColumns should be called and all columns should be updated to visible equal to false
    expect(setColumns).toHaveBeenCalled();
    expect(r.value()).not.toBeChecked();
    expect(r.actions()).not.toBeChecked();
  });
});
