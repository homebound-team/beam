import { useState } from "react";
import { SelectCardGroup } from "src/inputs/SelectCard/SelectCardGroup";
import { SelectCardGridGroupItemOption, SelectCardListGroupItemOption } from "src/inputs/SelectCard/types";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

enum Category {
  Math,
  History,
  Na,
}

function createGridCategoryOptions(): SelectCardGridGroupItemOption<Category>[] {
  return [
    { icon: "abacus", label: "Math", value: Category.Math },
    { icon: "archive", label: "History", value: Category.History },
    { icon: "remove", label: "Not Applicable", value: Category.Na },
  ];
}

function createListCategoryOptions(): SelectCardListGroupItemOption<Category>[] {
  return [
    { label: "Math", description: "Numbers and equations", value: Category.Math },
    { label: "History", description: "Past events", value: Category.History },
    { label: "Not Applicable", description: "None apply", value: Category.Na },
  ];
}

describe("SelectCardGroup", () => {
  it("reflects value from the parent without internal state", async () => {
    const onChange = vi.fn();
    // Given a controlled group with Math selected
    const r = await render(
      <SelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        value={Category.Math}
        onChange={onChange}
      />,
    );
    // Then Math is selected
    expect(r.math_value).toBeChecked();
    expect(r.history_value).not.toBeChecked();
  });

  it("calls onChange with the selected value", async () => {
    const onChange = vi.fn();
    const r = await render(
      <SelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        value={Category.Math}
        onChange={onChange}
      />,
    );
    // When selecting History
    click(r.history);
    // Then onChange receives only History
    expect(onChange).toHaveBeenCalledWith(Category.History);
  });

  it("updates when the value prop changes externally", async () => {
    function ControlledRadioGroup() {
      const [value, setValue] = useState<Category | undefined>(Category.Math);
      return (
        <>
          <SelectCardGroup label="Categories" options={createGridCategoryOptions()} value={value} onChange={setValue} />
          <button type="button" data-testid="reset" onClick={() => setValue(Category.History)}>
            Reset
          </button>
        </>
      );
    }

    const r = await render(<ControlledRadioGroup />);
    expect(r.math_value).toBeChecked();
    // When the parent changes value
    click(r.reset);
    // Then the group reflects the new selection
    expect(r.history_value).toBeChecked();
    expect(r.math_value).not.toBeChecked();
  });

  it("supports single-select in list view", async () => {
    const onChange = vi.fn();
    const r = await render(
      <SelectCardGroup
        label="Categories"
        view="list"
        options={createListCategoryOptions()}
        value={Category.Math}
        onChange={onChange}
      />,
    );
    // When selecting History
    click(r.history);
    // Then onChange receives only History
    expect(onChange).toHaveBeenCalledWith(Category.History);
  });

  it("associates the group label with the field", async () => {
    const r = await render(
      <SelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        value={Category.Math}
        onChange={() => {}}
      />,
    );
    // Then the group is labelled for assistive tech
    const group = r.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-labelledby", r.label.id);
  });

  it("disables all cards when the group is disabled", async () => {
    const r = await render(
      <SelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        value={Category.Math}
        onChange={() => {}}
        disabled
      />,
    );
    // Then every option input is disabled
    expect(r.math_value).toBeDisabled();
    expect(r.history_value).toBeDisabled();
    expect(r.notApplicable_value).toBeDisabled();
  });

  it("does not call onChange when the group is disabled", async () => {
    const onChange = vi.fn();
    const r = await render(
      <SelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        value={Category.Math}
        onChange={onChange}
        disabled
      />,
    );
    // When clicking an enabled-looking card in a disabled group
    click(r.history);
    // Then onChange is not called
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables all list cards when the group is disabled", async () => {
    const r = await render(
      <SelectCardGroup
        label="Categories"
        view="list"
        options={createListCategoryOptions()}
        value={Category.Math}
        onChange={() => {}}
        disabled
      />,
    );
    // Then every option input is disabled
    expect(r.math_value).toBeDisabled();
    expect(r.history_value).toBeDisabled();
    expect(r.notApplicable_value).toBeDisabled();
  });
});
