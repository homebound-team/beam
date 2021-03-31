import { useToggleState } from "@react-stately/toggle";
import { useRef } from "react";
import { useCheckbox } from "react-aria";
import { CheckboxBase } from "src/components";

interface CheckboxProps {
  /** Additional text displayed below label */
  description?: string;
  disabled?: boolean;
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  indeterminate?: boolean;
  selected?: boolean;
  label: string;
  /** Handler that is called when the element's selection state changes. */
  onChange: (selected: boolean) => void;
}

export function Checkbox(props: CheckboxProps) {
  const {
    label,
    indeterminate: isIndeterminate = false,
    disabled: isDisabled = false,
    selected,
    ...otherProps
  } = props;
  const ariaProps = { isSelected: selected, isDisabled, isIndeterminate, ...otherProps };
  const checkboxProps = { ...ariaProps, "aria-label": label };
  const ref = useRef(null);
  const toggleState = useToggleState(ariaProps);
  const isSelected = toggleState.isSelected;
  const { inputProps } = useCheckbox(checkboxProps, toggleState, ref);

  return (
    <CheckboxBase
      ariaProps={ariaProps}
      isDisabled={isDisabled}
      isIndeterminate={isIndeterminate}
      isSelected={isSelected}
      inputProps={inputProps}
      label={label}
      {...otherProps}
    />
  );
}
