import { useNumberField } from "@react-aria/numberfield";
import { NumberFieldStateProps, useNumberFieldState } from "@react-stately/numberfield";
import { ReactNode, useMemo, useRef } from "react";
import { useLocale } from "react-aria";
import { Css, Xss } from "src/Css";
import { TextFieldBase } from "./TextFieldBase";

// exported for testing purposes
export interface NumberFieldProps {
  label?: string;
  type?: "cents" | "percent" | "basisPoints";
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  compact?: boolean;
  disabled?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  readOnly?: boolean;
  /** Styles overrides */
  xss?: Xss<"textAlign">;
}

export function NumberField(props: NumberFieldProps) {
  const {
    disabled: isDisabled = false,
    readOnly: isReadOnly = false,
    type,
    label,
    onBlur,
    onFocus,
    errorMsg,
    helperText,
    compact = false,
    value,
    onChange,
    xss,
    ...otherProps
  } = props;

  const factor = type === "percent" || type === "cents" ? 100 : type === "basisPoints" ? 10_000 : 1;

  // If formatOptions isn't memo'd, a useEffect in useNumberStateField will cause jank,
  // see: https://github.com/adobe/react-spectrum/issues/1893.
  const formatOptions: Intl.NumberFormatOptions | undefined = useMemo(() => {
    return type === "percent"
      ? { style: "percent" }
      : type === "basisPoints"
      ? { style: "percent", minimumFractionDigits: 2 }
      : type === "cents"
      ? { style: "currency", currency: "USD", minimumFractionDigits: 2 }
      : undefined;
  }, [type]);

  // Keep a ref the last "before WIP" value that we passed into react-aria.
  //
  // This is b/c NumberFieldStateProps.onChange only actually calls during
  // `onBlur`, with the committed value. But we want our FieldStates to have
  // the latest WIP value, i.e. so that validation rules can be reacting
  // real time.
  //
  // However, if we treat useNumberField as "too controlled" and keep passing
  // in the latest WIP value, they'll see it as a state change and reset the
  // user's cursor.
  //
  // So just keep them out of the loop on `value` changes while that is happening.
  type ValueRef = { wip: true; value: number | undefined } | { wip: false };
  const valueRef = useRef<ValueRef>({ wip: false });

  const { locale } = useLocale();
  // We can use this for both useNumberFieldState + useNumberField
  const useProps: NumberFieldStateProps = {
    locale,
    // We want percents && cents to be integers, useNumberFieldState excepts them as decimals
    value: valueRef.current.wip ? valueRef.current.value : value === undefined ? Number.NaN : value / factor,
    // This is called on blur with the final/committed value.
    onChange: (value) => {
      // `value` for percentage style inputs will be in a number format, i.e. if input value is 4%, the `value` param will equal `.04`
      // Reverse the integer/decimal conversion
      onChange(Number.isNaN(value) ? undefined : factor !== 1 ? Math.round(value * factor) : value);
    },
    onFocus: () => {
      valueRef.current = { wip: true, value: value === undefined ? Number.NaN : value / factor };
    },
    onBlur: () => {
      valueRef.current = { wip: false };
    },
    validationState: errorMsg !== undefined ? "invalid" : "valid",
    label: label ?? "number",
    isDisabled,
    isReadOnly,
    formatOptions,
  };

  const state = useNumberFieldState(useProps);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps, groupProps } = useNumberField(useProps, state, inputRef);

  return (
    <TextFieldBase
      xss={{ ...Css.tr.$, ...xss }}
      groupProps={groupProps}
      labelProps={labelProps}
      label={label}
      inputProps={inputProps}
      // This is called on each DOM change, to push the latest value into the field
      onChange={(rawInputValue) => {
        // If the wip value is invalid, i.e. it's `10b`, don't push that back into the field state
        const wip = Number((rawInputValue || "").replace(/[^0-9\.]/g, ""));
        if (!Number.isNaN(wip)) {
          // For percentage values we need to initially divide by 100 in order to get their "number value" ("4%" = .04) for the factor multiplier to be accurate.
          // For example, if the using basisPoints and the user enters "4.31%", then we would expect the response to be 431 basisPoints. If only basing off the `factor` value, then 4.31 * 10000 = 43100, which would not be correct.
          const value = type === "percent" || type === "basisPoints" ? wip / 100 : wip;
          // Since the values returned is exactly what is in the field
          onChange(factor !== 1 ? Math.round(value * factor) : value);
        }
      }}
      inputRef={inputRef}
      onBlur={onBlur}
      onFocus={onFocus}
      errorMsg={errorMsg}
      helperText={helperText}
      compact={compact}
      {...otherProps}
    />
  );
}
