import { SelectedOptionPillList } from "src/forms/SelectedOptionPillList";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("SelectedOptionPillList", () => {
  it("renders a pill per option", async () => {
    // Given two selected options
    const options = [
      { id: "a", value: "Option A", onRemove: () => {} },
      { id: "b", value: "Option B", onRemove: () => {} },
    ];
    // When rendered
    const r = await render(<SelectedOptionPillList options={options} />);
    // Then each option's value is shown
    expect(r.selectedOptionPillList_pill_value_0).toHaveTextContent("Option A");
    expect(r.selectedOptionPillList_pill_value_1).toHaveTextContent("Option B");
  });

  it("calls the matching onRemove when a pill is removed", async () => {
    // Given a list with per-option remove handlers
    const onRemoveA = vi.fn();
    const onRemoveB = vi.fn();
    const r = await render(
      <SelectedOptionPillList
        options={[
          { id: "a", value: "Option A", onRemove: onRemoveA },
          { id: "b", value: "Option B", onRemove: onRemoveB },
        ]}
      />,
    );
    // When the second pill is removed
    click(r.selectedOptionPillList_pill_remove_1);
    // Then only that option's handler runs
    expect(onRemoveB).toHaveBeenCalledTimes(1);
    expect(onRemoveA).not.toHaveBeenCalled();
  });

  it("renders nothing when options is empty", async () => {
    // Given no options
    // When rendered
    const r = await render(<SelectedOptionPillList options={[]} />);
    // Then the list is absent
    expect(r.query.selectedOptionPillList).toBeNull();
  });
});
