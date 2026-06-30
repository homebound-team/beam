import { SelectCard } from "src/inputs";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("SelectCard", () => {
  it("renders the label", async () => {
    const r = await render(<SelectCard icon="single" label="Single" onChange={() => {}} />);
    expect(r.single).toHaveTextContent("Single");
  });

  it("renders the description when provided", async () => {
    const r = await render(
      <SelectCard icon="single" label="Single" description="Each slot is independent" onChange={() => {}} />,
    );
    expect(r.single).toHaveTextContent("Single");
    expect(r.single).toHaveTextContent("Each slot is independent");
  });

  it("omits the description when not provided", async () => {
    const r = await render(<SelectCard icon="single" label="Single" onChange={() => {}} />);
    expect(r.single).not.toHaveTextContent("Each slot is independent");
  });

  it("fires onChange when clicked", async () => {
    const onChange = vi.fn();
    // Given an unselected SelectCard
    const r = await render(<SelectCard icon="single" label="Single" onChange={onChange} />);
    // When clicking it
    click(r.single);
    // Then onChange is called with the toggled value
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("reflects the selected state on the underlying checkbox", async () => {
    const r = await render(<SelectCard icon="single" label="Single" selected onChange={() => {}} />);
    expect(r.single_value).toBeChecked();
  });

  it("is disabled and does not fire onChange", async () => {
    const onChange = vi.fn();
    // Given a disabled SelectCard
    const r = await render(<SelectCard icon="single" label="Single" disabled onChange={onChange} />);
    // Then the button is disabled
    expect(r.single).toBeDisabled();
    // And clicking it does not fire onChange (a disabled button does not dispatch click)
    click(r.single);
    expect(onChange).not.toHaveBeenCalled();
  });
});
