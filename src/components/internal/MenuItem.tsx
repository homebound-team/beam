import { Node } from "@react-types/shared";
import { useRef } from "react";
import { useHover, useMenuItem } from "react-aria";
import { useHistory } from "react-router";
import { NavLink } from "react-router-dom";
import { TreeState } from "react-stately";
import { IconMenuItemType, ImageMenuItemType, MenuItem } from "src/components/ButtonMenu";
import { Icon } from "src/components/Icon";
import { Css, Palette } from "src/Css";
import { Callback } from "src/types";
import { isAbsoluteUrl } from "src/utils";

interface MenuItemProps {
  item: Node<MenuItem>;
  state: TreeState<MenuItem>;
  onClose: Callback;
}

export function MenuItemImpl(props: MenuItemProps) {
  const { item, state, onClose } = props;
  const menuItem = item.value;
  const isFocused = state.selectionManager.focusedKey === item.key;
  const ref = useRef<HTMLLIElement>(null);
  const history = useHistory();
  const { hoverProps, isHovered } = useHover({});
  const { menuItemProps } = useMenuItem(
    {
      key: item.key,
      onAction: () => {
        const { onClick } = item.value;
        if (typeof onClick === "string") {
          // if it is an absolute URL, then open in new window. Assuming this should leave the App
          if (isAbsoluteUrl(onClick)) {
            window.open(onClick, "_blank", "noopener,noreferrer");
            return;
          }

          // Otherwise, it is a relative URL and we'll assume it is still within the App.
          history.push(onClick);
          return;
        }
        onClick && onClick();
      },
      onClose: () => {
        // TODO: Should we close when clicking a persistent action?
        // if (item.parentKey === "persistent") {
        //   return;
        // }
        onClose();
      },
    },
    state,
    ref,
  );
  return (
    <li
      {...menuItemProps}
      {...hoverProps}
      ref={ref}
      css={{
        ...Css.df.itemsCenter.py1.px2.cursorPointer.outline0.mh("42px").$,
        ...(isHovered ? Css.bgGray100.$ : {}),
        ...(isFocused ? Css.add("boxShadow", `inset 0 0 0 1px ${Palette.LightBlue700}`).$ : {}),
      }}
    >
      {maybeWrapInLink(
        menuItem.onClick,
        isIconMenuItem(menuItem) ? (
          <IconMenuItem {...menuItem} />
        ) : isImageMenuItem(menuItem) ? (
          <ImageMenuItem {...menuItem} />
        ) : (
          menuItem.label
        ),
      )}
    </li>
  );
}

function ImageMenuItem(item: ImageMenuItemType) {
  const { src, size = 24, label, isAvatar = false } = item;
  const styles = isAvatar
    ? Css.br12
        .wPx(size)
        .hPx(size)
        .objectCover.if(size === 48).br24.$
    : Css.br4.$;
  return (
    <>
      <span css={Css.fs0.mr2.$}>
        <img width={size} src={src} css={styles} />
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

function maybeWrapInLink(onClick: MenuItem["onClick"], content: JSX.Element | string): JSX.Element {
  return typeof onClick === "string" ? (
    isAbsoluteUrl(onClick) ? (
      <a
        href={onClick}
        target="_blank"
        rel="noopener noreferrer"
        className="navLink"
        css={Css.df.justifyBetween.w100.$}
      >
        {content}
        <span css={Css.fs0.ml2.$}>
          <Icon icon="linkExternal" />
        </span>
      </a>
    ) : (
      <NavLink to={onClick} className="navLink">
        {content}
      </NavLink>
    )
  ) : (
    <>{content}</>
  );
}

function isIconMenuItem(item: MenuItem): item is IconMenuItemType {
  return item && typeof item === "object" && "icon" in item;
}

function isImageMenuItem(item: MenuItem): item is ImageMenuItemType {
  return item && typeof item === "object" && "src" in item;
}
