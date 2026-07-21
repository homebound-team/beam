import { click, render } from "@homebound/rtl-utils";
import { act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { MultiSelectField } from "src/inputs";
import { HasIdAndName } from "src/types";
import { describe, expect, it, vi } from "vitest";

const { MockVirtuoso } = vi.hoisted(() => {
  const optionRowHeight = 42;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react") as typeof import("react");
  function MockVirtuoso({
    totalCount,
    totalListHeightChanged,
    itemContent,
  }: {
    totalCount: number;
    totalListHeightChanged?: (height: number) => void;
    itemContent: (index: number) => React.ReactNode;
  }) {
    React.useEffect(() => {
      totalListHeightChanged?.(totalCount * optionRowHeight);
      // Intentionally omit totalListHeightChanged — ListBox recreates it each render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalCount]);
    return React.createElement(
      "div",
      null,
      Array.from({ length: totalCount }, (_, i) => React.createElement("div", { key: i }, itemContent(i))),
    );
  }
  return { MockVirtuoso };
});

// jsdom does not lay out Virtuoso rows, so drive totalListHeightChanged with a deterministic height.
vi.mock("react-virtuoso", () => ({
  Virtuoso: MockVirtuoso,
}));

function listboxHeightPx(listbox: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(listbox).getPropertyValue("--height"));
}

describe("MultiSelectField listbox height", () => {
  it("does not shrink the listbox height when filtering options", async () => {
    // Given a MultiSelectField with enough options to fill the list popover
    const manyOptions: HasIdAndName[] = Array.from({ length: 40 }, (_, i) => ({
      id: String(i + 1),
      name: i === 39 ? "UniqueZebra" : `Option ${String(i + 1).padStart(2, "0")}`,
    }));
    const r = await render(<TestMultiSelectField values={["1", "2", "3"]} options={manyOptions} />);
    // When opening the menu
    click(r.age);
    const listbox = r.getByRole("listbox");
    // Virtuoso mock reports content height (capped at ListBox max of 512) via --height
    expect(listboxHeightPx(listbox)).toBe(512);
    const heightBeforeFilter = listboxHeightPx(listbox);

    // When filtering down to a single matching option
    act(() => {
      fireEvent.input(r.age, { target: { value: "UniqueZebra" } });
    });
    expect(r.getAllByRole("option").map((o) => o.textContent)).toEqual(["UniqueZebra"]);

    // Then the listbox height does not collapse below the height established before filtering
    expect(listboxHeightPx(listbox)).toBeGreaterThanOrEqual(heightBeforeFilter);
  });
});

function TestMultiSelectField(props: { values: string[]; options: HasIdAndName[] }): JSX.Element {
  const [selected, setSelected] = useState(props.values);
  return (
    <MultiSelectField
      label="Age"
      getOptionLabel={(o) => o.name}
      getOptionValue={(o) => o.id}
      options={props.options}
      values={selected}
      onSelect={setSelected}
      autoSort={false}
      data-testid="age"
    />
  );
}
