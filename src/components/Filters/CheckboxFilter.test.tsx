import { useState } from "react";
import { checkboxFilter, CheckboxFilterProps } from "src/components/Filters/CheckboxFilter";
import { click, render } from "src/utils/rtl";
import { useTestIds } from "src/utils/useTestIds";

describe("CheckboxFilter", () => {
  it("uses true/undefined by default", async () => {
    // Given a default boolean filter
    const r = await render(<TestFilter checkboxFilter={{}} />);
    // It's initially empty
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
    // And when its clicked, it turns true
    click(r.filter_filter);
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("true");
    // And when its clicked again, it goes back to undefined
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
  });

  it("can use false/undefined when onValue is set", async () => {
    // Given a default boolean filter
    const r = await render(<TestFilter checkboxFilter={{ onValue: false }} />);
    // It's initially empty
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
    // And when its clicked, it turns true
    click(r.filter_filter);
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("false");
    // And when its clicked again, it goes back to undefined
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
  });

  it("can use true/false when offValue is set", async () => {
    // Given a default boolean filter
    const r = await render(<TestFilter checkboxFilter={{ offValue: false }} />);
    // It's initially empty
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("false");
    // And when its clicked, it turns true
    click(r.filter_filter);
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("true");
    // And when its clicked again, it goes back to false
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("false");
  });

  it("can use foo/bar when onValue/offValue are both set", async () => {
    // Given a default boolean filter
    const r = await render(<TestFilter checkboxFilter={{ onValue: "foo", offValue: "bar" }} />);
    // It's initially empty
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("bar");
    // And when its clicked, it turns true
    click(r.filter_filter);
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("foo");
    // And when its clicked again, it goes back to false
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("bar");
  });

  it("can default to checked", async () => {
    // Given a default boolean filter
    const r = await render(
      <TestFilter
        checkboxFilter={{}}
        // That has a persisted value coming in from usePersistedFilter
        persistedValue={true}
      />,
    );
    // It's initially checked
    expect(r.filter_filter).toBeChecked();
    expect(r.value).toHaveTextContent("true");
    // And when its clicked again, it goes back to false
    click(r.filter_filter);
    expect(r.filter_filter).not.toBeChecked();
    expect(r.value).toHaveTextContent("undefined");
  });
});

function TestFilter<V>(props: { checkboxFilter: CheckboxFilterProps<V>; persistedValue?: V }) {
  const filter = checkboxFilter(props.checkboxFilter)("filter");
  const [value, setValue] = useState<V | undefined>(props.persistedValue || filter.defaultValue);
  const tid = useTestIds({}, "filter");
  return (
    <div>
      {filter.render(value, setValue, tid, false, false)}
      <div data-testid="value">{typeof value !== "string" ? String(value) : value}</div>
    </div>
  );
}
