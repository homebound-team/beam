import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { MenuMultiSelectField } from "src/inputs/MenuSelectField/MenuMultiSelectField";
import { click, render, select, type } from "src/utils/rtl";
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
});

type Color = { id: string; name: string };

type HarnessProps = {
  onSelectSpy?: (values: string[], opts: Color[]) => void;
  options?: Color[];
  initial?: string[];
  proposedValues?: string[];
  disabledOptions?: (string | { value: string; reason: string })[];
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
