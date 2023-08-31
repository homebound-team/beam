import { useState } from "react";
import { FilterDefs, Filters } from "src/components/Filters";
import { ProjectFilter } from "src/components/Filters/testDomain";
import { render, type } from "src/utils/rtl";
import { numberRangeFilter, NumberRangeFilterValue } from "./NumberRangeFilter";

describe("NumberRangeFilter", () => {
  it("renders the Number Range Filter in horizontal filters", async () => {
    // Given we have a Number Range Filter within Filters
    const r = await render(<TestFilters defs={{ numberRange: numberRangeFilter({ label: "Price" }) }} />);

    // Then the min / max number range filter should be visible
    expect(r.filter_price_min).toHaveValue("");
    expect(r.filter_price_max).toHaveValue("");
  });

  it("renders the Number Range Filter in vertical Filters", async () => {
    // Given we have a Number Range Filter within vertical Filters
    const r = await render(
      <TestFilters showVertical={true} defs={{ numberRange: numberRangeFilter({ label: "Price" }) }} />,
    );

    // Then the min / max number range filter should be visible
    expect(r.filter_price_min_vertical).toHaveValue("");
    expect(r.filter_price_max_vertical).toHaveValue("");
  });

  it("should render filter with default values when filter state default is set", async () => {
    const defaultValue = { min: 10, max: 50 };
    // Given we have a Number Range Filter with a default value set
    const r = await render(
      <TestFilters defaultValue={defaultValue} defs={{ numberRange: numberRangeFilter({ label: "Price" }) }} />,
    );

    // Then the min / max number range filter should be set with the default values
    expect(r.filter_price_min).toHaveValue("10");
    expect(r.filter_price_max).toHaveValue("50");
  });

  it("should only set the min range value", async () => {
    // Given we have a Number Range Filter
    const r = await render(<TestFilters defs={{ numberRange: numberRangeFilter({ label: "Price" }) }} />);

    // When we set the min / max value
    type(r.filter_price_min, "10");

    // Then we expect the min / max filter to be set
    expect(r.filter_value).toHaveTextContent(JSON.stringify({ numberRange: { min: 10 } }));
  });

  it("should only set the max range value", async () => {
    // Given we have a Number Range Filter
    const r = await render(<TestFilters defs={{ numberRange: numberRangeFilter({ label: "Price" }) }} />);

    // When we set the min / max value
    type(r.filter_price_max, "50");

    // Then we expect the min / max filter to be set
    expect(r.filter_value).toHaveTextContent(JSON.stringify({ numberRange: { max: 50 } }));
  });

  it("should set and render both the min / max filter range values", async () => {
    // Given we have a Number Range Filter
    const r = await render(<TestFilters defs={{ numberRange: numberRangeFilter({ label: "Price" }) }} />);

    // When we set the min / max value
    type(r.filter_price_min, "10");
    type(r.filter_price_max, "50");

    // Then we expect to render the min / max values
    expect(r.filter_price_min).toHaveValue("10");
    expect(r.filter_price_max).toHaveValue("50");

    // And we expect the min / max filter to be set
    expect(r.filter_value).toHaveTextContent(JSON.stringify({ numberRange: { max: 50, min: 10 } }));
  });

  it("should unset filter range values", async () => {
    // Given we have a Number Range Filter
    const r = await render(<TestFilters defs={{ numberRange: numberRangeFilter({ label: "Price" }) }} />);

    // And we set the min / max value
    type(r.filter_price_min, "10");
    type(r.filter_price_max, "50");

    // When we unset the min / max values
    type(r.filter_price_min, "");
    type(r.filter_price_max, "");

    // Then we expect the numberRange filter to be unset
    expect(r.filter_value).toHaveTextContent(JSON.stringify({}));
  });

  it("should render the formatted range values", async () => {
    // Given we have a Number Range Filter formatted in cents i.e. numberFieldType is set in cents
    const r = await render(
      <TestFilters defs={{ numberRange: numberRangeFilter({ label: "Price", numberFieldType: "cents" }) }} />,
    );

    // When we set the min / max value
    type(r.filter_price_min, "10");
    type(r.filter_price_max, "50");

    // Then we expect the min / max filter UI to be formatted
    expect(r.filter_price_min).toHaveValue("$10.00");
    expect(r.filter_price_max).toHaveValue("$50.00");
  });

  it("should set the filter range values in cents", async () => {
    // Given we have a Number Range Filter formatted in cents i.e. numberFieldType is set in cents
    const r = await render(
      <TestFilters defs={{ numberRange: numberRangeFilter({ label: "Price", numberFieldType: "cents" }) }} />,
    );

    // When we set the min / max value
    type(r.filter_price_min, "10");
    type(r.filter_price_max, "50");

    // And we expect the min / max filter to be set in cents
    expect(r.filter_value).toHaveTextContent(JSON.stringify({ numberRange: { max: 5000, min: 1000 } }));
  });
});

function TestFilters(props: TestFilterProps) {
  const { defs, showVertical, defaultValue } = props;
  const [filter, setFilter] = useState<ProjectFilter>(defaultValue ? { numberRange: defaultValue } : {});
  return (
    <div>
      <Filters vertical={!!showVertical} filterDefs={defs} filter={filter} onChange={setFilter} />
      <div data-testid="filter_value">{JSON.stringify(filter)}</div>
    </div>
  );
}

interface TestFilterProps {
  defs: FilterDefs<ProjectFilter>;
  showVertical?: boolean;
  defaultValue?: NumberRangeFilterValue;
}
