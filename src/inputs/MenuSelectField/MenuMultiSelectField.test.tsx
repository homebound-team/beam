import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { MenuMultiSelectField } from "src/inputs/MenuSelectField/MenuMultiSelectField";
import type { SelectionView } from "src/inputs/MenuSelectField/types";
import { click, getOption, getOptions, render, select, type } from "src/utils/rtl";
import { vi } from "vitest";

describe("MenuMultiSelectField", () => {
  it("toggles and stays open", async () => {
    // Given a multi select
    const onSelect = vi.fn();
    const r = await render(<MultiHarness onSelectSpy={onSelect} />);
    // When selecting two options
    select(r.color, ["Red", "Blue"]);
    // Then both are selected, the menu stays open, and the count badge shows 2
    expect(onSelect).toHaveBeenLastCalledWith(
      ["r", "b"],
      [
        { id: "r", name: "Red" },
        { id: "b", name: "Blue" },
      ],
    );
    expect(r.color_overlay).toBeInTheDocument();
    expect(r.color_count).toHaveTextContent("2");
  });

  it("shows selected options as pills above the search", async () => {
    // Given a multi select with two values and a long enough list to search
    const r = await render(<MultiHarness initial={["r", "b"]} options={manyColors()} />);
    // When opening it
    click(r.color);
    // Then both selected options are listed
    expect(r.color_selections_pill_0).toHaveTextContent("Red");
    expect(r.color_selections_pill_1).toHaveTextContent("Blue");
    // And the row fits, so there is no expand control
    expect(r.query.color_selections_toggle).toBeNull();
  });

  it("hides the pill row when nothing is selected", async () => {
    // Given a multi select with nothing selected
    const r = await render(<MultiHarness options={manyColors()} />);
    // When opening it
    click(r.color);
    // Then there is no pill row
    expect(r.query.color_selections).toBeNull();
  });

  it("toggles a dotted option like any other checkbox", async () => {
    // Given some records hold Red, and nothing is selected
    const onSelect = vi.fn();
    const r = await render(<MultiHarness mixedValues={["r"]} onSelectSpy={onSelect} />);
    click(r.color);
    expect(getOption(r.color, "Red")).toHaveAttribute("aria-selected", "false");
    expect(getOption(r.color, "Red")).toHaveAccessibleDescription("Mixed Selected rows have different values.");
    // When checking Red
    select(r.color, "Red");
    // Then it's selected and loses its dot
    expect(onSelect).toHaveBeenLastCalledWith(["r"], [{ id: "r", name: "Red" }]);
    expect(getOption(r.color, "Red")).toHaveAttribute("aria-selected", "true");
    expect(getOption(r.color, "Red")).not.toHaveAccessibleDescription();
    // And when unchecking it, it's dotted again
    select(r.color, "Red");
    expect(onSelect).toHaveBeenLastCalledWith([], []);
    expect(getOption(r.color, "Red")).toHaveAccessibleDescription("Mixed Selected rows have different values.");
  });

  it("counts dotted values in the badge but not in the pills", async () => {
    // Given every record holds Red, and some hold Blue or Green
    const r = await render(<MultiHarness initial={["r"]} mixedValues={["b", "g"]} />);
    // Then the field reads Mixed, counting Red plus the dotted Blue and Green
    expect(r.color).toHaveTextContent(/^Mixed3$/);
    expect(r.color_count).toHaveTextContent("3");
    // And when opened, only Red is a pill, since only a selection can be removed
    click(r.color);
    expect(r.color_selections_pill_0).toHaveTextContent("Red");
    expect(r.query.color_selections_pill_1).toBeNull();
  });

  it("removes a selection when its pill is clicked", async () => {
    // Given Red and Blue selected
    const onSelect = vi.fn();
    const r = await render(<MultiHarness initial={["r", "b"]} options={manyColors()} onSelectSpy={onSelect} />);
    click(r.color);
    // When clicking the Red pill
    click(r.color_selections_pill_0);
    // Then Red is removed and the menu stays open
    expect(onSelect).toHaveBeenLastCalledWith(["b"], [{ id: "b", name: "Blue" }]);
    expect(r.color_selections_pill_0).toHaveTextContent("Blue");
    expect(r.query.color_selections_pill_1).toBeNull();
    expect(r.color_overlay).toBeInTheDocument();
  });

  it("keeps every selected pill while search hides some options", async () => {
    // Given Red and Blue selected
    const onSelect = vi.fn();
    const r = await render(<MultiHarness initial={["r", "b"]} options={manyColors()} onSelectSpy={onSelect} />);
    click(r.color);
    // When search hides Red
    type(r.color_search, "blu");
    // Then both pills remain, and clicking Red still clears it
    expect(r.color_selections_pill_0).toHaveTextContent("Red");
    expect(r.color_selections_pill_1).toHaveTextContent("Blue");
    click(r.color_selections_pill_0);
    expect(onSelect).toHaveBeenLastCalledWith(["b"], [{ id: "b", name: "Blue" }]);
  });

  it("does not remove a disabled selection from its pill", async () => {
    // Given Red selected and disabled, with a reason
    const onSelect = vi.fn();
    const r = await render(
      <MultiHarness
        initial={["r", "b"]}
        options={manyColors()}
        disabledOptions={[{ value: "r", reason: "Required" }]}
        onSelectSpy={onSelect}
      />,
    );
    click(r.color);
    // When clicking the Red pill
    const red = r.color_selections_pill_0;
    click(red);
    // Then Red stays selected, and the pill shows why
    expect(red).toBeDisabled();
    expect(red.parentElement).toHaveAttribute("title", "Required");
    expect(onSelect).not.toHaveBeenCalled();
    expect(r.color_selections_pill_0).toHaveTextContent("Red");
    expect(r.color_selections_pill_1).toHaveTextContent("Blue");
  });

  it("wraps the pills and caps the row when expanded", async () => {
    // Given an open menu whose pills overflow the row
    const restore = mockSelectionsLineOverflow("color_selections_line");
    try {
      const r = await render(<MultiHarness initial={["r", "b"]} options={manyColors()} />);
      click(r.color);
      // Then the clipped line fades, and the expand control is shown
      expect(r.color_selections_line.style.getPropertyValue("--maskImage")).toContain("linear-gradient");
      // When expanding the pill row
      click(r.color_selections_toggle);
      // Then the pills wrap
      expect(r.color_selections_toggle).toHaveAttribute("aria-expanded", "true");
      expect(r.color_selections_options).toBeInTheDocument();
      // When collapsing it
      click(r.color_selections_toggle);
      // Then the pills are a single line again
      expect(r.color_selections_pill_0).toBeInTheDocument();
      expect(r.query.color_selections_options).toBeNull();
    } finally {
      restore();
    }
  });

  it("does not render chips", async () => {
    // Given a multi select with selections
    const r = await render(<MultiHarness initial={["r", "b"]} />);
    // Then the trigger has no chip UI, only the count badge
    expect(r.query.chip).toBeNull();
    expect(r.query.chips).toBeNull();
    expect(r.color).toHaveTextContent("2");
    expect(r.color_count).toHaveTextContent("2");
  });

  it("keeps hidden selections when selecting while filtered", async () => {
    // Given a multi select with Red selected
    const onSelect = vi.fn();
    const r = await render(<MultiHarness initial={["r"]} options={manyColors()} onSelectSpy={onSelect} />);
    click(r.color);
    // When filtering Red out and selecting Blue
    type(r.color_search, "blu");
    select(r.color, "Blue");
    // Then Red is still selected
    expect(onSelect).toHaveBeenLastCalledWith(
      ["r", "b"],
      [
        { id: "r", name: "Red" },
        { id: "b", name: "Blue" },
      ],
    );
  });

  it("keeps a selected pill when the options list drops it", async () => {
    // Given a multi select
    const onSelect = vi.fn();
    function Page() {
      const [options, setOptions] = useState(colors());
      const [values, setValues] = useState<string[]>([]);
      return (
        <>
          <button data-testid="showBlue" onClick={() => setOptions([{ id: "b", name: "Blue" }])} />
          <MenuMultiSelectField
            label="Color"
            options={options}
            values={values}
            onSelect={(next, opts) => {
              onSelect(next, opts);
              setValues(next);
            }}
          />
        </>
      );
    }
    const r = await render(<Page />);
    // When Red is selected and the list is replaced with Blue
    select(r.color, "Red");
    click(r.showBlue);
    // Then the menu lists Blue only, and Red stays a pill
    expect(getOptions(r.color)).toEqual(["Blue"]);
    expect(r.color_selections_pill_0).toHaveTextContent("Red");
    expect(r.query.color_selections_pill_1).toBeNull();
    expect(r.color_count).toHaveTextContent("1");
    // When Blue is selected too
    select(r.color, "Blue");
    // Then Red is still part of the selection
    expect(onSelect).toHaveBeenLastCalledWith(
      ["r", "b"],
      [
        { id: "r", name: "Red" },
        { id: "b", name: "Blue" },
      ],
    );
    // When the Red pill is clicked
    click(r.color_selections_pill_0);
    // Then Red is cleared even though it is no longer in the list
    expect(onSelect).toHaveBeenLastCalledWith(["b"], [{ id: "b", name: "Blue" }]);
  });

  it("keeps hidden selections when deselecting while filtered", async () => {
    // Given Red and Blue selected
    const onSelect = vi.fn();
    const r = await render(<MultiHarness initial={["r", "b"]} options={manyColors()} onSelectSpy={onSelect} />);
    click(r.color);
    // When filtering Red out and deselecting Blue
    type(r.color_search, "blu");
    select(r.color, "Blue");
    // Then only Red remains
    expect(onSelect).toHaveBeenLastCalledWith(["r"], [{ id: "r", name: "Red" }]);
  });

  it("treats a reordered proposal as unchanged", async () => {
    // Given the same colors on record and proposed, in opposite orders
    const r = await render(<MultiHarness initial={["b", "r"]} proposedValues={["r", "b"]} />);
    // Then nothing is struck through
    expect(r.query.color_originalValue).toBeNull();
  });

  it("keeps focus in the list when pressing an option", async () => {
    // Given an open multi select with no search field
    const r = await render(<MultiHarness />);
    click(r.color);
    // When pressing down on an option
    const notPrevented = fireEvent.mouseDown(r.getAllByTestId("color_option")[0]);
    // Then the browser's default focus change is prevented and the list keeps focus
    expect(notPrevented).toBe(false);
    expect(r.color_listbox).toHaveFocus();
  });

  describe("selectionView", () => {
    it("shows in-field pills and count badge by default", async () => {
      // Given a multi select with two values
      const r = await render(<MultiHarness initial={["r", "b"]} />);
      // Then each selection is a pill, and the count badge is present
      expect(r.color_pill_0).toHaveTextContent("Red");
      expect(r.color_pill_1).toHaveTextContent("Blue");
      expect(r.color_count).toHaveTextContent("2");
      expect(r.query.selectedOptionPillList).toBeNull();
    });

    it("shows only a count badge when badgeOnly", async () => {
      // Given a multi select with two values, shown as badge only
      const r = await render(<MultiHarness initial={["r", "b"]} selectionView="badgeOnly" />);
      // Then the field shows the count and no pills
      expect(r.color_count).toHaveTextContent("2");
      expect(r.query.color_pill_0).toBeNull();
      expect(r.query.selectedOptionPillList).toBeNull();
    });

    it("opens the menu when an in-field pill is clicked", async () => {
      // Given a multi select with a value shown as a pill in the field
      const r = await render(<MultiHarness initial={["r"]} selectionView="inField" />);
      // When clicking the pill
      click(r.color_pill_0);
      // Then the menu opens
      expect(r.color).toHaveAttribute("aria-expanded", "true");
    });

    it("keeps the count badge instead of pills when AI proposes values", async () => {
      // Given Red on record and Blue and Green proposed, shown in the field
      const r = await render(<MultiHarness initial={["r"]} proposedValues={["b", "g"]} selectionView="inField" />);
      // Then the field keeps its count badge
      expect(r.color_count).toHaveTextContent("2");
      expect(r.query.color_pill_0).toBeNull();
    });

    it("keeps the Mixed label instead of pills when some values are dotted", async () => {
      // Given Red on every record and Blue on some, shown in the field
      const r = await render(<MultiHarness initial={["r"]} mixedValues={["b"]} selectionView="inField" />);
      // Then the field reads Mixed, with no pills
      expect(r.color).toHaveTextContent(/^Mixed2$/);
      expect(r.query.color_pill_0).toBeNull();
    });

    it("shows the placeholder in the field while selections are listed", async () => {
      // Given a selection list with two values and a field placeholder
      const r = await render(
        <MultiHarness initial={["r", "b"]} selectionView="selectionList" placeholder="Add an option" />,
      );
      // Then the field reads the placeholder, and the selections stay listed below it
      expect(r.color).toHaveTextContent("Add an option");
      expect(r.selectedOptionPillList_pill_value_0).toHaveTextContent("Red");
      expect(r.selectedOptionPillList_pill_value_1).toHaveTextContent("Blue");
    });

    it("lists each selection below the field when selectionList", async () => {
      // Given a multi select with two values, listed below the field
      const r = await render(<MultiHarness initial={["r", "b"]} selectionView="selectionList" />);
      // Then each selection is a pill below the field, and the count badge stays
      expect(r.selectedOptionPillList_pill_value_0).toHaveTextContent("Red");
      expect(r.selectedOptionPillList_pill_value_1).toHaveTextContent("Blue");
      expect(r.color_count).toHaveTextContent("2");
      expect(r.query.color_pill_0).toBeNull();
    });

    it("renders no list when nothing is selected", async () => {
      // Given a multi select with nothing selected, listed below the field
      const r = await render(<MultiHarness selectionView="selectionList" />);
      // Then there is no list
      expect(r.query.selectedOptionPillList).toBeNull();
    });

    it("uses the menu label for each list pill", async () => {
      // Given a menu label that differs from the field label
      const r = await render(
        <MultiHarness
          initial={["r"]}
          selectionView="selectionList"
          getOptionMenuLabel={(option) => `Menu ${option.name}`}
        />,
      );
      // Then the list pill shows the menu label
      expect(r.selectedOptionPillList_pill_value_0).toHaveTextContent("Menu Red");
    });

    it("removes a selection from its list pill", async () => {
      // Given Red and Blue listed below the field
      const onSelect = vi.fn();
      const r = await render(
        <MultiHarness initial={["r", "b"]} selectionView="selectionList" onSelectSpy={onSelect} />,
      );
      // When removing the Red pill
      click(r.selectedOptionPillList_pill_remove_0);
      // Then Red is cleared
      expect(onSelect).toHaveBeenLastCalledWith(["b"], [{ id: "b", name: "Blue" }]);
      expect(r.selectedOptionPillList_pill_value_0).toHaveTextContent("Blue");
    });

    it("hides list remove controls when the field is disabled", async () => {
      // Given a disabled field with Red listed below it
      const r = await render(<MultiHarness initial={["r"]} selectionView="selectionList" disabled />);
      // Then Red shows as a pill without a remove control
      expect(r.selectedOptionPillList_pill_value_0).toHaveTextContent("Red");
      expect(r.query.selectedOptionPillList_pill_remove_0).toBeNull();
    });
  });

  describe("AI mode", () => {
    it("counts the proposed values", async () => {
      // Given Red on record and Blue and Green proposed
      const r = await render(<MultiHarness initial={["r"]} proposedValues={["b", "g"]} />);
      // Then the badge counts the proposal and the original sits below
      expect(r.color_count).toHaveTextContent("2");
      expect(r.color).toHaveAttribute("data-ai-mode", "true");
      expect(r.color_originalValue).toHaveTextContent("Red");
    });
  });

  it("scopes the selection-count tooltip to an explicit field prefix", async () => {
    // Given a multi-select with selected values and an explicit prefix
    // When rendered
    const r = await render(
      <MenuMultiSelectField
        label="Color"
        options={colors()}
        values={["r", "b"]}
        onSelect={() => {}}
        data-testid="productColors"
      />,
    );
    // Then the count has its own tooltip, separate from field reasons
    expect(r.productColors_count_tooltip).toBeInTheDocument();
  });

  it("supports indexed tooltips for multiple disabled checkbox options", async () => {
    // Given Red and Black enabled, and Blue and Green disabled
    const r = await render(
      <MultiHarness
        disabledOptions={[
          { value: "b", reason: "Out of stock" },
          { value: "g", reason: "Discontinued" },
        ]}
      />,
    );
    // When opening it
    click(r.color);
    // Then the suffix indexes tooltip wrappers, not the full option list
    expect(r.color_option_tooltip_0).toHaveAttribute("title", "Out of stock");
    expect(r.color_option_tooltip_1).toHaveAttribute("title", "Discontinued");
  });
});

