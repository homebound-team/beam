import { useTextField } from "@react-aria/textfield";
import { useLayoutEffect } from "@react-aria/utils";
import React, { useCallback, useRef } from "react";
import { TextFieldBase } from "src/components/TextFieldBase";
import { BeamTextFieldProps } from "src/interfaces";

// exported for test purposes
export interface TextAreaFieldProps extends BeamTextFieldProps {
  wide?: boolean;
}

/** Returns a <textarea /> element that auto-adjusts height based on the field's value */
export function TextAreaField(props: TextAreaFieldProps) {
  const { value = "", disabled: isDisabled = false, readOnly: isReadOnly = false, ...otherProps } = props;
  const textFieldProps = { ...otherProps, value, isDisabled, isReadOnly };
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
    <TextFieldBase {...otherProps} multiline labelProps={labelProps} inputProps={inputProps} inputRef={inputRef} />
  );
}
