import { ReactNode, useRef } from "react";
import { useCheckbox } from "react-aria";
import { useToggleState } from "react-stately";
import { CheckboxBase } from "src/inputs/CheckboxBase";

export interface CheckboxProps {
  label: string;
  /** If false this will be wrap in a div element instead of the label
   * Expects implementer to wrap within a label element to work properly
   * @default true
   */
  withLabelElement?: boolean;
  checkboxOnly?: boolean;
  selected: boolean | "indeterminate";
  /** Handler that is called when the element's selection state changes. */
  onChange: (selected: boolean) => void;
  /** Additional text displayed below label */
  description?: string;
  disabled?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  /** Callback fired when focus removes from the component */
  onBlur?: () => void;
  /** Callback fired when focus is set to the component */
  onFocus?: () => void;
}

export function Checkbox(props: CheckboxProps) {
  const { label, disabled: isDisabled = false, selected, ...otherProps } = props;
  // Treat indeterminate as false so that clicking on indeterminate always goes --> true.
  const isSelected = selected === true;
  const isIndeterminate = selected === "indeterminate";
  const ariaProps = { isSelected, isDisabled, isIndeterminate, ...otherProps };
  const checkboxProps = { ...ariaProps, "aria-label": label };
  const ref = useRef(null);
  const toggleState = useToggleState(ariaProps);
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
