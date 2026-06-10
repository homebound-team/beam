import { useState } from "react";
import { click, render, withRouter } from "src/utils/rtl";
import { FilterDropdownMenu } from "./FilterDropdownMenu";
import { singleFilter } from "./SingleFilter";
import { FilterDefs } from "./types";

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
      withRouter(),
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
        initialFilter={{ status: "Active" }}
      />,
      withRouter(),
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
      withRouter(),
    );

    // Click the chip
    click(r.filter_chip_status);

    // Filter should be cleared
    expect(r.filterValue).toHaveTextContent("{}");
  });

  it("shows the search bar when props are provided", async () => {
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
        searchProps={{ onSearch: (v: string) => {} }}
      />,
      withRouter(),
    );

    expect(r.search).toBeInTheDocument();
  });

  it("hides the filters if no filter props are provided", async () => {
    const r = await render(
      <TestFilterDropdownMenu<Record<string, never>> filterDefs={{}} searchProps={{ onSearch: (v: string) => {} }} />,
      withRouter(),
    );

    expect(r.query.filter_button).not.toBeInTheDocument();
  });
});

function TestFilterDropdownMenu<F extends Record<string, unknown>>(props: {
  filterDefs: FilterDefs<F>;
  initialFilter?: F;
  groupBy?: {
    value: string;
    setValue: (groupBy: string) => void;
    options: Array<{ id: string; name: string }>;
  };
  searchProps?: {
    onSearch: (value: string) => void;
  };
}) {
  const [filter, setFilter] = useState<F>(props.initialFilter || ({} as F));
  return (
    <>
      <FilterDropdownMenu
        filterDefs={props.filterDefs}
        filter={filter}
        onChange={setFilter}
        groupBy={props.groupBy}
        searchProps={props.searchProps}
      />
      <div data-testid="filterValue">{JSON.stringify(filter)}</div>
    </>
  );
}
