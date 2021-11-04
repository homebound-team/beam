import { InputHTMLAttributes, KeyboardEvent, useRef, useState } from "react";
import { useFocus, useTextField } from "react-aria";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { maybeCall, useTestIds } from "src/utils";

interface ChipTextFieldProps {
  // Label is not visible in the component, but required for accessibility purposes
  label: string;
  // Current value of the input element
  value?: string;
  // Whether the input is required. Adds aria-required attribute
  required?: boolean;
  // Sets input's placeholder attribute
  placeholder?: string;
  // Whether to call `onBlur` when the user presses the "Escape" key while focused on the input.
  // @default `true`
  blurOnEscape?: false;
  // Callback fired when the user changes the value of the input
  onChange: (value: string) => void;
  // Callback fired when focus removes from the input
  onBlur?: () => void;
  // Callback fired when focus is set to the input
  onFocus?: () => void;
  // Callback when the user presses the "Enter" key while focused on the input
  onEnter?: () => void;
}

// A TextField styled to look like a Chip
export function ChipTextField(props: ChipTextFieldProps) {
  const { onFocus, onBlur, onEnter, required, label, blurOnEscape = true, ...otherProps } = props;
  const { fieldProps } = usePresentationContext();
  const tid = useTestIds(props, "chipInput");
  const [isFocused, setIsFocused] = useState(false);
  const { focusProps } = useFocus({
    onFocus: (e) => {
      (e.target as HTMLInputElement).select();
      maybeCall(onFocus);
    },
    onBlur: () => maybeCall(onBlur),
    onFocusChange: setIsFocused,
  });

  const textFieldProps = {
    ...otherProps,
    isRequired: required,
    "aria-label": label,
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        maybeCall(onEnter);
      } else if (blurOnEscape && e.key === "Escape") {
        (e.target as HTMLInputElement).blur();
      }
    },
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const { inputProps } = useTextField(textFieldProps, inputRef);
  const typeScale = fieldProps?.typeScale ?? "sm";

  return (
    <input
      {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
      {...focusProps}
      ref={inputRef}
      css={{
        ...Css[typeScale].dif.aic.br16.pl1.pxPx(10).pyPx(2).gray900.bgGray300.outline0.$,
        ...(isFocused ? Css.bshFocus.$ : {}),
      }}
      {...tid}
      size={props.value?.length ?? 1}
    />
  );
}
