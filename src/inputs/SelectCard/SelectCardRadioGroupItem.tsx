import { useRef } from "react";
import { useRadio } from "react-aria";
import { RadioGroupState } from "react-stately";
import { GridSelectCard } from "src/inputs/SelectCard/GridSelectCard";
import { ListSelectCard } from "src/inputs/SelectCard/ListSelectCard";
import { SelectCardGridGroupItemOption, SelectCardGroupItemProps } from "src/inputs/SelectCard/types";
import { Value, valueToKey } from "src/inputs/Value";

type SelectCardRadioGroupItemProps<V extends Value> = SelectCardGroupItemProps<V> & {
  groupState: RadioGroupState;
};

export function SelectCardRadioGroupItem<V extends Value>(props: SelectCardRadioGroupItemProps<V>) {
  const { option, groupState, isSelected, view, ...others } = props;
  const { label, description, disabled, tooltip, value } = option;
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps, isDisabled: isOptionDisabled } = useRadio(
    { value: valueToKey(value), "aria-label": label, isDisabled: disabled ?? false },
    groupState,
    ref,
  );

  const layoutProps = {
    label,
    description,
    selected: isSelected,
    disabled: isOptionDisabled,
    tooltip,
    inputProps,
    ...others,
  };

  if (view === "list") {
    return <ListSelectCard {...layoutProps} />;
  }

  return <GridSelectCard {...layoutProps} icon={(option as SelectCardGridGroupItemOption<V>).icon} />;
}
