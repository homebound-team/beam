import { render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { jan1, jan10, jan19, jan2 } from "src/forms/formStateDomain";
import { DateRangeField } from "src/inputs/DateFields/DateRangeField";
import { noop } from "src/utils";
import { click, focus } from "src/utils/rtl";

describe(DateRangeField, () => {
  it("renders with date", async () => {
    // Given a DateRangeField with existing value
    const r = await render(<DateRangeField value={{ from: jan2, to: jan10 }} label="Date" onChange={noop} />);

    expect(r.date_label().textContent).toBe("Date");
    expect(r.date()).toHaveValue("01/02/20 - 01/10/20");
  });

  it("should keep calendar open while selecting dates and calls on blur when overlay closes", async () => {
    const onBlur = jest.fn();
    const onChange = jest.fn();
    // Given a DateRangeField with existing value
    const r = await render(
      <DateRangeField value={{ from: jan2, to: jan10 }} label="Date" onChange={onChange} onBlur={onBlur} />,
    );
    // And focus set on the input element.
    focus(r.date());

    // When "blur"ing the field with the overlay as the related target
    fireEvent.blur(r.date(), { relatedTarget: r.date_datePicker() });
    // And clicking on a value in the date picker
    click(r.datePickerDay_0);
    // Then the field is updated and the overlay stays open.
    expect(r.date()).toHaveValue("01/01/20 - 01/10/20");
    expect(r.date_datePicker()).toBeTruthy();
    // When triggering the overlay to close without returning focus to the input
    fireEvent.keyDown(r.date_datePicker(), { key: "Escape", code: "Escape" });
    // Then the overlay should close
    expect(r.date_datePicker).toNotBeInTheDom();
    // And onChange should be called with the new range
    const { from, to } = onChange.mock.calls[0][0];
    expect(new Date(from).toDateString()).toEqual(new Date("01/01/2020").toDateString());
    expect(new Date(to).toDateString()).toEqual(new Date("01/10/2020").toDateString());
  });

  it("can unset the input value while selecting dates", async () => {
    const onBlur = jest.fn();
    const onChange = jest.fn();
    // Given a DateRangeField with existing value
    const r = await render(
      <DateRangeField value={{ from: jan2, to: jan10 }} label="Date" onChange={onChange} onBlur={onBlur} />,
    );
    // And focus set on the input element.
    focus(r.date());
    // When "blur"ing the field with the overlay as the related target
    fireEvent.blur(r.date(), { relatedTarget: r.date_datePicker() });
    // And clicking on a value in the date picker
    click(r.datePickerDay_0);
    // Then `onChange` should have been called once
    expect(onChange).toBeCalledTimes(1).toBeCalledWith({ from: jan1, to: jan10 });
    // And clicking the same date a second time to 'unset' the current range
    click(r.datePickerDay_0);
    // Then expect the input to have been cleared
    expect(r.date()).toHaveValue("");
    // And `onChange` should be called with `undefined`
    expect(onChange).toBeCalledTimes(2).toBeCalledWith(undefined);

    // When selecting the start/'from' date
    click(r.datePickerDay_0);
    // Then the field is updated
    expect(r.date()).toHaveValue("01/01/20 - ");
    // And `onChange` should be called with `undefined`
    expect(onChange).toBeCalledTimes(3).toBeCalledWith(undefined);

    // When selecting the end/'to' date
    click(r.datePickerDay_18);
    // Then the field should be updated with the proper values
    expect(r.date()).toHaveValue("01/01/20 - 01/19/20");
    // And onChange should be called with the new range
    expect(onChange).toBeCalledTimes(4).toBeCalledWith({ from: jan1, to: jan19 });
  });

  it("resets to previous date if user enters invalid value", async () => {
    // Given a DateRangeField with `jan2` as our date
    const onChange = jest.fn();
    const r = await render(<DateRangeField value={{ from: jan2, to: jan10 }} label="Date" onChange={onChange} />);
    // When changing the input value to an invalid date (`type` method will fire `blur` event after entering the value)
    type(r.date, "f");
    // Then the date should be reset
    expect(r.date()).toHaveValue("01/02/20 - 01/10/20");
  });

  it("fires onChange event when user types a valid date", async () => {
    // Given a DateRangeField with `jan2` as our date
    const onChange = jest.fn();
    const r = await render(<DateRangeField value={{ from: jan2, to: jan10 }} label="Date" onChange={onChange} />);
    // When changing the input value to an valid date (`type` method will fire `blur` event after entering the value)
    type(r.date, "01/01/20 - 01/19/20");
    // Then the date should persist in the field
    expect(r.date()).toHaveValue("01/01/20 - 01/19/20");
    // And onChange should be called with the new range
    const { from, to } = onChange.mock.calls[0][0];
    expect(new Date(from).toDateString()).toEqual(new Date("01/01/2020").toDateString());
    expect(new Date(to).toDateString()).toEqual(new Date("01/19/2020").toDateString());
  });

  it("changes date format upon focus and blur", async () => {
    // Given a DateRangeField with the "medium" format
    const r = await render(
      <DateRangeField value={{ from: jan2, to: jan10 }} label="Date" onChange={noop} format="medium" />,
    );
    // Then the format should be displayed as expected upon render
    expect(r.date()).toHaveValue("Thu, Jan 2 - Fri, Jan 10");

    // When focusing the element.
    focus(r.date());
    // Then the format should change to "MM/DD/YY"
    expect(r.date()).toHaveValue("01/02/20 - 01/10/20");

    // And when blur-ing the element.
    fireEvent.blur(r.date());
    // Then the format should reset to specified in props
    expect(r.date()).toHaveValue("Thu, Jan 2 - Fri, Jan 10");
  });
});
