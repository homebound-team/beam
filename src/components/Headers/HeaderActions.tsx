import { Button, ButtonProps } from "src/components/Button";
import { ButtonMenu, ButtonMenuProps } from "src/components/ButtonMenu";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

/** Overflow `ButtonMenu` props; the trigger is always a `verticalDots` IconButton. */
type HeaderMenuAction = Omit<ButtonMenuProps, "trigger">;

/**
 * A single action rendered by `HeaderActions` — a `Button`, an icon-only `IconButton`, or a
 * `ButtonMenu` (typically the overflow / more-actions menu).
 *
 * Tagged with `kind` (not `type`) because `ButtonProps` already has its own
 * unrelated `type?: "button" | "submit" | "reset"` HTML-attribute field.
 *
 * Icon actions always render with the `outline` `IconButton` variant, so `variant` is omitted here.
 * Menu actions always use a `verticalDots` trigger.
 */
export type HeaderAction =
  | ({ kind?: "default" } & ButtonProps)
  | ({ kind: "icon" } & Omit<IconButtonProps, "variant">)
  | ({ kind: "menu" } & HeaderMenuAction);

export type HeaderActionsProps = {
  actions: HeaderAction[];
};

/**
 * Internal actions-row shared by header/section title rows.
 *
 * Used by `ContentHeader` today; expected to also back `PageHeader`, `WorkflowHeader`,
 * `FormSection`, and `FormSectionLayout`'s `actions` props. Not part of the public API —
 * consumers configure actions via each of those components' own `actions` prop instead.
 */
export function HeaderActions(props: HeaderActionsProps) {
  const { actions, ...otherProps } = props;
  const tid = useTestIds(otherProps, "headerActions");

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
          return <ButtonMenu key={key} {...menuProps} trigger={{ icon: "verticalDots" }} />;
        }
        return <Button key={key} {...action} />;
      })}
    </div>
  );
}

function headerActionKey(action: HeaderAction, index: number): string {
  if (action.kind === "icon") return `${action.icon}-${index}`;
  if (action.kind === "menu") return `menu-${index}`;
  return `${String(action.label)}-${index}`;
}
