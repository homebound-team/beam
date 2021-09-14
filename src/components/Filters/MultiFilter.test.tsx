import { useState } from "react";
import { FilterDefs, Filters } from "src/components/Filters";
import { ProjectFilter, stageFilter, stageFilterDefaultValue } from "src/components/Filters/testDomain";
import { render } from "src/utils/rtl";

describe("MultiSelectFilter", () => {
  it("shows All by default", async () => {
    const r = await render(<TestFilters defs={{ stage: stageFilter }} />);
    expect(r.filter_stage()).toHaveValue("All");
  });

  it("shows defaultValue when given", async () => {
    // Given a MultiSelectFilter with a default value
    // When rendering
    const r = await render(<TestFilters defs={{ stage: stageFilterDefaultValue }} />);
    // Then expect the value to match the default value
    expect(r.filter_stage()).toHaveValue("Two");
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
