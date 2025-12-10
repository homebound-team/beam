import { useState } from "react";
import { click, render } from "src/utils/rtl";
import { FilterDropdownMenu } from "./FilterDropdownMenu";
import { singleFilter } from "./SingleFilter";
import { FilterDefs } from "./types";
import { GroupByConfig } from "./utils";

describe("FilterDropdownMenu", () => {
  it("shows filters when button is clicked", async () => {
    type TestFilter = { status?: string };
    const r = await render(
      <TestFilterDropdownMenu<TestFilter>
        filterDefs={{
          status: singleFilter({
            options: [
              { id: "active", name: "Active" },
              { id: "inactive", name: "Inactive" },
            ],
            getOptionValue: (o) => o.id,
            getOptionLabel: (o) => o.name,
          }),
        }}
      />,
    );

    // Filters should not be visible initially
    expect(r.query.filter_status).not.toBeInTheDocument();

    // Click the filter button
    click(r.filter_button);

    // Filters should now be visible
    expect(r.filter_status).toBeInTheDocument();
  });

  it("displays chips when filters are selected and dropdown is closed", async () => {
    type TestFilter = { status?: string };
    const r = await render(
      <TestFilterDropdownMenu<TestFilter>
        filterDefs={{
          status: singleFilter({
            options: [
              { id: "active", name: "Active" },
              { id: "inactive", name: "Inactive" },
            ],
            getOptionValue: (o) => o.id,
            getOptionLabel: (o) => o.name,
          }),
        }}
        initialFilter={{ status: "active" }}
      />,
    );

    // Chip should be visible when dropdown is closed
    expect(r.filter_chip_status).toBeInTheDocument();
    expect(r.filter_chip_status).toHaveTextContent("Active");
  });

  it("removes filter when chip is clicked", async () => {
    type TestFilter = { status?: string };
    const r = await render(
      <TestFilterDropdownMenu<TestFilter>
        filterDefs={{
          status: singleFilter({
            options: [
              { id: "active", name: "Active" },
              { id: "inactive", name: "Inactive" },
            ],
            getOptionValue: (o) => o.id,
            getOptionLabel: (o) => o.name,
          }),
        }}
        initialFilter={{ status: "active" }}
      />,
    );

    // Click the chip
    click(r.filter_chip_status);

    // Filter should be cleared
    expect(r.filterValue).toHaveTextContent("{}");
  });
});

function TestFilterDropdownMenu<F extends Record<string, unknown>>(props: {
  filterDefs: FilterDefs<F>;
  initialFilter?: F;
  groupBy?: GroupByConfig;
}) {
  const [filter, setFilter] = useState<F>(props.initialFilter || ({} as F));
  return (
    <div>
      <FilterDropdownMenu filterDefs={props.filterDefs} filter={filter} onChange={setFilter} groupBy={props.groupBy} />
      <div data-testid="filterValue">{JSON.stringify(filter)}</div>
    </div>
  );
}
