import { camelCase } from "change-case";
import { HTMLAttributes, PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { FocusScope, useMenu } from "react-aria";
import { Item, Section, useTreeData, useTreeState } from "react-stately";
import { MenuItem, MenuSection } from "src/components";
import { MenuSectionImpl } from "src/components/internal/MenuSection";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

interface MenuProps<T> {
  ariaMenuProps: HTMLAttributes<HTMLElement>;
  onClose: VoidFunction;
  items: MenuItem[];
  persistentItems?: MenuItem[];
}

export function Menu<T>(props: PropsWithChildren<MenuProps<T>>) {
  const { ariaMenuProps, items, persistentItems, onClose } = props;
  // Build out the Menu's Tree data to include the Persistent Action, if any. This is a collection of Nodes that is used
  // by React-Aria to keep track of item states such as focus, and provide hooks for calling those actions.
  const tree = useTreeData({
    initialItems: [items, persistentItems ? persistentItems : []].map(
      (i, idx) => ({ label: idx === 0 ? "items" : "persistent", items: i } as MenuSection),
    ),
    getKey: (item) => camelCase(item.label),
    getChildren: (item) => (item as MenuSection).items ?? [],
  });

  const menuChildren = useMemo(() => {
    return tree.items.map(({ value: s }) => (
      <Section key={s.label.replace(/"/g, "")} title={s.label} items={s.items}>
        {(item) => <Item key={item.label.replace(/"/g, "")}>{item.label}</Item>}
      </Section>
    ));
  }, [tree]);

  const state = useTreeState({ children: menuChildren, items: tree.items.map((i) => i.value), selectionMode: "none" });

  const menuRef = useRef(null);
  const { menuProps } = useMenu<any>({ ...ariaMenuProps, children: menuChildren, autoFocus: true }, state, menuRef);
  const tid = useTestIds(props);

  // Bulk updates of MenuItems below. If we find this to be of sluggish performance, then we can change to be more surgical in our updating.
  // If our list of items change, update the "items" menu section. (key is based on label in `getKey` above)
  useEffect(() => tree.update("items", { label: "items", items } as MenuSection), [items]);

  return (
    <FocusScope>
      <ul
        css={{
          // Using `max-height: inherit` allows us to take advantage of the height set on the overlay container, which updates based on the available space for the overlay within the viewport
          ...Css.df.fdc.myPx(4).bgWhite.outline0.br4.bshBasic.listReset.maxh("inherit").overflowAuto.$,
          "&:hover, &:focus": Css.bshHover.$,
        }}
        {...menuProps}
        ref={menuRef}
        {...tid.menu}
      >
        {/* It is possible to have, at most, 2 sections: One for items, and one for persisted items */}
        {[...state.collection].map((item) => (
          <MenuSectionImpl key={item.key} section={item} state={state} onClose={onClose} {...tid} />
        ))}
      </ul>
    </FocusScope>
  );
}
