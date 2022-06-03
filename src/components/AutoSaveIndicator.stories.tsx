import { AutoSaveStatusContext } from "@homebound/form-state";
import { AutoSaveStatus } from "@homebound/form-state/dist/AutoSaveStatus/AutoSaveStatusProvider";
import { Meta } from "@storybook/react";
import { AutoSaveIndicator } from "./AutoSaveIndicator";

export default {
  component: AutoSaveIndicator,
  title: "Components/Auto Save Indicator",
} as Meta;

const renderForStatus = (status: AutoSaveStatus) => (
  <AutoSaveStatusContext.Provider
    value={{
      status,
      resetStatus() {},
      errors: [],
      resolveAutoSave() {},
      triggerAutoSave() {},
    }}
  >
    <AutoSaveIndicator />
  </AutoSaveStatusContext.Provider>
);

export const AutoSaveIndicatorStatuses = () => {
  return (
    <>
      {renderForStatus(AutoSaveStatus.IDLE)}
      {renderForStatus(AutoSaveStatus.SAVING)}
      {renderForStatus(AutoSaveStatus.DONE)}
      {renderForStatus(AutoSaveStatus.ERROR)}
    </>
  );
};
