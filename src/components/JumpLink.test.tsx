import { JumpLink } from "src/components/JumpLink";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("JumpLink", () => {
  it("renders the label", async () => {
    const r = await render(<JumpLink active={false} label="Section One" onClick={() => {}} data-testid="jumpLink" />);
    expect(r.jumpLink).toHaveTextContent("Section One");
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    const r = await render(<JumpLink active={false} label="Section One" onClick={onClick} data-testid="jumpLink" />);
    click(r.jumpLink);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
