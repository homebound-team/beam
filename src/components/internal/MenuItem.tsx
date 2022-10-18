import { Node } from "@react-types/shared";
import { useRef } from "react";
import { useHover, useMenuItem } from "react-aria";
import { useHistory } from "react-router";
import { NavLink } from "src/components";
import { TreeState } from "react-stately";
import { Avatar } from "src/components/Avatar";
import { IconMenuItemType, ImageMenuItemType, MenuItem } from "src/components/ButtonMenu";
import { Icon } from "src/components/Icon";
import { Css, Palette } from "src/Css";
import { isAbsoluteUrl, useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface MenuItemProps {
  item: Node<MenuItem>;
  state: TreeState<MenuItem>;
  onClose: VoidFunction;
}

export function MenuItemImpl(props: MenuItemProps) {
  const { item, state, onClose } = props;
  const menuItem = item.value;
  const { disabled: isDisabled, onClick, label, destructive } = menuItem;
  const isFocused = state.selectionManager.focusedKey === item.key;
  const ref = useRef<HTMLLIElement>(null);
  const history = useHistory();
  const { hoverProps, isHovered } = useHover({});
  const tid = useTestIds(props);
  const { menuItemProps } = useMenuItem(
    {
      key: item.key,
      isDisabled,
      onAction: () => {
        if (typeof onClick === "string") {
          // if it is an absolute URL, then open in new window. Assuming this should leave the App
          if (isAbsoluteUrl(onClick)) {
            // We want to do `window.open(url, "_blank", "noopener,noreferrer")` but that Safari treats
            // that as "open in new window", this happens when safari has the "Open pages in tabs instead of windows" set to "Automatically" (which is the default)
            // see https://support.apple.com/guide/safari/tabs-ibrw1045/mac (Open pages in tabs instead of windows) for other behaviors
            //
            // So we do this instead, and at least null out the opener
            // as a way to manually mimic the `"noopener"` flag.
            (window.open(onClick, "_blank") as Window).opener = null;
            return;
          }

          // Otherwise, it is a relative URL and we'll assume it is still within the App.
          history.push(onClick);
          return;
        }
        onClick && onClick();
      },
      onClose,
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
        ...Css.df.aic.py1.px2.cursorPointer.outline0.mh("42px").$,
        ...(!isDisabled && isHovered ? Css.bgGray100.$ : {}),
        ...(isFocused ? Css.add("boxShadow", `inset 0 0 0 1px ${Palette.LightBlue700}`).$ : {}),
        ...(isDisabled ? Css.gray500.cursorNotAllowed.$ : {}),
        ...(destructive ? Css.red600.$ : {}),
      }}
      {...tid[defaultTestId(menuItem.label)]}
    >
      {maybeWrapInLink(
        onClick,
        isIconMenuItem(menuItem) ? (
          <IconMenuItem {...menuItem} />
        ) : isImageMenuItem(menuItem) ? (
          <ImageMenuItem {...menuItem} />
        ) : (
          label
        ),
        isDisabled,
      )}
    </li>
  );
}

function ImageMenuItem(item: ImageMenuItemType) {
  const { src, size = 24, label, isAvatar = false } = item;
  return (
    <>
      <span css={Css.fs0.mr2.$}>
        {isAvatar ? (
          <Avatar src={src} name={label} size={size === 24 ? "sm" : "lg"} />
        ) : (
          <img width={size} src={src} css={Css.br4.$} alt={label} />
        )}
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

function maybeWrapInLink(
  onClick: MenuItem["onClick"],
  content: JSX.Element | string,
  disabled: boolean | undefined,
  active: boolean | undefined,
): JSX.Element {
  if (disabled || typeof onClick !== "string") {
    return <>{content}</>;
  }

  return isAbsoluteUrl(onClick) ? (
    <a href={onClick} target="_blank" rel="noopener noreferrer" className="navLink" css={Css.df.jcsb.w100.$}>
      {content}
      <span css={Css.fs0.ml2.$}>
        <Icon icon="linkExternal" />
      </span>
    </a>
  ) : (
    <NavLink href={onClick} className="navLink" active={active}>
      {content}
    </NavLink>
  );
}

function isIconMenuItem(item: MenuItem): item is IconMenuItemType {
  return item && typeof item === "object" && "icon" in item;
}

function isImageMenuItem(item: MenuItem): item is ImageMenuItemType {
  return item && typeof item === "object" && "src" in item;
}
