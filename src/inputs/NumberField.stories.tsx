import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";
import { Css } from "src/Css";
import { TextField } from "src/inputs";
import { NumberField, NumberFieldProps } from "src/inputs/NumberField";

export default {
  component: NumberField,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=1291%3A0",
    },
  },
} as Meta;

export function NumberFieldStyles() {
  return (
    <div css={Css.df.fdc.gap5.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <TestNumberField value={0} label="Age" labelStyle="hidden" />
        <TestNumberField label="Age" value={1000} />
        <TestNumberField label="Age Positive Only" value={1000} positiveOnly />
        <TestNumberField label="Age Disabled" value={1000} disabled="Disabled reason tooltip" />
        <TestNumberField label="Age Read Only" value={1000} readOnly="Read only reason tooltip" />
        <TestNumberField
          label="Age Read Helper Text"
          value={1000}
          helperText="Some really long helper text that we expect to wrap."
        />
        <ValidationNumberField label="Age Validated" value={-1} />
        <ValidationNumberField label="Omit Error Message" value={-1} hideErrorMessage />
      </div>

      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Compact</h1>
        <TestNumberField compact value={0} label="Age" labelStyle="hidden" />
        <TestNumberField compact label="Age" value={1000} />
        <TestNumberField compact label="Age Disabled" value={1000} disabled />
        <ValidationNumberField label="Age Validated" compact value={-1} />
      </div>

      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Unit Types</h1>
        <TestNumberField label="Percent" type="percent" value={12.55} numFractionDigits={2} truncate />
        <TestNumberField label="Mills" type="mills" value={1000} />
        <TestNumberField label="Cents" type="cents" value={1000} />
        <TestNumberField label="Dollars" type="dollars" value={1000} />
        <TestNumberField label="Margin" type="basisPoints" value={1275} />
        <TestNumberField label="Days" type="days" value={1} />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Custom Format Options</h1>
        <TestNumberField label="kph" value={50} numberFormatOptions={{ style: "unit", unit: "kilometer-per-hour" }} />
        <TestNumberField label="Euro" value={500} numberFormatOptions={{ style: "currency", currency: "EUR" }} />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Force 3 Integers</h1>
        <TestNumberField value={undefined} numIntegerDigits={3} label="Code" labelStyle="hidden" placeholder="Code.." />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Without grouping</h1>
        <TestNumberField value={123456789} label="No grouping" useGrouping={false} />
      </div>

      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Full Width</h1>
        <TestNumberField value={0} label="Age" fullWidth />
      </div>
    </div>
  );
}

export function NumberFieldReadOnly() {
  return (
    <div css={Css.df.gap2.$}>
      <div css={Css.df.fdc.gap3.$}>
        <b>Read Only</b>
        <TextField label="First Name" value="first" onChange={() => {}} readOnly={true} />
        <TestNumberField label="Name" value={100} readOnly={true} />
        <TestNumberField label="Name" value={100} labelStyle="hidden" readOnly={true} />
        <TestNumberField label="Name" value={100} readOnly={true} type="mills" />
        <TestNumberField label="Name" value={100} readOnly={true} type="cents" />
        <TestNumberField label="Name" value={100} readOnly={true} type="percent" />
      </div>
      {/* Matching column but w/o readOnly for comparison */}
      <div css={Css.df.fdc.gap3.$}>
        <b>Editable</b>
        <TextField label="First Name" value="first" onChange={() => {}} />
        <TestNumberField label="Name" value={100} />
        <TestNumberField label="Name" value={100} labelStyle="hidden" />
        <TestNumberField label="Name" value={100} type="cents" />
        <TestNumberField label="Name" value={100} type="percent" />
      </div>
    </div>
  );
}

/**
 * Reproduction story for stale value on Tab between dependent NumberFields.
 *
 * This uses a "BufferedNumberField" pattern (only commits onChange on blur) which
 * is common for table cells where you don't want to save intermediate values.
 *
 * Steps to reproduce:
 * 1. Click "Cost Change" and type a new value (e.g. clear and type 200, i.e. $2.00)
 * 2. Press Tab to move to "Proposed Total"
 * 3. BUG: "Proposed Total" shows the OLD value ($1.20 = old cost $1.00 + markup $0.20)
 *    instead of the expected new value ($2.20 = new cost $2.00 + markup $0.20)
 * 4. Click outside "Proposed Total", then click back in — now it shows $2.20 correctly
 *
 * Root cause: Beam's NumberField valueRef.wip mechanism captures the stale value prop
 * on focus because React 18 batches the state update from the previous field's blur.
 */
export function StaleValueOnTab() {
  // The parent holds the "committed" values (only updated on blur)
  const [costChange, setCostChange] = useState<number | undefined>(100); // $1.00
  const [markup, setMarkup] = useState<number | undefined>(20); // $0.20
  // Derived value: both fields can be edited, but Proposed Total depends on Cost Change
  const proposedTotal = costChange !== undefined && markup !== undefined ? costChange + markup : undefined;

  return (
    <div css={Css.df.fdc.gap3.$}>
      <h1 css={Css.lg.$}>Stale Value on Tab — BufferedNumberField Pattern</h1>
      <p css={Css.sm.gray700.$}>
        This uses the BufferedNumberField pattern (onChange only fires on blur, not during typing). Type a new value in
        "Cost Change", then press Tab. "Proposed Total" should update immediately but shows the stale value.
      </p>
      <div css={Css.df.gap2.$}>
        <BufferedNumberField
          label="Cost Change"
          type="cents"
          value={costChange}
          onChange={setCostChange}
          displayDirection
        />
        <BufferedNumberField label="Markup" type="cents" value={markup} onChange={setMarkup} displayDirection />
        <BufferedNumberField
          label="Proposed Total"
          type="cents"
          value={proposedTotal}
          onChange={() => {}}
          displayDirection
        />
      </div>
      <div css={Css.df.fdc.gap1.sm.$}>
        <span>
          Committed state — Cost: {costChange}¢ | Markup: {markup}¢ | Total: {proposedTotal}¢
        </span>
        <span css={Css.gray500.$}>
          (Watch the committed state update on blur, and notice "Proposed Total" field shows the wrong value when
          tabbing into it)
        </span>
      </div>
    </div>
  );
}

/**
 * BufferedNumberField — wraps NumberField to only commit onChange on blur.
 *
 * This is a common pattern for editable table cells where intermediate values
 * (e.g. "1" when the user means "10000") should not be saved. The local `wip`
 * state tracks what the user is typing, and the committed `onChange` only fires
 * when the field loses focus.
 */
function BufferedNumberField(props: NumberFieldProps) {
  const { value, onChange, onBlur, ...rest } = props;
  const [wip, setWip] = useState(props.value);
  useEffect(() => {
    setWip(props.value);
  }, [props.value]);

  return <NumberField {...rest} value={wip} onChange={setWip} onBlur={() => props.onChange(wip)} />;
}

function TestNumberField(props: Omit<NumberFieldProps, "onChange" | "onBlur" | "onFocus">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <NumberField
      value={internalValue}
      onChange={setValue}
      {...otherProps}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}

function ValidationNumberField({
  label,
  compact,
  value,
  hideErrorMessage,
}: {
  label: string;
  compact?: boolean;
  value: number;
  hideErrorMessage?: boolean;
}) {
  const [internalValue, setValue] = useState<number | undefined>(value);
  const isValid = useMemo(() => internalValue && internalValue > 0, [internalValue]);
  return (
    <NumberField
      label={label}
      compact={compact}
      value={internalValue}
      onChange={setValue}
      errorMsg={!isValid ? "Cannot be negative" : undefined}
      hideErrorMessage={hideErrorMessage}
    />
  );
}
