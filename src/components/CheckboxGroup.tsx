import { useCheckboxGroup } from "@react-aria/checkbox";
import { useCheckboxGroupState } from "@react-stately/checkbox";
import { CheckboxGroupItem } from "src/components";
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
