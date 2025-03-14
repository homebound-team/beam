import { jest } from "@jest/globals";
import { useState } from "react";
import { Switch as SwitchComponent, SwitchProps } from "src/inputs";
import { click, render } from "src/utils/rtl";

describe("Switch", () => {
  it("can change", async () => {
    const onChange = jest.fn();
    // Given a switch
    const r = await render(<SwitchTest label="Age" onChange={onChange} />);
    // Then it defaults no checked
    expect(r.age).not.toBeChecked();
    // And when we click it, it flips to checked
    click(r.age);
    expect(r.age).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
    // And if we click it again, it flips back to unchecked
    click(r.age);
    expect(r.age).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

type SwitchTestProps = Omit<SwitchProps, "onChange" | "selected"> & {
  onChange?: (value: boolean) => void;
  selected?: boolean;
};

function SwitchTest({ selected: initSelected, onChange: _onChange, ...props }: SwitchTestProps) {
  const [selected, setSelected] = useState(initSelected || false);
  return (
    <SwitchComponent
      labelStyle="inline"
      selected={selected}
      onChange={(value) => {
        _onChange?.(value);
        setSelected(value);
      }}
      {...props}
    />
  );
}
