import { useRef } from "react";
import { mergeProps, useTextField } from "react-aria";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { BeamTextFieldProps } from "src/interfaces";

// exported for testing purposes
export interface TextFieldProps extends BeamTextFieldProps {
  compact?: boolean;
}

export function TextField(props: TextFieldProps) {
  const {
    disabled: isDisabled = false,
    readOnly: isReadOnly = false,
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
    isReadOnly,
    isRequired: required,
    validationState: errorMsg ? ("invalid" as const) : ("valid" as const),
    value,
  };
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField(textFieldProps, inputRef);
  return (
    <TextFieldBase
      {...mergeProps(textFieldProps, { onBlur, onFocus })}
      errorMsg={errorMsg}
      required={required}
      labelProps={labelProps}
      inputProps={inputProps}
      inputRef={inputRef}
    />
  );
}
