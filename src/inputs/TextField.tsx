import { useRef } from "react";
import { mergeProps, useTextField } from "react-aria";
import { Only } from "src/Css";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";

// exported for testing purposes
export interface TextFieldProps<X> extends BeamTextFieldProps<X> {
  compact?: boolean;
  inlineLabel?: boolean;
  clearable?: boolean;
}

export function TextField<X extends Only<TextFieldXss, X>>(props: TextFieldProps<X>) {
  const {
    disabled: isDisabled = false,
    readOnly = false,
    required,
    errorMsg,
    value = "",
    onBlur,
    onFocus,
    ...otherProps
  } = props;
  const textFieldProps = {
    ...otherProps,
    isDisabled,
    isReadOnly: readOnly,
    isRequired: required,
    validationState: errorMsg ? ("invalid" as const) : ("valid" as const),
    value,
  };
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField(textFieldProps, inputRef);
  return (
    <TextFieldBase
      {...mergeProps(textFieldProps, { onBlur, onFocus })}
      readOnly={readOnly}
      errorMsg={errorMsg}
      required={required}
      labelProps={labelProps}
      inputProps={inputProps}
      inputRef={inputRef}
    />
  );
}
