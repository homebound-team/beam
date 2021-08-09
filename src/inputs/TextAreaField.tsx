import { useLayoutEffect } from "@react-aria/utils";
import { useCallback, useRef } from "react";
import { mergeProps, useTextField } from "react-aria";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { BeamTextFieldProps } from "src/interfaces";

// Exported for test purposes
export interface TextAreaFieldProps extends BeamTextFieldProps {}

/** Returns a <textarea /> element that auto-adjusts height based on the field's value */
export function TextAreaField(props: TextAreaFieldProps) {
  const { value = "", disabled = false, readOnly = false, onBlur, onFocus, ...otherProps } = props;
  const textFieldProps = { ...otherProps, value, isDisabled: disabled, isReadOnly: readOnly };
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  // not in stately because this is so we know when to re-measure, which is a spectrum design

  const onHeightChange = useCallback(() => {
    const input = inputRef.current;
    if (input) {
      const prevAlignment = input.style.alignSelf;
      input.style.alignSelf = "start";
      input.style.height = "auto";
      // Adding 2px to height avoids showing the scrollbar. This is to compensate for the border due to `box-sizing: border-box;`
      input.style.height = `${input.scrollHeight + 2}px`;
      input.style.alignSelf = prevAlignment;
    }
  }, [inputRef]);

  useLayoutEffect(() => {
    if (inputRef.current) {
      onHeightChange();
    }
  }, [onHeightChange, value, inputRef]);

  const { labelProps, inputProps } = useTextField({ ...textFieldProps, inputElementType: "textarea" }, inputRef);

  return (
    <TextFieldBase
      {...mergeProps(otherProps, { onBlur, onFocus })}
      multiline
      labelProps={labelProps}
      inputProps={inputProps}
      inputRef={inputRef}
      readOnly={readOnly}
    />
  );
}
