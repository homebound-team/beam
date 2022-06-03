import { useAutoSaveStatus } from "@homebound/form-state";
import { AutoSaveStatus } from "@homebound/form-state/dist/AutoSaveStatus/AutoSaveStatusProvider";
import { assertNever } from "@homebound/form-state/dist/utils";
import { useEffect } from "react";

interface AutoSaveIndicatorProps {
  hideOnIdle?: boolean;
}

export function AutoSaveIndicator({ hideOnIdle }: AutoSaveIndicatorProps) {
  const { status, resetStatus } = useAutoSaveStatus();

  /** On Dismount, reset back to Idle so new pages don't imply something "saved" */
  useEffect(() => () => resetStatus(), []);

  switch (status) {
    case AutoSaveStatus.IDLE:
      return hideOnIdle ? null : <div>Idle</div>;
    case AutoSaveStatus.SAVING:
      return <div>Saving</div>;
    case AutoSaveStatus.DONE:
      return <div>Done</div>;
    case AutoSaveStatus.ERROR:
      return <div>Error</div>;
    default:
      assertNever(status);
  }
}
