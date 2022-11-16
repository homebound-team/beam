import { useTextField } from "@react-aria/textfield";
import { MutableRefObject, ReactNode, useRef, useState } from "react";
import { mergeProps, useFocusWithin, useHover, useSearchField } from "react-aria";
import { Css, Only } from "src/Css";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";
import { maybeCall } from "src/utils";
import { TextFieldBase } from "../TextFieldBase";

interface TextFieldProps<X> extends BeamTextFieldProps<X> {
  inlineLabel?: boolean;
  startAdornment?: ReactNode;
}

export function MenuSearchField<X extends Only<TextFieldXss, X>>(props: TextFieldProps<X>) {
  const { onEnter, onBlur, onFocus, ...otherProps } = props;
  const [isFocused, setIsFocused] = useState(false);
  const { hoverProps, isHovered } = useHover({});
  const { focusWithinProps } = useFocusWithin({ onFocusWithinChange: setIsFocused });

  const fieldStyles = {
    input: {
      ...Css.w100.mw0.outline0.bgWhite.br4.$,
    },
    hover: Css.gray200.bLightBlue900.$,
  }

  const textFieldProps = {
    ...otherProps,
  }

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField(
    { ...textFieldProps },
    inputRef,
  );

  return (
    <TextFieldBase {...textFieldProps} css={Css.br0.$} inputRef={inputRef} inputProps={inputProps} labelProps={labelProps}  />

    // Currently switching between these two inputs to decide which input field is the best use case to move forward with

    // <>
    //   <label {...labelProps}>{props.label}</label>
    //   <input {...inputProps} ref={inputRef} onClick={() => inputRef.current?.focus()} css={{
    //     ...fieldStyles.input,
    //     ...(isHovered && fieldStyles.hover),
    //   }} />
    // </>
  )
}