import { blur, change, render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { formatValue, NumberField, NumberFieldProps } from "src/inputs/NumberField";
import { focus } from "src/utils/rtl";
import { vi } from "vitest";

let lastSet: any = undefined;

describe("NumberFieldTest", () => {
  it("can set a value", async () => {
    const r = await render(<TestNumberField label="Age" value={1} />);
    expect(r.age).toHaveValue("1");
    type(r.age, "2");
    expect(r.age).toHaveValue("2");
  });

  it("can set a negative value", async () => {
    const r = await render(<TestNumberField label="Age" value={1} />);
    expect(r.age).toHaveValue("1");
    type(r.age, "-2");
    expect(r.age).toHaveValue("-2");
  });

  it("can not set a negative value if positiveOnly is set", async () => {
    const r = await render(<TestNumberField label="Age" value={1} positiveOnly />);
    expect(r.age).toHaveValue("1");
    type(r.age, "-2");
    expect(r.age).toHaveValue("2");
  });

  it("can set a percentage value", async () => {
    const r = await render(<TestNumberField label="Complete" type="percent" value={12} />);
    expect(r.complete).toHaveValue("12%");
    type(r.complete, "14");
    expect(r.complete).toHaveValue("14%");
    expect(lastSet).toEqual(14);
  });

  it("calls onChange with expected value for percentage", async () => {
    const onChange = vi.fn();
    const r = await render(<NumberField label="Complete" type="percent" value={12} onChange={onChange} />);
    change(r.complete, "15");
    expect(onChange).toBeCalledWith(15);
    expect(onChange).toBeCalledTimes(2); // change and blur
  });

  it("can set a basis points value", async () => {
    const r = await render(<TestNumberField label="Margin" type="basisPoints" value={1234} />);
    expect(r.margin).toHaveValue("12.34%");
    type(r.margin, "23.45");
    expect(r.margin).toHaveValue("23.45%");
    expect(lastSet).toEqual(2345);
  });

  it("calls onChange with expected value for basisPoints", async () => {
    const onChange = vi.fn();
    const r = await render(<NumberField label="Margin" type="basisPoints" value={1234} onChange={onChange} />);
    change(r.margin, "23.45");
    expect(onChange).toBeCalledWith(2345);
    expect(onChange).toBeCalledTimes(2); // change and blur
  });

  it("can set mills as dollars", async () => {
    const r = await render(<TestNumberField label="Cost" type="mills" value={1200} />);
    expect(r.cost).toHaveValue("$1.200");
    type(r.cost, "14");
    expect(r.cost).toHaveValue("$14.000");
    expect(lastSet).toEqual(14000);
  });

  it("can set cents as dollars", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost).toHaveValue("$12.00");
    type(r.cost, "14");
    expect(r.cost).toHaveValue("$14.00");
    expect(lastSet).toEqual(1400);
  });

  it("can set dollars and cents as dollars", async () => {
    const r = await render(<TestNumberField label="Cost" type="dollars" value={1200} />);
    expect(r.cost).toHaveValue("$1,200.00");
    type(r.cost, "14.25");
    expect(r.cost).toHaveValue("$14.25");
    expect(lastSet).toEqual(14.25);
  });

  it("can set dollars as dollars only", async () => {
    const r = await render(<TestNumberField label="Cost" type="dollars" value={1200} numFractionDigits={0} />);
    expect(r.cost).toHaveValue("$1,200");
    type(r.cost, "14.25");
    expect(r.cost).toHaveValue("$14");
    expect(lastSet).toEqual(14);
  });

  it("calls onChange with expected value for cents", async () => {
    const onChange = vi.fn();
    const r = await render(<NumberField label="Cost" type="cents" value={1234} onChange={onChange} />);
    change(r.cost, "23.45");
    expect(onChange).toBeCalledWith(2345);
    expect(onChange).toBeCalledTimes(2); // change and blur
  });

  it("can set mills as mills", async () => {
    const r = await render(<TestNumberField label="Cost" type="mills" value={12000} />);
    expect(r.cost).toHaveValue("$12.000");
    type(r.cost, ".145");
    expect(r.cost).toHaveValue("$0.145");
    expect(lastSet).toEqual(145);
  });

  it("can set cents as cents", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost).toHaveValue("$12.00");
    type(r.cost, ".14");
    expect(r.cost).toHaveValue("$0.14");
    expect(lastSet).toEqual(14);
  });

  it("can set to undefined", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost).toHaveValue("$12.00");
    type(r.cost, "");
    expect(r.cost).toHaveValue("");
    expect(lastSet).toBeUndefined();
  });

  it("retains correct value on focus", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost).toHaveValue("$12.00");
    fireEvent.focus(r.cost);
    expect(r.cost).toHaveValue("$12.00");
  });

  it("updates displayed value when the value prop changes externally while focused", async () => {
    // Given two dependent fields where Total = Cost + Markup
    const onTotalChange = vi.fn<(v: number | undefined) => void>();

    function DependentFields() {
      const [cost, setCost] = useState<number | undefined>(100);
      const markup = 20;
      const total = cost !== undefined ? cost + markup : undefined;
      return (
        <>
          <NumberField label="Cost" type="cents" value={cost} onChange={setCost} />
          <NumberField label="Total" type="cents" value={total} onChange={onTotalChange} />
        </>
      );
    }
    const r = await render(<DependentFields />);
    expect(r.total).toHaveValue("$1.20");
    // When cost changes, total updates
    change(r.cost, "2");
    expect(r.total).toHaveValue("$2.20");
    // When Total is focused and cost changes externally, Total should
    // reflect the new derived value instead of showing the stale value
    // that was captured by valueRef on focus.
    focus(r.total);
    change(r.cost, "5");
    expect(r.total).toHaveValue("$5.20");
  });

  it("can be read only", async () => {
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} readOnly={true} />);
    expect(r.cost).toHaveTextContent("$12.00");
    expect(r.cost).toHaveAttribute("data-readonly", "true");
  });

  it("displays and updates 'days' type", async () => {
    const r = await render(<TestNumberField label="Days" type="days" value={2} />);
    expect(r.days).toHaveValue("2 days");
    type(r.days, "1");
    expect(r.days).toHaveValue("1 day");
  });

  it("does not allow for decimal values in days type", async () => {
    const r = await render(<TestNumberField label="Days" type="days" value={2} />);
    expect(r.days).toHaveValue("2 days");
    type(r.days, "1.23");
    expect(r.days).toHaveValue("1 day");
  });

  it("allows override of numberFormatOptions", async () => {
    const r = await render(
      <TestNumberField
        label="Cost"
        value={1200}
        numFractionDigits={2}
        numberFormatOptions={{ style: "currency", currency: "USD" }}
      />,
    );
    expect(r.cost).toHaveValue("$1,200.00");
    type(r.cost, "14.14");
    expect(r.cost).toHaveValue("$14.14");
  });

  it("displays direction", async () => {
    const r = await render(
      <>
        <TestNumberField label="Days" type="days" value={123} displayDirection />
        <TestNumberField label="Mills" type="mills" value={456} displayDirection />
        <TestNumberField label="Cents" type="cents" value={456} displayDirection />
        <TestNumberField label="Basis Points" type="basisPoints" value={789} displayDirection />
        <TestNumberField label="Percent" type="percent" value={123} displayDirection />
        <TestNumberField label="Zero Percent" type="percent" value={0} displayDirection />
      </>,
    );
    expect(r.days).toHaveValue("+123 days");
    expect(r.mills).toHaveValue("+$0.456");
    expect(r.cents).toHaveValue("+$4.56");
    expect(r.basisPoints).toHaveValue("+7.89%");
    expect(r.percent).toHaveValue("+123%");
    expect(r.zeroPercent).toHaveValue("+0%");
  });

  it("fires onEnter and blurs field", async () => {
    const onBlur = vi.fn();
    const onEnter = vi.fn();
    // Given a numberfield
    const r = await render(<TestNumberField label="Age" value={10} onBlur={onBlur} onEnter={onEnter} />);
    // With focus
    focus(r.age);
    expect(r.age).toHaveFocus();
    // When hitting the Enter key
    fireEvent.keyDown(r.age, { key: "Enter" });
    // And onEnter and onBlur should be called
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(r.age).not.toHaveFocus();
  });

  it("respects numFractionDigits and truncate props", async () => {
    const r = await render(
      <TestNumberField label="Complete" type="percent" value={12.5} numFractionDigits={2} truncate />,
    );
    expect(r.complete).toHaveValue("12.5%");
    type(r.complete, "14.55");
    expect(r.complete).toHaveValue("14.55%");
    expect(lastSet).toEqual(14.55);

    // Can truncate decimals
    type(r.complete, "10.40");
    expect(r.complete).toHaveValue("10.4%");
    expect(lastSet).toEqual(10.4);

    type(r.complete, "12.00");
    expect(r.complete).toHaveValue("12%");
    expect(lastSet).toEqual(12);
  });

  it("respects numIntegerDigits", async () => {
    // Given a NumberField with a restriction of 3 digits, with a value of only two digits
    const r = await render(<TestNumberField label="Code" numIntegerDigits={3} value={12} />);
    // Then a leading zero is added to make it three digits
    expect(r.code).toHaveValue("012");
    // When changing the value to a single digit
    type(r.code, "1");
    // Then leading zeros are added to make it three digits
    expect(r.code).toHaveValue("001");
    // When changing to more than three digits
    type(r.code, "1234");
    // Then the value is formatted back to only three, stripping off the first digits
    expect(r.code).toHaveValue("234");
  });

  it("respects placeholder", async () => {
    const r = await render(
      <NumberField label="Code" value={undefined} placeholder="Test Placeholder" onChange={() => {}} />,
    );
    expect(r.code).toHaveAttribute("placeholder", "Test Placeholder");
  });

  it("does not revert display when user clears the field and blurs", async () => {
    // Given a NumberField with a value
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost).toHaveValue("$12.00");
    // When the user focuses (via element.focus so react-aria tracks it), clears, and blurs
    change(r.cost, "");
    // Then the field should stay cleared — react-aria's commit must not reformat with the stale value
    expect(r.cost).toHaveValue("");
    expect(lastSet).toBeUndefined();
  });

  it("does not revert display when re-editing a value and blurring", async () => {
    // Given a NumberField set to $50.00
    const r = await render(<TestNumberField label="Cost" type="cents" value={5000} />);
    expect(r.cost).toHaveValue("$50.00");
    // When the user focuses, changes to 75, and blurs
    change(r.cost, "75");
    // Then the field should show $75.00 — not revert to $50.00
    expect(r.cost).toHaveValue("$75.00");
    expect(lastSet).toEqual(7500);
  });

  it("does not discard pasted values", async () => {
    // Given a NumberField with a value
    const r = await render(<TestNumberField label="Cost" type="cents" value={1200} />);
    expect(r.cost).toHaveValue("$12.00");
    // When the user focuses, selects all, and pastes a new value
    const input = r.cost as HTMLInputElement;
    focus(input);
    input.setSelectionRange(0, input.value.length);
    fireEvent.paste(input, { clipboardData: { getData: () => "75" } });
    fireEvent.blur(input);
    // Then the pasted value should be retained
    expect(r.cost).toHaveValue("$75.00");
    expect(lastSet).toEqual(7500);
  });

  it("respects useGrouping as false", async () => {
    // Given a NumberField with `useGrouping` set to `false`
    const r = await render(<TestNumberField label="Code" useGrouping={false} value={123456} />);
    // Then the number should not have comma's.
    expect(r.code).toHaveValue("123456");
  });
});

