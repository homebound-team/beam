import { change, render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { NumberField, NumberFieldProps } from "src/inputs";

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
    expect(onChange).toBeCalledTimes(2);
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
    expect(onChange).toBeCalledTimes(2);
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
    expect(onChange).toBeCalledTimes(2);
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
