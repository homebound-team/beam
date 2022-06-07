import { AutoSaveStatus, useAutoSaveStatus } from "@homebound/form-state";
import { PropsWithChildren, useEffect } from "react";
import { Css, Palette } from "src/Css";
import { assertNever } from "src/types";
import { Tooltip } from ".";
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
      return hideOnIdle ? null : <Icon icon="cloudSave" color={Palette.Gray700} />;
    case AutoSaveStatus.SAVING:
      return (
        <HelperText text="Saving..." color={Palette.Gray700}>
          <Icon icon="refresh" color={Palette.Gray700} />
        </HelperText>
      );
    case AutoSaveStatus.DONE:
      return (
        <HelperText text="Saved" color={Palette.LightBlue700}>
          <Icon icon="cloudSave" color={Palette.LightBlue700} />
        </HelperText>
      );
    case AutoSaveStatus.ERROR:
      return (
        /**
         * Tooltip is expanding to fill as much available space as it can, possibly
         * rendering it far away from the Icon/Text. Wrap it with a div to constrain
         * it.
         */
        <div css={Css.dif.$}>
          <Tooltip title={String(errors)} placement="bottom">
            <HelperText text="Error saving" color={Palette.Gray700}>
              <Icon icon="error" color={Palette.Red500} />
            </HelperText>
          </Tooltip>
        </div>
      );
    default:
      assertNever(status);
  }
}

const HelperText = ({ text, color, children }: PropsWithChildren<{ text: string; color?: Palette }>) => (
  <div css={Css.df.gap1.color(color).$}>
    {children}
    {text}
  </div>
);
