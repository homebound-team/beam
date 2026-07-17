import { Node } from "@react-types/shared";
import { type KeyboardEvent, type MouseEvent, useRef } from "react";
import { useHover, useMenuItem } from "react-aria";
import { Link, useNavigate } from "react-router-dom";
import { TreeState } from "react-stately";
import { Avatar } from "src/components/Avatar";
import { IconMenuItemType, ImageMenuItemType, MenuItem } from "src/components/ButtonMenu";
import { Icon } from "src/components/Icon";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css, Tokens } from "src/Css";
import { isAbsoluteUrl, useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

type MenuItemProps = {
  item: Node<MenuItem>;
  state: TreeState<MenuItem>;
  onClose: VoidFunction;
};

export function MenuItemImpl(props: MenuItemProps) {
  const { item, state, onClose } = props;
  const menuItem = item.value;
  const ref = useRef<HTMLLIElement>(null);
  const navigate = useNavigate();
  const { hoverProps, isHovered } = useHover({});
  const tid = useTestIds(props);
  // react-aria's `onAction` callback isn't given the triggering event, so we can't inspect
  // modifier keys there. Capture whether the user cmd/ctrl/shift-clicked (which should open a
  // new tab instead of navigating the current page) in the capture phase, before react-aria's
  // press handling fires `onAction`, and read it back below. I.e. cmd-click -> `true`.
  const openInNewTabRef = useRef(false);
  function captureModifiers(e: KeyboardEvent | MouseEvent) {
    openInNewTabRef.current = wantsNewTab(e);
  }
  const { menuItemProps } = useMenuItem(
    {
      key: item.key,
      isDisabled: Boolean(menuItem?.disabled),
      onAction: () => {
        if (!menuItem) {
          return;
        }
        const { onClick } = menuItem;
        if (typeof onClick === "string") {
          // Open in a new tab for absolute (external) URLs, or when the user cmd/ctrl/shift-clicked.
          if (isAbsoluteUrl(onClick) || openInNewTabRef.current) {
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
          navigate(onClick);
          return;
        }
        onClick && onClick();
      },
      onClose,
    },
    state,
    ref,
  );

  if (!menuItem) {
    return null;
  }

  const { disabled, label, destructive } = menuItem;
  const isDisabled = Boolean(disabled);
  const isSelected = state.selectionManager.selectedKeys.has(label);
  const isFocused = state.selectionManager.focusedKey === item.key;

  return (
    <li
      {...menuItemProps}
      {...hoverProps}
      // Capture-phase handlers run before react-aria's press handling, so `onAction` sees a fresh value.
      onPointerDownCapture={captureModifiers}
      onKeyDownCapture={captureModifiers}
      onClickCapture={captureModifiers}
      ref={ref}
      css={{
        ...Css.df.aic.py1.px2.cursorPointer.outline0.mh("42px").sm.$,
        ...(menuItem.hasDivider ? Css.bb.bc(Tokens.SurfaceSeparator).$ : {}),
        ...(!isDisabled && isHovered ? Css.bgColor(Tokens.SurfaceRaisedHover).$ : {}),
        ...(isFocused ? Css.add("boxShadow", `inset 0 0 0 1px var(${Tokens.FocusRingInset})`).$ : {}),
        ...(isDisabled ? Css.color(Tokens.TextDisabled).cursorNotAllowed.$ : {}),
        ...(destructive ? Css.color(Tokens.Danger).$ : {}),
        ...(isSelected ? Css.fw5.$ : {}),
      }}
      {...tid[defaultTestId(menuItem.label)]}
    >
      {maybeTooltip({
        title: resolveTooltip(disabled),
        placement: "right",
        children: renderMenuItem(menuItem, isSelected, isDisabled),
      })}
    </li>
  );
}

function renderMenuItem(menuItem: MenuItem, isSelected: boolean, isDisabled: boolean) {
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
      {isSelected && <Icon icon="check" color={isDisabled ? Tokens.TextDisabled : Tokens.SelectionIndicator} />}
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

/** True when a click's modifier keys indicate the user wants a new tab/window. I.e. cmd/ctrl/shift-click. */
function wantsNewTab(e: KeyboardEvent | MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey;
}

function isIconMenuItem(item: MenuItem): item is IconMenuItemType {
  return item && typeof item === "object" && "icon" in item;
}

function isImageMenuItem(item: MenuItem): item is ImageMenuItemType {
  return item && typeof item === "object" && "src" in item;
}
