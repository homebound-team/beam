import { useState } from "react";
import { Filters } from "src/components/Filters/Filters";
import { singleFilter } from "src/components/Filters/SingleFilter";
import {
  type ProjectFilter,
  stageFilterWithNothingSelectedText,
  stageSingleFilter,
} from "src/components/Filters/testDomain";
import type { FilterDefs } from "src/components/Filters/types";
import { getOptions, render, select } from "src/utils/rtl";

describe("SingleSelectFilter", () => {
  it("shows All by default", async () => {
    const r = await render(<TestFilters defs={{ stageSingle: stageSingleFilter }} />);
    expect(r.filter_stageSingle).toHaveTextContent("All");
  });

  it("shows All as an option to unset the filter", async () => {
    const r = await render(<TestFilters defs={{ stageSingle: stageSingleFilter }} />);
    // Given we select a filter
    select(r.filter_stageSingle, "One");
    expect(r.filter_value).toHaveTextContent(`{"stageSingle":"ONE"}`);
    // When we select All
    select(r.filter_stageSingle, "All");
    // Then it is unset
    expect(r.filter_value).toHaveTextContent(`{}`);
  });

  it("shows nothigSelectedText when no value is selected", async () => {
    const r = await render(<TestFilters defs={{ stageSingle: stageFilterWithNothingSelectedText }} />);
    expect(r.filter_stageSingle).toHaveTextContent("All Stages");
  });

  it("returns the option label for a matching value", () => {
    // Given a singleFilter with static options
    const filter = singleFilter({
      options: [
        { id: "active", name: "Active" },
        { id: "inactive", name: "Inactive" },
      ],
      getOptionValue: (o) => o.id,
      getOptionLabel: (o) => o.name,
    })("status");

    // When formatting the label for a selected value
    const label = filter.formatSelectedFilterLabel("active");

    // Then the option label is returned
    expect(label).toBe("Active");
  });

  it("lists options alphabetically, with All first", async () => {
    // Given an option that would sort ahead of All
    const r = await render(
      <TestFilters<{ status?: string }>
        defs={{
          status: singleFilter({
            options: [
              { id: "z", name: "Zebra" },
              { id: "a", name: "Aardvark" },
            ],
          }),
        }}
      />,
    );
    // Then All stays first and the rest are sorted
    expect(getOptions(r.filter_status)).toEqual(["All", "Aardvark", "Zebra"]);
  });

  it("keeps the given order when autoSort is false", async () => {
    // Given autoSort turned off
    const r = await render(
      <TestFilters<{ status?: string }>
        defs={{
          status: singleFilter({
            autoSort: false,
            options: [
              { id: "z", name: "Zebra" },
              { id: "a", name: "Aardvark" },
            ],
          }),
        }}
      />,
    );
    // Then the caller order is kept, after All
    expect(getOptions(r.filter_status)).toEqual(["All", "Zebra", "Aardvark"]);
  });

  it("falls back to String(value) when the option is not found", () => {
    // Given a singleFilter whose options do not include the value
    const filter = singleFilter({
      options: [{ id: "active", name: "Active" }],
      getOptionValue: (o) => o.id,
      getOptionLabel: (o) => o.name,
    })("status");

    // When formatting the label for an unknown value
    const label = filter.formatSelectedFilterLabel("missing");

    // Then the raw value is stringified as fallback
    expect(label).toBe("missing");
  });
});

function TestFilters<F extends Record<string, unknown> = ProjectFilter>(props: { defs: Partial<FilterDefs<F>> }) {
  const { defs } = props;
  const [filter, setFilter] = useState<F>({} as F);
  return (
    <div>
      <Filters filterDefs={defs as FilterDefs<F>} filter={filter} onChange={setFilter} />
      <div data-testid="filter_value">{JSON.stringify(filter)}</div>
    </div>
  );
}
