import { useTextField } from "@react-aria/textfield";
import { mergeProps } from "@react-aria/utils";
import { useRef } from "react";
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
    value = "",
    onBlur,
    onFocus,
    ...otherProps
  } = props;
  const textFieldProps = { ...otherProps, isDisabled, isReadOnly, value };
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField(textFieldProps, inputRef);
  return (
    <TextFieldBase
      {...mergeProps(textFieldProps, { onBlur, onFocus })}
      labelProps={labelProps}
      inputProps={inputProps}
      inputRef={inputRef}
    />
  );
}
