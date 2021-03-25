import { useCheckboxGroup } from "@react-aria/checkbox";
import { useCheckboxGroupState } from "@react-stately/checkbox";
import { CheckboxGroupItem, CheckboxProps } from "src/components";
import { Css } from "src/Css";

export interface CheckboxGroupItemOption extends CheckboxProps {
  /** The value of the CheckboxGroup item, stored in value array in state. */
  value: string;
}

interface CheckboxGroupProps {
  label: string;
  /** Handler that is called when the value changes. */
  /** The name of the CheckboxGroup, used when submitting an HTML form. */
  name?: string;
  /** Called when a checkbox is selected or deselected */
  onChange: (values: string[]) => void;
  /** Options for the checkboxes contained within the CheckboxGroup. */
  options: CheckboxGroupItemOption[];
  /** The values currently selected. */
  values?: string[];
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const { options, label } = props;

  const state = useCheckboxGroupState({ ...props, value: props.values });
  const { groupProps, labelProps } = useCheckboxGroup(props, state);

  return (
    <div {...groupProps}>
      <div {...labelProps} css={Css.coolGray500.pbPx(4).sm.$}>
        {label}
      </div>
      <div css={Css.dg.gap2.$}>
        {options.map((option) => (
          <CheckboxGroupItem
            key={option.value}
            {...option}
            state={state}
            selected={state.value.includes(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
