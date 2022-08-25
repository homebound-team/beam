import { camelCase } from "change-case";
import { HTMLAttributes, PropsWithChildren, useMemo, useRef } from "react";
import { FocusScope, useMenu } from "react-aria";
import { Item, Section, useTreeData, useTreeState } from "react-stately";
import { MenuItem } from "src/components";
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
  const isSectioned = areItemsSectioned(items);
  const tree = useTreeData({
    initialItems: [
      ...(isSectioned ? items : [{ hideLabel: true, label: "items", items: items }]),
      persistentItems ? { hideLabel: true, label: "persistent", items: persistentItems } : {},
    ].map(({ hideLabel, items, label }) => {
      return { hideLabel, label, items } as MenuItem;
    }),
    getKey: (item) => camelCase(item.label),
    getChildren: (item) => item.items ?? [],
  });

  const menuChildren = useMemo(() => {
    return tree.items.map(({ value: s }) => (
      <Section key={camelCase(s.label)} title={s.label} items={s.items}>
        {(item) => <Item key={item.label.replace(/"/g, "")}>{item.label}</Item>}
      </Section>
    ));
  }, [tree]);

  const state = useTreeState({ children: menuChildren, items: tree.items.map((i) => i.value), selectionMode: "none" });

  const menuRef = useRef(null);
  const { menuProps } = useMenu<any>({ ...ariaMenuProps, autoFocus: true }, state, menuRef);
  const tid = useTestIds(props);

  // Bulk updates of MenuItems below. If we find this to be of sluggish performance, then we can change to be more surgical in our updating.
  // If our list of items change, update the "items" menu section. (key is based on label in `getKey` above)
  // useEffect(() => tree.update("items", { label: "items", items } as MenuItem), [items]);

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
        {[...state.collection].map((item) => (
          <MenuSectionImpl
            key={item.key}
            section={item}
            state={state}
            onClose={onClose}
            hideLabel={tree.getItem(item.key)?.value.hideLabel}
            {...tid}
          />
        ))}
      </ul>
    </FocusScope>
  );
}

function areItemsSectioned(items: MenuItem[]): boolean {
  return items.length > 0 && typeof items[0] === "object" && "items" in items[0] && Array.isArray(items[0].items);
}
