import { useState } from "react";
import { Switch as SwitchComponent, SwitchProps } from "src/inputs";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("Switch", () => {
  it("can change", async () => {
    const onChange = vi.fn();
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

  it("moves the circle right when selected", async () => {
    const r = await render(<SwitchTest label="Age" selected />);
    expect(switchCircle(r.age)).toHaveStyle({ left: "calc(100% - 20px - 2px)" });
  });
});

function switchCircle(input: HTMLElement): HTMLElement {
  const label = input.closest("label");
  if (!label) {
    throw new Error("Expected switch input to be wrapped by a label");
  }
  const circle = label.querySelector('[aria-hidden="true"] > div');
  if (!(circle instanceof HTMLElement)) {
    throw new Error("Expected switch circle element");
  }
  return circle;
}

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
