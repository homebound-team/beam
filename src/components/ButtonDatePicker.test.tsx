import { ButtonDatePicker } from "src/components/ButtonDatePicker";
import { click, render } from "src/utils/rtl";
import { jan1, jan2 } from "src/utils/testDates";
import { vi } from "vitest";

describe("ButtonDatePicker", () => {
  it("can render with date picker and select a date", async () => {
    const onSelect = vi.fn();
    // Given a ButtonDatePicker
    const r = await render(<ButtonDatePicker trigger={{ label: "Trigger" }} value={jan2} onSelect={onSelect} />);

    // When clicking the trigger
    click(r.trigger);

    // And selecting a date
    click(r.datePickerDay_0);

    // Then the selected date should be returned and the date picker closed
    expect(onSelect).toBeCalledWith(jan1);
    expect(r.queryByTestId("trigger_datePicker")).toBeFalsy();
  });
});
