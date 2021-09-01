import { click } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { FilterDefs, Filters } from "src/components/Filters";
import { ProjectFilter, stageSingleFilter } from "src/components/Filters/testDomain";
import { render } from "src/utils/rtl";

describe("SingleSelectFilter", () => {
  it("shows All by default", async () => {
    const r = await render(<TestFilters defs={{ stageSingle: stageSingleFilter }} />);
    expect(r.filter_stageSingle()).toHaveValue("All");
  });

  it("shows All as an option to unset the filter", async () => {
    const r = await render(<TestFilters defs={{ stageSingle: stageSingleFilter }} />);
    // Given we select a filter
    fireEvent.focus(r.filter_stageSingle());
    click(r.getByRole("option", { name: "One" }));
    expect(r.filter_value()).toHaveTextContent(`{"stageSingle":"ONE"}`);
    // When we select All
    fireEvent.focus(r.filter_stageSingle());
    click(r.getByRole("option", { name: "All" }));
    // Then it is unset
    expect(r.filter_value()).toHaveTextContent(`{}`);
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
