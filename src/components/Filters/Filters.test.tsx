import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { booleanFilter, FilterDefs, Filters, multiFilter, singleFilter } from "src/components/Filters";
import { ProjectFilter, Stage } from "src/components/Filters/testDomain";
import { click, render } from "src/utils/rtl";
import { MultiFilterProps } from "./MultiFilter";
import { HasIdAndName } from "src/types";
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

  it("can filter multi select filter", async () => {
    // Given a MultiSelectFilter with options
    const r = await render(<TestFilter />);
    // When opening the options
    click(r.filter_multi);
    // Then all options are visible
    expect(r.queryAllByRole("option")).toHaveLength(2);
   
    // And typing in the filter input
    fireEvent.input(r.filter_multi, { target: { value: "1" } });
    expect(r.filter_multi).toHaveValue("1");
    
    // Then only the Project one option is visible
    expect(r.queryAllByRole("option")).toHaveLength(1);
    expect(r.getByRole("option", { name: "Project 1" })).toBeVisible();
  });
});

function TestFilter(props: Partial<MultiFilterProps<HasIdAndName, string>>) {
  const options: HasIdAndName[] = zeroTo(2).map((i) => ({
    id: `p:${i}`,
    name: `Project ${i}`,
  }));


  type MultiFilter = { stage?: string[] };

  const defs: FilterDefs<MultiFilter> = {
    stage: multiFilter({
      options: options,
      label: "Multi",
      getOptionValue: (o) => o.id,
      getOptionLabel: (o) => o.name,
      ...props,
    }),
  };

  const [filter, setFilter] = useState<MultiFilter>({ stage: props.defaultValue });
  return (
    <div>
      <Filters filterDefs={defs} filter={filter} onChange={setFilter} />
      <div data-testid="value">{JSON.stringify(filter)}</div>
    </div>
  );
}
