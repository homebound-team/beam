import { KeyboardEvent, useRef, useState } from "react";
import { useFocus } from "react-aria";
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
  const { onFocus, onBlur, onEnter, onChange, required, label, value, blurOnEscape = true } = props;
  const { fieldProps } = usePresentationContext();
  // Use a ref for the value to not cause a re-render when it changes, avoiding cursor position resetting.
  const valueRef = useRef(value);
  const tid = useTestIds(props, "chipField");
  const [isFocused, setIsFocused] = useState(false);
  const { focusProps } = useFocus({
    onFocus: (e) => {
      if (fieldRef.current) {
        // The range/selection logic is to select the text within the field on focus
        const range = document.createRange();
        range.selectNodeContents(fieldRef.current);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      maybeCall(onFocus);
    },
    onBlur: () => maybeCall(onBlur),
    onFocusChange: setIsFocused,
  });

  const fieldRef = useRef<HTMLSpanElement>(null);
  const typeScale = fieldProps?.typeScale ?? "sm";

  // React doesn't like contentEditable because it takes the children of the node out of React's scope. This is fine in this case as it is just a text value and we are managing it.
  return (
    <span
      ref={fieldRef}
      contentEditable
      suppressContentEditableWarning={true}
      aria-required={required}
      aria-label={label}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          maybeCall(onEnter);
        } else if (blurOnEscape && e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
      }}
      onInput={(e: KeyboardEvent<HTMLElement>) => {
        // Prevent user from pasting content that has new line characters and replace with empty space.
        const target = e.target as HTMLElement;
        target.textContent = target.textContent?.replace(/[\n\r]/g, " ") ?? "";
        onChange(target.textContent ?? "");
      }}
      {...focusProps}
      css={{
        ...Css[typeScale].dib.br16.pl1.pxPx(10).pyPx(2).gray900.bgGray300.outline0.mwPx(32).$,
        ...(isFocused ? Css.bshFocus.$ : {}),
      }}
      {...tid}
    >
      {valueRef.current}
    </span>
  );
}
