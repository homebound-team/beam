import { render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { NumberField, NumberFieldProps } from "src/components/NumberField";

let lastSet: any = undefined;

describe("NumberFieldTest", () => {
  it("can set a value", async () => {
    const r = await render(<TestNumberField value={1} />);
    expect(r.age()).toHaveValue("1");
    type(r.age, "2");
    expect(r.age()).toHaveValue("2");
  });

  it("can set a percentage value", async () => {
    const r = await render(<TestNumberField label="Complete" type="percent" value={12} />);
    expect(r.complete()).toHaveValue("12%");
    type(r.complete, "14");
    fireEvent.blur(r.complete());
    expect(r.complete()).toHaveValue("14%");
    expect(lastSet).toEqual(14);
  });

  it("can set a basis points value", async () => {
    const r = await render(<TestNumberField label="Margin" type="basisPoints" value={1234} />);
    expect(r.margin()).toHaveValue("12.34%");
    type(r.margin, "23.45");
    fireEvent.blur(r.margin());
    expect(r.margin()).toHaveValue("23.45%");
    expect(lastSet).toEqual(2345);
  });

  it("can set cents as dollars", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost()).toHaveValue("$12.00");
    type(r.cost, "14");
    fireEvent.blur(r.cost());
    expect(r.cost()).toHaveValue("$14.00");
    expect(lastSet).toEqual(1400);
  });

  it("can set cents as cents", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost()).toHaveValue("$12.00");
    type(r.cost, ".14");
    fireEvent.blur(r.cost());
    expect(r.cost()).toHaveValue("$0.14");
    expect(lastSet).toEqual(14);
  });
});

function TestNumberField(props: Omit<NumberFieldProps, "onChange">) {
  const { value, label = "Age", ...otherProps } = props;
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
