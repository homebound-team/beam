import { jest } from "@jest/globals";
import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";
import { ToggleChip } from "./ToggleChip";

describe("ToggleChip", () => {
  it("renders", async () => {
    const r = await render(<ToggleChip text="Toggle me" onClick={noop} />);

    expect(r.chip.textContent).toBe("Toggle me");
    expect(r.chip_x).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const onClick = jest.fn();
    const r = await render(<ToggleChip text="Click me" onClick={onClick} />);
    click(r.chip);

    expect(onClick).toHaveBeenCalled();
  });

  it("can be disabled", async () => {
    const r = await render(<ToggleChip text="Disabled" onClick={noop} disabled />);

    expect(r.chip).toBeDisabled();
    // and the x icon is not displayed when disabled
    expect(r.query.chip_x).not.toBeInTheDocument();
  });

  it("can render with an additional icon", async () => {
    const r = await render(<ToggleChip text="With icon" icon="attachment" onClick={noop} />);

    expect(r.chip_icon).toBeInTheDocument();
  });
});
