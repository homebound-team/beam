import type { ReactNode } from "react";
import type { BeamColor } from "src/colors";
import { Icon } from "src/components/Icon";
import { Tooltip } from "src/components/Tooltip";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type ColumnTooltipIconProps = {
  /** Hover content, or a click handler the caller uses to open a modal. */
  tooltip: ReactNode | VoidFunction;
  color: BeamColor;
  /** Column name. Names the click target for assistive tech. */
  label?: string;
};

/** Info icon for a column header or an Edit Columns row. */
export function ColumnTooltipIcon(props: ColumnTooltipIconProps) {
  const { tooltip, color, label } = props;
  const tid = useTestIds(props, "columnTooltip");
  const icon = <Icon icon="infoCircle" inc={2} color={color} />;

  if (typeof tooltip === "function") {
    return (
      <button
        type="button"
        aria-label={label ? `${label} information` : "Column information"}
        css={Css.bn.bgTransparent.p0.lh(0).fs0.df.aic.cursorPointer.outline(0).onFocusVisible.bshFocus.$}
        onClick={tooltip}
        {...tid}
      >
        {icon}
      </button>
    );
  }

  return (
    <Tooltip title={tooltip} placement="top" {...tid}>
      {icon}
    </Tooltip>
  );
}
