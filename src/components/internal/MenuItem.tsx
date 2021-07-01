import { HTMLAttributes, RefObject } from "react";
import { useHover } from "react-aria";
import { NavLink } from "react-router-dom";
import { Icon, IconProps } from "src/components/Icon";
import { Css, Palette } from "src/Css";
import { Callback } from "src/types";
import { isAbsoluteUrl } from "src/utils";

type MenuItemBase = {
  label: string;
  // If the `onClick` property is set as a string, then the menu item will be rendered as a link with the `onClick` value being the href
  onClick: string | Callback;
};

type IconMenuItemType = MenuItemBase & {
  icon: IconProps["icon"];
};

type ImageMenuItemType = MenuItemBase & {
  src: string;
  size?: 24 | 48;
  isAvatar?: boolean;
};

export type MenuItemType = MenuItemBase | IconMenuItemType | ImageMenuItemType;

interface MenuItemProps {
  item: MenuItemType;
  itemProps: HTMLAttributes<HTMLElement>;
  itemRef: RefObject<HTMLLIElement>;
  isFocused: boolean;
}

export function MenuItem(props: MenuItemProps) {
  const { item, itemProps, itemRef, isFocused } = props;
  const { hoverProps, isHovered } = useHover({});
  return (
    <li
      {...itemProps}
      {...hoverProps}
      ref={itemRef}
      css={{
        ...Css.df.itemsCenter.py1.px2.cursorPointer.outline0.mh("42px").$,
        ...(isHovered ? Css.bgGray100.$ : {}),
        ...(isFocused ? Css.add("boxShadow", `inset 0 0 0 1px ${Palette.LightBlue700}`).$ : {}),
      }}
    >
      {maybeWrapInLink(
        item.onClick,
        isIconMenuItem(item) ? (
          <IconMenuItem {...item} />
        ) : isImageMenuItem(item) ? (
          <ImageMenuItem {...item} />
        ) : (
          item.label
        ),
      )}
    </li>
  );
}

function ImageMenuItem(item: ImageMenuItemType) {
  const { src, size = 24, label, isAvatar = false } = item;
  return (
    <>
      <span css={Css.fs0.mr2.$}>
        <img src={src} width={size} css={Css.br4.if(isAvatar).br12.if(size === 48).br24.$} />
      </span>
      {label}
    </>
  );
}

function IconMenuItem(item: IconMenuItemType) {
  const { icon, label } = item;
  return (
    <>
      <span css={Css.fs0.mr2.$}>
        <Icon icon={icon} />
      </span>
      {label}
    </>
  );
}

function maybeWrapInLink(onClick: MenuItemType["onClick"], content: JSX.Element | string): JSX.Element {
  return typeof onClick === "string" ? (
    isAbsoluteUrl(onClick) ? (
      <a href={onClick} target="_blank" rel="noopener noreferrer" className="navLink" css={Css.df.justifyBetween.$}>
        {content}
        <span css={Css.fs0.ml2.$}>
          <Icon icon="linkExternal" />
        </span>
      </a>
    ) : (
      <NavLink to={onClick} css={Css.gray900.$}>
        {content}
      </NavLink>
    )
  ) : (
    <>{content}</>
  );
}

function isIconMenuItem(item: MenuItemType): item is IconMenuItemType {
  return item && typeof item === "object" && "icon" in item;
}

function isImageMenuItem(item: MenuItemType): item is ImageMenuItemType {
  return item && typeof item === "object" && "src" in item;
}
