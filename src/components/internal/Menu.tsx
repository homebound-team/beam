import type { TreeNode } from "@react-stately/data";
import type { CollectionChildren } from "@react-types/shared";
import { HTMLAttributes, PropsWithChildren, useRef } from "react";
import { FocusScope, useMenu } from "react-aria";
import { useTreeState } from "react-stately";
import { MenuItem, MenuSection } from "src/components";
import { MenuSectionImpl } from "src/components/internal/MenuSection";
import { Css } from "src/Css";
import { Callback } from "src/types";
import { useTestIds } from "src/utils";

interface MenuProps<T> {
  ariaMenuProps: HTMLAttributes<HTMLElement>;
  children: CollectionChildren<MenuSection>;
  items: TreeNode<MenuItem>[];
  onClose: Callback;
}

export function Menu<T>(props: PropsWithChildren<MenuProps<T>>) {
  const { children, ariaMenuProps } = props;
  const state = useTreeState({ ...props, items: props.items.map((i) => i.value), selectionMode: "none" });
  const menuRef = useRef(null);
  const { menuProps } = useMenu<any>({ ...ariaMenuProps, children, autoFocus: true }, state, menuRef);
  const tid = useTestIds(props);
  return (
    <FocusScope restoreFocus>
      <ul
        css={{
          // Using `max-height: inherit` allows us to take advantage of the height set on the overlay container, which updates based on the available space for the overlay within the viewport
          ...Css.df.fdc.mtPx(4).bgWhite.outline0.br4.bshBasic.listReset.maxh("inherit").overflowAuto.$,
          "&:hover, &:focus": Css.bshHover.$,
        }}
        {...menuProps}
        ref={menuRef}
        {...tid.menu}
      >
        {/* It is possible to have, at most, 2 sections: One for items, and one for persisted items */}
        {[...state.collection].map((item) => (
          <MenuSectionImpl key={item.key} section={item} state={state} onClose={props.onClose} {...tid} />
        ))}
      </ul>
    </FocusScope>
  );
}
