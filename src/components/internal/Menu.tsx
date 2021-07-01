import { CollectionChildren } from "@react-types/shared";
import React, { HTMLAttributes, PropsWithChildren, useRef } from "react";
import { FocusScope, useMenu } from "react-aria";
import { TreeState } from "react-stately";
import { MenuItemType } from "src/components/internal/MenuItem";
import { Css, px } from "src/Css";

interface MenuProps<T> {
  ariaMenuProps: HTMLAttributes<HTMLElement>;
  children: CollectionChildren<MenuItemType>;
  state: TreeState<T>;
}

export function Menu<T>(props: PropsWithChildren<MenuProps<T>>) {
  const { children, state, ariaMenuProps } = props;
  const menuRef = useRef(null);
  const { menuProps } = useMenu<any>({ ...ariaMenuProps, children, autoFocus: true }, state, menuRef);
  return (
    <FocusScope restoreFocus>
      <ul
        css={{
          ...Css.mtPx(4).bgWhite.outline0.br4.bshBasic.listReset.maxh(px(400)).overflowAuto.$,
          "&:hover, &:focus": Css.bshHover.$,
        }}
        {...menuProps}
        ref={menuRef}
      >
        {children}
      </ul>
    </FocusScope>
  );
}
