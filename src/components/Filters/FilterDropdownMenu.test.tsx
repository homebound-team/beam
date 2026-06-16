import { useMemo, useState } from "react";
import { click, render, withRouter } from "src/utils/rtl";
import { checkboxFilter } from "./CheckboxFilter";
import { FilterDropdownMenu } from "./FilterDropdownMenu";
import { multiFilter } from "./MultiFilter";
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
        initialFilter={{ status: "active" }}
      />,
      withRouter(),
    );

    // Chip should be visible when dropdown is closed
    expect(r.filter_chip_status).toBeInTheDocument();
    expect(r.filter_chip_status).toHaveTextContent("Active");
  });

  it("displays option labels for multiFilter values stored as ids", async () => {
    // Given a multiFilter with assignee ids and matching option labels
    type TestFilter = { assignee?: string[] };
    const r = await render(
      <TestFilterDropdownMenu<TestFilter>
        filterDefs={{
          assignee: multiFilter({
            options: [
              { label: "John Doe", value: "u:1" },
              { label: "Jane Smith", value: "u:2" },
            ],
            getOptionLabel: (a) => a.label,
            getOptionValue: (a) => a.value,
            label: "Assignee",
          }),
        }}
        initialFilter={{ assignee: ["u:2"] }}
      />,
      withRouter(),
    );

    // Then the chip shows the option label, not the raw id
    expect(r.filter_chip_assignee_u2).toBeInTheDocument();
    expect(r.filter_chip_assignee_u2).toHaveTextContent("Jane Smith");
  });

  it("displays the filter label for checkbox filters", async () => {
    // Given a checkbox filter with a selected true value
    type TestFilter = { needsRevision?: boolean };
    const r = await render(
      <TestFilterDropdownMenu<TestFilter>
        filterDefs={{
          needsRevision: checkboxFilter({
            label: "Needs Revision",
          }),
        }}
        initialFilter={{ needsRevision: true }}
      />,
      withRouter(),
    );

    // Then the chip shows the filter label
    expect(r.filter_chip_needsRevision).toBeInTheDocument();
    expect(r.filter_chip_needsRevision).toHaveTextContent("Needs Revision");
  });

  it("does not display a chip when a checkbox filter is inactive", async () => {
    // Given a checkbox filter with offValue set to false and the filter unchecked
    type TestFilter = { needsRevision?: boolean };
    const r = await render(
      <TestFilterDropdownMenu<TestFilter>
        filterDefs={{
          needsRevision: checkboxFilter({
            label: "Needs Revision",
            offValue: false,
          }),
        }}
        initialFilter={{ needsRevision: false }}
      />,
      withRouter(),
    );

    // Then no chip is shown for the inactive value
    expect(r.query.filter_chip_needsRevision).toBeNull();
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

  it("shows labels for lazy options when current includes selected values", async () => {
    // Given lazy options with current set to the selected assignee
    const r = await render(<LazySelectedAssigneeHarness />, withRouter());

    // Then the chip shows the label from current, not the raw id
    expect(r.filter_chip_assignee_u2).toHaveTextContent("Jane Smith");
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

function LazySelectedAssigneeHarness() {
  type TestFilter = { assignee?: string[] };

  const [loaded, setLoaded] = useState<Array<{ label: string; value: string }>>();
  const filterDefs = useMemo(
    () => ({
      assignee: multiFilter({
        options: {
          current: { label: "Jane Smith", value: "u:2" },
          load: async () => {
            setLoaded([
              { label: "John Doe", value: "u:1" },
              { label: "Jane Smith", value: "u:2" },
              { label: "Bob Johnson", value: "u:3" },
            ]);
          },
          options: loaded,
        },
        getOptionLabel: (a) => a.label,
        getOptionValue: (a) => a.value,
        label: "Assignee",
      }),
    }),
    [loaded],
  );

  return <FilterDropdownMenu<TestFilter> filterDefs={filterDefs} filter={{ assignee: ["u:2"] }} onChange={() => {}} />;
}
