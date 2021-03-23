import { useTextField } from "@react-aria/textfield";
import React, { useRef } from "react";
import { TextFieldBase } from "src/components/TextFieldBase";
import { BeamTextFieldProps } from "src/interfaces";

interface TextFieldProps extends BeamTextFieldProps {
  isSmall?: boolean;
}

export function TextField(props: TextFieldProps) {
  const { disabled: isDisabled = false, readOnly: isReadOnly = false, ...otherProps } = props;
  const textFieldProps = { ...otherProps, isDisabled, isReadOnly };
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField(textFieldProps, inputRef);
  return <TextFieldBase {...textFieldProps} labelProps={labelProps} inputProps={inputProps} inputRef={inputRef} />;
}
