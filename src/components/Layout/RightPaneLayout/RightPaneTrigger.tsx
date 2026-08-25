import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Css } from "src/Css";
import { getFloatingRightOffset } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { useRightPane } from "./useRightPane";

export type RightPaneTriggerProps = {
  icon: IconButtonProps["icon"];
  /** Accessible name (and default tooltip). */
  label: string;
  onClick: VoidFunction;
  /** Vertical offset from the top of the viewport chrome area (px). Default 120. */
  topPx?: number;
};

/**
 * Floating circular trigger docked to the right; hidden while the right pane is open.
 * Omit when rows / in-form buttons open the pane instead. See `docs/layouts.md`.
 */
export function RightPaneTrigger(props: RightPaneTriggerProps) {
  const { icon, label, onClick, topPx = 120 } = props;
  const tid = useTestIds(props, "rightPaneTrigger");
  const { isRightPaneOpen } = useRightPane();

  if (isRightPaneOpen) return null;

  return (
    <div css={Css.fixed.topPx(topPx).right(getFloatingRightOffset(16)).z(zIndices.rightPane).$} {...tid}>
      <IconButton icon={icon} label={label} variant="circle" onClick={onClick} />
    </div>
  );
}
