import { useRef } from "react";
import { mergeProps, useTextField } from "react-aria";
import { resolveTooltip } from "src/components";
import { Only } from "src/Css";
import { useGrowingTextField } from "src/inputs/hooks/useGrowingTextField";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";
import { maybeCall } from "src/utils";

// Exported for test purposes
export interface TextAreaFieldProps<X> extends BeamTextFieldProps<X> {
  // Does not allow the user to enter new line characters and removes minimum height for textarea.
  preventNewLines?: boolean;
  // `onEnter` is only triggered when `preventNewLines` is set to `true`
  onEnter?: VoidFunction;
}

/** Returns a <textarea /> element that auto-adjusts height based on the field's value */
export function TextAreaField<X extends Only<TextFieldXss, X>>(props: TextAreaFieldProps<X>) {
  const {
    value = "",
    disabled = false,
    readOnly = false,
    onBlur,
    onFocus,
    preventNewLines,
    onEnter,
    ...otherProps
  } = props;
  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;
  const textFieldProps = { ...otherProps, value, isDisabled, isReadOnly };
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);

  useGrowingTextField({ inputRef, inputWrapRef, value });

  const { labelProps, inputProps } = useTextField(
    {
      ...textFieldProps,
      inputElementType: "textarea",
      ...(preventNewLines
        ? {
            onKeyDown: (e) => {
              // Prevent user from typing the new line character
              if (e.key === "Enter") {
                e.preventDefault();
                maybeCall(onEnter);
                inputRef.current?.blur();
              }
            },
            onInput: (e) => {
              // Prevent user from pasting content that has new line characters and replace with empty space.
              const target = e.target as HTMLTextAreaElement;
              target.value = target.value.replace(/[\n\r]/g, " ");
            },
          }
        : {}),
    },
    inputRef,
  );

  return (
    <TextFieldBase
      {...mergeProps(otherProps, { onBlur, onFocus })}
      multiline
      labelProps={labelProps}
      inputProps={inputProps}
      inputRef={inputRef}
      inputWrapRef={inputWrapRef}
      textAreaMinHeight={preventNewLines ? 0 : undefined}
      tooltip={resolveTooltip(disabled, undefined, readOnly)}
    />
  );
}
