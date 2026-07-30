import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { SelectCardGroup } from "src/inputs/SelectCard/SelectCardGroup";
import { SelectCardGridGroupItemOption, SelectCardListGroupItemOption } from "src/inputs/SelectCard/types";
import { noop } from "src/utils";
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
    expect(r.categories_math_value).toBeChecked();
    expect(r.categories_history_value).not.toBeChecked();
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
    click(r.categories_history);
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
    expect(r.categories_math_value).toBeChecked();
    // When the parent changes value
    click(r.reset);
    // Then the group reflects the new selection
    expect(r.categories_history_value).toBeChecked();
    expect(r.categories_math_value).not.toBeChecked();
  });

  it("renders cards horizontally when layout is horizontal", async () => {
    const onChange = vi.fn();
    // Given a grid group with the horizontal layout
    const r = await render(
      <SelectCardGroup
        label="Categories"
        layout="horizontal"
        options={createGridCategoryOptions()}
        value={Category.Math}
        onChange={onChange}
      />,
    );
    // Then the card content lays out its icon and text in a row
    expect(r.categories_math).toHaveStyle({ flexDirection: "row" });
    // And selection still works
    click(r.categories_history);
    expect(onChange).toHaveBeenCalledWith(Category.History);
  });

  it("renders an image instead of an icon when image is provided", async () => {
    const onChange = vi.fn();
    // Given a grid group with image options
    const r = await render(
      <SelectCardGroup
        label="Categories"
        options={[
          { image: "math.png", label: "Math", value: Category.Math },
          { image: "history.png", label: "History", value: Category.History },
        ]}
        value={Category.Math}
        onChange={onChange}
      />,
    );
    // Then the card renders the image
    expect(r.categories_math_img).toHaveAttribute("src", "math.png");
    // And selection still works
    click(r.categories_history);
    expect(onChange).toHaveBeenCalledWith(Category.History);
  });

  it("renders a link at the bottom of the card when the option has one", async () => {
    const onChange = vi.fn();
    const onLinkClick = vi.fn();
    // Given a grid group where an option has a link
    const r = await render(
      <SelectCardGroup
        label="Categories"
        options={[
          { icon: "abacus", label: "Math", value: Category.Math, link: { label: "More info", onClick: onLinkClick } },
          { icon: "archive", label: "History", value: Category.History },
        ]}
        value={Category.History}
        onChange={onChange}
      />,
    );
    // When clicking the link
    click(r.moreInfo);
    // Then it fires the link handler without selecting the card
    expect(onLinkClick).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the link out of the option's accessible name", async () => {
    // Given a grid group where an option has a link
    const r = await render(
      <SelectCardGroup
        label="Categories"
        options={[
          { icon: "abacus", label: "Math", value: Category.Math, link: { label: "More info", onClick: noop } },
          { icon: "archive", label: "History", value: Category.History },
        ]}
        value={Category.History}
        onChange={noop}
      />,
    );
    // Then the radio is only named by the card's own label, i.e. not "MathMore info"
    expect((r.categories_math_value as HTMLInputElement).labels?.[0]).toHaveTextContent(/^Math$/);
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
    click(r.categories_history);
    // Then onChange receives only History
    expect(onChange).toHaveBeenCalledWith(Category.History);
  });

  it("prevents the browser default on mousedown so focus stays put", async () => {
    // react-aria flags a focus event with no preceding user event as "virtual" focus and shows
    // the keyboard focus ring. Inside a modal (tabindex=-1), mousedown on a card would move focus
    // to the modal and "use up" the pointer event, so the label click's focus on our hidden input
    // looked virtual and cards got the focus ring on plain mouse clicks. Preventing the mousedown
    // default keeps focus in place, so the only focus event happens right after the click.
    const onChange = vi.fn();
    // Given a grid group
    const r = await render(
      <SelectCardGroup
        label="Categories"
        options={createGridCategoryOptions()}
        value={Category.Math}
        onChange={onChange}
      />,
    );
    // When mousing down on a card, then the default focus-move is prevented
    expect(fireEvent.mouseDown(r.categories_history)).toBe(false);
    // And clicking still selects the card
    click(r.categories_history);
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
    expect(group).toHaveAttribute("aria-labelledby", r.categories_label.id);
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
    expect(r.categories_math_value).toBeDisabled();
    expect(r.categories_history_value).toBeDisabled();
    expect(r.categories_notApplicable_value).toBeDisabled();
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
    click(r.categories_history);
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
    expect(r.categories_math_value).toBeDisabled();
    expect(r.categories_history_value).toBeDisabled();
    expect(r.categories_notApplicable_value).toBeDisabled();
  });
});
