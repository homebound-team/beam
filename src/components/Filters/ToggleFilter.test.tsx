import { useState } from "react";
import { toggleFilter } from "src/components/Filters";
import { ToggleFilterProps } from "src/components/Filters/ToggleFilter";
import { click, render } from "src/utils/rtl";
import { useTestIds } from "src/utils/useTestIds";

describe("ToggleFilter", () => {
  it("uses true/undefined by default", async () => {
    // Given a default boolean filter
    const r = await render(<TestFilter toggleFilter={{}} />);
    // It's initially empty
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
    // And when they click it, we turn true
    click(r.filter_filter);
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("true");
    // And when they click it again, we go back to undefined
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
  });

  it("can use false/undefined when onValue is set", async () => {
    // Given a default boolean filter
    const r = await render(<TestFilter toggleFilter={{ onValue: false }} />);
    // It's initially empty
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
    // And when they click it, we turn true
    click(r.filter_filter);
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("false");
    // And when they click it again, we go back to undefined
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
  });

  it("can use true/false when offValue is set", async () => {
    // Given a default boolean filter
    const r = await render(<TestFilter toggleFilter={{ offValue: false }} />);
    // It's initially empty
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("false");
    // And when they click it, we turn true
    click(r.filter_filter);
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("true");
    // And when they click it again, we go back to false
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("false");
  });

  it("can use foo/bar when onValue/offValue are both set", async () => {
    // Given a default boolean filter
    const r = await render(<TestFilter toggleFilter={{ onValue: "foo", offValue: "bar" }} />);
    // It's initially empty
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("bar");
    // And when they click it, we turn true
    click(r.filter_filter);
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("foo");
    // And when they click it again, we go back to false
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("bar");
  });

  it("can default to checked", async () => {
    // Given a default boolean filter
    const r = await render(
      <TestFilter
        toggleFilter={{}}
        // That has a persisted value coming in from usePersistedFilter
        persistedValue={true}
      />,
    );
    // It's initially checked
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("true");
    // And when they click it, we turn false
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
  });

  it("returns the filter label when the value matches onValue", () => {
    // Given a toggleFilter with default onValue
    const filter = toggleFilter({ label: "Show Archived" })("showArchived");

    // When formatting the label for the active value
    const label = filter.formatSelectedFilterLabel(true);

    // Then the filter label is returned
    expect(label).toBe("Show Archived");
  });

  it("returns undefined when the value does not match onValue", () => {
    // Given a toggleFilter with a custom onValue
    const filter = toggleFilter({ label: "Show Archived", onValue: "yes" })("showArchived");

    // When formatting the label for a non-active value
    const label = filter.formatSelectedFilterLabel("no");

    // Then no chip label is produced
    expect(label).toBeUndefined();
  });
});

function TestFilter<V>(props: { toggleFilter: ToggleFilterProps<V>; persistedValue?: V }) {
  const filter = toggleFilter(props.toggleFilter)("filter");
  const [value, setValue] = useState<V | undefined>(props.persistedValue || filter.defaultValue);
  const tid = useTestIds({}, "filter");
  return (
    <div>
      {filter.render(value, setValue, tid, false, false)}
      <div data-testid="value">{typeof value !== "string" ? String(value) : value}</div>
    </div>
  );
}
