import { fireEvent } from "@testing-library/react";
import { act, useState, type ReactNode } from "react";
import { OpenModal } from "src/components/Modal/OpenModal";
import { PresentationProvider } from "src/components/PresentationContext";
import { MenuSelectField } from "src/inputs/MenuSelectField/MenuSelectField";
import { setViewport } from "src/tests/viewport";
import { click, getOptions, getSelected, render, select, type, wait } from "src/utils/rtl";
import { vi } from "vitest";

describe("MenuSelectField", () => {
  it("renders the label and nothing-selected text", async () => {
    // Given a single select with nothing selected
    const r = await render(<TestHarness nothingSelectedText="All" />);
    // Then the trigger shows the label and placeholder text
    expect(r.color_label).toHaveTextContent("Color");
    expect(r.color.tagName).toBe("BUTTON");
    expect(r.color).toHaveTextContent("All");
    expect(r.color).toHaveAttribute("aria-expanded", "false");
  });

  it("focuses the list when a short menu opens", async () => {
    // Given a single select with eight options
    const r = await render(<TestHarness options={manyColors().slice(0, 8)} />);
    // When opening it
    click(r.color);
    // Then there is no search field, and the list has focus
    expect(r.color).toHaveAttribute("aria-expanded", "true");
    expect(r.query.color_search).toBeNull();
    expect(r.color_listbox).toHaveFocus();
  });

  it("focuses the search input when a long menu opens", async () => {
    // Given a single select with more than eight options
    const r = await render(<TestHarness options={manyColors()} />);
    // When opening it
    click(r.color);
    // Then the search input has focus
    expect(document.activeElement).toBe(r.color_search);
  });

  it("filters options by the search text", async () => {
    // Given an open single select with enough options to search
    const r = await render(<TestHarness options={manyColors()} />);
    click(r.color);
    // When searching
    type(r.color_search, "bl");
    // Then only matching options remain
    expect(getOptions(r.color)).toEqual(["Black", "Blue"]);
  });

  it("shows search on a short list when the caller handles it", async () => {
    // Given a short list with onSearch
    const onSearch = vi.fn();
    const r = await render(<SearchField onSearch={onSearch} />);
    // When opening and closing without typing
    click(r.color);
    expect(r.color_search).toBeInTheDocument();
    click(r.color);
    // Then nothing is queried
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("shows the options the caller returns for a search", async () => {
    // Given a short list whose matches come from the caller
    const onSearch = vi.fn();
    const r = await render(<SearchField onSearch={onSearch} />);
    click(r.color);
    // When searching for text that is not in the current labels
    type(r.color_search, "oak");
    // Then the current page stays until the caller answers
    expect(getOptions(r.color)).toEqual(["Black", "Blue", "Green", "Red"]);
    await wait();
    // Then the caller is asked, and their option is shown even though its label does not contain the text
    expect(onSearch).toHaveBeenCalledWith("oak");
    expect(getOptions(r.color)).toEqual(["123 Main"]);
    // When the search is cleared
    type(r.color_search, "");
    await wait();
    // Then the caller is asked for the unfiltered page
    expect(onSearch).toHaveBeenLastCalledWith("");
    expect(getOptions(r.color)).toEqual(["Black", "Blue", "Green", "Red"]);
  });

  it("asks for the unfiltered page when a search menu closes", async () => {
    // Given a search that has been sent
    const onSearch = vi.fn();
    const r = await render(<SearchField onSearch={onSearch} />);
    click(r.color);
    type(r.color_search, "oak");
    await wait();
    // When the menu closes
    click(r.color);
    // Then the caller is asked for the first page
    expect(onSearch).toHaveBeenLastCalledWith("");
  });

  it("loads options the first time the menu opens", async () => {
    // Given a selected option whose full list has not been loaded
    const load = vi.fn();
    let finishLoad = () => {};
    function LazyField() {
      const [loaded, setLoaded] = useState<Color[] | undefined>();
      return (
        <MenuSelectField
          label="Color"
          value="b"
          onSelect={() => {}}
          options={{
            current: { id: "b", name: "Blue" },
            load: () => {
              load();
              return new Promise<void>((resolve) => {
                finishLoad = () => {
                  setLoaded(colors());
                  resolve();
                };
              });
            },
            options: loaded,
          }}
        />
      );
    }
    const r = await render(<LazyField />);
    expect(load).not.toHaveBeenCalled();
    expect(r.color).toHaveTextContent("Blue");

    // When the menu opens
    click(r.color);

    // Then the loader runs, the current option stays visible, and the rest arrive when it finishes
    expect(load).toHaveBeenCalledOnce();
    expect(r.loadingDots).toBeInTheDocument();
    expect(getOptions(r.color)).toEqual(["Blue"]);
    await act(async () => {
      finishLoad();
    });
    expect(getOptions(r.color)).toEqual(["Black", "Blue", "Green", "Red"]);
    expect(r.query.loadingDots).toBeNull();
  });

  describe("AI mode", () => {
    it("shows the proposal with the original struck through below", async () => {
      // Given Red on record and Blue proposed
      const r = await render(<TestHarness initial="r" proposedValue="b" />);
      // Then the trigger shows the proposal and the original sits below
      expect(r.color).toHaveTextContent("Blue");
      expect(r.color).toHaveAttribute("data-ai-mode", "true");
      expect(r.color_originalValue).toHaveTextContent("Red");
    });

    it("shows the proposal as selected in the menu", async () => {
      // Given Red on record and Blue proposed
      const r = await render(<TestHarness initial="r" proposedValue="b" />);
      // When opening the menu
      click(r.color);
      // Then Blue is the selected row
      expect(getSelected(r.color)).toBe("Blue");
    });

    it("does not commit when re-picking the proposal", async () => {
      // Given Red on record and Blue proposed
      const onSelect = vi.fn();
      const r = await render(<TestHarness initial="r" proposedValue="b" onSelectSpy={onSelect} />);
      // When picking the option AI mode already shows
      select(r.color, "Blue");
      // Then nothing commits and the field stays in AI mode
      expect(onSelect).not.toHaveBeenCalled();
      expect(r.color).toHaveAttribute("data-ai-mode", "true");
    });

    it("commits and drops the AI treatment when picking another option", async () => {
      // Given Red on record and Blue proposed
      const onSelect = vi.fn();
      const r = await render(<TestHarness initial="r" proposedValue="b" onSelectSpy={onSelect} />);
      // When picking Green
      select(r.color, "Green");
      // Then Green commits and the field reads normally
      expect(onSelect).toHaveBeenCalledWith("g", { id: "g", name: "Green" });
      expect(r.color).toHaveTextContent("Green");
      expect(r.color).not.toHaveAttribute("data-ai-mode");
    });

    it("omits the original when nothing was on record", async () => {
      // Given nothing on record and Blue proposed
      const r = await render(<TestHarness proposedValue="b" />);
      // Then there is no struck-through original
      expect(r.color).toHaveAttribute("data-ai-mode", "true");
      expect(r.query.color_originalValue).toBeNull();
    });

    it("draws both halves inline when read-only", async () => {
      // Given a read-only field with Red on record and Blue proposed
      const r = await render(<TestHarness initial="r" proposedValue="b" readOnly />);
      // Then the original and proposal render together
      expect(r.color_proposedValue).toHaveTextContent("Red Blue");
      expect(r.query.color_originalValue).toBeNull();
    });
  });

  it("also matches getOptionSearchText", async () => {
    // Given an option whose search text is not part of its label
    const r = await render(
      <TestHarness options={manyColors()} getOptionSearchText={(color) => (color.id === "b" ? "AZURE" : [])} />,
    );
    click(r.color);
    // When searching for that extra text
    type(r.color_search, "azu");
    // Then the option matches, and the row still shows the label
    expect(getOptions(r.color)).toEqual(["Blue"]);
  });

  it("renders a custom menu label and still searches the string label", async () => {
    // Given a selected option whose menu row is custom content
    const r = await render(
      <TestHarness initial="b" options={manyColors()} getOptionMenuLabel={(color) => <em>{color.id}</em>} />,
    );
    // Then the closed trigger keeps the string label
    expect(r.color).toHaveTextContent("Blue");

    // When the menu opens and the search matches the string label, not the custom content
    click(r.color);
    type(r.color_search, "blu");

    // Then only Blue remains, rendered with the custom node
    expect(getOptions(r.color)).toEqual(["Blue"]);
    expect(r.color_option.querySelector("em")).toHaveTextContent("b");
  });

  it("sorts options alphabetically", async () => {
    // Given options that are not in alphabetical order
    const r = await render(<TestHarness />);
    // When the menu opens
    click(r.color);
    // Then they are sorted by label
    expect(getOptions(r.color)).toEqual(["Black", "Blue", "Green", "Red"]);
  });

  it("keeps the given order when autoSort is false", async () => {
    // Given autoSort turned off
    const r = await render(<TestHarness autoSort={false} />);
    // When the menu opens
    click(r.color);
    // Then the caller order is kept
    expect(getOptions(r.color)).toEqual(["Red", "Blue", "Black", "Green"]);
  });

  describe("unsetLabel", () => {
    it("puts the unsetLabel row first and selects it when the value is empty", async () => {
      // Given unsetLabel and no value
      const r = await render(<TestHarness unsetLabel="None" />);
      // Then the trigger shows that label, and the row is first and selected
      expect(r.color).toHaveTextContent("None");
      expect(getSelected(r.color)).toBe("None");
      expect(getOptions(r.color)).toEqual(["None", "Black", "Blue", "Green", "Red"]);
    });

    it("keeps unsetLabel first when autoSort is off", async () => {
      // Given caller order and a label that would sort into the list
      const r = await render(
        <TestHarness
          unsetLabel="None"
          autoSort={false}
          options={[
            { id: "z", name: "Zebra" },
            { id: "a", name: "Aardvark" },
          ]}
        />,
      );
      // Then None stays first and the rest keep the given order
      expect(getOptions(r.color)).toEqual(["None", "Zebra", "Aardvark"]);
    });

    it("commits undefined when the unset row is selected", async () => {
      // Given a selected color and an unset row
      const onSelect = vi.fn();
      const r = await render(<TestHarness initial="b" unsetLabel="None" onSelectSpy={onSelect} />);
      // When selecting the unset row
      select(r.color, "None");
      // Then the field clears
      expect(onSelect).toHaveBeenCalledWith(undefined, undefined);
      expect(r.color).toHaveTextContent("None");
    });

    it("lets getOptionMenuLabel replace the unset row", async () => {
      // Given a custom menu row for the unset option
      const r = await render(
        <TestHarness
          unsetLabel="None"
          getOptionMenuLabel={(_color, isUnsetOpt) => (isUnsetOpt ? "Unset Label" : _color.name)}
        />,
      );
      // Then the closed field keeps unsetLabel
      expect(r.color).toHaveTextContent("None");
      // When the menu opens
      click(r.color);
      // Then the row content is the custom label, and its accessible name stays unsetLabel
      const row = r.color_listbox.querySelector("[data-label='None']");
      expect(row).toHaveTextContent("Unset Label");
    });

    it("shows unsetLabel before lazy options load", async () => {
      // Given a list that has not loaded
      let finishLoad = () => {};
      function LazyField() {
        const [loaded, setLoaded] = useState<Color[] | undefined>();
        return (
          <MenuSelectField
            label="Color"
            value={undefined}
            unsetLabel="None"
            onSelect={() => {}}
            options={{
              current: undefined,
              load: () =>
                new Promise<void>((resolve) => {
                  finishLoad = () => {
                    setLoaded(colors());
                    resolve();
                  };
                }),
              options: loaded,
            }}
          />
        );
      }
      const r = await render(<LazyField />);
      expect(r.color).toHaveTextContent("None");
      // When the menu opens
      click(r.color);
      // Then only the unset row is listed until the load finishes
      expect(getOptions(r.color)).toEqual(["None"]);
      await act(async () => {
        finishLoad();
      });
      expect(getOptions(r.color)).toEqual(["None", "Black", "Blue", "Green", "Red"]);
    });

    it("hides unsetLabel when the search does not match it", async () => {
      // Given a searchable list with an unset row
      const r = await render(<TestHarness options={manyColors()} unsetLabel="None" />);
      click(r.color);
      // When the query matches nothing
      type(r.color_search, "zzz");
      // Then the unset row is filtered out with the rest
      expect(r.color_empty).toHaveTextContent("No results");
    });

    it("keeps unsetLabel when the search matches it", async () => {
      // Given a searchable list with an unset row
      const r = await render(<TestHarness options={manyColors()} unsetLabel="None" />);
      click(r.color);
      // When the query matches the unset label
      type(r.color_search, "non");
      // Then the unset row remains
      expect(getOptions(r.color)).toEqual(["None"]);
    });

    it("keeps the unset row when onSearch replaces the list", async () => {
      // Given a server-filtered list
      function Field() {
        const [options, setOptions] = useState(colors());
        return (
          <MenuSelectField
            label="Color"
            unsetLabel="All"
            value={undefined}
            options={options}
            onSelect={() => {}}
            onSearch={(text) => setOptions(text ? [{ id: "addr", name: "123 Main" }] : colors())}
          />
        );
      }
      const r = await render(<Field />);
      click(r.color);
      // When the caller replaces the options
      type(r.color_search, "oak");
      await wait();
      // Then the unsetLabel row stays above the matches
      expect(getOptions(r.color)).toEqual(["All", "123 Main"]);
    });
  });

  it("shows an empty row when nothing matches", async () => {
    // Given an open single select with enough options to search
    const r = await render(<TestHarness options={manyColors()} />);
    click(r.color);
    // When searching for something that doesn't exist
    type(r.color_search, "zzz");
    // Then the empty row renders
    expect(r.color_empty).toHaveTextContent("No results");
  });

  it("commits and closes on single select", async () => {
    // Given a single select
    const onSelect = vi.fn();
    const r = await render(<TestHarness onSelectSpy={onSelect} />);
    // When selecting an option
    select(r.color, "Blue");
    // Then the value is committed, the menu closes, and focus returns to the trigger
    expect(onSelect).toHaveBeenCalledWith("b", { id: "b", name: "Blue" });
    expect(r.color).toHaveTextContent("Blue");
    expect(r.query.color_overlay).toBeNull();
    expect(document.activeElement).toBe(r.color);
  });

  it("does not show selected pills", async () => {
    // Given a single select with a value
    const r = await render(<TestHarness initial="b" />);
    // When opening it
    click(r.color);
    // Then the menu has no selected-pill row
    expect(r.query.color_selections).toBeNull();
  });

  it("closes when re-selecting the current value", async () => {
    // Given a single select with a value
    const onSelect = vi.fn();
    const r = await render(<TestHarness initial="b" onSelectSpy={onSelect} />);
    // When selecting the same option again
    select(r.color, "Blue");
    // Then the menu closes and the value stays
    expect(r.query.color_overlay).toBeNull();
    expect(r.color).toHaveTextContent("Blue");
  });

  it("keeps focus in the list when pressing an option", async () => {
    // Given an open select with no search field
    const r = await render(<TestHarness />);
    click(r.color);
    // When pressing down on an option
    const notPrevented = fireEvent.mouseDown(r.getAllByTestId("color_option")[0]);
    // Then the browser's default focus change is prevented and the list keeps focus
    expect(notPrevented).toBe(false);
    expect(r.color_listbox).toHaveFocus();
  });

  it("keeps focus in the search input when pressing an option", async () => {
    // Given an open select with a search field
    const r = await render(<TestHarness options={manyColors()} />);
    click(r.color);
    // When pressing down on an option
    const notPrevented = fireEvent.mouseDown(r.getAllByTestId("color_option")[0]);
    // Then the browser's default focus change is prevented and search keeps focus
    expect(notPrevented).toBe(false);
    expect(r.color_search).toHaveFocus();
  });

  it("navigates and selects with the keyboard", async () => {
    // Given an open single select
    const onSelect = vi.fn();
    const r = await render(<TestHarness onSelectSpy={onSelect} />);
    click(r.color);
    // Then nothing is highlighted until the keyboard moves
    expect(menuKeyTarget(r).getAttribute("aria-activedescendant")).toBeNull();
    // When moving down once and pressing Enter
    fireEvent.keyDown(menuKeyTarget(r), { key: "ArrowDown" });
    expect(menuKeyTarget(r).getAttribute("aria-activedescendant")).toMatch(/-option-0$/);
    fireEvent.keyDown(menuKeyTarget(r), { key: "Enter" });
    // Then the first option is selected
    expect(onSelect).toHaveBeenCalledWith("k", { id: "k", name: "Black" });
  });

  it("opens from the trigger with ArrowDown", async () => {
    // Given a closed single select
    const r = await render(<TestHarness />);
    // When pressing ArrowDown on the trigger
    fireEvent.keyDown(r.color, { key: "ArrowDown" });
    // Then the menu opens
    expect(r.color_overlay).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    // Given an open single select
    const r = await render(<TestHarness />);
    click(r.color);
    // When pressing Escape in the menu
    fireEvent.keyDown(menuKeyTarget(r), { key: "Escape" });
    // Then it closes and focus is back on the trigger
    expect(r.query.color_overlay).toBeNull();
    expect(document.activeElement).toBe(r.color);
  });

  it("does not select disabled options", async () => {
    // Given a single select with a disabled option
    const onSelect = vi.fn();
    const r = await render(<TestHarness onSelectSpy={onSelect} disabledOptions={[{ value: "b", reason: "Nope" }]} />);
    click(r.color);
    // When moving onto the first option, then down past the disabled option, and pressing Enter
    fireEvent.keyDown(menuKeyTarget(r), { key: "ArrowDown" });
    fireEvent.keyDown(menuKeyTarget(r), { key: "ArrowDown" });
    fireEvent.keyDown(menuKeyTarget(r), { key: "Enter" });
    // Then the disabled option is skipped
    expect(onSelect).toHaveBeenCalledWith("g", { id: "g", name: "Green" });
    // And the disabled option is marked disabled
    click(r.color);
    const blue = r.getAllByTestId("color_option").find((o) => o.dataset.label === "Blue");
    expect(blue).toHaveAttribute("aria-disabled", "true");
  });

  it("does not open when disabled", async () => {
    // Given a disabled select
    const r = await render(<TestHarness disabled />);
    // When clicking it
    click(r.color);
    // Then it stays closed
    expect(r.query.color_overlay).toBeNull();
    expect(r.color).toBeDisabled();
  });

  it("portals the menu to the body", async () => {
    // Given a single select
    const r = await render(<TestHarness />);
    // When opening it
    click(r.color);
    // Then the popover container is under body
    expect(r.color_overlay.parentElement?.parentElement).toBe(document.body);
  });

  it("moves to the ends of the list with Home and End", async () => {
    // Given an open single select
    const r = await render(<TestHarness />);
    click(r.color);
    // When pressing End, then Home
    fireEvent.keyDown(menuKeyTarget(r), { key: "End" });
    expect(menuKeyTarget(r).getAttribute("aria-activedescendant")).toMatch(/-option-3$/);
    fireEvent.keyDown(menuKeyTarget(r), { key: "Home" });
    // Then virtual focus returns to the first option
    expect(menuKeyTarget(r).getAttribute("aria-activedescendant")).toMatch(/-option-0$/);
  });

  it("opens when the label is clicked", async () => {
    // Given a closed single select
    const r = await render(<TestHarness />);
    // When the label is clicked
    click(r.color_label);
    // Then the menu opens and the list is focused
    expect(r.color_overlay).toBeInTheDocument();
    expect(r.color_listbox).toHaveFocus();
  });

  it("does not close a parent modal on Escape", async () => {
    // Given the field inside an open modal
    const r = await render(
      <OpenModal keepOpen>
        <TestHarness />
      </OpenModal>,
    );
    click(r.color);
    // When Escape is pressed in the menu
    fireEvent.keyDown(menuKeyTarget(r), { key: "Escape" });
    // Then the menu closes and the modal stays open
    expect(r.query.color_overlay).toBeNull();
    expect(r.modal).toBeInTheDocument();
  });

  it("renders read-only text and does not open", async () => {
    // Given a read-only field with a value
    const r = await render(<TestHarness initial="b" readOnly />);
    // Then the trigger is static text
    expect(r.color.tagName).toBe("DIV");
    expect(r.color).toHaveAttribute("data-readonly", "true");
    expect(r.color).toHaveTextContent("Blue");
    // When it is clicked
    click(r.color);
    // Then the menu stays closed
    expect(r.query.color_overlay).toBeNull();
  });

  it("keeps a hidden label and shows the error in a tooltip", async () => {
    // Given table cell settings that hide the label and move the error into a tooltip
    const r = await render(
      <PresentationProvider fieldProps={{ labelStyle: "hidden", borderOnHover: true, errorInTooltip: true }}>
        <MenuSelectField label="Color" options={colors()} value="b" onSelect={() => {}} />
        <MenuSelectField label="Error" options={colors()} value="b" onSelect={() => {}} errorMsg="Required" />
      </PresentationProvider>,
    );
    // Then the label stays available, the error is not inline, and the field opts into the table row hover border
    expect(r.query.color_label).not.toBeNull();
    expect(r.query.error_errorMsg).toBeNull();
    expect(r.color).toHaveClass("beam-bhc");
  });

  it("stays open when a parent scrolls", async () => {
    // Given an open menu inside a scrolling parent
    const r = await render(
      <div data-testid="scroller" style={{ height: 120, overflow: "auto" }}>
        <TestHarness />
        <div style={{ height: 400 }} />
      </div>,
    );
    click(r.color);
    // When the parent scrolls
    fireEvent.scroll(r.scroller);
    // Then the menu stays open
    expect(r.color_overlay).toBeInTheDocument();
    expect(r.color).toHaveAttribute("aria-expanded", "true");
  });

  it("opens a bottom sheet on small screens", async () => {
    // Given a mobile viewport
    setViewport("sm");
    const r = await render(<TestHarness />);
    // When opening the select
    click(r.color);
    // Then it renders as a sheet with the list focused
    expect(r.color_sheet).toBeInTheDocument();
    expect(r.query.color_overlay).toBeNull();
    expect(r.color_sheet.style.width).toBe("");
    expect(document.activeElement).toBe(r.color_listbox);
    // And Done closes it
    click(r.color_sheetDone);
    expect(r.query.color_sheet).toBeNull();
  });

  it("keeps the sheet inside the visual viewport when the keyboard is open", async () => {
    // Given a small screen whose visible viewport is shorter than the layout viewport
    setViewport("sm");
    const keyboard = installKeyboardViewport({ height: 320, offsetTop: 40 });
    const r = await render(<TestHarness />);
    click(r.color);
    const frame = r.color_sheet.parentElement as HTMLElement;
    // Then the sheet frame matches the visible viewport, above the keyboard
    expect(frame.style.top).toBe("40px");
    expect(frame.style.height).toBe("320px");
    expect(frame.style.getPropertyValue("--menu-max-height")).toBe("224px");

    // When the keyboard grows. The sheet applies the viewport on the next frame.
    const pending: FrameRequestCallback[] = [];
    const originalFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      pending.push(callback);
      return pending.length;
    };
    try {
      keyboard.set({ height: 200, offsetTop: 0 });
      act(() => {
        pending.forEach((callback) => callback(0));
      });
      // Then the frame shrinks with the visible viewport
      expect(frame.style.top).toBe("0px");
      expect(frame.style.height).toBe("200px");
      expect(frame.style.getPropertyValue("--menu-max-height")).toBe("122px");
    } finally {
      window.requestAnimationFrame = originalFrame;
      keyboard.restore();
    }
  });
});

type Color = { id: string; name: string };

type HarnessProps = {
  onSelectSpy?: (...args: unknown[]) => void;
  nothingSelectedText?: string;
  unsetLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  disabledOptions?: { value: string; reason: string }[];
  getOptionMenuLabel?: (color: Color, isUnsetOpt?: boolean) => ReactNode;
  getOptionSearchText?: (color: Color) => string | readonly string[];
  options?: Color[];
  autoSort?: boolean;
};

function installKeyboardViewport(initial: { height: number; offsetTop: number }) {
  const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
  const originalVisualViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");
  const listeners = new Set<() => void>();
  const viewport = {
    height: initial.height,
    offsetTop: initial.offsetTop,
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
  };
  Object.defineProperty(window, "innerHeight", { configurable: true, get: () => 800 });
  Object.defineProperty(window, "visualViewport", { configurable: true, get: () => viewport });
  return {
    set(next: { height: number; offsetTop: number }) {
      viewport.height = next.height;
      viewport.offsetTop = next.offsetTop;
      listeners.forEach((listener) => listener());
    },
    restore() {
      if (originalInnerHeight) Object.defineProperty(window, "innerHeight", originalInnerHeight);
      else delete (window as { innerHeight?: number }).innerHeight;
      if (originalVisualViewport) Object.defineProperty(window, "visualViewport", originalVisualViewport);
      else delete (window as { visualViewport?: VisualViewport }).visualViewport;
    },
  };
}

function colors() {
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

function menuKeyTarget(r: { query: { color_search?: HTMLElement | null }; color_listbox?: HTMLElement }): HTMLElement {
  const target = r.query.color_search ?? r.color_listbox;
  if (!target) throw new Error("Expected a search input or listbox");
  return target;
}

function SearchField(props: { onSearch: (search: string) => void }) {
  const [options, setOptions] = useState(colors());
  return (
    <MenuSelectField
      label="Color"
      value={undefined}
      options={options}
      onSelect={() => {}}
      onSearch={(text) => {
        props.onSearch(text);
        setOptions(text ? [{ id: "addr", name: "123 Main" }] : colors());
      }}
    />
  );
}

function TestHarness(props: HarnessProps & { initial?: string; proposedValue?: string }) {
  const { onSelectSpy, initial, options = colors(), ...others } = props;
  const [value, setValue] = useState<string | undefined>(initial);
  return (
    <MenuSelectField
      label="Color"
      options={options}
      value={value}
      onSelect={(v, o) => {
        onSelectSpy?.(v, o);
        setValue(v);
      }}
      {...others}
    />
  );
}
