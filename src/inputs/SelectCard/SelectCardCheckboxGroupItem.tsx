import { useRef } from "react";
import { useCheckboxGroupItem } from "react-aria";
import { CheckboxGroupState } from "react-stately";
import { GridSelectCard } from "src/inputs/SelectCard/GridSelectCard";
import { ListSelectCard } from "src/inputs/SelectCard/ListSelectCard";
import { SelectCardGridGroupItemOption, SelectCardGroupItemProps } from "src/inputs/SelectCard/types";
import { Value, valueToKey } from "src/inputs/Value";

type SelectCardCheckboxGroupItemProps<V extends Value> = SelectCardGroupItemProps<V> & {
  groupState: CheckboxGroupState;
};

export function SelectCardCheckboxGroupItem<V extends Value>(props: SelectCardCheckboxGroupItemProps<V>) {
  const { option, groupState, isSelected, view, ...others } = props;
  const { label, description, disabled, tooltip, value } = option;
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps, isDisabled: isOptionDisabled } = useCheckboxGroupItem(
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
