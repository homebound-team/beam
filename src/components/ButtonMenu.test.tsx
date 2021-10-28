import { action } from "@storybook/addon-actions";
import { useState } from "react";
import { Button } from "src/components/Button";
import { ButtonMenu, MenuItem } from "src/components/ButtonMenu";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";

describe("ButtonMenu", () => {
  it("can update menu items", async () => {
    // Given a Button Menu
    const r = await render(<TestButtonMenu />);

    // When opening the menu
    click(r.menuTrigger);
    // Then the initial items are set
    expect(r.menuTrigger_menuItems().childNodes).toHaveLength(3);

    // With first item is not disabled
    expect(r.menuTrigger_itemOne()).not.toHaveAttribute("aria-disabled");
    // When setting the disabled property on the first item
    click(r.disable);
    // Then expect the item to have disabled set
    expect(r.menuTrigger_itemOne()).toHaveAttribute("aria-disabled");

    // When Adding a new item
    click(r.add);
    // Then a new item is added
    expect(r.menuTrigger_menuItems().childNodes).toHaveLength(4);

    // When removing a new item
    click(r.delete);
    // Then an item is removed
    expect(r.menuTrigger_menuItems().childNodes).toHaveLength(3);
  });

  it("can accept testid", async () => {
    // Given a Button Menu with a testid defined
    const r = await render(<TestButtonMenu data-testid="example" />);

    // Then button should use that testid.
    click(r.example);
    // And all components with in should have the prefix
    expect(r.example_menu()).toBeTruthy();
    expect(r.example_menuItems()).toBeTruthy();
    expect(r.example_itemOne()).toBeTruthy();
  });
});

function TestButtonMenu(props: any) {
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
              { label: `Item ${prevItems.length + 1}`, onClick: action(`Item ${prevItems.length + 1}`) },
            ])
          }
        />
        <Button label="Delete" onClick={() => setMenuItems((prevItems) => prevItems.slice(1))} />
      </div>
      <ButtonMenu trigger={{ label: "Menu trigger" }} items={menuItems} {...props} />
    </>
  );
}
