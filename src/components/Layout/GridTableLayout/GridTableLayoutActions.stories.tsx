import type { Meta } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { checkboxFilter } from "src/components/Filters/CheckboxFilter";
import { multiFilter } from "src/components/Filters/MultiFilter";
import type { FilterDefs } from "src/components/Filters/types";
import type { HeaderAction } from "src/components/Headers/HeaderActions";
import type { GridDataRow } from "src/components/Table/components/Row";
import type { TableView } from "src/components/Table/components/ViewToggleButton";
import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import type { GridColumn } from "src/components/Table/types";
import { column, selectColumn } from "src/components/Table/utils/columns";
import { type SimpleHeaderAndData, simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { Css } from "src/Css";
import { newStory, viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { GridTableLayout, useGridTableLayoutState } from "./GridTableLayout";
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

export function WithSingleFilter() {
  const [filter, setFilter] = useState<{ needsRevision?: boolean }>({});
  return (
    <GridTableLayoutActions
      searchProps={{ onSearch: () => {} }}
      filterDefs={{ needsRevision: checkboxFilter({ label: "Needs Revision" }) }}
      filter={filter}
      setFilter={setFilter}
      hasHideableColumns
      columns={columns}
      api={api}
      view="list"
      setView={() => {}}
    />
  );
}

export function WithGroupByOnly() {
  const [groupBy, setGroupBy] = useState("none");
  return (
    <GridTableLayoutActions
      searchProps={{ onSearch: () => {} }}
      groupBy={{
        value: groupBy,
        setValue: setGroupBy,
        options: createGroupByOptions(),
      }}
      hasHideableColumns
      columns={columns}
      api={api}
      view="list"
      setView={() => {}}
    />
  );
}

export function WithGroupByAndFilters() {
  const [filter, setFilter] = useState<TestFilter>({ status: ["active"] });
  const [groupBy, setGroupBy] = useState("none");
  return (
    <GridTableLayoutActions
      filterDefs={filterDefs}
      filter={filter}
      setFilter={setFilter}
      groupBy={{
        value: groupBy,
        setValue: setGroupBy,
        options: createGroupByOptions(),
      }}
    />
  );
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

export function WithActions() {
  return (
    <GridTableLayoutActions
      actions={[
        { label: "Add", onClick: () => {} },
        {
          kind: "menu",
          tooltip: "More actions",
          trigger: { icon: "verticalDots", variant: "outline" },
          defaultOpen: true,
          items: [
            { label: "Export", onClick: () => {} },
            { label: "Import", onClick: () => {} },
            { label: "Archive", onClick: () => {} },
          ],
        },
      ]}
    />
  );
}

type ResponsiveDisplayArgs = {
  hasSearch: boolean;
  filterCount: number;
  hasGroupBy: boolean;
  hasViewModeToggle: boolean;
  hasRowSelection: boolean;
  hasEditColumns: boolean;
  hasListCardView: boolean;
  hasOverflowActions: boolean;
};

/**
 * Inside a container too narrow for the full controls, the toolbar switches to its mobile format once
 * its left and right slots get within 40px of each other. Drag the bottom-right corner to resize, and use
 * the controls to try different combinations.
 */
export const ResponsiveDisplay = newStory(
  (args: ResponsiveDisplayArgs) => {
    const {
      hasSearch,
      filterCount,
      hasGroupBy,
      hasViewModeToggle,
      hasRowSelection,
      hasEditColumns,
      hasListCardView,
      hasOverflowActions,
    } = args;
    const [viewMode, setViewMode] = useState<ViewMode>("cost");
    const responsiveFilterDefs = useMemo(
      () => Object.fromEntries(Object.entries(responsiveFilters).slice(0, filterCount)) as FilterDefs<ResponsiveFilter>,
      [filterCount],
    );
    const layoutState = useGridTableLayoutState<ResponsiveFilter>({
      persistedFilter: filterCount
        ? { filterDefs: responsiveFilterDefs, storageKey: `table-actions-responsive-${filterCount}` }
        : undefined,
      search: hasSearch ? "client" : undefined,
      groupBy: hasGroupBy ? { none: "None", tag: "Tag" } : undefined,
    });
    const tableColumns = useMemo(
      () => (hasRowSelection ? [selectColumn<Row>(), ...columns] : columns),
      [hasRowSelection],
    );

    return (
      <div css={Css.w("600px").maxw("100%").hPx(360).add("resize", "horizontal").oa.ba.bcGray300.px2.$}>
        <GridTableLayout
          layoutState={layoutState}
          selectionSummary={hasRowSelection}
          hideEditColumns={!hasEditColumns}
          withCardView={hasListCardView}
          viewModeToggle={hasViewModeToggle ? viewModeButtons(viewMode, setViewMode) : undefined}
          actions={hasOverflowActions ? [overflowMenu] : undefined}
          tableProps={{ columns: tableColumns, rows: responsiveRows }}
        />
      </div>
    );
  },
  {
    args: {
      hasSearch: true,
      filterCount: 2,
      hasGroupBy: false,
      hasViewModeToggle: true,
      hasRowSelection: true,
      hasEditColumns: true,
      hasListCardView: true,
      hasOverflowActions: true,
    },
    // Explicit controls, since `newStory` hides the render's args from Storybook's control inference
    argTypes: {
      hasSearch: { control: "boolean" },
      filterCount: { control: { type: "range", min: 0, max: 3, step: 1 } },
      hasGroupBy: { control: "boolean" },
      hasViewModeToggle: { control: "boolean" },
      hasRowSelection: { control: "boolean" },
      hasEditColumns: { control: "boolean" },
      hasListCardView: { control: "boolean" },
      hasOverflowActions: { control: "boolean" },
    },
  },
);

type ResponsiveFilter = { needsRevision?: boolean; status?: string[]; archived?: boolean };
const responsiveFilters: FilterDefs<ResponsiveFilter> = {
  ...filterDefs,
  archived: checkboxFilter({ label: "Archived" }),
};

const responsiveRows: GridDataRow<Row>[] = [
  simpleHeader,
  { kind: "data", id: "1", data: { name: "Kitchen", tag: "Interior" }, initSelected: true },
  { kind: "data", id: "2", data: { name: "Garage", tag: "Exterior" }, initSelected: true },
  { kind: "data", id: "3", data: { name: "Patio", tag: "Exterior" } },
];

const overflowMenu: HeaderAction = {
  kind: "menu",
  tooltip: "More actions",
  trigger: { icon: "verticalDots", variant: "outline" },
  items: [
    { label: "Export", onClick: () => {} },
    { label: "Archive", onClick: () => {} },
  ],
};

/** On mobile, the toggle moves to the top of the columns menu; it stays in the toolbar only when it's the sole item there. */
export function WithViewModeToggle() {
  const [viewMode, setViewMode] = useState<ViewMode>("cost");
  return (
    <GridTableLayoutActions
      viewModeToggle={viewModeButtons(viewMode, setViewMode)}
      hasHideableColumns
      columns={columns}
      api={api}
      view="list"
      setView={() => {}}
    />
  );
}

WithViewModeToggle.parameters = { chromatic: { modes: viewportModes("desktop", "mobile1") } };

export function AllFeatures() {
  const [filter, setFilter] = useState<TestFilter>({ status: ["active"] });
  const [view, setView] = useState<TableView>("list");
  const [viewMode, setViewMode] = useState<ViewMode>("cost");
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
      viewModeToggle={viewModeButtons(viewMode, setViewMode)}
      actions={[
        {
          kind: "menu",
          tooltip: "More actions",
          trigger: { icon: "verticalDots", variant: "outline" },
          items: [
            { label: "Export", onClick: () => {} },
            { label: "Import", onClick: () => {} },
            { label: "Archive", onClick: () => {} },
          ],
        },
      ]}
    />
  );
}

type ViewMode = "cost" | "price";

function viewModeButtons(viewMode: ViewMode, setViewMode: (mode: ViewMode) => void) {
  return [
    { text: "Cost", active: viewMode === "cost", onClick: () => setViewMode("cost") },
    { text: "Price", active: viewMode === "price", onClick: () => setViewMode("price") },
  ];
}

function createGroupByOptions() {
  return [
    { id: "none", name: "None" },
    { id: "status", name: "Status" },
    { id: "tag", name: "Tag" },
  ];
}
