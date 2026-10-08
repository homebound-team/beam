import { SelectionSummaryPill } from "src/components/Pills/SelectionSummaryPill/SelectionSummaryPill";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("SelectionSummaryPill", () => {
  it("renders the text and Clear on one button", async () => {
    // Given a selection summary pill
    // When rendered
    const r = await render(<SelectionSummaryPill text="3 Rows Selected" onClick={() => {}} />);
    // Then the text and Clear are on the button, and screen readers hear the action first
    expect(r.selectionSummaryPill.tagName).toBe("BUTTON");
    expect(r.selectionSummaryPill).toHaveTextContent("3 Rows Selected");
    expect(r.selectionSummaryPill_clear).toHaveTextContent("Clear");
    expect(r.selectionSummaryPill).toHaveAccessibleName("Clear 3 Rows Selected");
  });

  it("shows just the count and an × when compact, keeping the text as its name", async () => {
    // Given a compact selection summary pill
    // When rendered
    const r = await render(<SelectionSummaryPill text="3 Rows Selected" onClick={() => {}} compactCount={3} />);
    // Then only the count shows beside the ×, and screen readers still hear the full summary
    expect(r.selectionSummaryPill.textContent).toBe("3");
    expect(r.selectionSummaryPill_count).toHaveTextContent("3");
    expect(r.selectionSummaryPill_clear).toBeInTheDocument();
    expect(r.selectionSummaryPill).toHaveAccessibleName("Clear 3 Rows Selected");
  });

  it("calls onClick when the pill is clicked", async () => {
    // Given a selection summary pill with an onClick handler
    const onClick = vi.fn();
    const r = await render(<SelectionSummaryPill text="3 Rows Selected" onClick={onClick} />);
    // When the pill is clicked
    click(r.selectionSummaryPill);
    // Then onClick is called
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ignores clicks when disabled", async () => {
    // Given a disabled selection summary pill
    const onClick = vi.fn();
    const r = await render(<SelectionSummaryPill text="3 Rows Selected" onClick={onClick} disabled />);
    // When the pill is clicked
    click(r.selectionSummaryPill);
    // Then onClick is not called and there is no tooltip
    expect(r.selectionSummaryPill).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
    expect(r.query.tooltip).toBeNull();
  });

  it("shows the disabled reason in a tooltip", async () => {
    // Given a selection summary pill disabled with a reason
    const onClick = vi.fn();
    const r = await render(<SelectionSummaryPill text="3 Rows Selected" onClick={onClick} disabled="Locked" />);
    // Then the pill is disabled and the reason is on the tooltip
    expect(r.selectionSummaryPill).toBeDisabled();
    expect(r.tooltip).toHaveAttribute("title", "Locked");
    // When the pill is clicked
    click(r.selectionSummaryPill);
    // Then onClick is not called
    expect(onClick).not.toHaveBeenCalled();
  });
});
