import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { FilterDefs, Filters } from "src/components/Filters";
import { ProjectFilter, taskDueFilter } from "src/components/Filters/testDomain";
import { click, render, type } from "src/utils/rtl";

describe("DateFilter", () => {
  it("shows Any operation and date field is disabled by default", async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const year = `${today.getFullYear()}`.substring(2);

    const r = await render(<TestFilters defs={{ date: taskDueFilter }} />);
    expect(r.filter_taskDue_dateOperation).toHaveValue("Any");
    expect(r.filter_taskDue_dateField)
      .toBeDisabled()
      .toHaveValue(`${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day}/${year}`);
  });

  it("can set and unset the date filter", async () => {
    const r = await render(<TestFilters defs={{ date: taskDueFilter }} />);
    // Given we select an operation
    fireEvent.click(r.filter_taskDue_dateOperation);
    click(r.getByRole("option", { name: "On" }));
    // Then the date field should become enabled
    expect(r.filter_taskDue_dateField).not.toBeDisabled();
    // And we type in a new date
    type(r.filter_taskDue_dateField, "10/31/21");
    // Then the filter should be set (intentionally omitting the time value from the 'date' value)
    expect(r.filter_value).toHaveTextContent('{"date":{"op":"ON","value":"2021-10-31T');
    // When we select Any
    fireEvent.click(r.filter_taskDue_dateOperation);
    click(r.getByRole("option", { name: "Any" }));
    // Then the date field is disabled
    expect(r.filter_taskDue_dateField).toBeDisabled();
    // And it is unset
    expect(r.filter_value).toHaveTextContent(`{}`);
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
