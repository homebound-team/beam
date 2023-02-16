import { camelCase } from "change-case";
import { HTMLAttributes, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { FocusScope, useFilter, useMenu } from "react-aria";
import { Item, Section, useTreeData, useTreeState } from "react-stately";
import { MenuItem, MenuSection } from "src/components";
import { MenuSectionImpl } from "src/components/internal/MenuSection";
import { Css } from "src/Css";
import { MenuSearchField } from "src/inputs/internal/MenuSearchField";
import { useTestIds } from "src/utils";

interface MenuProps<T> {
  ariaMenuProps: HTMLAttributes<HTMLElement>;
  onClose: VoidFunction;
  items: MenuItem[];
  searchable?: boolean;
  persistentItems?: MenuItem[];
  contrast: boolean;
  selectedItem: string | undefined;
  onChange: ((key: string) => void) | undefined;
}

export function Menu<T>(props: PropsWithChildren<MenuProps<T>>) {
  const { ariaMenuProps, items, persistentItems, onClose, searchable, contrast, selectedItem, onChange } = props;
  // Build out the Menu's Tree data to include the Persistent Action, if any. This is a collection of Nodes that is used
  // by React-Aria to keep track of item states such as focus, and provide hooks for calling those actions.
  const tree = useTreeData({
    initialItems: [items, persistentItems ? persistentItems : []].map(
      (i, idx) => ({ label: idx === 0 ? "items" : "persistent", items: i } as MenuSection),
    ),
    getKey: (item) => camelCase(item.label),
    getChildren: (item) => (item as MenuSection).items ?? [],
  });

  const [search, setSearch] = useState<string | undefined>(undefined);
  const { contains } = useFilter({ sensitivity: "base" });

  // Filter our tree data items based on the search term
  const filteredTree = useMemo(() => {
    const { items, ...others } = tree;
    const [itemsSection, persistentSection] = items;

    if (search) {
      const filteredChildren = itemsSection.children.filter((item) => contains(item.value.label, search));
      const { items, ...otherValues } = itemsSection.value;
      const filteredValue = items?.filter((item) => contains(item.label, search));
      return {
        ...others,
        items: [
          { ...itemsSection, value: { ...otherValues, children: filteredChildren, items: filteredValue } },
          persistentSection,
        ],
      };
    } else {
      return tree;
    }
  }, [tree, search, contains]);

  const menuChildren = useMemo(() => {
    return filteredTree.items.map(({ value: s }) => (
      <Section key={s.label.replace(/"/g, "")} title={s.label} items={s.items}>
        {(item) => <Item key={item.label.replace(/"/g, "")}>{item.label}</Item>}
      </Section>
    ));
  }, [filteredTree]);

  const state = useTreeState({
    children: menuChildren,
    items: filteredTree.items.map((i) => i.value),
    selectionMode: typeof onChange === "function" ? "single" : "none",
    disallowEmptySelection: typeof onChange === "function",
    selectedKeys: selectedItem ? [selectedItem] : undefined,
    onSelectionChange: (keys) => {
      keys !== "all" && onChange && onChange([...keys.values()].map((k) => k.toString())[0]);
    },
  });

  const menuRef = useRef(null);
  const { menuProps } = useMenu<any>({ ...ariaMenuProps, autoFocus: searchable ? false : true }, state, menuRef);
  const tid = useTestIds(props);

  // Bulk updates of MenuItems below. If we find this to be of sluggish performance, then we can change to be more surgical in our updating.
  // If our list of items change, update the "items" menu section. (key is based on label in `getKey` above)
  useEffect(() => filteredTree.update("items", { label: "items", items } as MenuSection), [items]);
  return (
    <FocusScope>
      <div
        // Using `max-height: inherit` allows us to take advantage of the height set on the overlay container, which updates based on the available space for the overlay within the viewport
        css={{
          ...Css.df.fdc.myPx(4).bgWhite.outline0.br4.bshBasic.maxh("inherit").overflowAuto.if(contrast).bgGray900.$,
          "&:hover": Css.bshHover.$,
        }}
      >
        {searchable && (
          <MenuSearchField
            label=""
            value={search}
            placeholder="Search..."
            labelStyle="inline"
            onChange={setSearch}
            {...tid}
          />
        )}
        <ul css={Css.listReset.$} {...menuProps} ref={menuRef} {...tid.menu}>
          {/* It is possible to have, at most, 2 sections: One for items, and one for persisted items */}
          {[...state.collection].map((item) => (
            <MenuSectionImpl
              key={item.key}
              section={item}
              state={state}
              onClose={onClose}
              contrast={contrast}
              {...tid}
            />
          ))}
        </ul>
      </div>
    </FocusScope>
  );
}
