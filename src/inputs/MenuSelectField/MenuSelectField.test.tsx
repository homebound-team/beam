import { fireEvent } from "@testing-library/react";
import { act, useState, type ReactNode } from "react";
import { OpenModal } from "src/components/Modal/OpenModal";
import { PresentationProvider } from "src/components/PresentationContext";
import { MenuSelectField } from "src/inputs/MenuSelectField/MenuSelectField";
import { SelectField } from "src/inputs/SelectField";
import { TextField } from "src/inputs/TextField";
import { setViewport } from "src/tests/viewport";
import { click, getOptions, getSelected, render, select, type } from "src/utils/rtl";
import { zIndices } from "src/utils/zIndices";
import { vi } from "vitest";

describe("MenuSelectField", () => {
  it("renders the label and nothing-selected text", async () => {
    // Given a single select with nothing selected
    const r = await render(<SingleHarness nothingSelectedText="All" />);
    // Then the trigger shows the label and placeholder text
    expect(r.color_label).toHaveTextContent("Color");
    expect(r.color.tagName).toBe("BUTTON");
    expect(r.color).toHaveTextContent("All");
    expect(r.color).toHaveAttribute("aria-expanded", "false");
  });

  it("focuses the list when a short menu opens", async () => {
    // Given a single select with eight options
    const r = await render(<SingleHarness options={manyColors().slice(0, 8)} />);
    // When opening it
    click(r.color);
    // Then there is no search field, and the list has focus
    expect(r.color).toHaveAttribute("aria-expanded", "true");
    expect(r.query.color_search).toBeNull();
    expect(r.color_listbox).toHaveFocus();
  });

  it("focuses the search input when a long menu opens", async () => {
    // Given a single select with more than eight options
    const r = await render(<SingleHarness options={manyColors()} />);
    // When opening it
    click(r.color);
    // Then the search input has focus
    expect(document.activeElement).toBe(r.color_search);
  });

  it("filters options by the search text", async () => {
    // Given an open single select with enough options to search
    const r = await render(<SingleHarness options={manyColors()} />);
    click(r.color);
    // When searching
    type(r.color_search, "bl");
    // Then only matching options remain
    expect(getOptions(r.color)).toEqual(["Blue", "Black"]);
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
    expect(getOptions(r.color)).toEqual(["Red", "Blue", "Black", "Green"]);
    expect(r.query.loadingDots).toBeNull();
  });

  describe("AI mode", () => {
    it("shows the proposal with the original struck through below", async () => {
      // Given Red on record and Blue proposed
      const r = await render(<SingleHarness initial="r" proposedValue="b" />);
      // Then the trigger shows the proposal and the original sits below
      expect(r.color).toHaveTextContent("Blue");
      expect(r.color).toHaveAttribute("data-ai-mode", "true");
      expect(r.color_originalValue).toHaveTextContent("Red");
    });

    it("shows the proposal as selected in the menu", async () => {
      // Given Red on record and Blue proposed
      const r = await render(<SingleHarness initial="r" proposedValue="b" />);
      // When opening the menu
      click(r.color);
      // Then Blue is the selected row
      expect(getSelected(r.color)).toBe("Blue");
    });

    it("does not commit when re-picking the proposal", async () => {
      // Given Red on record and Blue proposed
      const onSelect = vi.fn();
      const r = await render(<SingleHarness initial="r" proposedValue="b" onSelectSpy={onSelect} />);
      // When picking the option AI mode already shows
      select(r.color, "Blue");
      // Then nothing commits and the field stays in AI mode
      expect(onSelect).not.toHaveBeenCalled();
      expect(r.color).toHaveAttribute("data-ai-mode", "true");
    });

    it("commits and drops the AI treatment when picking another option", async () => {
      // Given Red on record and Blue proposed
      const onSelect = vi.fn();
      const r = await render(<SingleHarness initial="r" proposedValue="b" onSelectSpy={onSelect} />);
      // When picking Green
      select(r.color, "Green");
      // Then Green commits and the field reads normally
      expect(onSelect).toHaveBeenCalledWith("g", { id: "g", name: "Green" });
      expect(r.color).toHaveTextContent("Green");
      expect(r.color).not.toHaveAttribute("data-ai-mode");
    });

    it("omits the original when nothing was on record", async () => {
      // Given nothing on record and Blue proposed
      const r = await render(<SingleHarness proposedValue="b" />);
      // Then there is no struck-through original
      expect(r.color).toHaveAttribute("data-ai-mode", "true");
      expect(r.query.color_originalValue).toBeNull();
    });

    it("draws both halves inline when read-only", async () => {
      // Given a read-only field with Red on record and Blue proposed
      const r = await render(<SingleHarness initial="r" proposedValue="b" readOnly />);
      // Then the original and proposal render together
      expect(r.color_proposedValue).toHaveTextContent("Red Blue");
      expect(r.query.color_originalValue).toBeNull();
    });
  });

  it("also matches getOptionSearchText", async () => {
    // Given an option whose search text is not part of its label
    const r = await render(
      <SingleHarness options={manyColors()} getOptionSearchText={(color) => (color.id === "b" ? "AZURE" : [])} />,
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
      <SingleHarness initial="b" options={manyColors()} getOptionMenuLabel={(color) => <em>{color.id}</em>} />,
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

  it("shows an empty row when nothing matches", async () => {
    // Given an open single select with enough options to search
    const r = await render(<SingleHarness options={manyColors()} />);
    click(r.color);
    // When searching for something that doesn't exist
    type(r.color_search, "zzz");
    // Then the empty row renders
    expect(r.color_empty).toHaveTextContent("No results");
  });

  it("commits and closes on single select", async () => {
    // Given a single select
    const onSelect = vi.fn();
    const r = await render(<SingleHarness onSelectSpy={onSelect} />);
    // When selecting an option
    select(r.color, "Blue");
    // Then the value is committed, the menu closes, and focus returns to the trigger
    expect(onSelect).toHaveBeenCalledWith("b", { id: "b", name: "Blue" });
    expect(r.color).toHaveTextContent("Blue");
    expect(r.query.color_overlay).toBeNull();
    expect(document.activeElement).toBe(r.color);
  });

  it("closes when re-selecting the current value", async () => {
    // Given a single select with a value
    const onSelect = vi.fn();
    const r = await render(<SingleHarness initial="b" onSelectSpy={onSelect} />);
    // When selecting the same option again
    select(r.color, "Blue");
    // Then the menu closes and the value stays
    expect(r.query.color_overlay).toBeNull();
    expect(r.color).toHaveTextContent("Blue");
  });

  it("keeps focus in the list when pressing an option", async () => {
    // Given an open select with no search field
    const r = await render(<SingleHarness />);
    click(r.color);
    // When pressing down on an option
    const notPrevented = fireEvent.mouseDown(r.getAllByTestId("color_option")[0]);
    // Then the browser's default focus change is prevented and the list keeps focus
    expect(notPrevented).toBe(false);
    expect(r.color_listbox).toHaveFocus();
  });

  it("keeps focus in the search input when pressing an option", async () => {
    // Given an open select with a search field
    const r = await render(<SingleHarness options={manyColors()} />);
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
    const r = await render(<SingleHarness onSelectSpy={onSelect} />);
    click(r.color);
    // Then nothing is highlighted until the keyboard moves
    expect(menuKeyTarget(r).getAttribute("aria-activedescendant")).toBeNull();
    // When moving down once and pressing Enter
    fireEvent.keyDown(menuKeyTarget(r), { key: "ArrowDown" });
    expect(menuKeyTarget(r).getAttribute("aria-activedescendant")).toMatch(/-option-0$/);
    fireEvent.keyDown(menuKeyTarget(r), { key: "Enter" });
    // Then the first option is selected
    expect(onSelect).toHaveBeenCalledWith("r", { id: "r", name: "Red" });
  });

  it("opens from the trigger with ArrowDown", async () => {
    // Given a closed single select
    const r = await render(<SingleHarness />);
    // When pressing ArrowDown on the trigger
    fireEvent.keyDown(r.color, { key: "ArrowDown" });
    // Then the menu opens
    expect(r.color_overlay).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    // Given an open single select
    const r = await render(<SingleHarness />);
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
    const r = await render(<SingleHarness onSelectSpy={onSelect} disabledOptions={[{ value: "b", reason: "Nope" }]} />);
    click(r.color);
    // When moving onto the first option, then down past the disabled option, and pressing Enter
    fireEvent.keyDown(menuKeyTarget(r), { key: "ArrowDown" });
    fireEvent.keyDown(menuKeyTarget(r), { key: "ArrowDown" });
    fireEvent.keyDown(menuKeyTarget(r), { key: "Enter" });
    // Then the disabled option is skipped
    expect(onSelect).toHaveBeenCalledWith("k", { id: "k", name: "Black" });
    // And the disabled option is marked disabled
    click(r.color);
    const blue = r.getAllByTestId("color_option").find((o) => o.dataset.label === "Blue");
    expect(blue).toHaveAttribute("aria-disabled", "true");
  });

  it("does not open when disabled or read-only", async () => {
    // Given a disabled select
    const r = await render(<SingleHarness disabled />);
    // When clicking it
    click(r.color);
    // Then it stays closed
    expect(r.query.color_overlay).toBeNull();
    expect(r.color).toBeDisabled();
  });

  it("portals the menu to the body on the popover layer", async () => {
    // Given a single select
    const r = await render(<SingleHarness />);
    // When opening it
    click(r.color);
    // Then the popover container is under body and the overlay uses the popover z-index
    expect(r.color_overlay.parentElement?.parentElement).toBe(document.body);
    expect(r.color_overlay.style.zIndex).toBe(String(zIndices.popover));
  });

  it("moves to the ends of the list with Home and End", async () => {
    // Given an open single select
    const r = await render(<SingleHarness />);
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
    const r = await render(<SingleHarness />);
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
        <SingleHarness />
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
    const r = await render(<SingleHarness initial="b" readOnly />);
    // Then the trigger is static text
    expect(r.color.tagName).toBe("DIV");
    expect(r.color).toHaveAttribute("data-readonly", "true");
    expect(r.color).toHaveTextContent("Blue");
    // When it is clicked
    click(r.color);
    // Then the menu stays closed
    expect(r.query.color_overlay).toBeNull();
  });

  it("matches SelectField value weight", async () => {
    // Given a menu select next to a select, plus inline and read-only variants
    const r = await render(
      <div>
        <SelectField<{ id: string; name: string }, string>
          label="Group"
          options={colors()}
          value="b"
          onSelect={() => {}}
        />
        <MenuSelectField label="Color" options={colors()} value="b" onSelect={() => {}} />
        <MenuSelectField label="Inline" labelStyle="inline" options={colors()} value="b" onSelect={() => {}} />
        <MenuSelectField label="Read only value" options={colors()} value="b" onSelect={() => {}} readOnly />
      </div>,
    );
    // Then the selected value is medium, except inline labels and read-only text
    expect(r.group).toHaveStyle({ fontWeight: "500" });
    expect(spanWithText(r.color, "Blue")).toHaveStyle({ fontWeight: "500" });
    expect(spanWithText(r.inline, "Blue")).not.toHaveStyle({ fontWeight: "500" });
    expect(spanWithText(r.readOnlyValue, "Blue")).not.toHaveStyle({ fontWeight: "500" });
  });

  it("follows table field settings from presentation context", async () => {
    // Given the field settings GridTable applies to cells
    const r = await render(
      <PresentationProvider
        fieldProps={{
          labelStyle: "hidden",
          compact: true,
          borderless: true,
          borderOnHover: true,
          typeScale: "xs",
          errorInTooltip: true,
        }}
      >
        <TextField label="Name" value="Kitchen" onChange={() => {}} />
        <MenuSelectField label="Color" options={colors()} value="b" onSelect={() => {}} />
        <MenuSelectField label="Error" options={colors()} value="b" onSelect={() => {}} errorMsg="Required" />
        <TextField label="Read only name" value="Kitchen" onChange={() => {}} readOnly />
        <MenuSelectField label="Read only color" options={colors()} value="b" onSelect={() => {}} readOnly />
      </PresentationProvider>,
    );
    // Then the trigger matches the text field, the label is hidden, and the error stays in a tooltip
    const textField = getComputedStyle(r.name.parentElement!);
    const menuField = getComputedStyle(r.color);
    expect(menuField.height).toBe(textField.height);
    expect(menuField.paddingLeft).toBe(textField.paddingLeft);
    expect(menuField.paddingRight).toBe(textField.paddingRight);
    expect(menuField.borderRadius).toBe(textField.borderRadius);
    expect(menuField.fontSize).toBe(textField.fontSize);
    expect(menuField.borderTopColor).toBe(textField.borderTopColor);
    expect(r.color).toHaveClass("beam-bhc");
    expect(r.query.color_label).not.toBeNull();
    expect(r.query.error_errorMsg).toBeNull();
    expect(getComputedStyle(r.readOnlyColor).minHeight).toBe(getComputedStyle(r.readOnlyName).minHeight);
  });

  it("stays open when a parent scrolls", async () => {
    // Given an open menu inside a scrolling parent
    const r = await render(
      <div data-testid="scroller" style={{ height: 120, overflow: "auto" }}>
        <SingleHarness />
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
    const r = await render(<SingleHarness />);
    // When opening the select
    click(r.color);
    // Then it renders as a sheet with the list focused
    expect(r.color_sheet).toBeInTheDocument();
    expect(r.query.color_overlay).toBeNull();
    expect(document.activeElement).toBe(r.color_listbox);
    // And Done closes it
    click(r.color_sheetDone);
    expect(r.query.color_sheet).toBeNull();
  });

  it("keeps the sheet inside the visual viewport when the keyboard is open", async () => {
    // Given a small screen whose visible viewport is shorter than the layout viewport
    setViewport("sm");
    const keyboard = installKeyboardViewport({ height: 320, offsetTop: 40 });
    const r = await render(<SingleHarness />);
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
  disabled?: boolean;
  readOnly?: boolean;
  disabledOptions?: { value: string; reason: string }[];
  getOptionMenuLabel?: (color: Color) => ReactNode;
  getOptionSearchText?: (color: Color) => string | readonly string[];
  options?: Color[];
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

function spanWithText(root: HTMLElement, text: string): HTMLElement {
  const matches = [...root.querySelectorAll("span")].filter((el) => el.textContent === text);
  const match = matches.at(-1);
  if (!match) throw new Error(`No span with text "${text}"`);
  return match;
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

function SingleHarness(props: HarnessProps & { initial?: string; proposedValue?: string }) {
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
