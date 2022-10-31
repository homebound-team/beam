import { AutoSaveStatus, AutoSaveStatusContext, AutoSaveStatusProvider } from "@homebound/form-state";
import { Meta } from "@storybook/react";
import { Css } from "..";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { Button } from "./Button";

export default {
  component: AutoSaveIndicator,
  title: "Workspace/Components/Auto Save Indicator",
  parameters: { 
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31572%3A99609",
    }
  },
  
} as Meta;

export const AutoSaveIndicatorStatuses = () => (
  <>
    <AutoSaveStatusContext.Provider value={autoSaveProviderValue(AutoSaveStatus.IDLE)}>
      <AutoSaveIndicator />
    </AutoSaveStatusContext.Provider>
    <AutoSaveStatusContext.Provider value={autoSaveProviderValue(AutoSaveStatus.SAVING)}>
      <AutoSaveIndicator />
    </AutoSaveStatusContext.Provider>
    <AutoSaveStatusContext.Provider value={autoSaveProviderValue(AutoSaveStatus.DONE)}>
      <AutoSaveIndicator />
    </AutoSaveStatusContext.Provider>
    <AutoSaveStatusContext.Provider
      value={{ ...autoSaveProviderValue(AutoSaveStatus.ERROR), errors: [new Error("Some issue happened saving")] }}
    >
      <AutoSaveIndicator />
    </AutoSaveStatusContext.Provider>
  </>
);

export const AutoSaveIndicatorInAction = () => (
  <AutoSaveStatusProvider resetToIdleTimeout={2000}>
    <AutoSaveIndicator />
    <AutoSaveStatusContext.Consumer>
      {({ triggerAutoSave, resolveAutoSave }) => (
        <Button
          label="Do a Save"
          variant="secondary"
          onClick={() => {
            triggerAutoSave();
            setTimeout(resolveAutoSave, 1500);
          }}
          css={Css.buttonBase.$}
        />
      )}
    </AutoSaveStatusContext.Consumer>
  </AutoSaveStatusProvider>
);

const autoSaveProviderValue = (status: AutoSaveStatus) => ({
  status,
  resetStatus() {},
  errors: [],
  resolveAutoSave() {},
  triggerAutoSave() {},
});
