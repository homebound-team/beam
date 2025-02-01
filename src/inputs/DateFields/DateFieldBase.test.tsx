import { clickAndWait } from "@homebound/rtl-utils";
import { jest } from "@jest/globals";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { jan10, jan2 } from "src/forms/formStateDomain";
import { DateFieldBase } from "src/inputs/DateFields/DateFieldBase";
import { noop } from "src/utils";
import { blur, click, focus, render } from "src/utils/rtl";

describe(DateFieldBase, () => {
  it("renders with placeholder", async () => {
    // Given a DateField without existing value and placeholder text
    const r = await render(
      <DateFieldBase mode="single" value={undefined} label="Date" onChange={noop} placeholder="Select a date" />,
    );
    // Then value should not be set and placeholder should be set.
    expect(r.date).toHaveValue("").toHaveAttribute("placeholder", "Select a date");
  });

  it("renders with error message", async () => {
    // Given a DateField with error
    const r = await render(
      <DateFieldBase mode="single" value={jan2} label="Date" onChange={noop} errorMsg="Error message" />,
    );
    // Then the error text should exist and match
    expect(r.date_errorMsg.textContent).toBe("Error message");
  });

  it("renders with helper text", async () => {
    // Given a DateField with helper text
    const r = await render(
      <DateFieldBase mode="single" value={jan2} label="Date" onChange={noop} helperText="Helper text" />,
    );
    // Then the helper text should exist and match
    expect(r.date_helperText.textContent).toBe("Helper text");
  });

  it("renders correctly without calendar icon button", async () => {
    // Given a DateField without a calendar icon
    const r = await render(
      <DateFieldBase
        mode="single"
        value={undefined}
        label="Date"
        onChange={noop}
        placeholder="Select a date"
        hideCalendarIcon
      />,
    );
    // Then the calendar icon isn't rendered
    expect(r.queryByTestId("date_calendarButton")).toBeNull();
    // And the placeholder is still there
    expect(r.date).toHaveValue("").toHaveAttribute("placeholder", "Select a date");
  });

  it("clicking calendar button triggers date picker", async () => {
    const onBlur = jest.fn();
    const r = await render(<DateFieldBase mode="single" value={jan2} label="Date" onChange={noop} onBlur={onBlur} />);
    // Given focus set on the input element.
    focus(r.date);
    // When setting focus to the Calendar Icon button
    click(r.date_calendarButton);
    // Then the date picker should be open
    expect(r.date_datePicker).toBeTruthy();
  });

  it("does not call onBlur when changing focus to the calendar overlay", async () => {
    const onBlur = jest.fn();
    const r = await render(<DateFieldBase mode="single" value={jan2} label="Date" onChange={noop} onBlur={onBlur} />);
    // When clicking input element to trigger the date picker
    click(r.date);
    // When "blur"ing the field with the overlay as the related target
    fireEvent.blur(r.date, { relatedTarget: r.date_datePicker });
    // Then `onBlur` should not have been called.
    expect(onBlur).not.toBeCalled();
  });

  it("calls onBlur once the calendar overlay closes and focus is not returned to the input field", async () => {
    const onBlur = jest.fn();
    const r = await render(<DateFieldBase mode="single" value={jan2} label="Date" onChange={noop} onBlur={onBlur} />);
    // When clicking input element to trigger the date picker
    click(r.date);
    // Then the overlay should be opened
    expect(r.date_datePicker).toBeTruthy();
    // expect(r.date).not.toHaveFocus();
    // Then `onBlur` is not called because the overlay is now open
    expect(onBlur).not.toBeCalled();
    // And modify the date field to close the overlay - This should trigger an `onBlur` event due to the overlay closing and the field no longer having focus.
    fireEvent.input(r.date, { target: { value: "01/29/20" } });
    // Then the overlay should close
    expect(r.queryByTestId("date_datePicker")).toBeFalsy();

    // Given focus set on the input element.
    focus(r.date);
    // And opening up the Date Picker
    click(r.date_calendarButton);
    // When "blur"ing the field with the overlay as the related target
    fireEvent.blur(r.date, { relatedTarget: r.date_datePicker });
    // And closing the overlay with focus not on the input
    fireEvent.keyDown(r.date_datePicker, { key: "Escape", code: "Escape" });
    // Then the overlay should close
    expect(r.queryByTestId("date_datePicker")).toBeFalsy();
    // When blur-ing the field with the overlay closed
    blur(r.date);
    // Then `onBlur` should have been called
    expect(onBlur).toBeCalledTimes(1);
  });

  it("can fire onFocus and onBlur when interacting with the input field only", async () => {
    // Given a DateField with `onFocus` and `onBlur`
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    const r = await render(
      <DateFieldBase mode="single" value={jan2} label="Date" onChange={noop} onFocus={onFocus} onBlur={onBlur} />,
    );
    // When setting focus on the input element
    focus(r.date);
    // And clicking the input element to trigger the date picker
    click(r.date);
    // Then focus should be called.
    expect(onFocus).toBeCalledTimes(1);
    // When closing the overlay
    fireEvent.keyDown(r.date_datePicker, { key: "Escape", code: "Escape" });
    // And firing the blur event with the overlay closed
    blur(r.date);
    // Then onBlur should be called
    expect(onBlur).toBeCalledTimes(1);
  });

  it("fires onEnter and blurs field when pressing Enter key", async () => {
    // Given a DateField with `jan2` as our date
    const onEnter = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
      <DateFieldBase mode="single" value={jan2} label="Date" onChange={noop} onEnter={onEnter} onBlur={onBlur} />,
    );
    // When clicking input element to trigger the date picker - and awaiting the focus to change
    await clickAndWait(r.date);
    // Then the overlay should be opened
    expect(r.chevronLeft).toHaveFocus();
    // When closing the overlay
    fireEvent.keyDown(r.date_datePicker, { key: "Escape", code: "Escape" });
    expect(r.queryByTestId("date_datePicker")).toBeFalsy();
    // And putting focus back on the input
    focus(r.date);
    // And when hitting the Enter key
    fireEvent.keyDown(r.date, { key: "Enter" });
    // And the onEnter and onBlur callbacks should be triggered
    expect(onEnter).toBeCalledTimes(1);
    expect(onBlur).toBeCalledTimes(1);
    expect(r.date).not.toHaveFocus();
  });

  it("updates the field if the date changes from outside the component", async () => {
    // Given a component rendering the DateField with the ability to update the state.
    function TestComponent() {
      const [date, setDate] = useState<Date | undefined>(jan2);
      return (
        <>
          <DateFieldBase mode="single" value={date} label="Date" onChange={setDate} />
          <button onClick={() => setDate(jan10)} data-testid="button" />
        </>
      );
    }
    const r = await render(<TestComponent />);
    // When changing the date from outside the component
    click(r.button);
    // Then the component should have updated with the new date
    expect(r.date).toHaveValue("01/10/20");
  });

  it("does not update the field if the focus is currently on the input", async () => {
    // Given a component rendering the DateField with the ability to update the state.
    function TestComponent() {
      const [date, setDate] = useState<Date | undefined>(jan2);
      return (
        <>
          <DateFieldBase mode="single" value={date} label="Date" onChange={setDate} />
          <button onClick={() => setDate(jan10)} data-testid="button" />
        </>
      );
    }
    const r = await render(<TestComponent />);
    // When focusing on the input
    focus(r.date);
    // And changing the date from outside the component
    click(r.button);
    // Then the component should NOT have updated with the new date
    expect(r.date).toHaveValue("01/02/20");
  });

  it("does not update the field if the date picker is open", async () => {
    // Given a component rendering the DateField with the ability to update the state.
    function TestComponent() {
      const [date, setDate] = useState<Date | undefined>(jan2);
      return (
        <>
          <DateFieldBase mode="single" value={date} label="Date" onChange={setDate} />
          <button onClick={() => setDate(jan10)} data-testid="button" />
        </>
      );
    }
    const r = await render(<TestComponent />);
    // When clicking input element to trigger the date picker
    click(r.date);
    // And blurring with the date picker as the related target. Demonstrates that the input is not in focus, but the date picker is open
    fireEvent.blur(r.date, { relatedTarget: r.date_datePicker });
    // When changing the date from outside the component
    click(r.button);
    // Then the component should NOT have updated with the new date as the date picker was open
    expect(r.date).toHaveValue("01/02/20");
  });
});
