import { AriaTextFieldOptions, useTextField } from "@react-aria/textfield";
import React, { useRef } from "react";
import { TextFieldBase } from "src/components/TextFieldBase";

interface TextFieldProps
  extends Pick<
    AriaTextFieldOptions,
    "label" | "onChange" | "value" | "defaultValue" | "autoFocus" | "isDisabled" | "isReadOnly"
  > {
  isSmall?: boolean;
  errorMsg?: string;
}

export function TextField(props: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField(props, inputRef);
  return <TextFieldBase {...props} labelProps={labelProps} inputProps={inputProps} inputRef={inputRef} />;
}
