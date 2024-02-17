import { useLayoutEffect } from "@react-aria/utils";
import { MutableRefObject, useCallback } from "react";

interface GrowingTextFieldProps {
  inputRef: MutableRefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  inputWrapRef: MutableRefObject<HTMLDivElement | null>;
  value: number | string | readonly string[] | undefined;
  disabled?: boolean;
}

export function useGrowingTextField({ inputRef, inputWrapRef, value, disabled }: GrowingTextFieldProps) {
  // not in stately because this is so we know when to re-measure, which is a spectrum design
  const onHeightChange = useCallback(() => {
    if (disabled) return;
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
  }, [inputRef, disabled, inputWrapRef]);

  useLayoutEffect(() => {
    if (disabled) return;

    if (inputRef.current) {
      // Temp hack until we can figure out a better way to ensure proper measurements when rendered through a portal (i.e. Modals)
      if (inputRef.current.scrollHeight === 0) {
        setTimeout(() => onHeightChange(), 0);
        return;
      }
      onHeightChange();
    }
  }, [onHeightChange, value, inputRef, disabled]);
}
