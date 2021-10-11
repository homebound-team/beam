import { click, render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { jan1, jan2 } from "src/forms/formStateDomain";
import { DateField } from "src/inputs/DateField";
import { noop } from "src/utils";

describe("DateField", () => {
  it("renders with date", async () => {
    // Given a DateField with existing value
    const r = await render(<DateField value={jan2} label="Date" onChange={noop} />);

    expect(r.date_label().textContent).toBe("Date");
    expect(r.date()).toHaveValue("01/02/20");
  });

  it("renders with placeholder", async () => {
    // Given a DateField without existing value and placeholder text
    const r = await render(<DateField value={undefined} label="Date" onChange={noop} placeholder="Select a date" />);
    // Then value should not be set and placeholder should be set.
    expect(r.date()).toHaveValue("").toHaveAttribute("placeholder", "Select a date");
  });

  it("renders with error message", async () => {
    // Given a DateField with error
    const r = await render(<DateField value={jan2} label="Date" onChange={noop} errorMsg="Error message" />);
    // Then the error text should exist and match
    expect(r.date_errorMsg().textContent).toBe("Error message");
  });

  it("renders with helper text", async () => {
    // Given a DateField with helper text
    const r = await render(<DateField value={jan2} label="Date" onChange={noop} helperText="Helper text" />);
    // Then the helper text should exist and match
    expect(r.date_helperText().textContent).toBe("Helper text");
  });

  it("resets focus to input field when clicking calendar button and does not call onBlur", async () => {
    const onBlur = jest.fn();
    const r = await render(<DateField value={jan2} label="Date" onChange={noop} onBlur={onBlur} />);
    // Given focus set on the input element.
    fireEvent.focus(r.date());
    // When setting focus to the Calendar Icon button
    fireEvent.focus(r.date_calendarButton());
    // Then expect the focus to move back to the input element.
    expect(r.date()).toHaveFocus();
    // And firing blur event on the input with the `calendarButton` as the related target
    fireEvent.blur(r.date(), { relatedTarget: r.date_calendarButton() });
    // And the `onBlur` should not have been called.
    expect(onBlur).not.toBeCalled();
  });

  it("can fire onFocus and onBlur", async () => {
    // Given a DateField with `onFocus` and `onBlur`
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    const r = await render(<DateField value={jan2} label="Date" onChange={noop} onFocus={onFocus} onBlur={onBlur} />);
    // When setting focus on the input element
    fireEvent.focus(r.date());
    // Then focus should be called.
    expect(onFocus).toBeCalledTimes(1);
    // When firing the blur event
    fireEvent.blur(r.date());
    // Then onBlur should be called
    expect(onBlur).toBeCalledTimes(1);
  });

  it("can select dates", async () => {
    // Given a DateField with `jan2` as our date
    const onChange = jest.fn();
    const r = await render(<DateField value={jan2} label="Date" onChange={onChange} />);

    // When triggering the Date Picker
    fireEvent.focus(r.date());
    // Then the Date Picker should be shown
    expect(r.date_datePicker()).toBeTruthy();

    // And when selecting a date - React-Day-Picker uses role="gridcell" for all dates. Choose the first of these, which should be `jan1`
    click(r.queryAllByRole("gridcell")[0]);
    // Then then Date Picker should close
    expect(r.queryByTestId("date_datePicker")).toBeFalsy();
    // And the input's value should reflect the new date.
    expect(r.date()).toHaveValue("01/01/20");
    expect(onChange).toBeCalledTimes(1);
    expect(new Date(onChange.mock.calls[0][0]).toDateString()).toEqual(jan1.toDateString());
  });

  it("resets to previous date if user enters invalid value and does not fire onChange", async () => {
    // Given a DateField with `jan2` as our date
    const onChange = jest.fn();
    const r = await render(<DateField value={jan2} label="Date" onChange={onChange} />);
    // When changing the input value to an invalid date (`type` method will fire `blur` event after entering the value)
    type(r.date, "f");
    // Then the date should reset to its initial value
    expect(r.date()).toHaveValue("01/02/20");
    // And onChange should not be called
    expect(onChange).not.toBeCalled();
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
});
