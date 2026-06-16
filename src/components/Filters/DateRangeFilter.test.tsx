import { useState } from "react";
import { FilterDefs, Filters } from "src/components/Filters";
import { dateRangeFilter } from "src/components/Filters/DateRangeFilter";
import { ProjectFilter, taskCompleteFilter } from "src/components/Filters/testDomain";
import { click, render, type } from "src/utils/rtl";
import { jan19, jan2 } from "src/utils/testDates";

describe("DateRangeFilter", () => {
  it("shows date placeholder text when not given an initial value", async () => {
    const r = await render(<TestFilters defs={{ dateRange: taskCompleteFilter }} />);

    expect(r.filter_taskCompleted_dateField).toHaveProperty("placeholder", "This is some placeholder text");

    expect(r.filter_taskCompleted_dateField).toHaveValue("");
  });

  it("shows clear btn when a value is present", async () => {
    const r = await render(<TestFilters defs={{ dateRange: taskCompleteFilter }} />);
    expect(r.queryByTestId("xCircle")).toBeNull();
    type(r.filter_taskCompleted_dateField, "01/02/20 - 01/19/20");
    expect(r.xCircle).toBeTruthy();
  });

  it("clears text when clear btn is pressed", async () => {
    const r = await render(<TestFilters defs={{ dateRange: taskCompleteFilter }} />);
    type(r.filter_taskCompleted_dateField, "01/02/20 - 01/19/20");
    click(r.xCircle);
    expect(r.filter_taskCompleted_dateField).toHaveValue("");
  });

  it("does not show clear btn when datePicker is open", async () => {
    const r = await render(<TestFilters defs={{ dateRange: taskCompleteFilter }} />);
    type(r.filter_taskCompleted_dateField, "01/02/20 - 01/19/20");
    expect(r.xCircle).toBeTruthy();
    click(r.filter_taskCompleted_dateField);
    expect(r.queryByTestId("xCircle")).toBeNull();
  });

  it("returns the formatted date range", () => {
    // Given a dateRangeFilter
    const filter = dateRangeFilter({ label: "Task Completed" })("taskCompleted");

    // When formatting the label for a selected date range
    const label = filter.formatSelectedFilterLabel({
      op: "between",
      value: { from: jan2, to: jan19 },
    });

    // Then the formatted range is returned
    expect(label).toBe("01/02/2020 - 01/19/2020");
  });

  it("returns undefined when the range has no dates", () => {
    // Given a dateRangeFilter
    const filter = dateRangeFilter({ label: "Task Completed" })("taskCompleted");

    // When formatting the label with an empty date range
    const label = filter.formatSelectedFilterLabel({
      op: "between",
      value: { from: undefined, to: undefined },
    });

    // Then no chip label is produced
    expect(label).toBeUndefined();
  });
});

function TestFilters(props: { defs: FilterDefs<ProjectFilter> }) {
  const { defs } = props;
  const [filter, setFilter] = useState<ProjectFilter>({});
  return (
    <div>
      <Filters filterDefs={defs} filter={filter} onChange={setFilter} />
      <div data-testid="filter_value">{JSON.stringify(filter)}</div>
    </div>
  );
}
