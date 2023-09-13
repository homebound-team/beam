import { Node } from "@react-types/shared";
import { useRef } from "react";
import { useHover, useMenuItem } from "react-aria";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { TreeState } from "react-stately";
import { Avatar } from "src/components/Avatar";
import { IconMenuItemType, ImageMenuItemType, MenuItem } from "src/components/ButtonMenu";
import { Icon } from "src/components/Icon";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css, Palette } from "src/Css";
import { isAbsoluteUrl, useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface MenuItemProps {
  item: Node<MenuItem>;
  state: TreeState<MenuItem>;
  onClose: VoidFunction;
  contrast: boolean;
}

export function MenuItemImpl(props: MenuItemProps) {
  const { item, state, onClose, contrast } = props;
  const menuItem = item.value;
  if (!menuItem) {
    return null;
  }

  const { disabled, onClick, label, destructive } = menuItem;
  const isDisabled = Boolean(disabled);
  const isSelected = state.selectionManager.selectedKeys.has(label);
  const isFocused = state.selectionManager.focusedKey === item.key;
  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = useRef<HTMLLIElement>(null);
  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const history = useHistory();
  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { hoverProps, isHovered } = useHover({});
  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tid = useTestIds(props);
  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
        ...Css.df.aic.py1.px2.cursorPointer.outline0.mh("42px").sm.$,
        ...(!isDisabled && isHovered ? (contrast ? Css.bgGray800.$ : Css.bgGray100.$) : {}),
        ...(isFocused ? Css.add("boxShadow", `inset 0 0 0 1px ${Palette.Blue700}`).$ : {}),
        ...(isDisabled ? Css.gray500.cursorNotAllowed.$ : {}),
        ...(destructive ? Css.red600.$ : {}),
        ...(isSelected ? Css.fw5.$ : {}),
      }}
      {...tid[defaultTestId(menuItem.label)]}
    >
      {maybeTooltip({
        title: resolveTooltip(disabled),
        placement: "right",
        children: renderMenuItem(menuItem, isSelected, isDisabled, contrast),
      })}
    </li>
  );
}

function renderMenuItem(menuItem: MenuItem, isSelected: boolean, isDisabled: boolean, contrast: boolean) {
  return (
    <div css={Css.df.w100.aic.jcsb.gap2.$}>
      <div css={Css.df.aic.$}>
        {maybeWrapInLink(
          menuItem.onClick,
          isIconMenuItem(menuItem) ? (
            <IconMenuItem {...menuItem} />
          ) : isImageMenuItem(menuItem) ? (
            <ImageMenuItem {...menuItem} />
          ) : (
            menuItem.label
          ),
          isDisabled,
        )}
      </div>
      {isSelected && (
        <Icon
          icon="check"
          color={
            !contrast ? (isDisabled ? Palette.Gray400 : Palette.Blue700) : isDisabled ? Palette.Gray500 : Palette.White
          }
        />
      )}
    </div>
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
): JSX.Element {
  if (disabled || typeof onClick !== "string") {
    return <>{content}</>;
  }

  return isAbsoluteUrl(onClick) ? (
    <a href={onClick} target="_blank" rel="noopener noreferrer" className="navLink" css={Css.df.aic.jcsb.w100.$}>
      {content}
      <span css={Css.fs0.ml2.$}>
        <Icon icon="linkExternal" />
      </span>
    </a>
  ) : (
    <Link className="navLink" to={onClick}>
      {content}
    </Link>
  );
}

function isIconMenuItem(item: MenuItem): item is IconMenuItemType {
  return item && typeof item === "object" && "icon" in item;
}

function isImageMenuItem(item: MenuItem): item is ImageMenuItemType {
  return item && typeof item === "object" && "src" in item;
}
