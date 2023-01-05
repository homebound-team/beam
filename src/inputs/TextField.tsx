import { MutableRefObject, ReactNode, useRef } from "react";
import { mergeProps, useTextField } from "react-aria";
import { resolveTooltip } from "src/components";
import { Only } from "src/Css";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";
import { maybeCall } from "src/utils";

// exported for testing purposes
export interface TextFieldProps<X> extends BeamTextFieldProps<X> {
  compact?: boolean;
  clearable?: boolean;
  api?: MutableRefObject<TextFieldApi | undefined>;
  onEnter?: VoidFunction;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
  hideErrorMessage?: boolean;
}

export function TextField<X extends Only<TextFieldXss, X>>(props: TextFieldProps<X>) {
  const {
    disabled = false,
    readOnly = false,
    required,
    errorMsg,
    value = "",
    onBlur,
    onFocus,
    api,
    onEnter,
    hideErrorMessage,
    ...otherProps
  } = props;

  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;
  const textFieldProps = {
    ...otherProps,
    isDisabled,
    isReadOnly,
    isRequired: required,
    validationState: errorMsg ? ("invalid" as const) : ("valid" as const),
    value,
  };
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField(
    {
      ...textFieldProps,
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          maybeCall(onEnter);
          inputRef.current?.blur();
        }
      },
    },
    inputRef,
  );

  // Construct our TextFieldApi to give access to some imperative methods
  if (api) {
    api.current = {
      focus: () => inputRef.current && inputRef.current.focus(),
    };
  }

  return (
    <TextFieldBase
      {...mergeProps(textFieldProps, { onBlur, onFocus })}
      errorMsg={errorMsg}
      required={required}
      labelProps={labelProps}
      inputProps={inputProps}
      inputRef={inputRef}
      tooltip={resolveTooltip(disabled, undefined, readOnly)}
      hideErrorMessage={hideErrorMessage}
    />
  );
}

export type TextFieldApi = {
  focus: VoidFunction;
};
