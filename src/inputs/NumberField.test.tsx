import { change, render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { NumberField, NumberFieldProps, NumberFieldType, parseRawInput } from "src/inputs/NumberField";

let lastSet: any = undefined;

describe("NumberFieldTest", () => {
  it("can set a value", async () => {
    const r = await render(<TestNumberField label="Age" value={1} />);
    expect(r.age()).toHaveValue("1");
    type(r.age, "2");
    expect(r.age()).toHaveValue("2");
  });

  it("can set a percentage value", async () => {
    const r = await render(<TestNumberField label="Complete" type="percent" value={12} />);
    expect(r.complete()).toHaveValue("12%");
    type(r.complete, "14");
    expect(r.complete()).toHaveValue("14%");
    expect(lastSet).toEqual(14);
  });

  it("calls onChange with expected value for percentage", async () => {
    const onChange = jest.fn();
    const r = await render(<NumberField label="Complete" type="percent" value={12} onChange={onChange} />);
    change(r.complete, "15");
    expect(onChange).toBeCalledWith(15);
    expect(onChange).toBeCalledTimes(2); // change and blur
  });

  it("can set a basis points value", async () => {
    const r = await render(<TestNumberField label="Margin" type="basisPoints" value={1234} />);
    expect(r.margin()).toHaveValue("12.34%");
    type(r.margin, "23.45");
    expect(r.margin()).toHaveValue("23.45%");
    expect(lastSet).toEqual(2345);
  });

  it("calls onChange with expected value for basisPoints", async () => {
    const onChange = jest.fn();
    const r = await render(<NumberField label="Margin" type="basisPoints" value={1234} onChange={onChange} />);
    change(r.margin, "23.45");
    expect(onChange).toBeCalledWith(2345);
    expect(onChange).toBeCalledTimes(2); // change and blur
  });

  it("can set cents as dollars", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost()).toHaveValue("$12.00");
    type(r.cost, "14");
    expect(r.cost()).toHaveValue("$14.00");
    expect(lastSet).toEqual(1400);
  });

  it("calls onChange with expected value for cents", async () => {
    const onChange = jest.fn();
    const r = await render(<NumberField label="Cost" type="cents" value={1234} onChange={onChange} />);
    change(r.cost, "23.45");
    expect(onChange).toBeCalledWith(2345);
    expect(onChange).toBeCalledTimes(2); // change and blur
  });

  it("can set cents as cents", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost()).toHaveValue("$12.00");
    type(r.cost, ".14");
    expect(r.cost()).toHaveValue("$0.14");
    expect(lastSet).toEqual(14);
  });

  it("can set to undefined", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost()).toHaveValue("$12.00");
    type(r.cost, "");
    expect(r.cost()).toHaveValue("");
    expect(lastSet).toBeUndefined();
  });

  it("retains correct value on focus", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost()).toHaveValue("$12.00");
    fireEvent.focus(r.cost());
    expect(r.cost()).toHaveValue("$12.00");
  });

  it("can be read only", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} readOnly={true} />);
    expect(r.cost()).toHaveTextContent("$12.00");
    expect(r.cost()).toHaveAttribute("data-readonly", "true");
  });

  it("displays and updates 'days' type", async () => {
    const r = await render(<TestNumberField label="Days" type="days" value={2} />);
    expect(r.days()).toHaveValue("2 days");
    type(r.days, "1");
    expect(r.days()).toHaveValue("1 day");
  });
});

describe("parseRawInput function", () => {
  it.each([
    // if rawInput is NaN return undefined
    ["asdf", 100, "percent" as NumberFieldType, undefined],
    ["asdf", 100, "cents" as NumberFieldType, undefined],
    ["asdf", 10_000, "basisPoints" as NumberFieldType, undefined],
    ["asdf", 1, undefined, undefined],

    // if rawInput includes numbers followed by letters, return number and value based on type
    ["10kb", 100, "percent" as NumberFieldType, 10],
    ["10kb", 100, "cents" as NumberFieldType, 1000],
    ["10kb", 10_000, "basisPoints" as NumberFieldType, 1000],
    ["10kb", 1, undefined, 10],

    // it can return negative numbers
    ["-10kb", 100, "percent" as NumberFieldType, -10],
    ["-10kb", 100, "cents" as NumberFieldType, -1000],
    ["-10kb", 10_000, "basisPoints" as NumberFieldType, -1000],
    ["-10kb", 1, undefined, -10],
  ])(
    "with a rawInput of %s, a factor of %s and a type of %s, it should return %s",
    (rawInput, factor, type, expected) => {
      const actual = parseRawInput(rawInput, factor, type);

      expect(actual).toBe(expected);
    },
  );
});

function TestNumberField(props: Omit<NumberFieldProps, "onChange">) {
  const { value, label, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <NumberField
      label={label}
      value={internalValue}
      onChange={(v) => {
        lastSet = v;
        setValue(v);
      }}
      {...otherProps}
    />
  );
}
