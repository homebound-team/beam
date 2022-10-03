import { ReactNode, useRef } from "react";
import { useCheckboxGroup, useCheckboxGroupItem } from "react-aria";
import { CheckboxGroupState, useCheckboxGroupState } from "react-stately";
import { HelperText } from "src/components/HelperText";
import { Label } from "src/components/Label";
import { Css } from "src/Css";
import { CheckboxBase } from "src/inputs/CheckboxBase";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { useTestIds } from "src/utils";

export interface CheckboxGroupItemOption {
  /** Additional text displayed below label */
  description?: string;
  disabled?: boolean;
  label: string;
  /** The value of the CheckboxGroup item, stored in value array in state. */
  value: string;
}

export interface CheckboxGroupProps {
  label: string;
  /** Called when a checkbox is selected or deselected */
  onChange: (values: string[]) => void;
  /** Options for the checkboxes contained within the CheckboxGroup. */
  options: CheckboxGroupItemOption[];
  /** The values currently selected. */
  values: string[];
  errorMsg?: string;
  helperText?: string | ReactNode;
  /** Called when the component loses focus */
  onBlur?: () => void;
  /** Called when the component is in focus */
  onFocus?: () => void;
  /** Number of columns to display checkboxes */
  columns?: number;
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const { options, label, values, errorMsg, helperText, onBlur, onFocus, columns = 1 } = props;

  const state = useCheckboxGroupState({ ...props, value: values });
  const { groupProps, labelProps } = useCheckboxGroup(props, state);
  const tid = useTestIds(props);

  return (
    <div {...groupProps} onBlur={onBlur} onFocus={onFocus} {...tid}>
      <Label label={label} {...labelProps} {...tid.label} />
      <div css={Css.dg.gtc(`repeat(${columns}, auto)`).gap2.$}>
        {options.map((option) => (
          <CheckboxGroupItem
            key={option.value}
            {...option}
            groupState={state}
            selected={state.value.includes(option.value)}
          />
        ))}
      </div>
      {errorMsg && <ErrorMessage errorMsg={errorMsg} {...tid.errorMsg} />}
      {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </div>
  );
}

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

function CheckboxGroupItem(props: CheckboxGroupItemProps) {
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
