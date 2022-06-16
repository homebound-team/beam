import { change, render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { formatValue, NumberField, NumberFieldProps } from "src/inputs/NumberField";

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

  it("can set dollars and cents as dollars", async () => {
    const r = await render(<TestNumberField label="Cost" type="dollars" value={1200} />);
    expect(r.cost()).toHaveValue("$1,200.00");
    type(r.cost, "14.25");
    expect(r.cost()).toHaveValue("$14.25");
    expect(lastSet).toEqual(14.25);
  });

  it("can set dollars as dollars only", async () => {
    const r = await render(<TestNumberField label="Cost" type="dollars" value={1200} numFractionDigits={0} />);
    expect(r.cost()).toHaveValue("$1,200");
    type(r.cost, "14.25");
    expect(r.cost()).toHaveValue("$14");
    expect(lastSet).toEqual(14);
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

  it("does not allow for decimal values in days type", async () => {
    const r = await render(<TestNumberField label="Days" type="days" value={2} />);
    expect(r.days()).toHaveValue("2 days");
    type(r.days, "1.23");
    expect(r.days()).toHaveValue("1 day");
  });

  it("allows override of numberFormatOptions", async () => {
    const r = await render(
      <TestNumberField
        label="Cost"
        value={1200}
        numFractionDigits={2}
        numberFormatOptions={{ style: "currency", currency: "USD" }}
      />,
    );
    expect(r.cost()).toHaveValue("$1,200.00");
    type(r.cost, "14.14");
    expect(r.cost()).toHaveValue("$14.14");
  });

  it("displays direction of positive values and no direction display for zero", async () => {
    const r = await render(
      <>
        <TestNumberField label="Days" type="days" value={123} displayDirection />
        <TestNumberField label="Cents" type="cents" value={456} displayDirection />
        <TestNumberField label="Basis Points" type="basisPoints" value={789} displayDirection />
        <TestNumberField label="Percent" type="percent" value={123} displayDirection />
        <TestNumberField label="Zero Percent" type="percent" value={0} displayDirection />
      </>,
    );
    expect(r.days()).toHaveValue("+123 days");
    expect(r.cents()).toHaveValue("+$4.56");
    expect(r.basisPoints()).toHaveValue("+7.89%");
    expect(r.percent()).toHaveValue("+123%");
    expect(r.zeroPercent()).toHaveValue("0%");
  });

  it("fires onEnter and blurs field", async () => {
    const onBlur = jest.fn();
    const onEnter = jest.fn();
    // Given a numberfield
    const r = await render(<TestNumberField label="Age" value={10} onBlur={onBlur} onEnter={onEnter} />);
    // With focus
    r.age().focus();
    expect(r.age()).toHaveFocus();
    // When hitting the Enter key
    fireEvent.keyDown(r.age(), { key: "Enter" });
    // And onEnter and onBlur should be called
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(r.age()).not.toHaveFocus();
  });

  it("respects numFractionDigits and truncate props", async () => {
    const r = await render(
      <TestNumberField label="Complete" type="percent" value={12.5} numFractionDigits={2} truncate />,
    );
    expect(r.complete()).toHaveValue("12.5%");
    type(r.complete, "14.55");
    expect(r.complete()).toHaveValue("14.55%");
    expect(lastSet).toEqual(14.55);

    // Can truncate decimals
    type(r.complete, "10.40");
    expect(r.complete()).toHaveValue("10.4%");
    expect(lastSet).toEqual(10.4);

    type(r.complete, "12.00");
    expect(r.complete()).toHaveValue("12%");
    expect(lastSet).toEqual(12);
  });
});

// test against factors and num fraction digits.
describe("formatValue function", () => {
  it.each([
    // if value is NaN return undefined
    [Number("a"), 100, undefined, undefined],

    // value returns as expected based on factor
    [10, 100, undefined, 1_000],
    [10, 10_000, undefined, 100_000],
    [10, 1, undefined, 10],

    // it can round and format with fractional values
    [0.10456, 100, 2, 10.46],
    [0.10456, 100, 1, 10.5],
    [1.10456, 10_000, 2, 11045.6],
    [-10.456, 1, 3, -10.456],
  ])(
    "with a value of %s, a factor of %s and numFractionDigits of %s, it should return %s",
    (value, factor, type, expected) => {
      expect(formatValue(value, factor, type)).toBe(expected);
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
