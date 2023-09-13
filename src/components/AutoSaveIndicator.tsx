import { useEffect } from "react";
import { Css, Palette } from "src/Css";
import { assertNever } from "src/types";
import { AutoSaveStatus, IconProps, Tooltip, useAutoSaveStatus } from ".";
import { Icon } from "./Icon";

interface AutoSaveIndicatorProps {
  hideOnIdle?: boolean;
  doNotReset?: boolean;
}

export function AutoSaveIndicator({ hideOnIdle, doNotReset }: AutoSaveIndicatorProps) {
  const { status, resetStatus, errors } = useAutoSaveStatus();

  useEffect(
    () => {
      if (doNotReset) return;
      /**
       * Any time AutoSaveIndicator dismounts, most likely on Page Navigation,
       * state should clear before the next Indicator mounts
       */
      return () => resetStatus();
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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
    <div data-testid="autoSave" css={Css.df.gap1.aic.gray700.smMd.$}>
      <Icon icon={icon} color={color} />
      {text}
    </div>
  );
}
