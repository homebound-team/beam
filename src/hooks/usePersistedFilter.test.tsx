import { withRouter } from "@homebound/rtl-react-router-utils";
import { render, wait } from "@homebound/rtl-utils";
import { useMemo } from "react";
import { booleanFilter, FilterDefs, Filters, singleFilter } from "src/components/Filters";
import { ProjectFilter, Stage } from "src/components/Filters/testDomain";
import { usePersistedFilter } from "src/hooks/usePersistedFilter";

describe("usePersistedFilter", () => {
  beforeEach(() => sessionStorage.clear());

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
    expect(r.filter_stageSingle()).toHaveValue("");
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

  it("uses default filter for booleans", async () => {
    // Given a filter with a default value
    type FavoriteFilter = FilterDefs<ProjectFilter>["favorite"];
    const favorite: FavoriteFilter = booleanFilter({ defaultValue: true });
    const r = await render(<TestPage filterDefs={{ favorite }} />, withRouter());
    await wait();
    // Then the filter renders with one
    expect(r.applied().textContent).toEqual(`{"favorite":true}`);
  });
});

function TestPage(props: { filterDefs: FilterDefs<ProjectFilter> }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterDefs = useMemo(() => props.filterDefs, []);
  const { filter, setFilter } = usePersistedFilter({ storageKey: "test", filterDefs });
  return (
    <div>
      <Filters filter={filter} filterDefs={filterDefs} onChange={setFilter} />
      Applied: <div data-testid="applied">{JSON.stringify(filter)}</div>
    </div>
  );
}
