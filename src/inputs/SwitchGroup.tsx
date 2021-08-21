import { useContext } from "react";
import { useCheckboxGroup } from "react-aria";
import { FormContext } from "src/forms/FormContext";
import { Css } from "../Css";
import { toGroupState } from "../utils";
import { Switch } from "./Switch";

type GroupItem = {
  label: string;
  value: string;
};

export interface SwitchGroupProps {
  /** Whether to render a compact version of SwitchGroup */
  compact?: boolean;
  /** Group label */
  label: string;
  /** Handler when a child Switch component is toggled. */
  onChange: (value: string[]) => void;
  /** List of switch options */
  options: GroupItem[];
  /** Currently selected values. */
  values: string[];
  /** Whether to render the icon version of SwitchGroup */
  withIcon?: boolean;
}

/*
 * FIXME: @KoltonG keyboard arrow navigation is not working. May need to implement
 * FocusScope due to lack of handling in useCheckboxGroup vs useRadioButtonGroup
 * Actually, maybe I am not crazy... useRadioButtonGroup has actual code to
 * handle keyboard navigation https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/radio/src/useRadioGroup.ts where as useCheckboxGroup does not https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/checkbox/src/useCheckboxGroup.ts
 * Maybe that is why we can't get UP and DOWN arrows to move nicely...
 * This is a great example on doing that https://react-spectrum.adobe.com/react-aria/FocusScope.html#usefocusmanager-example so lets make a wrapper to make it easier for others!
 */
export function SwitchGroup(props: SwitchGroupProps) {
  const settings = useContext(FormContext);
  const { compact = settings.compact, label, onChange, options, values, withIcon } = props;
  const groupState = toGroupState<string>(values, onChange);
  const { groupProps, labelProps } = useCheckboxGroup({ ...props, "aria-label": label }, groupState);
  const { isSelected, addValue, removeValue } = groupState;

  return (
    <fieldset {...groupProps}>
      <legend {...labelProps} css={Css.sm.gray500.mb1.$}>
        {label}
      </legend>
      {/* Switches */}
      <div css={Css.df.flexColumn.childGap2.$}>
        {options.map(({ label, value }) => (
          <Switch
            compact={compact}
            key={value}
            label={label}
            onChange={(isSelected) => (isSelected ? addValue(value) : removeValue(value))}
            selected={isSelected(value)}
            withIcon={withIcon}
          />
        ))}
      </div>
    </fieldset>
  );
}
