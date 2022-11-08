import { Meta } from "@storybook/react";
import { EditColumnsButton } from "src/components/Table/components/EditColumnsButton";
import { GridTable } from "src/components/Table/GridTable";
import { useGridTableApi } from "src/components/Table/GridTableApi";
import { GridColumn } from "src/components/Table/types";
import { simpleHeader, SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { Css } from "src/Css";

export default {
  title: "Workspace/Components/EditColumnsButton",
  component: EditColumnsButton,
} as Meta;

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndData<Data>;
const nameColumn: GridColumn<Row> = { id: "Name", name: "Name", header: "Name", data: ({ name }) => name };
const valueColumn: GridColumn<Row> = {
  id: "Value",
  name: "Value",
  header: "Value",
  canHide: true,
  data: ({ value }) => value,
};
const actionColumn: GridColumn<Row> = {
  id: "Actions",
  name: "Actions",
  header: "Action",
  canHide: true,
  data: () => "Actions",
};
const otherColumn: GridColumn<Row> = {
  id: "Other",
  name: "Other",
  header: "Other",
  canHide: true,
  data: ({ name }) => name,
};

export function EditColumnButton() {
  const api = useGridTableApi<Row>();
  return (
    <div>
      <h2 css={Css.lg.$}>Edit Columns Button</h2>
      <div css={Css.mlPx(200).mb4.$}>
        <EditColumnsButton
          api={api}
          trigger={{ label: "Columns" }}
          placement="right"
          columns={[nameColumn, valueColumn, actionColumn]}
          title="Select columns to show"
          defaultOpen
        />
      </div>
    </div>
  );
}

export function EditColumnButtonInAction() {
  const tableColumns = [nameColumn, otherColumn, valueColumn, actionColumn];
  const api = useGridTableApi<Row>();
  return (
    <div>
      <h2 css={Css.lg.$}>Edit Columns Button In Action</h2>
      <div css={Css.mlPx(200).mb4.$}>
        <EditColumnsButton
          api={api}
          trigger={{ label: "Columns" }}
          placement="right"
          columns={tableColumns}
          title="Select columns to show"
        />
      </div>
      <GridTable<Row>
        columns={tableColumns}
        style={{ cellHighlight: true }}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "b", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
        sorting={{ on: "client" }}
        api={api}
      />
    </div>
  );
}
