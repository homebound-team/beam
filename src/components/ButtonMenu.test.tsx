import { useState } from "react";
import { Button } from "src/components/Button";
import { ButtonMenu, MenuItem } from "src/components/ButtonMenu";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { click, render, type } from "src/utils/rtl";

describe("ButtonMenu", () => {
  it("can update menu items", async () => {
    // Given a Button Menu
    const r = await render(<TestButtonMenu />);

    // When opening the menu
    click(r.menuTrigger);
    // Then the initial items are set
    expect(r.menuTrigger_menuItems.childNodes).toHaveLength(3);

    // With first item is not disabled
    expect(r.menuTrigger_itemOne).not.toHaveAttribute("aria-disabled");
    // When setting the disabled property on the first item
    click(r.disable);
    // Then expect the item to have disabled set
    expect(r.menuTrigger_itemOne).toHaveAttribute("aria-disabled", "true");

    // When Adding a new item
    click(r.add);
    // Then a new item is added
    expect(r.menuTrigger_menuItems.childNodes).toHaveLength(4);

    // When removing a new item
    click(r.delete);
    // Then an item is removed
    expect(r.menuTrigger_menuItems.childNodes).toHaveLength(3);
  });

  it("can initialize with an empty list and load items afterwards", async () => {
    // Given a Button Menu with no items to start out with
    const r = await render(<TestButtonMenu empty />);

    // The menu items should initially be empty
    click(r.menuTrigger);
    expect(r.menuTrigger_menuItems.childNodes).toHaveLength(0);

    // When loading in items
    click(r.load);
    // Then the menu list should populate
    expect(r.menuTrigger_menuItems.childNodes).toHaveLength(3);
  });

  it("can accept testid", async () => {
    // Given a Button Menu with a testid defined
    const r = await render(<TestButtonMenu data-testid="example" />);

    // Then button should use that testid.
    click(r.example);
    // And all components with in should have the prefix
    expect(r.example_menu).toBeTruthy();
    expect(r.example_menuItems).toBeTruthy();
    expect(r.example_itemOne).toBeTruthy();
  });

  it("properly sets disabled on the button menu", async () => {
    // Given the permutations how a button can be disabled/enabled.
    const commonProps = { trigger: { label: "Label" }, items: [] };
    const r = await render(
      <>
        <ButtonMenu data-testid="disabled" disabled={true} {...commonProps} />
        <ButtonMenu data-testid="disabled" disabled={"Tooltip"} {...commonProps} />
        <ButtonMenu data-testid="enabled" disabled={false} {...commonProps} />
        <ButtonMenu data-testid="enabled" {...commonProps} />
      </>,
    );

    // Then ButtonMenu with disabled=true and disabled="Tooltip" are disabled
    expect(r.disabled_0).toBeDisabled();
    expect(r.disabled_1).toBeDisabled();
    // And ButtonMenu with disabled=false and undefined are not disabled
    expect(r.enabled_0).not.toBeDisabled();
    expect(r.enabled_1).not.toBeDisabled();
  });

  it("can filter menu items", async () => {
    // Given a Button Menu with items
    const r = await render(<TestButtonMenu searchable={true} />);

    // When opening the menu
    click(r.menuTrigger);
    // Then the initial items are set
    expect(r.menuTrigger_menuItems.childNodes).toHaveLength(3);

    // When filtering the menu items
    type(r.menuTrigger_search, "one");
    // Then the menu items are filtered
    expect(r.menuTrigger_menuItems.childNodes).toHaveLength(1);
  });

  it("supports tooltips on disabled menu items", async () => {
    // Given a menu item that is disabled with a value that will show as a tooltip
    const menuItems = [{ label: "Disabled", disabled: "Tooltip", onClick: noop }];
    const r = await render(<ButtonMenu trigger={{ label: "Trigger" }} items={menuItems} />);

    // When opening the menu
    click(r.trigger);

    // Then the menu item should be disabled and have a tooltip
    expect(r.trigger_disabled).toHaveAttribute("aria-disabled", "true");
    expect(r.tooltip).toHaveAttribute("title", "Tooltip");
  });

  it("handles selecting button menu items", async () => {
    // Given two menu items that can be selected
    function TestComponent() {
      const [selected, setSelected] = useState("Option A");
      const menuItems: MenuItem[] = [
        { label: "Option A", onClick: noop },
        { label: "Option B", onClick: noop },
      ];

      return (
        <ButtonMenu
          trigger={{ label: "Trigger" }}
          items={menuItems}
          selectedItem={selected}
          onChange={(key) => setSelected(key)}
        />
      );
    }

    const r = await render(<TestComponent />);

    // When opening the menu
    click(r.trigger);

    // Then the first option should be selected
    expect(r.trigger_optionA).toHaveAttribute("aria-checked", "true");
    expect(r.trigger_optionA.querySelector("[data-icon='check']")).toBeTruthy();
    expect(r.trigger_optionB).toHaveAttribute("aria-checked", "false");

    // When clicking the second option
    click(r.trigger_optionB);

    // Then `onChange` should have been called to update the selection properly.
    click(r.trigger);
    expect(r.trigger_optionA).toHaveAttribute("aria-checked", "false");
    expect(r.trigger_optionB).toHaveAttribute("aria-checked", "true");
    expect(r.trigger_optionB.querySelector("[data-icon='check']")).toBeTruthy();
  });
});

function TestButtonMenu({ empty = false, searchable = false, ...others }: { empty?: boolean; searchable?: boolean }) {
  const [loaded, setLoaded] = useState(!empty);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { label: "Item One", onClick: noop },
    { label: "Item 2", onClick: noop },
    { label: "Item 3", onClick: noop },
  ]);

  return (
    <>
      <div css={Css.df.gap1.mb2.$}>
        <Button
          label="Disable"
          onClick={() =>
            setMenuItems(([firstItem, ...others]) => [{ ...firstItem, disabled: !firstItem.disabled }, ...others])
          }
        />
        <Button
          label="Add"
          onClick={() =>
            setMenuItems((prevItems) => [
              ...prevItems,
              { label: `Item ${prevItems.length + 1}`, onClick: () => console.log(`Item ${prevItems.length + 1}`) },
            ])
          }
        />
        <Button label="Delete" onClick={() => setMenuItems((prevItems) => prevItems.slice(1))} />
        <Button label="Load" onClick={() => setLoaded(true)} />
      </div>
      <ButtonMenu
        trigger={{ label: "Menu trigger" }}
        items={loaded ? menuItems : []}
        {...others}
        searchable={searchable}
      />
    </>
  );
}
