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
