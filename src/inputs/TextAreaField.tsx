import { useLayoutEffect } from "@react-aria/utils";
import { useCallback, useRef } from "react";
import { mergeProps, useTextField } from "react-aria";
import { Only } from "src/Css";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";

// Exported for test purposes
export interface TextAreaFieldProps<X> extends BeamTextFieldProps<X> {
  // Does not allow the user to enter new line characters and removes minimum height for textarea.
  preventNewLines?: boolean;
}

/** Returns a <textarea /> element that auto-adjusts height based on the field's value */
export function TextAreaField<X extends Only<TextFieldXss, X>>(props: TextAreaFieldProps<X>) {
  const { value = "", disabled = false, readOnly = false, onBlur, onFocus, preventNewLines, ...otherProps } = props;
  const textFieldProps = { ...otherProps, value, isDisabled: disabled, isReadOnly: readOnly };
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);

  // not in stately because this is so we know when to re-measure, which is a spectrum design
  const onHeightChange = useCallback(() => {
    const input = inputRef.current;
    const inputWrap = inputWrapRef.current;
    if (input && inputWrap) {
      const prevAlignment = input.style.alignSelf;
      input.style.alignSelf = "start";
      input.style.height = "auto";
      // Adding 2px to height avoids showing the scrollbar. This is to compensate for the border due to `box-sizing: border-box;`
      inputWrap.style.height = `${input.scrollHeight + 2}px`;
      // Set the textarea's height back to 100% so it takes up the full `inputWrap`
      input.style.height = "100%";
      input.style.alignSelf = prevAlignment;
    }
  }, [inputRef]);

  useLayoutEffect(() => {
    if (inputRef.current) {
      onHeightChange();
    }
  }, [onHeightChange, value, inputRef]);

  const { labelProps, inputProps } = useTextField(
    {
      ...textFieldProps,
      inputElementType: "textarea",
      ...(preventNewLines
        ? {
            onKeyDown: (e) => {
              // Prevent user from typing the new line character
              if (e.keyCode === 13) {
                e.preventDefault();
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
      readOnly={readOnly}
      inputWrapRef={inputWrapRef}
      minHeight={preventNewLines ? 0 : undefined}
    />
  );
}
