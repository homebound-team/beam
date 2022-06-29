import { AutoSaveStatus, useAutoSaveStatus } from "@homebound/form-state";
import { useEffect } from "react";
import { Css, Palette } from "src/Css";
import { assertNever } from "src/types";
import { IconProps, Tooltip } from ".";
import { Icon } from "./Icon";

interface AutoSaveIndicatorProps {
  hideOnIdle?: boolean;
  doNotReset?: boolean;
}

export function AutoSaveIndicator({ hideOnIdle, doNotReset }: AutoSaveIndicatorProps) {
  const { status, resetStatus, errors } = useAutoSaveStatus();

  useEffect(() => {
    if (doNotReset) return;
    /**
     * Any time AutoSaveIndicator dismounts, most likely on Page Navigation,
     * state should clear before the next Indicator mounts
     */
    return () => resetStatus();
  }, []);

  switch (status) {
    case AutoSaveStatus.IDLE:
      return hideOnIdle ? null : <Indicator icon="cloudSave" />;
    case AutoSaveStatus.SAVING:
      return <Indicator icon="refresh" text="Saving..." />;
    case AutoSaveStatus.DONE:
      return <Indicator icon="cloudSave" text="Saved" />;
    case AutoSaveStatus.ERROR:
      return (
        /**
         * Tooltip is expanding to fill as much available space as it can, possibly
         * rendering it far away from the Icon/Text. Wrap it with a div to constrain
         * it.
         */
        <div css={Css.dif.$}>
          <Tooltip title={String(errors)} placement="bottom">
            <Indicator icon="error" color={Palette.Red500} text="Error saving" />
          </Tooltip>
        </div>
      );
    default:
      assertNever(status);
  }
}

interface IndicatorProps {
  icon: IconProps["icon"];
  color?: IconProps["color"];
  text?: string;
}
function Indicator({ text, icon, color }: IndicatorProps) {
  return (
    <div css={Css.df.gap1.aic.gray700.smEm.$}>
      <Icon icon={icon} color={color} />
      {text}
    </div>
  );
}
