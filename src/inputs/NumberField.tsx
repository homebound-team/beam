import { useNumberField } from "@react-aria/numberfield";
import { NumberFieldStateProps, useNumberFieldState } from "@react-stately/numberfield";
import { ReactNode, useMemo, useRef } from "react";
import { useLocale } from "react-aria";
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

  const { locale } = useLocale();
  // We can use this for both useNumberFieldState + useNumberField
  const useProps: NumberFieldStateProps = {
    locale,
    // We want percents && cents to be integers, useNumberFieldState excepts them as decimals
    value: value === undefined ? Number.NaN : value / factor,
    // Reverse the integer/decimal conversion
    onChange: (value) => {
      onChange(Number.isNaN(value) ? undefined : factor !== 1 ? Math.round(value * factor) : value);
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
      groupProps={groupProps}
      labelProps={labelProps}
      label={label}
      inputProps={inputProps}
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
