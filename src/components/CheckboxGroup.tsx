import { useCheckboxGroup } from "@react-aria/checkbox";
import { CheckboxGroupState, useCheckboxGroupState } from "@react-stately/checkbox";
import { useRef } from "react";
import { useCheckboxGroupItem } from "react-aria";
import { CheckboxBase } from "src/components";
import { Css } from "src/Css";

interface CheckboxGroupItemOption {
  /** Additional text displayed below label */
  description?: string;
  disabled?: boolean;
  label: string;
  /** The value of the CheckboxGroup item, stored in value array in state. */
  value: string;
}

interface CheckboxGroupProps {
  label: string;
  /** Called when a checkbox is selected or deselected */
  onChange: (values: string[]) => void;
  /** Options for the checkboxes contained within the CheckboxGroup. */
  options: CheckboxGroupItemOption[];
  /** The values currently selected. */
  values: string[];
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const { options, label, values } = props;

  const state = useCheckboxGroupState({ ...props, value: values });
  const { groupProps, labelProps } = useCheckboxGroup(props, state);

  return (
    <div {...groupProps}>
      <div {...labelProps} css={Css.gray700.pbPx(4).sm.$}>
        {label}
      </div>
      <div css={Css.dg.gap2.$}>
        {options.map((option) => (
          <CheckboxGroupItem
            key={option.value}
            {...option}
            groupState={state}
            selected={state.value.includes(option.value)}
          />
        ))}
      </div>
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
