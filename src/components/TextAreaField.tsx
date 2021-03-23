import { useTextField } from "@react-aria/textfield";
import { chain, useLayoutEffect } from "@react-aria/utils";
import React, { useCallback, useRef, useState } from "react";
import { TextFieldBase } from "src/components/TextFieldBase";
import { BeamTextFieldProps } from "src/interfaces";

interface TextareaProps extends BeamTextFieldProps {
  wide?: boolean;
}

/** Returns a <textarea /> element that auto-adjusts height based on the field's value */
export function TextAreaField(props: TextareaProps) {
  const { onChange, disabled: isDisabled = false, readOnly: isReadOnly = false, ...otherProps } = props;
  const textFieldProps = { ...otherProps, isDisabled, isReadOnly };
  const [inputValue, setInputValue] = useState(props.value || props.defaultValue);
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
  }, [onHeightChange, inputValue, inputRef]);

  const { labelProps, inputProps } = useTextField(
    { ...textFieldProps, inputElementType: "textarea", onChange: chain(onChange, setInputValue) },
    inputRef,
  );

  return (
    <TextFieldBase {...otherProps} multiline labelProps={labelProps} inputProps={inputProps} inputRef={inputRef} />
  );
}
