import { fireEvent } from "@testing-library/react";
import { jan1, jan2 } from "src/forms/formStateDomain";
import { DateField } from "src/inputs/DateFields/DateField";
import { noop } from "src/utils";
import { blur, click, focus, render, type } from "src/utils/rtl";

describe("DateField", () => {
  it("renders with date", async () => {
    // Given a DateField with existing value
    const r = await render(<DateField value={jan2} label="Date" onChange={noop} />);

    expect(r.date_label().textContent).toBe("Date");
    expect(r.date()).toHaveValue("01/02/20");
  });

  it("can select dates and calls onBlur", async () => {
    // Given a DateField with `jan2` as our date
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const r = await render(<DateField value={jan2} label="Date" onChange={onChange} onBlur={onBlur} />);

    // When triggering the Date Picker
    focus(r.date);
    // Then the Date Picker should be shown
    expect(r.date_datePicker()).toBeTruthy();

    // Fire the blur event with the date picker as the related target. This should not fire `onBlur`, but will set the proper focus state internally.
    fireEvent.blur(r.date(), { relatedTarget: r.date_datePicker() });
    expect(onBlur).toBeCalledTimes(0);

    // And when selecting a date - Choose the first of these, which should be `jan1`
    click(r.datePickerDay_0);
    // Then the Date Picker should close
    expect(r.queryByTestId("date_datePicker")).toBeFalsy();
    // And the input's value should reflect the new date.
    expect(r.date()).toHaveValue("01/01/20");
    expect(onChange).toBeCalledTimes(1);
    expect(new Date(onChange.mock.calls[0][0]).toDateString()).toEqual(jan1.toDateString());
  });

  it("resets to previous date if user enters invalid value", async () => {
    // Given a DateField with `jan2` as our date
    const onChange = jest.fn();
    const r = await render(<DateField value={jan2} label="Date" onChange={onChange} />);
    // When changing the input value to an invalid date (`type` method will fire `blur` event after entering the value)
    type(r.date, "f");
    // Then the date should reset to its initial value
    expect(r.date()).toHaveValue("01/02/20");
  });

  it("fires onChange event when user types a valid date", async () => {
    // Given a DateField with `jan2` as our date
    const onChange = jest.fn();
    const r = await render(<DateField value={jan2} label="Date" onChange={onChange} />);
    // When changing the input value to an valid date (`type` method will fire `blur` event after entering the value)
    type(r.date, "01/29/20");
    // Then the date should persist in the field
    expect(r.date()).toHaveValue("01/29/20");
    // And onChange should be called with the new date
    expect(new Date(onChange.mock.calls[0][0]).toDateString()).toEqual(new Date("01/29/2020").toDateString());
  });

  it("changes date format upon focus and blur", async () => {
    // Given a DateField with the "medium" format
    const r = await render(<DateField value={jan2} label="Date" onChange={noop} format="medium" />);
    // Then the format should be displayed as expected upon render
    expect(r.date()).toHaveValue("Thu, Jan 2");

    // When focusing the element.
    focus(r.date);
    // Then the format should change to "MM/DD/YY"
    expect(r.date()).toHaveValue("01/02/20");

    // And when blur-ing the element.
    blur(r.date);
    // Then the format should reset to specified in props
    expect(r.date()).toHaveValue("Thu, Jan 2");
  });
});
