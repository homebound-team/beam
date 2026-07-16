import { JumpLink } from "src/components/JumpLink";
import { click, render } from "src/utils/rtl";
import { beforeEach, vi } from "vitest";

describe("JumpLink", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("renders the label", async () => {
    const r = await render(<JumpLink active={false} label="Section One" href="#section-one" data-testid="jumpLink" />);
    expect(r.jumpLink).toHaveTextContent("Section One");
  });

  it("renders as an anchor with the given href", async () => {
    const r = await render(<JumpLink active={false} label="Section One" href="#section-one" data-testid="jumpLink" />);
    expect(r.jumpLink.tagName).toBe("A");
    expect(r.jumpLink).toHaveAttribute("href", "#section-one");
  });

  it("scrolls to the target element when clicked", async () => {
    const r = await render(
      <div>
        <JumpLink active={false} label="Section One" href="#section-one" data-testid="jumpLink" />
        <div id="section-one" />
      </div>,
    );
    click(r.jumpLink);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: expect.any(Number), behavior: "smooth" });
  });

  it("does not scroll when disabled", async () => {
    const r = await render(
      <div>
        <JumpLink active={false} label="Section One" href="#section-one" disabled data-testid="jumpLink" />
        <div id="section-one" />
      </div>,
    );
    expect(r.jumpLink).not.toHaveAttribute("href");
    expect(r.jumpLink).toHaveAttribute("aria-disabled", "true");
    click(r.jumpLink);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
