import { FilterPill } from "src/components/Pills/FilterPill/FilterPill";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("FilterPill", () => {
  it("renders the label and close icon", async () => {
    // Given a filter pill
    // When rendered
    const r = await render(<FilterPill text="M1 - English Transitional" onClick={() => {}} />);
    // Then the label and close icon are shown on the button
    expect(r.filterPill.tagName).toBe("BUTTON");
    expect(r.filterPill).toHaveTextContent("M1 - English Transitional");
    expect(r.filterPill_x).toBeInTheDocument();
  });

  it("calls onClick when the pill is clicked", async () => {
    // Given a filter pill with an onClick handler
    const onClick = vi.fn();
    const r = await render(<FilterPill text="Status" onClick={onClick} />);
    // When the pill is clicked
    click(r.filterPill);
    // Then onClick is called
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps the close icon and ignores clicks when disabled", async () => {
    // Given a disabled filter pill
    const onClick = vi.fn();
    const r = await render(<FilterPill text="Status" onClick={onClick} disabled />);
    // When the pill is clicked
    click(r.filterPill);
    // Then the close icon stays and onClick is not called
    expect(r.filterPill).toBeDisabled();
    expect(r.filterPill_x).toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();
    expect(r.query.tooltip).toBeNull();
  });

  it("shows the disabled reason in a tooltip", async () => {
    // Given a filter pill disabled with a reason
    const onClick = vi.fn();
    const r = await render(<FilterPill text="Status" onClick={onClick} disabled="Required" />);
    // Then the pill is disabled and the reason is on the tooltip
    expect(r.filterPill).toBeDisabled();
    expect(r.tooltip).toHaveAttribute("title", "Required");
    // When the pill is clicked
    click(r.filterPill);
    // Then onClick is not called
    expect(onClick).not.toHaveBeenCalled();
  });
});
