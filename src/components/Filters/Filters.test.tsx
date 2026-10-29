import { booleanFilter } from "src/components/Filters/BooleanFilter";
import { Filters } from "src/components/Filters/Filters";
import { multiFilter } from "src/components/Filters/MultiFilter";
import { singleFilter } from "src/components/Filters/SingleFilter";
import { type ProjectFilter, Stage } from "src/components/Filters/testDomain";
import type { FilterDefs } from "src/components/Filters/types";
import { render, select } from "src/utils/rtl";
import { vi } from "vitest";

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

  it("calls setValue when a group by option is selected", async () => {
    // Given a group by field
    const setValue = vi.fn();
    const r = await render(
      <Filters
        filterDefs={{}}
        filter={{}}
        onChange={vi.fn()}
        groupBy={{
          value: "costCode",
          setValue,
          options: [
            { id: "costCode", name: "Cost Code" },
            { id: "tradeCategory", name: "Trade Category" },
          ],
        }}
      />,
    );
    // When Trade Category is selected
    select(r.groupBy, "Trade Category");
    // Then setValue receives the option id
    expect(setValue).toHaveBeenCalledWith("tradeCategory");
  });
});
