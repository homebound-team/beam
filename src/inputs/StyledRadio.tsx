import type { ComponentPropsWithRef } from "react";
import { useHover } from "react-aria";
import { Css } from "src/Css";
import { getRadioStateStyles, radioDefault, radioFocus, radioHover, radioReset } from "src/inputs/internal/radioStyles";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

export type StyledRadioProps = {
  label?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
  isFocusVisible?: boolean;
  inputProps: ComponentPropsWithRef<"input">;
};

/** A styled radio circle, for placing a radio inside custom markup like a select card or a `renderOption` row. */
export function StyledRadio(props: StyledRadioProps) {
  const { isDisabled = false, isSelected = false, isFocusVisible = false, label, inputProps } = props;
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const tid = useTestIds(props, label ? defaultTestId(label) : undefined);

  return (
    <input
      type="radio"
      css={{
        ...radioReset,
        ...radioDefault,
        ...getRadioStateStyles({ isDisabled, isSelected }),
        ...(isHovered && !isDisabled ? radioHover : {}),
        ...(isFocusVisible ? radioFocus : {}),
        ...Css.fs0.$,
      }}
      disabled={isDisabled}
      {...hoverProps}
      {...tid.value}
      // After the test id, so a data-testid in inputProps wins.
      {...inputProps}
    />
  );
}
