import { useCallback, useMemo } from "react";
import { useRadioGroup } from "react-aria";
import { useRadioGroupState } from "react-stately";
import { usePresentationContext } from "src/components/PresentationContext";
import { LabeledGroupField } from "src/inputs/internal/LabeledGroupField";
import { SelectCardRadioGroupItem } from "src/inputs/SelectCard/SelectCardRadioGroupItem";
import { SelectCardGroupProps } from "src/inputs/SelectCard/types";
import { getSelectCardOptionsCss } from "src/inputs/SelectCard/utils";
import { Value, keyToValue, valueToKey } from "src/inputs/Value";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export function SelectCardGroup<V extends Value>(props: SelectCardGroupProps<V>) {
  const { fieldProps } = usePresentationContext();
  const {
    label,
    labelStyle = fieldProps?.labelStyle ?? "above",
    value,
    options,
    errorMsg,
    helperText,
    disabled: isDisabled = false,
    onChange,
    view = "grid",
  } = props;

  const hasDescription = useMemo(() => options.some((o) => o.description), [options]);
  const tid = useTestIds(props);

  const handleChange = useCallback(
    (nextValue: V) => {
      onChange(nextValue);
    },
    [onChange],
  );

  const state = useRadioGroupState({
    value: value !== undefined ? valueToKey(value) : undefined,
    onChange: (nextValue) => handleChange(keyToValue<V>(nextValue)),
    isDisabled,
  });
  const { radioGroupProps, labelProps } = useRadioGroup({ label, isDisabled }, state);

  return (
    <LabeledGroupField
      label={label}
      labelStyle={labelStyle}
      labelProps={labelProps}
      groupProps={radioGroupProps}
      errorMsg={errorMsg}
      helperText={helperText}
      tid={tid}
    >
      <div css={getSelectCardOptionsCss(view, hasDescription)}>
        {options.map((option) => (
          <SelectCardRadioGroupItem
            key={String(option.value)}
            option={option}
            groupState={state}
            isSelected={value === option.value}
            view={view}
            {...tid[defaultTestId(option.label)]}
          />
        ))}
      </div>
    </LabeledGroupField>
  );
}
