import { MutableRefObject, useRef } from "react";
import { mergeProps, useTextField } from "react-aria";
import { Only } from "src/Css";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";
import { Callback } from "src/types";

// exported for testing purposes
export interface TextFieldProps<X> extends BeamTextFieldProps<X> {
  compact?: boolean;
  inlineLabel?: boolean;
  clearable?: boolean;
  textFieldApi?: MutableRefObject<TextFieldApi | undefined>;
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
    textFieldApi,
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

  // Construct our TextFieldApi to give access to some imperative methods
  if (textFieldApi) {
    textFieldApi.current = {
      focus: () => inputRef.current && inputRef.current.focus(),
    };
  }

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

export type TextFieldApi = {
  focus: Callback;
};
