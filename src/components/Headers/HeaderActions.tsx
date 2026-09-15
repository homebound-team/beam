import type { PressEvent } from "@react-types/shared";
import { Button, type ButtonProps } from "src/components/Button";
import { ButtonMenu, type ButtonMenuProps, type MenuItem } from "src/components/ButtonMenu";
import { IconButton, type IconButtonProps } from "src/components/IconButton";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils/useTestIds";

/**
 * A single action rendered by `HeaderActions` — a `Button`, an icon-only `IconButton`, or a
 * `ButtonMenu` (typically the overflow / more-actions menu).
 *
 * Tagged with `kind` (not `type`) because `ButtonProps` already has its own
 * unrelated `type?: "button" | "submit" | "reset"` HTML-attribute field.
 *
 * Labels are `string` so actions can collapse into a `ButtonMenu` on mobile.
 * Icon actions always render with the `outline` `IconButton` variant, so `variant` is omitted here.
 */
type HeaderActionKeepVisible = {
  /** At `sm`, render this action below the title instead of collapsing it into the overflow menu. */
  keepVisible?: boolean;
};

export type HeaderAction =
  | ({ kind?: "default" } & HeaderActionKeepVisible & Omit<ButtonProps, "label"> & { label: string })
  | ({ kind: "icon" } & HeaderActionKeepVisible & Omit<IconButtonProps, "variant" | "label"> & { label: string })
  | ({ kind: "menu" } & HeaderActionKeepVisible & ButtonMenuProps);

export type HeaderActionsProps = {
  actions: HeaderAction[];
  /** Collapse two or more actions into a overflow menu `ButtonMenu` at `sm`. */
  collapseOnSm?: boolean;
};

/** Internal renderer for `HeaderAction[]`. Not public — pass `actions` on `ContentHeader`, `GridTableLayout`, or `PageHeader`. */
export function HeaderActions(props: HeaderActionsProps) {
  const { actions, collapseOnSm = false, ...otherProps } = props;
  const tid = useTestIds(otherProps, "headerActions");
  const { sm } = useBreakpoint();
  const collapse = collapseOnSm && sm && actions.length > 1;

  if (collapse) {
    return (
      <div css={actionRowCss} {...tid}>
        <ButtonMenu trigger={{ icon: "verticalDots", variant: "outline" }} items={toMenuItems(actions)} />
      </div>
    );
  }

  return (
    <div css={actionRowCss} {...tid}>
      {actions.map(renderHeaderAction)}
    </div>
  );
}

/** At `sm`, `keepVisible` actions go in `bottomSlotActions`; the rest stay in `rightSlotActions`. */
export function splitHeaderActionsOnSm(
  actions: HeaderAction[] | undefined,
  sm: boolean,
): { bottomSlotActions: HeaderAction[]; rightSlotActions: HeaderAction[] } {
  if (!sm) return { bottomSlotActions: [], rightSlotActions: actions ?? [] };
  return {
    bottomSlotActions: actions?.filter((action) => action.keepVisible) ?? [],
    rightSlotActions: actions?.filter((action) => !action.keepVisible) ?? [],
  };
}

const actionRowCss = Css.df.aic.fww.gap2.fs0.$;

function renderHeaderAction(action: HeaderAction, index: number) {
  const key = headerActionKey(action, index);
  if (action.kind === "icon") {
    const { kind: _kind, keepVisible: _keepVisible, ...iconProps } = action;
    return <IconButton key={key} {...iconProps} variant="outline" />;
  }
  if (action.kind === "menu") {
    const { kind: _kind, keepVisible: _keepVisible, ...menuProps } = action;
    return <ButtonMenu key={key} {...menuProps} />;
  }
  const { keepVisible: _keepVisible, kind: _kind, ...buttonProps } = action;
  return <Button key={key} {...buttonProps} />;
}

function headerActionKey(action: HeaderAction, index: number): string {
  if (action.kind === "icon") return `${action.icon}-${index}`;
  if (action.kind === "menu") return `menu-${index}`;
  return `${action.label}-${index}`;
}

function toMenuItems(actions: HeaderAction[]): MenuItem[] {
  return actions.flatMap((action): MenuItem[] => {
    if (action.kind === "menu") return action.items;
    const { label, onClick, disabled } = action;
    // a non-string onClick could be a Promise for some buttons, but button menus don't support Promises, so we just need to trick it a little bit.
    const itemOnClick: MenuItem["onClick"] =
      typeof onClick === "string" ? onClick : () => void onClick({} as PressEvent);
    if (action.kind === "icon") {
      return [{ label, onClick: itemOnClick, disabled, icon: action.icon }];
    }
    return [
      {
        label,
        onClick: itemOnClick,
        disabled,
        // Buttons can opt out of their default icon with `icon: null`, which menu items can't render.
        ...(action.icon ? { icon: action.icon } : {}),
        ...(action.variant === "danger" ? { destructive: true } : {}),
      },
    ];
  });
}
