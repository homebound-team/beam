import { useCallback, useMemo } from "react";
import { useCheckboxGroup } from "react-aria";
import { useCheckboxGroupState } from "react-stately";
import { usePresentationContext } from "src/components/PresentationContext";
import { LabeledGroupField } from "src/inputs/internal/LabeledGroupField";
import { SelectCardCheckboxGroupItem } from "src/inputs/SelectCard/SelectCardCheckboxGroupItem";
import { MultiSelectCardGroupProps } from "src/inputs/SelectCard/types";
import {
  findToggledSelectCardGroupValue,
  getNextSelectCardGroupValues,
  getSelectCardOptionsCss,
} from "src/inputs/SelectCard/utils";
import { Value, keyToValue, valueToKey } from "src/inputs/Value";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export function MultiSelectCardGroup<V extends Value>(props: MultiSelectCardGroupProps<V>) {
  const { fieldProps } = usePresentationContext();
  const {
    label,
    labelStyle = fieldProps?.labelStyle ?? "above",
    values,
    options,
    errorMsg,
    helperText,
    disabled: isDisabled = false,
    onChange,
    view = "grid",
  } = props;

  const hasDescription = useMemo(() => options.some((o) => o.description), [options]);
  const tid = useTestIds(props);

  // Aria reports the full next selection, not which card was clicked. Diff prev/next to
  // find the toggled value, then apply our rules (e.g. exclusive options) instead of
  // passing aria's array through — a plain checkbox group would merge exclusive picks in.
  const handleChange = useCallback(
    (nextFromAria: V[]) => {
      const clicked = findToggledSelectCardGroupValue(values, nextFromAria);
      if (clicked === undefined) return;
      onChange(
        getNextSelectCardGroupValues({
          currentValues: values,
          clickedValue: clicked,
          options,
        }),
      );
    },
    [onChange, options, values],
  );

  const state = useCheckboxGroupState({
    value: values.map(valueToKey),
    onChange: (nextValues) => handleChange(nextValues.map((key) => keyToValue<V>(key))),
    isDisabled,
  });
  const { groupProps, labelProps } = useCheckboxGroup({ label, isDisabled }, state);

  return (
    <LabeledGroupField
      label={label}
      labelStyle={labelStyle}
      labelProps={labelProps}
      groupProps={groupProps}
      errorMsg={errorMsg}
      helperText={helperText}
      tid={tid}
    >
      <div css={getSelectCardOptionsCss(view, hasDescription)}>
        {options.map((option) => (
          <SelectCardCheckboxGroupItem
            key={String(option.value)}
            option={option}
            groupState={state}
            isSelected={values.includes(option.value)}
            view={view}
            {...tid[defaultTestId(option.label)]}
          />
        ))}
      </div>
    </LabeledGroupField>
  );
}
