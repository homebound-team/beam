import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import type { FilterDefs } from "src/components/Filters";
import { checkboxFilter, multiFilter } from "src/components/Filters";
import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import type { TableView } from "src/components/Table/components/ViewToggleButton";
import { GridColumn } from "src/components/Table/types";
import { column } from "src/components/Table/utils/columns";
import { SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { withBeamDecorator, withRouter } from "src/utils/sb";
import { GridTableLayoutActions } from "./GridTableLayoutActions";

type Data = { name: string; tag: string };
type Row = SimpleHeaderAndData<Data>;

const columns: GridColumn<Row>[] = [
  column<Row>({ id: "name", name: "Name", header: "Name", data: (row) => row.name, canHide: true }),
  column<Row>({ id: "tag", name: "Tag", header: "Tag", data: (row) => row.tag, canHide: true }),
];
const api = new GridTableApiImpl<Row>();

type TestFilter = { needsRevision?: boolean; status?: string[] };
const filterDefs: FilterDefs<TestFilter> = {
  needsRevision: checkboxFilter({ label: "Needs Revision" }),
  status: multiFilter({
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    getOptionLabel: (o) => o.label,
    getOptionValue: (o) => o.value,
    label: "Status",
  }),
};

export default {
  component: GridTableLayoutActions,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "padded" },
} satisfies Meta;

export function WithSearch() {
  return <GridTableLayoutActions searchProps={{ onSearch: () => {} }} />;
}

export function WithFilters() {
  const [filter, setFilter] = useState<TestFilter>({ needsRevision: true, status: ["active"] });
  return <GridTableLayoutActions filterDefs={filterDefs} filter={filter} setFilter={setFilter} />;
}

export function WithEditColumns() {
  return (
    <GridTableLayoutActions hasHideableColumns={true} columns={columns} api={api} view="list" setView={() => {}} />
  );
}

export function WithCardView() {
  const [view, setView] = useState<TableView>("list");
  return <GridTableLayoutActions withCardView view={view} setView={setView} />;
}

export function WithActionMenu() {
  return (
    <GridTableLayoutActions
      actionMenu={{
        tooltip: "More actions",
        defaultOpen: true,
        items: [
          { label: "Export", onClick: () => {} },
          { label: "Import", onClick: () => {} },
          { label: "Archive", onClick: () => {} },
        ],
      }}
    />
  );
}

export function AllFeatures() {
  const [filter, setFilter] = useState<TestFilter>({ status: ["active"] });
  const [view, setView] = useState<TableView>("list");
  return (
    <GridTableLayoutActions
      searchProps={{ onSearch: () => {} }}
      filterDefs={filterDefs}
      filter={filter}
      setFilter={setFilter}
      hasHideableColumns={true}
      columns={columns}
      api={api}
      withCardView
      view={view}
      setView={setView}
      actionMenu={{
        tooltip: "More actions",
        items: [
          { label: "Export", onClick: () => {} },
          { label: "Import", onClick: () => {} },
          { label: "Archive", onClick: () => {} },
        ],
      }}
    />
  );
}
