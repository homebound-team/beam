import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { FilterDefs, Filters } from "src/components/Filters";
import { ProjectFilter, taskCompleteFilter } from "src/components/Filters/testDomain";
import { click, render, type } from "src/utils/rtl";

describe("DateRangeFilter", () => {
  it("shows date placeholder text when not given an initial value", async () => {
    const r = await render(<TestFilters defs={{ dateRange: taskCompleteFilter }} />);

    expect(r.filter_taskCompleted_dateField()).toHaveProperty("placeholder", "This is some placeholder text");

    expect(r.filter_taskCompleted_dateField()).toHaveValue("");
  });

  it("shows clear btn when a value is present", async () => {
    const r = await render(<TestFilters defs={{ dateRange: taskCompleteFilter }} />);
    const dateField = r.filter_taskCompleted_dateField();

    expect(r.queryByTestId("xCircle")).toBeNull();

    type(dateField, "01/02/20 - 01/19/20");

    expect(r.xCircle()).toBeTruthy();
  });

  it("clears text when clear btn is pressed", async () => {
    const r = await render(<TestFilters defs={{ dateRange: taskCompleteFilter }} />);
    const dateField = r.filter_taskCompleted_dateField();

    type(dateField, "01/02/20 - 01/19/20");

    click(r.xCircle());

    expect(r.filter_taskCompleted_dateField()).toHaveValue("");
  });

  it("does not show clear btn when datePicker is open", async () => {
    const r = await render(<TestFilters defs={{ dateRange: taskCompleteFilter }} />);
    const dateField = r.filter_taskCompleted_dateField();

    type(dateField, "01/02/20 - 01/19/20");

    expect(r.xCircle()).toBeTruthy();

    fireEvent.focus(dateField);

    expect(r.queryByTestId("xCircle")).toBeNull();
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
