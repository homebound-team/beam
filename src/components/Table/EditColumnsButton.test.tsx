import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";
import { EditColumnsButton } from "./EditColumnsButton";
import { GridColumn } from "./GridTable";
import { SimpleHeaderAndData } from "./simpleHelpers";

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndData<Data>;
const nameColumn: GridColumn<Row> = { name: "name", header: "Name", data: ({ name }) => name };
const valueColumn: GridColumn<Row> = { name: "value", header: "Value", canHide: true, data: ({ value }) => value };
const actionColumn: GridColumn<Row> = { name: "actions", header: "Action", canHide: true, data: () => <div>Actions</div> };

describe("EditColumnsButton", () => {
    it("Should render editColumnsButton", async () => {
        // Given an edit columns button
        const r = await render(        
        <EditColumnsButton 
            trigger={{ label: "Columns"}} 
            columns={[nameColumn, valueColumn, actionColumn]}
            setColumns={noop}
          />);
        // Expect to render the button with the expected label
        expect(r.columns().textContent).toBe("Columns");
    });

    it("Should render only hide-able columns", async () => {
        // Given an edit columns button
        const r = await render(        
        <EditColumnsButton 
            trigger={{ label: "Columns"}}  
            columns={[nameColumn, valueColumn, actionColumn]}
            setColumns={noop}
            defaultOpen={true}
          />);
          // Expect to render the button with the expected label
          expect(r.columns().textContent).toBe("Columns");
          // Expect to render only hide-able columns with this case the columns with canHide=true
          expect(r.getAllByRole("checkbox")).toHaveLength(2);
    });

    it("Should call setColumns when an option is clicked", async () => {
        // Given an edit columns button
        const setColumns = jest.fn();
        const r = await render(        
            <EditColumnsButton 
                trigger={{ label: "Columns"}} 
                columns={[nameColumn, valueColumn, actionColumn]}
                setColumns={setColumns}
                defaultOpen={true}
                />);
        // When click on an option
        click(r.value);
        // Expect for setColumns to be called
        expect(setColumns).toHaveBeenCalled();
      });

      it("Should call setColumns when clear seleccions is clicked", async () => {
        // Given an edit columns button
        const setColumns = jest.fn();
        const r = await render(        
            <EditColumnsButton 
                trigger={{ label: "Columns"}} 
                columns={[nameColumn, valueColumn, actionColumn]}
                setColumns={setColumns}
                defaultOpen={true}
                />);
        // When click clearSelections button
        click(r.clearSelections);
        // Expect for setColumns to be called
        expect(setColumns).toHaveBeenCalled();
      });
});