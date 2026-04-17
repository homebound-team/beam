import { fireEvent } from "@testing-library/react";
import { DateFieldMock as MockDateField } from "src/inputs/DateFields/DateField.mock";
import { noop } from "src/utils";
import { render, type } from "src/utils/rtl";
import { feb11, jan1 } from "src/utils/testDates";
import { Temporal } from "temporal-polyfill";
import { vi } from "vitest";

describe("DateFieldMock", () => {
  it("formats date value when provided", async () => {
    const r = await render(<MockDateField label="Start Date" value={jan1} onChange={noop} />);
    expect(r.date).toHaveValue("01/01/20");
  });

  it("fires onChange with selected date", async () => {
    const onChange = vi.fn();
    const r = await render(<MockDateField label="Start Date" value={undefined} onChange={onChange} />);
    // When we change the date
    type(r.date, "02/11/20");
    // Then onChange was called with parsed date
    expect(onChange.mock.calls[0][0]).toEqual(feb11);
    expect(r.date).toHaveValue("02/11/20");
  });

  it("fires onFocus and onBlur", async () => {
    // Given a mock DateField with onBlur and onFocus callbacks
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const r = await render(
      <MockDateField label="Start Date" value={undefined} onChange={noop} onFocus={onFocus} onBlur={onBlur} />,
    );
    // When firing the events
    fireEvent.focus(r.date);
    fireEvent.blur(r.date);
    // Then the callbacks are invoked
    expect(onFocus).toBeCalledTimes(1);
    expect(onBlur).toBeCalledTimes(1);
  });

  it("forwards disabledDays prop as stringified object", async () => {
    const testDate = jan1;
    // Given an array of disabled days with a BeforeModifier and a FunctionModifier
    const disabledDays = [(date: typeof testDate) => Temporal.PlainDate.compare(date, testDate) < 0, () => false];
    // When we render the MockDateField
    const r = await render(
      <MockDateField label="Start Date" value={testDate} disabledDays={disabledDays} onChange={noop} />,
    );

    // Then we expect to get a stringified disabledDays in the `data-disabled-days` attribute
    const expectedResult = JSON.stringify(disabledDays);
    expect(r.date).toHaveAttribute("data-disabled-days", expectedResult);
  });
});
