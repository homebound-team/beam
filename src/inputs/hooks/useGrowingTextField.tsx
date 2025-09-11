import { useLayoutEffect } from "@react-aria/utils";
import { MutableRefObject, useCallback } from "react";
import { TextFieldBasePaddingIncrement } from "../TextFieldBase";

interface GrowingTextFieldProps {
  inputRef: MutableRefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  inputWrapRef: MutableRefObject<HTMLDivElement | null>;
  value: number | string | readonly string[] | undefined;
  disabled?: boolean;
  maxLines?: number;
}

export function useGrowingTextField({ inputRef, inputWrapRef, value, disabled, maxLines }: GrowingTextFieldProps) {
  // Get the actual line height from the rendered element
  const getLineHeight = useCallback((element: HTMLTextAreaElement): number => {
    const computedStyle = window.getComputedStyle(element);
    const lineHeight = computedStyle.lineHeight;

    // If line-height is "normal" for some reason, calculate it as 1.2x font size (standard browser behavior)
    if (lineHeight === "normal") {
      const fontSize = parseFloat(computedStyle.fontSize);
      return fontSize * 1.2;
    }

    return parseFloat(lineHeight);
  }, []);

  // not in stately because this is so we know when to re-measure, which is a spectrum design
  const onHeightChange = useCallback(() => {
    if (disabled) return;
    const input = inputRef.current;
    const inputWrap = inputWrapRef.current;
    if (input && inputWrap) {
      const prevAlignment = input.style.alignSelf;
      input.style.alignSelf = "start";
      input.style.height = "auto";

      // Adding 2px to avoid scrollbar due to border-box when maxLines not used
      const naturalHeight = input.scrollHeight + 2;

      let finalHeight = naturalHeight;

      // If maxLines is specified, calculate max height and constrain if needed
      if (maxLines && input instanceof HTMLTextAreaElement) {
        const lineHeight = getLineHeight(input);
        const maxHeight = maxLines * lineHeight + 2; // +2 for border compensation
        finalHeight = Math.min(naturalHeight, maxHeight);

        // Enable/disable scrolling based on whether content exceeds limit
        // Swap padding from parentwrapper to input so scrollbar is flush with border
        if (naturalHeight > maxHeight) {
          input.style.overflowY = "auto";
          input.style.paddingRight = `${TextFieldBasePaddingIncrement}px`;
          inputWrap.style.paddingRight = "0px";
        } else {
          input.style.overflowY = "hidden";
          input.style.paddingRight = "0px";
          inputWrap.style.paddingRight = `${TextFieldBasePaddingIncrement}px`;
        }
      }

      inputWrap.style.height = `${finalHeight}px`;
      // Set the textarea's height back to 100% so it takes up the full `inputWrap`
      input.style.height = "100%";
      input.style.alignSelf = prevAlignment;
    }
  }, [inputRef, disabled, inputWrapRef, maxLines, getLineHeight]);

  useLayoutEffect(() => {
    if (disabled) {
      // reset the height property if it was flipped to disabled
      if (inputWrapRef.current) {
        inputWrapRef.current.style.removeProperty("height");
      }
      return;
    }

    if (inputRef.current) {
      // Temp hack until we can figure out a better way to ensure proper measurements when rendered through a portal (i.e. Modals)
      if (inputRef.current.scrollHeight === 0) {
        setTimeout(() => onHeightChange(), 0);
        return;
      }
      onHeightChange();
      // This is a hack to re-measure the height of the textarea after all the content has been rendered (i.e. after multiple GridTable children have been rendered)
      // See the InVirtualizedTable storybook for reproducing this behavior
      setTimeout(() => onHeightChange(), 200);
    }
  }, [onHeightChange, value, inputRef, disabled, inputWrapRef]);
}
