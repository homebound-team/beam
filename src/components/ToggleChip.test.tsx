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
    await click(r.chip);
    expect(onClick).toHaveBeenCalled();
  });

  it("can be disabled", async () => {
    const r = await render(<ToggleChip text="Disabled" onClick={noop} disabled />);
    expect(r.chip).toBeDisabled();
  });

  it("can render with an additional icon", async () => {
    const r = await render(<ToggleChip text="With icon" icon="attachment" onClick={noop} />);
    expect(r.chip_icon).toBeInTheDocument();
  });

  it("can be rendered without the x icon", async () => {
    const r = await render(<ToggleChip text="Without x icon" onClick={noop} clearable={false} />);
    expect(r.query.chip_x).not.toBeInTheDocument();
  });
});
