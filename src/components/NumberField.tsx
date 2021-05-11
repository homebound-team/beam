import { useNumberField } from "@react-aria/numberfield";
import { mergeProps } from "@react-aria/utils";
import { NumberFieldStateProps, useNumberFieldState } from "@react-stately/numberfield";
import React, { useMemo, useRef } from "react";
import { useLocale } from "react-aria";
import { ErrorMessage } from "src/components/ErrorMessage";
import { Label } from "src/components/Label";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

// exported for testing purposes
export interface NumberFieldProps {
  label?: string;
  type?: "cents" | "percent" | "basisPoints";
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
  disabled?: boolean;
  errorMsg?: string;
  onBlur?: () => void;
  readOnly?: boolean;
}

export function NumberField(props: NumberFieldProps) {
  const {
    disabled: isDisabled = false,
    readOnly: isReadOnly = false,
    type,
    label,
    onBlur,
    errorMsg,
    compact = false,
    value,
    onChange,
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
    value: value / factor,
    // Reverse the integer/decimal conversion
    onChange: (value) => onChange(factor !== 1 ? Math.round(value * factor) : value),
    validationState: errorMsg !== undefined ? "invalid" : "valid",
    label: label ?? "number",
    isDisabled,
    isReadOnly,
    formatOptions,
  };

  const state = useNumberFieldState(useProps);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps, groupProps } = useNumberField(useProps, state, inputRef);
  const errorMessageId = `${inputProps.id}-error`;
  const tid = useTestIds(props, label);

  const width = compact ? 248 : 320;

  return (
    <div css={Css.df.flexColumn.wPx(width).$} {...groupProps}>
      {label && <Label labelProps={labelProps} label={label} />}
      <input
        {...mergeProps(inputProps, { onBlur })}
        {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
        ref={inputRef}
        css={{
          ...Css.add("resize", "none")
            .tr.bgWhite.wPx(width)
            .sm.px1.hPx(40)
            .gray900.br4.outline0.ba.bGray300.if(compact)
            .hPx(32).$,
          "&:focus": Css.bLightBlue700.$,
          "&:disabled": Css.gray400.bgGray100.cursorNotAllowed.$,
          ...(errorMsg ? Css.bRed600.$ : {}),
        }}
        {...tid}
      />
      <ErrorMessage id={errorMessageId} errorMsg={errorMsg} {...tid.errorMsg} />
    </div>
  );
}
