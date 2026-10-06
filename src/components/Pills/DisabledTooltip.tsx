import type { ReactNode } from "react";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css } from "src/Css";

type DisabledTooltipProps = {
  /** If a ReactNode, that reason is shown in a tooltip. */
  disabled: boolean | ReactNode;
  children: ReactNode;
};

/** Shows a disabled pill's reason in a tooltip. */
export function DisabledTooltip(props: DisabledTooltipProps) {
  const { disabled, children } = props;
  const reason = resolveTooltip(disabled);

  // Disabled buttons don't fire pointer events, and the tooltip trigger has no box, so this wrapper catches the hover.
  return maybeTooltip({
    title: reason,
    placement: "top",
    children: <span css={Css.if(!!reason).dif.cursorNotAllowed.else.display("contents").$}>{children}</span>,
  });
}
