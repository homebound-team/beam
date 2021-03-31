import { CheckboxGroupState } from "@react-stately/checkbox";
import { useRef } from "react";
import { useCheckboxGroupItem } from "react-aria";
import { CheckboxBase } from "src/components";

interface CheckboxGroupItemProps {
  /** Additional text displayed below label */
  description?: string;
  disabled?: boolean;
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  indeterminate?: boolean;
  selected: boolean;
  label: string;
  value: string;
  groupState: CheckboxGroupState;
}

export function CheckboxGroupItem(props: CheckboxGroupItemProps) {
  const {
    label,
    indeterminate: isIndeterminate = false,
    disabled: isDisabled = false,
    description,
    selected: isSelected,
    groupState,
    value = "",
    ...otherProps
  } = props;
  const ariaProps = { isSelected, isDisabled, isIndeterminate, value, ...otherProps };
  const checkboxProps = { ...ariaProps, "aria-label": label };
  const ref = useRef(null);
  const { inputProps } = useCheckboxGroupItem(checkboxProps, groupState, ref);

  return (
    <CheckboxBase
      ariaProps={ariaProps}
      description={description}
      isDisabled={isDisabled}
      isIndeterminate={isIndeterminate}
      isSelected={isSelected}
      inputProps={inputProps}
      label={label}
      {...otherProps}
    />
  );
}
