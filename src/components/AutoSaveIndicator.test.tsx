import { AutoSaveStatus, AutoSaveStatusContext } from "@homebound/form-state";
import React from "react";
import { noop } from "src/utils";
import { render } from "src/utils/rtl";
import { AutoSaveIndicator } from "./AutoSaveIndicator";

const MockAutoSaveProvider = ({
  status = AutoSaveStatus.IDLE,
  resetStatus = noop,
  children,
}: React.PropsWithChildren<{ status?: AutoSaveStatus; resetStatus?: VoidFunction }>) => {
  return (
    <AutoSaveStatusContext.Provider
      value={{ status, resetStatus, errors: [], resolveAutoSave() {}, triggerAutoSave() {} }}
    >
      {children}
    </AutoSaveStatusContext.Provider>
  );
};

describe(AutoSaveIndicator, () => {
  it.each([
    [AutoSaveStatus.IDLE, "cloudSave", ""],
    [AutoSaveStatus.SAVING, "refresh", "Saving"],
    [AutoSaveStatus.DONE, "cloudSave", "Saved"],
    [AutoSaveStatus.ERROR, "error", "Error saving"],
  ])(`renders for %s`, async (status, iconName, helperText) => {
    const r = await render(
      <MockAutoSaveProvider status={status as AutoSaveStatus}>
        <AutoSaveIndicator />
      </MockAutoSaveProvider>,
    );

    const iconElement = r.container.querySelector(`[data-icon=${iconName}]`)!;
    expect(iconElement).toBeInTheDocument();
    if (helperText) expect(iconElement.nextSibling?.textContent).toMatch(helperText);
  });

  it("can hide on idle", async () => {
    const r = await render(
      <MockAutoSaveProvider status={AutoSaveStatus.IDLE}>
        <AutoSaveIndicator hideOnIdle />
      </MockAutoSaveProvider>,
    );

    expect(r.firstElement).toBeEmptyDOMElement();
  });

  it("resets on dismount", async () => {
    const resetStatus = jest.fn();

    const r = await render(
      <MockAutoSaveProvider resetStatus={resetStatus}>
        <AutoSaveIndicator />
      </MockAutoSaveProvider>,
    );

    r.unmount();

    expect(resetStatus).toBeCalledTimes(1);
  });

  it("has tooltips for errors", async () => {
    const r = await render(
      <AutoSaveStatusContext.Provider
        value={{
          errors: [new Error("Some error occurred")],
          status: AutoSaveStatus.ERROR,
          resetStatus() {},
          resolveAutoSave() {},
          triggerAutoSave() {},
        }}
      >
        <AutoSaveIndicator />
      </AutoSaveStatusContext.Provider>,
    );

    expect(r.tooltip()).toHaveAttribute("title", "Error: Some error occurred");
  });
});
