import { Meta } from "@storybook/react";
import { noop } from "src/utils";
import { Css } from "../../Css";
import { EditColumnsButton } from "./EditColumnsButton";
import { GridColumn, GridTable } from "./GridTable";
import { simpleHeader, SimpleHeaderAndData } from "./simpleHelpers";
import { useColumns } from "./useColumns";

export default {
  title: "Workspace/Components/EditColumnsButton",
  component: EditColumnsButton,
} as Meta;

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndData<Data>;
const nameColumn: GridColumn<Row> = { name: "Name", header: "Name", data: ({ name }) => name };
const valueColumn: GridColumn<Row> = { name: "Value", header: "Value", canHide: true, data: ({ value }) => value };
const actionColumn: GridColumn<Row> = {
  name: "Actions",
  header: "Action",
  canHide: true,
  data: () => "Actions",
};
const otherColumn: GridColumn<Row> = { name: "Other", header: "Other", canHide: true, data: ({ name }) => name };

export function EditColumnButton() {
  return (
    <div>
      <h2 css={Css.lg.$}>Edit Columns Button</h2>
      <div css={Css.mlPx(200).mb4.$}>
        <EditColumnsButton
          trigger={{ label: "Columns" }}
          placement="right"
          allColumns={[nameColumn, valueColumn, actionColumn]}
          setSelectedColumns={noop}
          title="Select columns to show"
          defaultOpen={true}
          selectedColumns={[]}
        />
      </div>
    </div>
  );
}

export function EditColumnButtonInAction() {
  const tableColumns = [nameColumn, otherColumn, valueColumn, actionColumn];
  const [columns, setColumns] = useColumns(tableColumns);
  return (
    <div>
      <h2 css={Css.lg.$}>Edit Columns Button In Action</h2>
      <div css={Css.mlPx(200).mb4.$}>
        <EditColumnsButton
          trigger={{ label: "Columns" }}
          placement="right"
          allColumns={tableColumns}
          setSelectedColumns={setColumns}
          selectedColumns={columns}
          title="Select columns to show"
        />
      </div>
      <GridTable<Row>
        columns={columns}
        style={{ cellHighlight: true }}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "b", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
        sorting={{ on: "client" }}
      />
    </div>
  );
}
