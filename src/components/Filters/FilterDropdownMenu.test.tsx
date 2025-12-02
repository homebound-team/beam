import { useState } from "react";
import { click, render } from "src/utils/rtl";
import { checkboxFilter } from "./CheckboxFilter";
import { FilterDropdownMenu } from "./FilterDropdownMenu";
import { multiFilter } from "./MultiFilter";
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
    expect(r.queryByTestId("filterDropdown_status")).not.toBeInTheDocument();

    // Click the filter button
    click(r.filterDropdown_button);

    // Filters should now be visible
    expect(r.filterDropdown_status).toBeInTheDocument();
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
    expect(r.filterDropdown_chip_status).toBeInTheDocument();
    expect(r.filterDropdown_chip_status).toHaveTextContent("Active");
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
    click(r.filterDropdown_chip_status);

    // Filter should be cleared
    expect(r.filterValue).toHaveTextContent("{}");
  });

  it("shows all chips with wrapping", async () => {
    type TestFilter = { tags?: string[] };
    const r = await render(
      <TestFilterDropdownMenu<TestFilter>
        filterDefs={{
          tags: multiFilter({
            options: [
              { id: "one", name: "One" },
              { id: "two", name: "Two" },
              { id: "three", name: "Three" },
              { id: "four", name: "Four" },
              { id: "five", name: "Five" },
              { id: "six", name: "Six" },
              { id: "seven", name: "Seven" },
              { id: "eight", name: "Eight" },
            ],
            getOptionValue: (o) => o.id,
            getOptionLabel: (o) => o.name,
          }),
        }}
        initialFilter={{ tags: ["one", "two", "three", "four", "five", "six", "seven", "eight"] }}
      />,
    );

    // All chips should be visible
    expect(r.filterDropdown_chip_tags_one).toBeInTheDocument();
    expect(r.filterDropdown_chip_tags_two).toBeInTheDocument();
    expect(r.filterDropdown_chip_tags_three).toBeInTheDocument();
    expect(r.filterDropdown_chip_tags_four).toBeInTheDocument();
    expect(r.filterDropdown_chip_tags_five).toBeInTheDocument();
    expect(r.filterDropdown_chip_tags_six).toBeInTheDocument();
    expect(r.filterDropdown_chip_tags_seven).toBeInTheDocument();
    expect(r.filterDropdown_chip_tags_eight).toBeInTheDocument();
  });

  it("renders checkbox filters after non-checkbox filters", async () => {
    type TestFilter = { status?: string; archived?: boolean; priority?: string };
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
          archived: checkboxFilter({ label: "Archived" }),
          priority: singleFilter({
            options: [
              { id: "high", name: "High" },
              { id: "low", name: "Low" },
            ],
            getOptionValue: (o) => o.id,
            getOptionLabel: (o) => o.name,
          }),
        }}
      />,
    );

    // Open dropdown
    click(r.filterDropdown_button);

    // Get all filter elements
    const filters = r.container.querySelectorAll("[data-testid^='filterDropdown_']");
    const filterIds = Array.from(filters).map((el) => el.getAttribute("data-testid"));

    // Status and priority should come before archived
    const statusIndex = filterIds.indexOf("filterDropdown_status");
    const priorityIndex = filterIds.indexOf("filterDropdown_priority");
    const archivedIndex = filterIds.indexOf("filterDropdown_archived");

    expect(statusIndex).toBeGreaterThan(-1);
    expect(priorityIndex).toBeGreaterThan(-1);
    expect(archivedIndex).toBeGreaterThan(-1);
    expect(archivedIndex).toBeGreaterThan(statusIndex);
    expect(archivedIndex).toBeGreaterThan(priorityIndex);
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
