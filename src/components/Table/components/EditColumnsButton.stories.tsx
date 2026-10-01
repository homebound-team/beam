import type { Meta } from "@storybook/react-vite";
import { Button } from "src/components/Button";
import { ModalBody, ModalFooter, ModalHeader } from "src/components/Modal/Modal";
import { useModal } from "src/components/Modal/useModal";
import { EditColumnsButton } from "src/components/Table/components/EditColumnsButton";
import { GridTable } from "src/components/Table/GridTable";
import { useGridTableApi } from "src/components/Table/GridTableApi";
import type { GridColumn } from "src/components/Table/types";
import { column } from "src/components/Table/utils/columns";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { Css } from "src/Css";
import { newStory, withBeamDecorator } from "src/utils/sb";

export default {
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
        <EditColumnsButton api={api} placement="right" columns={[nameColumn, valueColumn, actionColumn]} defaultOpen />
      </div>
    </div>
  );
}

export function EditColumnButtonDefault() {
  const api = useGridTableApi<Row>();
  return (
    <div>
      <h2 css={Css.lg.$}>Edit Columns Button — Default (icon trigger)</h2>
      <div css={Css.mlPx(200).mb4.$}>
        <EditColumnsButton
          api={api}
          tooltip="Display columns"
          placement="right"
          columns={[nameColumn, valueColumn, actionColumn]}
        />
      </div>
    </div>
  );
}

export function EditColumnButtonManyColumns() {
  // A table with a crap load of hideable columns — enough to exceed the 512px popover cap,
  // so the option list scrolls internally and the "Reset Column Widths" footer stays pinned.
  const manyColumns: GridColumn<Row>[] = [
    nameColumn,
    ...Array.from({ length: 50 }, (_, i): GridColumn<Row> => ({
      id: `col${i}`,
      name: `Column ${i + 1}`,
      header: `Column ${i + 1}`,
      canHide: true,
      data: ({ value }) => value,
    })),
  ];
  const api = useGridTableApi<Row>();
  return (
    <div>
      <h2 css={Css.lg.$}>Edit Columns Button — Many Columns (scrolls, pinned footer)</h2>
      <div css={Css.mlPx(200).mb4.$}>
        <EditColumnsButton api={api} placement="right" columns={manyColumns} />
      </div>
      <GridTable<Row>
        columns={manyColumns}
        style={{ cellHighlight: true }}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "c", value: 1 } },
          { kind: "data", id: "2", data: { name: "b", value: 2 } },
          { kind: "data", id: "3", data: { name: "a", value: 3 } },
        ]}
        api={api}
      />
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
        <EditColumnsButton api={api} placement="right" columns={tableColumns} />
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

/** Hover tooltips and a click that opens a modal, on the header and in the menu. */
export const ColumnTooltips = newStory(() => <ColumnTooltipsExample />, { decorators: [withBeamDecorator] });

function ColumnTooltipsExample() {
  const { openModal, closeModal } = useModal();
  const columns: GridColumn<Row>[] = [
    column<Row>({ id: "total", name: "Total Cost", header: "Total Cost", data: ({ value }) => value, w: "160px" }),
    column<Row>({
      id: "indirect",
      name: "Indirect Hard Costs",
      header: "Indirect Hard Costs",
      data: ({ value }) => value,
      tooltip: "Costs for physical work and materials on the site, but outside the structure itself.",
      w: "220px",
    }),
    column<Row>({
      id: "direct",
      name: "Direct Hard Costs",
      header: "Direct Hard Costs",
      data: ({ name }) => name,
      tooltip: () =>
        openModal({
          content: (
            <>
              <ModalHeader>Direct Hard Costs</ModalHeader>
              <ModalBody>
                Costs for the materials and labor that go directly into building the structure itself.
              </ModalBody>
              <ModalFooter>
                <Button label="Done" onClick={closeModal} />
              </ModalFooter>
            </>
          ),
        }),
      w: "220px",
    }),
  ];
  const api = useGridTableApi<Row>();
  return (
    <div css={Css.df.aifs.gap4.p2.$}>
      <GridTable
        columns={columns}
        sorting={{ on: "client" }}
        rows={[
          simpleHeader,
          { kind: "data", id: "1", data: { name: "Temp fencing", value: 1 } },
          { kind: "data", id: "2", data: { name: "Site cleanup", value: 2 } },
        ]}
        api={api}
      />
      <EditColumnsButton api={api} columns={columns} defaultOpen placement="right" />
    </div>
  );
}
