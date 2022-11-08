import { useTextField } from "@react-aria/textfield";
import { MutableRefObject, ReactNode, useRef } from "react";
import { mergeProps, useSearchField } from "react-aria";
import { Only } from "src/Css";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";
import { maybeCall } from "src/utils";
import { TextFieldBase } from "../TextFieldBase";

interface TextFieldProps<X> extends BeamTextFieldProps<X> {
  onEnter?: VoidFunction;
  inlineLabel?: boolean;
  startAdornment?: ReactNode;
}

export function MenuSearchField<X extends Only<TextFieldXss, X>>(props: TextFieldProps<X>) {
  const { onEnter, onBlur, onFocus, ...otherProps } = props;

  const textFieldProps = {
    ...otherProps,
  }

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

  return (
    <TextFieldBase {...mergeProps(textFieldProps, { onBlur, onFocus })} inputRef={inputRef} inputProps={inputProps} labelProps={labelProps} />
  )
}