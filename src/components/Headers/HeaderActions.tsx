import { PressEvent } from "@react-types/shared";
import { Button, ButtonProps } from "src/components/Button";
import { ButtonMenu, ButtonMenuProps, MenuItem } from "src/components/ButtonMenu";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils";

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
export type HeaderAction =
  | ({ kind?: "default" } & Omit<ButtonProps, "label"> & { label: string })
  | ({ kind: "icon" } & Omit<IconButtonProps, "variant" | "label"> & { label: string })
  | ({ kind: "menu" } & ButtonMenuProps);

export type HeaderActionsProps = {
  actions: HeaderAction[];
  /** Collapse two or more actions into a kebab `ButtonMenu` at `sm`. */
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
      <div css={Css.df.aic.gap1.fs0.$} {...tid}>
        <ButtonMenu trigger={{ icon: "verticalDots", variant: "outline" }} items={toMenuItems(actions)} />
      </div>
    );
  }

  return (
    <div css={Css.df.aic.gap1.fs0.$} {...tid}>
      {actions.map((action, i) => {
        const key = headerActionKey(action, i);
        if (action.kind === "icon") {
          return <IconButton key={key} {...action} variant="outline" />;
        }
        if (action.kind === "menu") {
          const { kind, ...menuProps } = action;
          void kind;
          return <ButtonMenu key={key} {...menuProps} />;
        }
        return <Button key={key} {...action} />;
      })}
    </div>
  );
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
