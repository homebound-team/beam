import { AutoSaveStatusContext } from "@homebound/form-state";
import { AutoSaveStatus } from "@homebound/form-state/dist/AutoSaveStatus/AutoSaveStatusProvider";
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
    [AutoSaveStatus.IDLE, "Idle"],
    [AutoSaveStatus.SAVING, "Saving"],
    [AutoSaveStatus.DONE, "Done"],
    [AutoSaveStatus.ERROR, "Error"],
  ])(`renders for %s`, async (status, text) => {
    const r = await render(
      <MockAutoSaveProvider status={status as AutoSaveStatus}>
        <AutoSaveIndicator />
      </MockAutoSaveProvider>,
    );

    expect(r.getByText(text)).toBeInTheDocument();
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
});