// test against factors and num fraction digits.
describe("formatValue function", () => {
  it.each([
    // if value is NaN return undefined
    [Number("a"), 100, undefined, undefined, undefined],

    // value returns as expected based on factor
    [10, 100, undefined, undefined, 1_000],
    [10, 10_000, undefined, undefined, 100_000],
    [10, 1, undefined, undefined, 10],

    // it can round and format with fractional values
    [0.10456, 100, 2, undefined, 10.46],
    [0.10456, 100, 1, undefined, 10.5],
    [1.10456, 10_000, 2, undefined, 11045.6],
    [-10.456, 1, 3, undefined, -10.456],

    // It can limit the number of integer digits
    [0.10456, 100, 2, 2, 10.46],
    [0.10456, 10_000, undefined, 3, 46],
    [1234, 1, undefined, 2, 34],
    [-1234, 1, undefined, 2, -34],
    [1234.56, 1, 2, 2, 34.56],
  ])(
    "with a value of %s, a factor of %s, numFractionDigits of %s, and numIntegerDigits of %s, it should return %s",
    (value, factor, numFractionDigits, numIntegerDigits, expected) => {
      expect(formatValue(value, factor, numFractionDigits, numIntegerDigits)).toBe(expected);
    },
  );
});

describe("AI mode", () => {
  it("formats both values the way the field formats a typed value", async () => {
    const r = await render(<TestNumberField label="Age" value={20} proposedValue={25} />);
    expect(r.age_proposedValue).toHaveTextContent("20 25");
    expect(r.age_proposedValue_original).toHaveTextContent("20");
    expect(r.age).toHaveValue("25");
  });

  it.each([
    ["cents" as const, 1000, 2050, "$10.00 $20.50", "$20.50"],
    ["dollars" as const, 1000.5, 2050.25, "$1,000.50 $2,050.25", "$2,050.25"],
    ["percent" as const, 20, 25, "20% 25%", "25%"],
  ])("applies the field's %s formatting", async (type, value, proposed, overlay, input) => {
    const r = await render(<TestNumberField label="Price" type={type} value={value} proposedValue={proposed} />);
    expect(r.price_proposedValue).toHaveTextContent(overlay);
    expect(r.price).toHaveValue(input);
  });

  it("keeps a zero original visible", async () => {
    // `0` is falsy, so this guards the original from being dropped as if it were absent
    const r = await render(<TestNumberField label="Age" value={0} proposedValue={5} />);
    expect(r.age_proposedValue_original).toHaveTextContent("0");
    expect(r.age_proposedValue).toHaveTextContent("0 5");
  });

  it("does not commit when the user tabs through without editing", async () => {
    // Reviewing a form by tabbing through it shouldn't silently accept proposals
    const r = await render(<TestNumberField label="Age" value={20} proposedValue={25} />);
    lastSet = undefined;
    focus(r.age);
    expect(r.age).toHaveValue("25");
    blur(r.age);
    expect(lastSet).toBeUndefined();
    expect(r.age_proposedValue).toHaveTextContent("20 25");
  });

  it("ends AI mode when the user rejects by re-entering the on-record value", async () => {
    // 20 on record, 25 proposed, user types 20 back. `value` never changes, so this can only work
    // off the edit event — the regression that made the field impossible to reject into.
    const r = await render(<TestNumberField label="Age" value={20} proposedValue={25} />);
    expect(r.age).toHaveValue("25");
    type(r.age, "20");
    expect(r.age).toHaveValue("20");
    expect(r.query.age_proposedValue).not.toBeInTheDocument();
    blur(r.age);
    expect(r.age).toHaveValue("20");
  });

  it("stays out of AI mode if the user later re-enters the proposal", async () => {
    const r = await render(<TestNumberField label="Age" value={20} proposedValue={25} />);
    type(r.age, "20");
    type(r.age, "25");
    expect(r.age).toHaveValue("25");
    expect(r.query.age_proposedValue).not.toBeInTheDocument();
  });

  it("shows the proposal when readOnly", async () => {
    const r = await render(<TestNumberField label="Age" value={20} proposedValue={25} readOnly />);
    expect(r.age_proposedValue).toHaveTextContent("20 25");
  });

  it("omits the original when the field was empty", async () => {
    const r = await render(<TestNumberField label="Age" value={undefined} proposedValue={25} />);
    expect(r.age_proposedValue).toHaveTextContent("25");
    expect(r.query.age_proposedValue_original).not.toBeInTheDocument();
  });

  it("commits on edit and drops the AI treatment", async () => {
    const r = await render(<TestNumberField label="Age" value={20} proposedValue={25} />);
    type(r.age, "30");
    expect(lastSet).toBe(30);
    expect(r.query.age_proposedValue).not.toBeInTheDocument();
    expect(r.age).toHaveValue("30");
  });
});

function TestNumberField(props: Omit<NumberFieldProps, "onChange">) {
  const { value, label, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <NumberField
      label={label}
      value={internalValue}
      onChange={(v) => {
        lastSet = v;
        setValue(v);
      }}
      {...otherProps}
    />
  );
}
