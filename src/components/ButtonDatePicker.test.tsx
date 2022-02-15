import { ButtonDatePicker } from "src/components/ButtonDatePicker";
import { jan1, jan2 } from "src/forms/formStateDomain";
import { click, render } from "src/utils/rtl";

describe("ButtonDatePicker", () => {
  it("can render with date picker and select a date", async () => {
    const onSelect = jest.fn();
    // Given a ButtonDatePicker
    const r = await render(
      <ButtonDatePicker trigger={{ label: "Trigger" }} value={jan2} onSelect={(d) => onSelect(d.toDateString())} />,
    );

    // When clicking the trigger
    click(r.trigger);

    // And selecting a date
    click(r.queryAllByRole("gridcell")[0]);

    // Then the selected date should be returned and the date picker closed
    expect(onSelect).toBeCalledWith(jan1.toDateString());
    expect(r.queryByTestId("date_datePicker")).toBeFalsy();
  });
});
