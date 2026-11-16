import { AiProgressButton } from "src/components/AiProgressButton";
import { noop } from "src/utils/helpers";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("AiProgressButton", () => {
  it("keeps the label in the button while it rests as a star", async () => {
    // Given a button nobody is hovering or focusing
    const r = await render(<AiProgressButton label="View import Progress" onClick={noop} />);
    // Then the collapsed label still names it for screen readers
    expect(r.viewImportProgress).toHaveTextContent("View import Progress");
  });

  it("spins the star only while in progress", async () => {
    // Given a button whose work is in progress
    const r = await render(<AiProgressButton label="View import Progress" inProgress onClick={noop} />);
    // Then the star spins
    expect(getComputedStyle(r.viewImportProgress_star).animation).toBe("spin 3s linear infinite");
    // When the work finishes
    r.rerender(<AiProgressButton label="View import Progress" onClick={noop} />);
    // Then the star stops
    expect(getComputedStyle(r.viewImportProgress_star).animation).toBe("");
  });

  it("fires onClick", async () => {
    // Given a button
    const onClick = vi.fn();
    const r = await render(<AiProgressButton label="View import Progress" onClick={onClick} />);
    // When it's clicked
    click(r.viewImportProgress);
    // Then the handler runs
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick while disabled", async () => {
    // Given a disabled button
    const onClick = vi.fn();
    const r = await render(<AiProgressButton label="View import Progress" disabled onClick={onClick} />);
    // When it's clicked
    click(r.viewImportProgress);
    // Then the handler doesn't run
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows the disabled reason in a tooltip", async () => {
    // Given a disabled reason that takes precedence over the normal tooltip
    // When rendered
    const r = await render(
      <AiProgressButton
        label="View import Progress"
        disabled="No import is running"
        tooltip="Opens the import"
        onClick={noop}
      />,
    );
    // Then the tooltip shows the disabled reason
    expect(r.viewImportProgress_tooltip).toHaveAttribute("title", "No import is running");
  });

  it("renders a link when onClick is a URL", async () => {
    // Given a relative URL
    // When rendered
    const r = await render(<AiProgressButton label="View import Progress" onClick="/imports/1" />, {});
    // Then it's a link to that URL
    expect(r.viewImportProgress.tagName).toBe("A");
    expect(r.viewImportProgress).toHaveAttribute("href", "/imports/1");
  });
});
