import { AutoSaveStatus, useAutoSaveStatus } from "@homebound/form-state";
import { assertNever } from "@homebound/form-state/dist/utils";
import { useEffect } from "react";
import { Tooltip } from ".";
import { Palette } from "..";
import { Icon } from "./Icon";

interface AutoSaveIndicatorProps {
  hideOnIdle?: boolean;
}

export function AutoSaveIndicator({ hideOnIdle }: AutoSaveIndicatorProps) {
  const { status, resetStatus, errors } = useAutoSaveStatus();

  /** On Dismount, reset back to Idle so new pages don't imply something "saved" */
  useEffect(() => () => resetStatus(), []);

  switch (status) {
    case AutoSaveStatus.IDLE:
      return hideOnIdle ? null : <Icon icon="cloudSave" />;
    case AutoSaveStatus.SAVING:
      return <Icon icon="refresh" helperText="Saving..." color={Palette.LightBlue500} />;
    case AutoSaveStatus.DONE:
      return <Icon icon="cloudSave" helperText="Saved" color={Palette.Green600} />;
    case AutoSaveStatus.ERROR:
      return (
        <Tooltip title={String(errors)} placement="bottom">
          <Icon icon="xCircle" helperText="Error saving" color={Palette.Red500} />
        </Tooltip>
      );
    default:
      assertNever(status);
  }
}
