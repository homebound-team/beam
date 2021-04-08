import { useCheckboxGroup } from "@react-aria/checkbox";
import { Css } from "../Css";
import { toGroupState } from "../utils";
import { Switch } from "./Switch";

type GroupItem = {
  label: string;
  value: string;
};

export interface SwitchGroupProps {
  /** Group label */
  label?: string;
  /** Handler when a child Switch component is toggled. */
  onChange: (value: string[]) => void;
  /** List of switch options */
  options: GroupItem[];
  /** Currently selected values. */
  values: string[];
}

/**
 * FIXME: @KoltonG keyboard arrow navigation is not working. May need to implement
 * FocusScope due to lack of handling in useCheckboxGroup vs useRadioButtonGroup
 * Actually, maybe I am not crazy... useRadioButtonGroup has actual code to
 * handle keyboard navigation https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/radio/src/useRadioGroup.ts where as useCheckboxGroup does not https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/checkbox/src/useCheckboxGroup.ts
 * Maybe that is why we can't get UP and DOWN arrows to move nicely...
 * This is a great example on doing that https://react-spectrum.adobe.com/react-aria/FocusScope.html#usefocusmanager-example so lets make a wrapper to make it easier for others!
 */
export function SwitchGroup(props: SwitchGroupProps) {
  const { label, options, values, onChange } = props;
  const groupState = toGroupState<string>(values, onChange);
  const { groupProps, labelProps } = useCheckboxGroup(props, groupState);
  const { isSelected, addValue, removeValue } = groupState;

  return (
    <fieldset {...groupProps}>
      <legend {...labelProps} css={Css.sm.gray500.mb1.$}>
        {label}
      </legend>
      {/* Switches */}
      <div css={Css.df.flexColumn.gap2.$}>
        {options.map(({ label, value }) => (
          <Switch
            key={value}
            label={label}
            selected={isSelected(value)}
            onChange={(isSelected) => (isSelected ? addValue(value) : removeValue(value))}
          />
        ))}
      </div>
    </fieldset>
  );
}
