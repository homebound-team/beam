import { useState } from "react";
import { MultiSelectCardGroup } from "src/inputs/SelectCard/MultiSelectCardGroup";
import { SelectCardGridGroupItemOption, SelectCardListGroupItemOption } from "src/inputs/SelectCard/types";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("MultiSelectCardGroup", () => {
  it("reflects values from the parent without internal state", async () => {
    const onChange = vi.fn();
    // Given a controlled group with Math selected
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        values={[Category.Math]}
        onChange={onChange}
      />,
    );
    // Then Math is selected
    expect(r.categories_math_value).toBeChecked();
    expect(r.categories_history_value).not.toBeChecked();
  });

  it("calls onChange with multiple selections", async () => {
    const onChange = vi.fn();
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        values={[Category.Math]}
        onChange={onChange}
      />,
    );
    // When selecting History
    click(r.categories_history);
    // Then onChange receives both values
    expect(onChange).toHaveBeenCalledWith([Category.Math, Category.History]);
  });

  it("applies exclusive selection behavior", async () => {
    const onChange = vi.fn();
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        values={[Category.Math, Category.History]}
        onChange={onChange}
      />,
    );
    // When selecting the exclusive option
    click(r.categories_notApplicable);
    // Then onChange receives only N/A
    expect(onChange).toHaveBeenCalledWith([Category.Na]);
  });

  it("clears exclusive values when selecting a normal option", async () => {
    const onChange = vi.fn();
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        values={[Category.Na]}
        onChange={onChange}
      />,
    );
    // When selecting Math
    click(r.categories_math);
    // Then onChange receives only Math
    expect(onChange).toHaveBeenCalledWith([Category.Math]);
  });

  it("updates when the values prop changes externally", async () => {
    function ControlledGroup() {
      const [values, setValues] = useState<Category[]>([Category.Math]);
      return (
        <>
          <MultiSelectCardGroup
            label="Categories"
            options={createGridCategoryOptions()}
            values={values}
            onChange={setValues}
          />
          <button type="button" data-testid="reset" onClick={() => setValues([Category.History])}>
            Reset
          </button>
        </>
      );
    }

    const r = await render(<ControlledGroup />);
    expect(r.categories_math_value).toBeChecked();
    // When the parent changes values
    click(r.reset);
    // Then the group reflects the new selection
    expect(r.categories_history_value).toBeChecked();
    expect(r.categories_math_value).not.toBeChecked();
  });

  it("toggles off a selected value in list view", async () => {
    const onChange = vi.fn();
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        view="list"
        options={createListCategoryOptions()}
        values={[Category.Math]}
        onChange={onChange}
      />,
    );
    // When deselecting Math
    click(r.categories_math);
    // Then onChange receives an empty selection
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("applies exclusive selection behavior in list view", async () => {
    const onChange = vi.fn();
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        view="list"
        options={createListCategoryOptions()}
        values={[Category.Math, Category.History]}
        onChange={onChange}
      />,
    );
    // When selecting the exclusive option
    click(r.categories_notApplicable);
    // Then onChange receives only N/A
    expect(onChange).toHaveBeenCalledWith([Category.Na]);
  });

  it("associates the group label with the field", async () => {
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        values={[Category.Math]}
        onChange={() => {}}
      />,
    );
    // Then the group is labelled for assistive tech
    const group = r.getByRole("group");
    expect(group).toHaveAttribute("aria-labelledby", r.categories_label.id);
  });

  it("disables all cards when the group is disabled", async () => {
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        values={[Category.Math]}
        onChange={() => {}}
        disabled
      />,
    );
    // Then every option input is disabled
    expect(r.categories_math_value).toBeDisabled();
    expect(r.categories_history_value).toBeDisabled();
    expect(r.categories_notApplicable_value).toBeDisabled();
  });

  it("does not call onChange when the group is disabled", async () => {
    const onChange = vi.fn();
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        values={[Category.Math]}
        onChange={onChange}
        disabled
      />,
    );
    // When clicking an enabled-looking card in a disabled group
    click(r.categories_history);
    // Then onChange is not called
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables all list cards when the group is disabled", async () => {
    const r = await render(
      <MultiSelectCardGroup
        label="Categories"
        view="list"
        options={createListCategoryOptions()}
        values={[Category.Math]}
        onChange={() => {}}
        disabled
      />,
    );
    // Then every option input is disabled
    expect(r.categories_math_value).toBeDisabled();
    expect(r.categories_history_value).toBeDisabled();
    expect(r.categories_notApplicable_value).toBeDisabled();
  });
});

enum Category {
  Math,
  History,
  Na,
}

function createGridCategoryOptions(): SelectCardGridGroupItemOption<Category>[] {
  return [
    { icon: "abacus", label: "Math", value: Category.Math },
    { icon: "archive", label: "History", value: Category.History },
    { icon: "remove", label: "Not Applicable", value: Category.Na, selectionBehavior: "exclusive" },
  ];
}

function createListCategoryOptions(): SelectCardListGroupItemOption<Category>[] {
  return [
    { label: "Math", description: "Numbers and equations", value: Category.Math },
    { label: "History", description: "Past events", value: Category.History },
    { label: "Not Applicable", description: "None apply", value: Category.Na, selectionBehavior: "exclusive" },
  ];
}
