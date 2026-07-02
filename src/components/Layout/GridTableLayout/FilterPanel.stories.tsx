import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import type { FilterDefs } from "src/components/Filters";
import { checkboxFilter, multiFilter } from "src/components/Filters";
import { Value } from "src/inputs/Value";
import { withBeamDecorator, withRouter } from "src/utils/sb";
import { buildFilterImpls, FilterPanel } from "./FilterPanel";

export default {
  component: FilterPanel,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "padded" },
} satisfies Meta;

export function OpenWithControls() {
  const [filter, setFilter] = useState<TestFilter>({});
  return (
    <FilterPanel
      isOpen={true}
      filterImpls={filterImpls}
      filter={filter}
      setFilter={setFilter}
      onClear={() => setFilter({})}
    />
  );
}

export function ClosedWithChips() {
  const [filter, setFilter] = useState<TestFilter>({ needsRevision: true, status: ["active"] });
  return (
    <FilterPanel
      isOpen={false}
      filterImpls={filterImpls}
      filter={filter}
      setFilter={setFilter}
      onClear={() => setFilter({})}
    />
  );
}

export function WithGroupBy() {
  const [filter, setFilter] = useState<TestFilter>({});
  const [groupByValue, setGroupByValue] = useState<string>("none");
  return (
    <FilterPanel
      isOpen={true}
      filterImpls={filterImpls}
      filter={filter}
      setFilter={setFilter}
      onClear={() => setFilter({})}
      groupBy={{
        value: groupByValue as Value,
        setValue: (v) => setGroupByValue(v as string),
        options: groupByOptions,
      }}
    />
  );
}

export function Empty() {
  return <FilterPanel isOpen={false} filterImpls={filterImpls} filter={{}} setFilter={() => {}} onClear={() => {}} />;
}

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
const filterImpls = buildFilterImpls(filterDefs);

type GroupOption = { id: string; name: string };
const groupByOptions: GroupOption[] = [
  { id: "none", name: "None" },
  { id: "status", name: "Status" },
];
