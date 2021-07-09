import { TreeNode } from "@react-stately/data";
import { CollectionChildren } from "@react-types/shared";
import React, { HTMLAttributes, PropsWithChildren, useRef } from "react";
import { FocusScope, useMenu } from "react-aria";
import { useTreeState } from "react-stately";
import { MenuItem, MenuSection } from "src/components";
import { MenuSectionImpl } from "src/components/internal/MenuSection";
import { Css } from "src/Css";
import { Callback } from "src/types";

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
  return (
    <FocusScope restoreFocus>
      <ul
        css={{
          // Using `max-height: inherit` allows us to take advantage of the height set on the overlay container, which updates based on the available space for the overlay within the viewport
          ...Css.df.flexColumn.mtPx(4).bgWhite.outline0.br4.bshBasic.listReset.maxh("inherit").overflowAuto.$,
          "&:hover, &:focus": Css.bshHover.$,
        }}
        {...menuProps}
        ref={menuRef}
      >
        {[...state.collection].map((item) => (
          <MenuSectionImpl key={item.key} section={item} state={state} onClose={props.onClose} />
        ))}
      </ul>
    </FocusScope>
  );
}
