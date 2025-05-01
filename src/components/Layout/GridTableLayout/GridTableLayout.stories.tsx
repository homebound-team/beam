import { Meta } from "@storybook/react";
import { useMemo } from "react";
import { checkboxFilter, multiFilter } from "src/components/Filters";
import { GridColumn } from "src/components/Table/types";
import { simpleHeader, SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { withBeamDecorator, withRouter } from "src/utils/sb";
import { GridTableLayout as GridTableLayoutComponent, useGridTableLayoutState } from "./GridTableLayout";

export default {
  component: GridTableLayoutComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

type Data = { name: string | undefined; value: number | undefined };
type Row = SimpleHeaderAndData<Data>;

export function GridTableLayout() {
  const nameColumn: GridColumn<Row> = { header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = { header: "Value", data: ({ value }) => value };
  const actionColumn: GridColumn<Row> = { header: "Action", data: () => <div>Actions</div> };

  const filterDefs = useMemo(() => {
    return {
      primary: multiFilter({
        options: [
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
        ],
        getOptionLabel: (tp) => tp.label,
        getOptionValue: (tp) => tp.value,
        label: "Preference",
      }),
      status: multiFilter({
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
        getOptionLabel: (cs) => cs.label,
        getOptionValue: (cs) => cs.value,
        label: "Status",
      }),
      needsRevision: checkboxFilter({
        label: "Needs Revision",
      }),
    };
  }, []);

  const tableState = useGridTableLayoutState({
    persistedFilter: {
      filterDefs,
      storageKey: "grid-table-layout",
    },
    useSearch: "client",
  });

  const { data } = useExampleQuery({ filter: tableState.filter });

  return (
    <GridTableLayoutComponent
      pageTitle="Grid Table Layout Example"
      breadcrumb={[
        { href: "/", label: "Home" },
        { href: "/", label: "Sub Page" },
      ]}
      tableState={tableState}
      gridTableProps={{
        columns: [nameColumn, valueColumn, actionColumn],
        rows: [simpleHeader, ...data.map((d) => ({ kind: "data" as const, id: d.id, data: d }))],
      }}
    />
  );
}

function useExampleQuery({ filter }: { filter: Record<string, unknown> }) {
  return {
    data: [
      { id: "1", name: "a", value: 1 },
      { id: "2", name: "b", value: 2 },
      { id: "3", name: "c", value: 3 },
    ],
  };
}
