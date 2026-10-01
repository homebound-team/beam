import { useState } from "react";
import { booleanFilter } from "src/components/Filters/BooleanFilter";
import { Filters } from "src/components/Filters/Filters";
import { multiFilter } from "src/components/Filters/MultiFilter";
import { singleFilter } from "src/components/Filters/SingleFilter";
import { type ProjectFilter, Stage } from "src/components/Filters/testDomain";
import type { FilterDefs } from "src/components/Filters/types";
import type { HasIdAndName } from "src/types";
import { click, getOptions, render, type } from "src/utils/rtl";
import { zeroTo } from "src/utils/sb";

describe("Filters", () => {
  it("can match GQL types of enum arrays", () => {
    // Given a filter with an enum[]
    type StageFilter = FilterDefs<ProjectFilter>["stage"];
    // type StageFilter = FilterDef<Stage[]>;
    // Then we can assign multiFilter to it
    const f: StageFilter = multiFilter({
      options: [Stage.StageOne, Stage.StageTwo],
      getOptionValue: (s) => s,
      getOptionLabel: () => "name",
    });
    expect(f).toBeDefined();
  });

  it("can match GQL types of single enum", () => {
    // Given a filter with a enum
    type StageFilter = FilterDefs<ProjectFilter>["stageSingle"];
    // type StageFilter = FilterDef<Stage>;
    // Then we can assign singleFilter to it
    const f: StageFilter = singleFilter({
      options: [Stage.StageOne, Stage.StageTwo],
      getOptionValue: (s) => s,
      getOptionLabel: (s) => "name",
    });
    expect(f).toBeDefined();
  });

  it("can match GQL types of boolean", () => {
    // Given a filter with a boolean
    type FavoriteFilter = FilterDefs<ProjectFilter>["favorite"];
    // type StageFilter = FilterDef<Stage>;
    // Then we can assign singleFilter to it
    const f: FavoriteFilter = booleanFilter({
      options: [
        [undefined, "All"],
        [true, "Favorited"],
        [false, "Not favorited"],
      ],
      label: "Favorite Status",
    });
    expect(f).toBeDefined();
  });

  it("filters menu options as the user types", async () => {
    // Given a multi filter with two options
    const r = await render(<TestFilterSearch />);

    // When opening the menu and searching
    click(r.filter_multi);
    type(r.filter_multi_search, "1");

    // Then only the matching option remains
    expect(getOptions(r.filter_multi)).toEqual(["Project 1"]);
  });
});

function TestFilterSearch() {
  const options: HasIdAndName[] = zeroTo(2).map((i) => ({
    id: `p:${i}`,
    name: `Project ${i}`,
  }));
  type MultiFilter = { stage?: string[] };

  const defs: FilterDefs<MultiFilter> = {
    stage: multiFilter({
      options,
      label: "Multi",
      getOptionValue: (o) => o.id,
      getOptionLabel: (o) => o.name,
    }),
  };

  const [filter, setFilter] = useState<MultiFilter>({});
  return <Filters filterDefs={defs} filter={filter} onChange={setFilter} />;
}
