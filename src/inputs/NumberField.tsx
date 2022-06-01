import { NumberParser } from "@internationalized/number";
import type { NumberFieldStateProps } from "@react-stately/numberfield";
import { ReactNode, useMemo, useRef } from "react";
import { useLocale, useNumberField } from "react-aria";
import { useNumberFieldState } from "react-stately";
import { resolveTooltip } from "src/components";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Xss } from "src/Css";
import { maybeCall } from "src/utils";
import { TextFieldBase } from "./TextFieldBase";

export type NumberFieldType = "cents" | "percent" | "basisPoints" | "days";

// exported for testing purposes
export interface NumberFieldProps {
  label: string;
  /** If set, the label will be defined as 'aria-label` on the input element */
  hideLabel?: boolean;
  type?: NumberFieldType;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  compact?: boolean;
  /** Whether the field is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  required?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  /* Whether the field is readOnly. If a ReactNode, it's treated as a "readOnly reason" that's shown in a tooltip. */
  readOnly?: boolean | ReactNode;
  /** Styles overrides */
  xss?: Xss<"textAlign" | "justifyContent">;
  // If set, all positive values will be prefixed with "+". (Zero will not show +/-)
  displayDirection?: boolean;
  numFractionDigits?: number;
  truncate?: boolean;
  onEnter?: VoidFunction;
}

export function NumberField(props: NumberFieldProps) {
  // Determine default alignment based on presentation context
  const { fieldProps } = usePresentationContext();
  const alignment = fieldProps?.numberAlignment === "right" ? Css.tr.jcfe.$ : Css.tl.jcfs.$;
  const {
    disabled,
    required,
    readOnly,
    type,
    label,
    onBlur,
    onFocus,
    errorMsg,
    helperText,
    value,
    onChange,
    xss,
    displayDirection = false,
    numFractionDigits,
    truncate = false,
    onEnter,
    ...otherProps
  } = props;

  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;
  const factor = type === "percent" || type === "cents" ? 100 : type === "basisPoints" ? 10_000 : 1;
  const signDisplay = displayDirection ? "exceptZero" : "auto";
  const fractionFormatOptions = { [truncate ? "maximumFractionDigits" : "minimumFractionDigits"]: numFractionDigits };
  const { locale } = useLocale();
  // If formatOptions isn't memo'd, a useEffect in useNumberStateField will cause jank,
  // see: https://github.com/adobe/react-spectrum/issues/1893.
  const formatOptions: Intl.NumberFormatOptions | undefined = useMemo(() => {
    return type === "percent"
      ? { style: "percent", signDisplay, ...fractionFormatOptions }
      : type === "basisPoints"
      ? { style: "percent", minimumFractionDigits: 2, signDisplay }
      : type === "cents"
      ? { style: "currency", currency: "USD", minimumFractionDigits: 2, signDisplay }
      : type === "days"
      ? { style: "unit", unit: "day", unitDisplay: "long", maximumFractionDigits: 0, signDisplay }
      : fractionFormatOptions;
  }, [type]);
  const numberParser = useMemo(() => new NumberParser(locale, formatOptions), [locale, formatOptions]);

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

  // We can use this for both useNumberFieldState + useNumberField
  const useProps: NumberFieldStateProps = {
    locale,
    // We want percents && cents to be integers, useNumberFieldState excepts them as decimals
    value: valueRef.current.wip ? valueRef.current.value : value === undefined ? Number.NaN : value / factor,
    // // This is called on blur with the final/committed value.
    onChange: (value) => {
      onChange(formatValue(value, factor, numFractionDigits));
    },
    onFocus: () => {
      valueRef.current = { wip: true, value: value === undefined ? Number.NaN : value / factor };
    },
    onBlur: () => {
      valueRef.current = { wip: false };
    },
    onKeyDown: (e) => {
      if (e.key === "Enter") {
        maybeCall(onEnter);
        inputRef.current?.blur();
      }
    },
    validationState: errorMsg !== undefined ? "invalid" : "valid",
    label: label,
    isDisabled,
    isReadOnly,
    formatOptions,
  };

  const state = useNumberFieldState(useProps);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps, groupProps } = useNumberField(useProps, state, inputRef);

  // Pretty janky, but if readOnly=true, then TextFieldBase doesn't create an input element,
  // but useNumberField _really_ wants the ref to be set, so give it a throw-away element.
  if (readOnly && !inputRef.current) {
    inputRef.current = document.createElement("input");
  }

  return (
    <TextFieldBase
      xss={{ ...alignment, ...xss }}
      groupProps={groupProps}
      labelProps={labelProps}
      label={label}
      required={required}
      inputProps={inputProps}
      // This is called on each DOM change, to push the latest value into the field
      onChange={(rawInputValue) => {
        const parsedValue = numberParser.parse(rawInputValue || "");
        onChange(formatValue(parsedValue, factor, numFractionDigits));
      }}
      inputRef={inputRef}
      onBlur={onBlur}
      onFocus={onFocus}
      errorMsg={errorMsg}
      helperText={helperText}
      tooltip={resolveTooltip(disabled, undefined, readOnly)}
      {...otherProps}
    />
  );
}

export function formatValue(value: number, factor: number, numFractionDigits: number | undefined): number | undefined {
  // We treat percents & cents as (mostly) integers, while useNumberField wants decimals, so
  // undo that via `* factor` and `Math.round`, but also keep any specifically-requested `numFractionDigits`,
  // i.e. for `type=percent value=12.34`, `value` will be `0.1234` that we want turn into `12.34`.
  const maybeAdjustForDecimals = numFractionDigits ? Math.pow(10, numFractionDigits) : 1;
  // Reverse the integer/decimal conversion
  return Number.isNaN(value) ? undefined : Math.round(value * factor * maybeAdjustForDecimals) / maybeAdjustForDecimals;
}
