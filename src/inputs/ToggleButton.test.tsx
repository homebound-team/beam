import { click, render, wait } from "src/utils/rtl";
import { ToggleButton } from "./ToggleButton";

describe("ToggleButton", () => {
  it("renders", async () => {
    // Given a ToggleButton
    const r = await render(<ToggleButton label={"Toggle button"} onChange={() => {}} />);
    // Then it renders
    expect(r.toggleButton.textContent).toBe("Toggle button");
    expect(r.toggleButton_value).not.toBeChecked();
  });

  it("renders selected state", async () => {
    // Given a selected ToggleButton
    const r = await render(<ToggleButton label={"Toggle button"} selected onChange={() => {}} />);
    // Then it's checked
    expect(r.toggleButton_value).toBeChecked();
  });

  it("fires onChange", async () => {
    // Given a ToggleButton with a onChange callback
    const onChange = jest.fn();
    const r = await render(<ToggleButton label={"Toggle button"} onChange={onChange} />);
    // When we click the toggle button
    click(r.toggleButton);
    // Then it's called
    expect(onChange).toBeCalledTimes(1);
  });

  it("does not fire onChange when disabled", async () => {
    // Given a disabled ToggleButton with a onChange callback
    const onChange = jest.fn();
    const r = await render(<ToggleButton label={"Toggle button"} onChange={onChange} disabled />);
    // When we click the toggle button
    click(r.toggleButton);
    // Then it isn't called
    expect(onChange).toBeCalledTimes(0);
  });

  it("disables button while onChange is in flight and re-enables it after a successful promise", async () => {
    const r = await render(
      <ToggleButton label={"Toggle button"} onChange={async () => new Promise((resolve) => resolve())} />,
    );
    click(r.toggleButton, { allowAsync: true });
    expect(r.toggleButton_value).toBeDisabled();
    await wait();
    expect(r.toggleButton_value).not.toBeDisabled();
  });

  it("disables button while onChange is in flight and re-enables it after a failed promise", async () => {
    const onError = jest.fn();
    const r = await render(
      <ToggleButton
        label={"Toggle button"}
        onChange={async () => new Promise((resolve, reject) => reject("Promise error")).catch(onError)}
      />,
    );

    click(r.toggleButton, { allowAsync: true });
    expect(r.toggleButton_value).toBeDisabled();
    await wait();
    expect(r.toggleButton_value).not.toBeDisabled();
    expect(onError).toBeCalledWith("Promise error");
  });

  it("can define a custom testid", async () => {
    const r = await render(<ToggleButton label="Not the test id" data-testid="customTestId" onChange={() => {}} />);
    expect(r.customTestId).toBeInTheDocument();
  });
});
