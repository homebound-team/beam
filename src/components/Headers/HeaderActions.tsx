import { Button, ButtonProps } from "src/components/Button";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

/**
 * A single action rendered by `HeaderActions` — either a full `Button` or an icon-only `IconButton`.
 *
 * Tagged with `kind` (not `type`) because `ButtonProps` already has its own
 * unrelated `type?: "button" | "submit" | "reset"` HTML-attribute field.
 *
 * Icon actions always render with the `outline` `IconButton` variant, so `variant` is omitted here.
 */
export type HeaderAction = ({ kind?: "default" } & ButtonProps) | ({ kind: "icon" } & Omit<IconButtonProps, "variant">);

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
    <div css={Css.df.gap1.fs0.$} {...tid}>
      {actions.map((action) =>
        action.kind === "icon" ? (
          <IconButton key={action.icon} {...action} variant="outline" />
        ) : (
          <Button key={`${action.label}`} {...action} />
        ),
      )}
    </div>
  );
}
