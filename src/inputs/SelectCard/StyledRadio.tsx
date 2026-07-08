import { InputHTMLAttributes } from "react";
import { useHover } from "react-aria";
import { Css } from "src/Css";
import { getRadioStateStyles, radioDefault, radioHover, radioReset } from "src/inputs/internal/radioStyles";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type StyledRadioProps = {
  label?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
};

/** Styled radio circle used as the list-card leading control. */
export function StyledRadio(props: StyledRadioProps) {
  const { isDisabled = false, isSelected = false, label, inputProps } = props;
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
        ...Css.fs0.$,
      }}
      disabled={isDisabled}
      {...hoverProps}
      {...inputProps}
      {...tid.value}
    />
  );
}