type Color = { id: string; name: string };

type HarnessProps = {
  onSelectSpy?: (values: string[], opts: Color[]) => void;
  options?: Color[];
  initial?: string[];
  proposedValues?: string[];
  disabledOptions?: (string | { value: string; reason: string })[];
  mixedValues?: string[];
  selectionView?: SelectionView;
  getOptionMenuLabel?: (option: Color) => string;
  placeholder?: string;
  disabled?: boolean;
};

function MultiHarness(props: HarnessProps) {
  const { onSelectSpy, initial = [], options = colors(), proposedValues, ...others } = props;
  const [values, setValues] = useState<string[]>(initial);
  return (
    <MenuMultiSelectField
      label="Color"
      options={options}
      values={values}
      proposedValues={proposedValues}
      onSelect={(next, opts) => {
        onSelectSpy?.(next, opts);
        setValues(next);
      }}
      {...others}
    />
  );
}

function colors(): Color[] {
  return [
    { id: "r", name: "Red" },
    { id: "b", name: "Blue" },
    { id: "k", name: "Black" },
    { id: "g", name: "Green" },
  ];
}

/** jsdom has no layout, so report the collapsed pill line as wider than its box. */
function mockSelectionsLineOverflow(testId: string) {
  const proto = HTMLElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, "scrollWidth");
  Object.defineProperty(proto, "scrollWidth", {
    configurable: true,
    get() {
      return (this as HTMLElement).dataset.testid === testId ? 400 : (descriptor?.get?.call(this) ?? 0);
    },
  });
  return () => {
    if (descriptor) Object.defineProperty(proto, "scrollWidth", descriptor);
    else delete (proto as { scrollWidth?: number }).scrollWidth;
  };
}

function manyColors(): Color[] {
  return [
    ...colors(),
    { id: "y", name: "Yellow" },
    { id: "o", name: "Orange" },
    { id: "p", name: "Purple" },
    { id: "w", name: "White" },
    { id: "n", name: "Brown" },
  ];
}
