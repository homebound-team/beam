import { ReactNode, useRef } from "react";
import { useCheckbox } from "react-aria";
import { useToggleState } from "react-stately";
import { resolveTooltip } from "src/components";
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
  /** Additional text displayed below label */
  description?: string;
  /** Whether the field is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  errorMsg?: string;
  helperText?: string | ReactNode;
  /**
   * Removes maxwidth restrictions on the checkbox container
   * label, helperText, errorMsg, description props extend full width of the checkbox container as necessary
   * @default false
   */
  fullWidth?: boolean;
  /** Handler that is called when the element's selection state changes. */
  onChange: (selected: boolean) => void;
  /** Callback fired when focus removes from the component */
  onBlur?: () => void;
  /** Callback fired when focus is set to the component */
  onFocus?: () => void;
}

export function Checkbox(props: CheckboxProps) {
  const { label, disabled = false, selected, ...otherProps } = props;
  // Treat indeterminate as false so that clicking on indeterminate always goes --> true.
  const isSelected = selected === true;
  const isIndeterminate = selected === "indeterminate";
  const ariaProps = { isSelected, isDisabled: !!disabled, isIndeterminate, ...otherProps };
  const checkboxProps = { ...ariaProps, "aria-label": label };
  const ref = useRef(null);
  const toggleState = useToggleState(ariaProps);
  const { inputProps } = useCheckbox(checkboxProps, toggleState, ref);

  return (
    <CheckboxBase
      ariaProps={ariaProps}
      isDisabled={ariaProps.isDisabled}
      isIndeterminate={isIndeterminate}
      isSelected={isSelected}
      inputProps={inputProps}
      label={label}
      tooltip={resolveTooltip(disabled)}
      {...otherProps}
    />
  );
}
