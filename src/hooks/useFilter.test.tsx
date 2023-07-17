import { useMemo } from "react";
import { FilterDefs, Filters, singleFilter } from "src/components";
import { ProjectFilter, Stage } from "src/components/Filters/testDomain";
import { useFilter } from "src/hooks/useFilter";
import { render, wait, withRouter } from "src/utils/rtl";

describe("useFilter", () => {
  it("initializes with no default values", async () => {
    // Given a singleFilter with no default value
    type StageFilter = FilterDefs<ProjectFilter>["stageSingle"];
    const stage: StageFilter = singleFilter({
      options: [{ stage: Stage.StageOne }, { stage: Stage.StageTwo }],
      getOptionValue: (s) => s.stage,
      getOptionLabel: (s) => (s.stage === Stage.StageOne ? "One" : "Two"),
    });
    const r = await render(<TestPage filterDefs={{ stageSingle: stage }} />, withRouter());
    // Then the filter is initially empty
    expect(r.filter_stageSingle()).toHaveValue("All");
    expect(r.applied().textContent).toEqual("{}");
  });

  it("uses default filter", async () => {
    // Given a filter with a default value
    type StageFilter = FilterDefs<ProjectFilter>["stageSingle"];
    const stage: StageFilter = singleFilter({
      options: [{ stage: Stage.StageOne }, { stage: Stage.StageTwo }],
      getOptionValue: (s) => s.stage,
      getOptionLabel: (s) => (s.stage === Stage.StageOne ? "One" : "Two"),
      defaultValue: Stage.StageOne,
    });
    const r = await render(<TestPage filterDefs={{ stageSingle: stage }} />, withRouter());
    await wait();
    // Then the filter renders with one
    expect(r.filter_stageSingle()).toHaveValue("One");
    expect(r.applied().textContent).toEqual(`{"stageSingle":"ONE"}`);
  });
});

function TestPage(props: { filterDefs: FilterDefs<ProjectFilter> }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterDefs = useMemo(() => props.filterDefs, []);
  const { filter, setFilter } = useFilter({ filterDefs });
  return (
    <div>
      <Filters filter={filter} filterDefs={filterDefs} onChange={setFilter} />
      Applied: <div data-testid="applied">{JSON.stringify(filter)}</div>
    </div>
  );
}
