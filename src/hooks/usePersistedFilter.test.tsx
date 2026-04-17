import { withRouter } from "@homebound/rtl-react-router-utils";
import { useMemo, useRef, useState } from "react";
import { booleanFilter, FilterDefs, Filters, singleFilter } from "src/components/Filters";
import { ProjectFilter, Stage, taskCompleteFilter, taskDueFilter } from "src/components/Filters/testDomain";
import { usePersistedFilter } from "src/hooks/usePersistedFilter";
import { objectId } from "src/utils/objectId";
import { click, render, wait } from "src/utils/rtl";

describe("usePersistedFilter", () => {
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
    expect(r.filter_stageSingle).toHaveValue("All");
    expect(r.applied.textContent).toEqual("{}");
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
    expect(r.filter_stageSingle).toHaveValue("One");
    expect(r.applied.textContent).toEqual(`{"stageSingle":"ONE"}`);
  });

  it("uses default filter for booleans", async () => {
    // Given a filter with a default value
    type FavoriteFilter = FilterDefs<ProjectFilter>["favorite"];
    const favorite: FavoriteFilter = booleanFilter({ defaultValue: true });
    const r = await render(<TestPage filterDefs={{ favorite }} />, withRouter());
    await wait();
    // Then the filter renders with one
    expect(r.applied.textContent).toEqual(`{"favorite":true}`);
  });

  it("keeps a stable filter value across rerenders", async () => {
    type StageFilter = FilterDefs<ProjectFilter>["stageSingle"];
    const stage: StageFilter = singleFilter({
      options: [{ stage: Stage.StageOne }, { stage: Stage.StageTwo }],
      getOptionValue: (s) => s.stage,
      getOptionLabel: (s) => (s.stage === Stage.StageOne ? "One" : "Two"),
      defaultValue: Stage.StageOne,
    });
    const r = await render(<StableFilterTestPage filterDefs={{ stageSingle: stage }} />, withRouter());
    expect(r.filterIds.textContent).toEqual("[1,1]");
    click(r.rerenderButton);
    expect(r.filterIds.textContent).toEqual("[1,1,1]");
  });

  it("rehydrates plain date strings for persisted date filters", async () => {
    const r = await render(
      <TestPage filterDefs={{ date: taskDueFilter }} />,
      withRouter(createFilterRoute({ date: { op: "ON", value: "2020-01-29" } })),
    );
    expect(r.filter_taskDue_dateOperation).toHaveValue("On");
    expect(r.filter_taskDue_dateField).toHaveValue("01/29/20");
    expect(r.applied.textContent).toEqual('{"date":{"op":"ON","value":"2020-01-29"}}');
  });

  it("rehydrates legacy timestamp strings for persisted date range filters", async () => {
    const r = await render(
      <TestPage filterDefs={{ dateRange: taskCompleteFilter }} />,
      withRouter(
        createFilterRoute({
          dateRange: {
            op: "BETWEEN",
            value: { from: "2020-01-02T12:00:00.000Z", to: "2020-01-19T12:00:00.000Z" },
          },
        }),
      ),
    );
    expect(r.filter_taskCompleted_dateField).toHaveValue("01/02/20 - 01/19/20");
    expect(r.applied.textContent).toEqual(
      '{"dateRange":{"op":"BETWEEN","value":{"from":"2020-01-02","to":"2020-01-19"}}}',
    );
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

function StableFilterTestPage(props: { filterDefs: FilterDefs<ProjectFilter> }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterDefs = useMemo(() => props.filterDefs, []);
  const { filter } = usePersistedFilter({ storageKey: "test", filterDefs });
  const [tick, setTick] = useState(0);
  const filterIds = useRef<number[]>([]);
  filterIds.current.push(objectId(filter));
  return (
    <div>
      <button data-testid="rerenderButton" onClick={() => setTick((tick) => tick + 1)}>
        {tick}
      </button>
      <div data-testid="filterIds">{JSON.stringify(filterIds.current)}</div>
    </div>
  );
}

function createFilterRoute(filter: unknown): string {
  return `/?filter=${encodeURIComponent(JSON.stringify(filter))}`;
}
