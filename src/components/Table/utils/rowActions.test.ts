import { splitRowActions } from "src/components/Table/utils/rowActions";

describe("splitRowActions", () => {
  // `RowActionsCell` passes 2 icon slots (the pin included) on desktop and tablet, and 0 on phone-sized screens.
  // The menu always gets its own slot after them.
  const desktop = 2;
  const phone = 0;

  const action = (label: string, overflowOnly?: boolean) => ({ label, overflowOnly });
  const edit = action("Edit");
  const duplicate = action("Duplicate");
  const remove = action("Delete");

  /** The split as labels, so a failure reads as which actions landed where. */
  function split(actions: ReturnType<typeof action>[], pinnable: boolean, visibleCount: number) {
    const { icons, menu } = splitRowActions(actions, pinnable, visibleCount);
    return { icons: icons.map((a) => a.label), menu: menu.map((a) => a.label) };
  }

  it("fills the icon slots in order and puts the rest in the menu", () => {
    // Given a pin and three actions on desktop, where only one action fits next to the pin
    // Then the first action is an icon and the other two go in the menu
    expect(split([edit, duplicate, remove], true, desktop)).toEqual({
      icons: ["Edit"],
      menu: ["Duplicate", "Delete"],
    });
  });

  it("shows a lone overflowing action as an icon instead of a one-item menu", () => {
    // The desktop column has 3 button slots: 2 icons (the pin takes one) and the "overflow" menu.
    // Edit takes the free icon slot, so Delete overflows. Without this rule the row would draw
    // Edit, the pin, and a menu holding only Delete; instead Delete uses the menu's slot as an icon.
    // Given a pin and two actions on desktop
    // Then both actions are icons, and there's no menu
    expect(split([edit, remove], true, desktop)).toEqual({ icons: ["Edit", "Delete"], menu: [] });
    // And the same goes without a pin, where two actions fit and a third would overflow alone
    expect(split([edit, duplicate, remove], false, desktop)).toEqual({
      icons: ["Edit", "Duplicate", "Delete"],
      menu: [],
    });
  });

  it("puts overflowOnly actions in the menu whatever their order", () => {
    // Given an overflowOnly action listed first, then two regular actions, and a pin on desktop
    // Then the first regular action is the icon, and the overflowOnly action joins the regular one that didn't fit
    expect(split([action("Delete", true), edit, duplicate], true, desktop)).toEqual({
      icons: ["Edit"],
      menu: ["Delete", "Duplicate"],
    });
  });

  it("keeps overflowOnly actions in the menu even when there's room for icons", () => {
    // Given two overflowOnly actions and no pin on desktop, with room for both as icons
    // Then both go in the menu
    expect(split([action("Edit", true), action("Delete", true)], false, desktop)).toEqual({
      icons: [],
      menu: ["Edit", "Delete"],
    });
  });

  it("shows a lone overflowOnly action as an icon instead of a one-item menu", () => {
    // Given a regular action, an overflowOnly action, and a pin on desktop
    // Then the overflowOnly action is the menu's only action, so it's an icon instead
    expect(split([edit, action("Delete", true)], true, desktop)).toEqual({ icons: ["Edit", "Delete"], menu: [] });
  });

  it("puts every action in the menu on phone-sized screens, unless there's only one", () => {
    // Given no icon slots on a phone-sized screen
    // Then two or more actions all go in the menu, with or without a pin
    expect(split([edit, remove], false, phone)).toEqual({ icons: [], menu: ["Edit", "Delete"] });
    expect(split([edit, remove], true, phone)).toEqual({ icons: [], menu: ["Edit", "Delete"] });
    // And a single action is an icon instead of a one-item menu, with or without a pin
    expect(split([edit], false, phone)).toEqual({ icons: ["Edit"], menu: [] });
    expect(split([edit], true, phone)).toEqual({ icons: ["Edit"], menu: [] });
  });

  it("has nothing to split without actions", () => {
    // Given only a pin
    // Then there are no icons and no menu
    expect(split([], true, desktop)).toEqual({ icons: [], menu: [] });
  });
});
