import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { FilterDefs, Filters } from "src/components/Filters";
import { ProjectFilter, stageOnSearch } from "src/components/Filters/testDomain";
import { click, render, type } from "src/utils/rtl";

describe("MultiSelectFilter", () => {
  it("shows All by default", async () => {
    const r = await render(<TestFilters defs={{ stage: stageOnSearch }} />);
    expect(r.filter_stage).toHaveValue("All");
  });

  it("allows searching inside the filter", async () => {
    const r = await render(<TestFilters defs={{ stage: stageOnSearch }} />);
    // Given a multi-select filter
    click(r.filter_stage);
    click(r.getByRole("option", { name: "One" }));

    // And when typing in a value
    type(r.filter_stage, "One");
    // Then expect the searched value to be set
    expect(r.filter_value).toHaveTextContent(JSON.stringify({ stage: ["ONE"] }));
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