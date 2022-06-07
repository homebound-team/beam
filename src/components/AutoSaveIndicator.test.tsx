import { AutoSaveStatus, AutoSaveStatusContext } from "@homebound/form-state";
import React from "react";
import { noop } from "src/utils";
import { render } from "src/utils/rtl";
import { AutoSaveIndicator } from "./AutoSaveIndicator";

describe(AutoSaveIndicator, () => {
  it.each([
    [AutoSaveStatus.IDLE, "cloudSave", ""],
    [AutoSaveStatus.SAVING, "refresh", "Saving"],
    [AutoSaveStatus.DONE, "cloudSave", "Saved"],
    [AutoSaveStatus.ERROR, "error", "Error saving"],
  ])(`renders for %s`, async (status, iconName, helperText) => {
    const r = await render(
      <MockAutoSaveProvider status={status as AutoSaveStatus}>
        <AutoSaveIndicator showOnIdle />
      </MockAutoSaveProvider>,
    );

    const iconElement = r.container.querySelector(`[data-icon=${iconName}]`)!;
    expect(iconElement).toBeInTheDocument();
    if (helperText) expect(iconElement.nextSibling?.textContent).toMatch(helperText);
  });

  it("can hide when idle", async () => {
    const r = await render(
      <MockAutoSaveProvider status={AutoSaveStatus.IDLE}>
        <AutoSaveIndicator showOnIdle={false} />
      </MockAutoSaveProvider>,
    );

    expect(r.firstElement).toBeEmptyDOMElement();
  });

  it("resets on dismount", async () => {
    const resetStatus = jest.fn();

    // GIVEN it renders
    const r = await render(
      <MockAutoSaveProvider resetStatus={resetStatus}>
        <AutoSaveIndicator />
      </MockAutoSaveProvider>,
    );

    // WHEN we dismount
    r.unmount();

    // THEN it reset on dismount
    expect(resetStatus).toBeCalledTimes(1);
  });

  it("does not reset on rerender", async () => {
    const resetStatus = jest.fn();

    // GIVEN we've rendered
    const r = await render(
      <MockAutoSaveProvider resetStatus={resetStatus} status={AutoSaveStatus.IDLE}>
        <AutoSaveIndicator />
      </MockAutoSaveProvider>,
    );
    expect(resetStatus).not.toHaveBeenCalled();

    // WHEN we rerender, and maybe a Status Update happened
    r.rerender(
      <MockAutoSaveProvider resetStatus={resetStatus} status={AutoSaveStatus.SAVING}>
        <AutoSaveIndicator />
      </MockAutoSaveProvider>,
    );

    // THEN it still didn't get called
    expect(resetStatus).not.toHaveBeenCalled();
  });

  it("avoids resetting when asked", async () => {
    const resetStatus = jest.fn();

    // GIVEN we've told it to not reset
    // WHEN we render
    const r = await render(
      <MockAutoSaveProvider resetStatus={resetStatus}>
        <AutoSaveIndicator doNotReset />
      </MockAutoSaveProvider>,
    );

    // THEN it does not reset
    expect(resetStatus).not.toBeCalled();

    // AND WHEN we dismount
    r.unmount();

    // THEN it also should not reset
    expect(resetStatus).not.toBeCalled();
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

function MockAutoSaveProvider({
  status = AutoSaveStatus.IDLE,
  resetStatus = noop,
  children,
}: React.PropsWithChildren<{ status?: AutoSaveStatus; resetStatus?: VoidFunction }>) {
  return (
    <AutoSaveStatusContext.Provider
      value={{ status, resetStatus, errors: [], resolveAutoSave() {}, triggerAutoSave() {} }}
    >
      {children}
    </AutoSaveStatusContext.Provider>
  );
}
