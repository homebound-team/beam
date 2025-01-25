import { wait } from "@homebound/rtl-utils";
import { jest } from "@jest/globals";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { booleanFilter, FilterDefs, Filters, multiFilter, singleFilter } from "src/components/Filters";
import { ProjectFilter, Stage } from "src/components/Filters/testDomain";
import { HasIdAndName } from "src/types";
import { click, render } from "src/utils/rtl";
import { zeroTo } from "src/utils/sb";
import { useDebounce } from "use-debounce";
import { MultiFilterProps } from "./MultiFilter";

jest.mock("use-debounce", () => {
  const debounceMock = jest.fn((value, delay) => [value]); // Define the mock inline
  return {
    useDebounce: debounceMock,
  };
});

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

  it("calls onSearch with the debounced value", async () => {
    const onSearchMock = jest.fn();
    const debounceMock = jest.mocked(useDebounce);
    // Given a stateful component that has initial values set
    const r = await render(<TestFilterSearch onSearch={onSearchMock} />);

    // When opening the options and typing in the filter input
    click(r.filter_multi);
    fireEvent.input(r.filter_multi, { target: { value: "1" } });
    // Wait for `onSearch/debounce` to be called
    await wait();

    // Then the only remaining option is one and the onSearch/debounce function was called with the correct value and delay
    expect(r.queryAllByRole("option")).toHaveLength(1);
    expect(onSearchMock).toHaveBeenCalledWith("1");
    expect(debounceMock).toHaveBeenCalledWith("1", 300);
  });
});

function TestFilterSearch(props: Partial<MultiFilterProps<HasIdAndName, string>>, onSelectMock = jest.fn()) {
  const [search, setSearch] = useState<string | undefined>("");

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
      onSearch: (input) => {
        onSelectMock(input);
        setSearch(input);
      },
      ...props,
    }),
  };

  const [filter, setFilter] = useState<MultiFilter>({ stage: props.defaultValue });
  return (
    <div>
      <button data-testid="update" onClick={() => setSearch("baseball")} />
      <Filters filterDefs={defs} filter={filter} onChange={setFilter} />
      <div data-testid="value">{JSON.stringify(filter)}</div>
    </div>
  );
}
