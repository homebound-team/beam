import { AriaTextFieldOptions, useTextField } from "@react-aria/textfield";
import { chain, useLayoutEffect } from "@react-aria/utils";
import React, { useCallback, useRef, useState } from "react";
import { TextFieldBase } from "src/components/TextFieldBase";

interface TextareaProps
  extends Pick<
    AriaTextFieldOptions,
    "label" | "onChange" | "value" | "defaultValue" | "autoFocus" | "isDisabled" | "isReadOnly"
  > {
  wide?: boolean;
  errorMsg?: string;
}

export function Textarea(props: TextareaProps) {
  const { onChange, ...otherProps } = props;
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
    { ...props, inputElementType: "textarea", onChange: chain(onChange, setInputValue) },
    inputRef,
  );

  return (
    <TextFieldBase {...otherProps} multiline labelProps={labelProps} inputProps={inputProps} inputRef={inputRef} />
  );
}
