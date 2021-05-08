import { render, type } from "@homebound/rtl-utils";
import { useState } from "react";
import { NumberField, NumberFieldProps } from "src/components/NumberField";

describe("NumberFieldTest", () => {
  it("can set a value", async () => {
    const r = await render(<TestNumberField value={1} />);
    expect(r.age()).toHaveValue("1");
    type(r.age, "2");
    expect(r.age()).toHaveValue("2");
  });
});

function TestNumberField(props: Omit<NumberFieldProps, "onChange">) {
  const { value, label = "Age", ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return <NumberField label={label} value={internalValue} onChange={setValue} {...otherProps} />;
}
